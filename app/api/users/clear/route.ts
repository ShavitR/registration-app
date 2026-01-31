import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: NextRequest) {
    try {
        const count = await prisma.user.count();

        await prisma.user.deleteMany({});

        await logActivity(
            "DATABASE_CLEAR",
            `Database cleared completely. Deleted ${count} records.`,
            undefined,
            "Internal System"
        );

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
