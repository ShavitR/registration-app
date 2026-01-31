import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const DEFAULT_RULES = {
    idCard: { min: 8, required: true, label: "תעודת זהות" },
    firstName: { min: 2, required: true, label: "שם פרטי" },
    lastName: { min: 2, required: true, label: "שם משפחה" },
    email: { required: false, label: "אימייל" },
    mobilePhone: { min: 9, required: false, label: "טלפון נייד" },
};

export async function GET() {
    try {
        // Use raw SQL with safe template tags ($queryRaw)
        const result: any[] = await prisma.$queryRaw`SELECT rulesJson FROM ValidationRule WHERE id = 'config'`;

        if (!result || result.length === 0) {
            return NextResponse.json(DEFAULT_RULES);
        }

        let rules = result[0].rulesJson;
        if (typeof rules === 'string') {
            rules = JSON.parse(rules);
        }

        return NextResponse.json(rules);
    } catch (error: any) {
        console.error("API GET Rules error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body || !body.idCard) {
            return NextResponse.json({ error: "Invalid rules format" }, { status: 400 });
        }

        const rulesJson = JSON.stringify(body);

        // Safe parameterization with $queryRaw/$executeRaw template tags
        const existing: any[] = await prisma.$queryRaw`SELECT id FROM ValidationRule WHERE id = 'config'`;

        if (existing.length > 0) {
            await prisma.$executeRaw`UPDATE ValidationRule SET rulesJson = ${rulesJson}, updatedAt = CURRENT_TIMESTAMP WHERE id = 'config'`;
        } else {
            await prisma.$executeRaw`INSERT INTO ValidationRule (id, rulesJson, updatedAt) VALUES ('config', ${rulesJson}, CURRENT_TIMESTAMP)`;
        }

        await logActivity(
            "UPDATE_RULES",
            "Validation rulebook updated in database (Safe Raw SQL).",
            "config",
            "System Admin"
        );

        return NextResponse.json({ success: true, rules: body });
    } catch (error: any) {
        console.error("API POST Rules error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
