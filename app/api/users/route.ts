import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        const where: any = search ? {
            OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { idCard: { contains: search } },
                { email: { contains: search } },
            ]
        } : {};

        const users = await prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get some stats
        const total = await prisma.user.count();
        const today = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        });

        // Branch distribution
        const branchGroups = await prisma.user.groupBy({
            by: ['branch'],
            _count: {
                _all: true
            }
        });

        const statusGroups = await prisma.user.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        });

        // NEW: Gender Distribution
        const genderGroups = await prisma.user.groupBy({
            by: ['gender'],
            _count: { _all: true }
        });

        // NEW: Membership Type Distribution
        const membershipGroups = await prisma.user.groupBy({
            by: ['membershipType'],
            _count: { _all: true }
        });

        // NEW: Registration Timeline (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const timelineData = await prisma.user.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Group timeline by date
        const timelineDist = timelineData.reduce((acc: any, curr: { createdAt: Date }) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const timeline = Object.entries(timelineDist).map(([date, count]) => ({
            date,
            count
        }));

        return NextResponse.json({
            users,
            stats: {
                total,
                today,
                branches: branchGroups.map((g: any) => ({ name: g.branch || 'Unknown', count: g._count._all })),
                statuses: statusGroups.map((g: any) => ({ name: g.status || 'Unknown', count: g._count._all })),
                genders: genderGroups.map((g: any) => ({ name: g.gender || 'Unknown', count: g._count._all })),
                membershipTypes: membershipGroups.map((g: any) => ({ name: g.membershipType || 'Unknown', count: g._count._all })),
                timeline
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        const deleted = await prisma.user.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        await logActivity(
            "BULK_DELETE",
            `Deleted ${deleted.count} users in a bulk operation.`
        );

        return NextResponse.json({ success: true, count: deleted.count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Basic check for existing ID
        const existing = await prisma.user.findUnique({
            where: { idCard: data.idCard }
        });

        if (existing) {
            return NextResponse.json({ error: "תעודת זהות כבר קיימת במערכת" }, { status: 400 });
        }

        const user = await prisma.user.create({ data });

        await logActivity(
            "SINGLE_REGISTRATION",
            `Manual registration for ${user.firstName} ${user.lastName} (${user.idCard})`
        );

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
