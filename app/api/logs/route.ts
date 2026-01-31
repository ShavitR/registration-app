import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const logs = await prisma.activityLog.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 100, // Limit to last 100 for now
        });

        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
