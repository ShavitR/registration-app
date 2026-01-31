import { prisma } from "./db";

export async function logActivity(action: string, details: string, entityId?: string, admin: string = "Internal System") {
    try {
        await prisma.activityLog.create({
            data: {
                action,
                details,
                entityId,
                admin,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}
