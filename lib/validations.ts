import { z } from "zod";

export const excelDateToJSDate = (serial: number) => {
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
};

// Helper to build a Zod string schema from basic rules
const buildStringZod = (rule: any, fallbackLabel: string) => {
    let schema = z.string();

    if (rule?.required) {
        schema = schema.min(1, `${rule.label || fallbackLabel} is missing`);
    } else {
        // If not required, it can be optional or empty
        return schema.optional().or(z.literal(""));
    }

    if (rule?.min) {
        schema = schema.min(rule.min, `${rule.label || fallbackLabel} must be at least ${rule.min} chars`);
    }

    if (rule?.email) {
        schema = schema.email(`Invalid email format`);
    }

    return schema;
};

// Dynamic Schema Generation
export const getDynamicSchema = (rules: any) => {
    return z.object({
        idCard: buildStringZod(rules.idCard, "ID Card"),
        firstName: buildStringZod(rules.firstName, "First Name"),
        lastName: buildStringZod(rules.lastName, "Last Name"),
        gender: z.string().optional(),
        birthDate: z.union([z.number(), z.string(), z.date()]).transform((val) => {
            if (typeof val === 'number') return excelDateToJSDate(val);
            return new Date(val);
        }).optional(),
        association: z.string().optional(),
        employer: z.string().optional(),
        status: z.string().optional(),
        branch: z.string().optional(),
        joinDate: z.union([z.number(), z.string(), z.date()])
            .transform((val) => {
                if (typeof val === 'number') return excelDateToJSDate(val);
                return new Date(val);
            })
            .optional(),
        aliyahOrStudiesDate: z.union([z.number(), z.string(), z.date(), z.null()]).transform((val) => {
            if (val === null) return null;
            if (typeof val === 'number') return excelDateToJSDate(val);
            return new Date(val);
        }).optional().nullable(),
        membershipType: z.string().optional(),
        exceptionReason: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        email: buildStringZod({ ...rules.email, email: true }, "Email"),
        mobilePhone: buildStringZod(rules.mobilePhone, "Phone"),
        mailingApproval: z.string().optional(),
        approvalDate: z.union([z.number(), z.string(), z.date(), z.null()]).transform((val) => {
            if (val === null) return null;
            if (typeof val === 'number') return excelDateToJSDate(val);
            return new Date(val);
        }).optional().nullable(),
        education: z.string().optional(),
        institution: z.string().optional(),
    });
};

// Default static schema for type inference and fallback
export const UserSchema = z.object({
    idCard: z.string().min(1, "ID Card is missing").min(8, "ID Card must be at least 8 digits"),
    firstName: z.string().min(1, "First Name is missing").min(2, "First Name is too short (min 2 chars)"),
    lastName: z.string().min(1, "Last Name is missing").min(2, "Last Name is too short (min 2 chars)"),
    gender: z.string().optional(),
    birthDate: z.union([z.number(), z.string(), z.date()]).transform((val) => {
        if (typeof val === 'number') return excelDateToJSDate(val);
        return new Date(val);
    }).optional(),
    association: z.string().optional(),
    employer: z.string().optional(),
    status: z.string().optional(),
    branch: z.string().optional(),
    joinDate: z.union([z.number(), z.string(), z.date()])
        .transform((val) => {
            if (typeof val === 'number') return excelDateToJSDate(val);
            return new Date(val);
        })
        .optional(),
    aliyahOrStudiesDate: z.union([z.number(), z.string(), z.date(), z.null()]).transform((val) => {
        if (val === null) return null;
        if (typeof val === 'number') return excelDateToJSDate(val);
        return new Date(val);
    }).optional().nullable(),
    membershipType: z.string().optional(),
    exceptionReason: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    mobilePhone: z.string().min(9, "Phone number is too short (min 9 digits)").optional(),
    mailingApproval: z.string().optional(),
    approvalDate: z.union([z.number(), z.string(), z.date(), z.null()]).transform((val) => {
        if (val === null) return null;
        if (typeof val === 'number') return excelDateToJSDate(val);
        return new Date(val);
    }).optional().nullable(),
    education: z.string().optional(),
    institution: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
