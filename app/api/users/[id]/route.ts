import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserSchema } from "@/lib/validations";
import { logActivity } from "@/lib/logger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        await logActivity(
            "DELETE_USER",
            `Deleted user ${user.firstName} ${user.lastName} (${user.idCard})`,
            id
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Partial validation for updates
        // We reuse UserSchema but make it partial since we might update only some fields
        // However, for simplicity and to allow updating single fields without re-validating everything strictly:
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: body
        });

        await logActivity(
            "UPDATE_USER",
            `Updated details for user ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.idCard})`,
            id
        );

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
