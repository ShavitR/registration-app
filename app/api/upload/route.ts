import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { UserSchema, excelDateToJSDate, getDynamicSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logActivity } from "@/lib/logger";
import fs from "fs";
import path from "path";

// Mapping from Hebrew headers to English keys
const HEADER_MAPPING: Record<string, string> = {
    "תעודת זהות": "idCard",
    "שם פרטי": "firstName",
    "שם משפחה": "lastName",
    "מין": "gender",
    "תאריך לידה": "birthDate",
    "אגודה": "association",
    "מעסיק": "employer",
    "סטטוס": "status",
    "סניף": "branch",
    "תאריך הצטרפות": "joinDate",
    "תאריך עליה/לימודים": "aliyahOrStudiesDate",
    "סוג חברות": "membershipType",
    "סיבת חריגים": "exceptionReason",
    "עיר": "city",
    "רחוב ומספר": "street",
    "דואר אלקטרוני": "email",
    "טלפון נייד": "mobilePhone",
    "אישור דיוור": "mailingApproval",
    "תאריך דחייה/אישור": "approvalDate",
    "השכלה": "education",
    "מוסד לימודים": "institution",
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            if (rows[i] && rows[i].includes("תעודת זהות")) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            return NextResponse.json({ error: "Could not find header row" }, { status: 400 });
        }

        const headers = rows[headerRowIndex];
        const dataRows = rows.slice(headerRowIndex + 1);

        const processedUsers = [];
        const errors = [];
        const createdUsers = [];

        // Fetch dynamic validation rules from Database (Raw SQL Fallback)
        let rules = {
            idCard: { min: 8, required: true },
            firstName: { min: 2, required: true },
            lastName: { min: 2, required: true },
            email: { required: false },
            mobilePhone: { min: 9, required: false },
        };

        try {
            const result: any[] = await prisma.$queryRaw`SELECT rulesJson FROM ValidationRule WHERE id = 'config'`;
            if (result && result.length > 0) {
                let rulesData = result[0].rulesJson;
                rules = typeof rulesData === 'string' ? JSON.parse(rulesData) : rulesData;
            }
        } catch (e) {
            console.error("Failed to load rules from DB (Raw SQL), using defaults", e);
        }

        const DynamicUserSchema = getDynamicSchema(rules);

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row || row.length === 0) continue;

            const userObj: any = {};
            headers.forEach((header: string, index: number) => {
                const key = HEADER_MAPPING[header];
                if (key) {
                    userObj[key] = row[index];
                }
            });



            if (typeof userObj.idCard === 'number') {
                userObj.idCard = userObj.idCard.toString();
            }

            const validation = DynamicUserSchema.safeParse(userObj);
            const excelRow = i + 1;

            if (validation.success) {
                processedUsers.push({ ...validation.data, _excelRow: excelRow });
            } else {
                errors.push({
                    ...userObj,
                    excelRow,
                    errors: validation.error.flatten().fieldErrors
                });
            }
        }

        for (const user of processedUsers) {
            try {
                const { _excelRow, ...data } = user;
                const created = await prisma.user.create({ data: data as any });
                createdUsers.push(created);
            } catch (e: any) {
                const { _excelRow, ...userData } = user;
                let errorMessage = "שגיאת מערכת";

                // Prisma Unique Constraint Error (P2002)
                if (e.code === 'P2002') {
                    errorMessage = "תעודת זהות כבר קיימת במערכת";
                } else {
                    errorMessage = `שגיאת מסד נתונים: ${e.message}`;
                }

                errors.push({
                    ...userData,
                    excelRow: (user as any)._excelRow,
                    errors: { idCard: [errorMessage] }
                });
            }
        }

        await logActivity(
            "UPLOAD",
            `Processed file "${file.name}". ${createdUsers.length} users added, ${errors.length} failed.`
        );

        return NextResponse.json({
            success: true,
            addedCount: createdUsers.length,
            errorCount: errors.length,
            errors: errors,
            users: createdUsers.slice(0, 50)
        });

    } catch (error: any) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
