"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Briefcase, MapPin, Calendar } from "lucide-react";

interface EditUserDialogProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedUser: any) => Promise<void>;
}

const FieldGroup = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4 mb-8 text-right">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 flex-row-reverse">
            <Icon className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-blue-100">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const InputField = ({ id, label, type = "text", formData, onChange, onDateChange }: {
    id: string,
    label: string,
    type?: string,
    formData: any,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onDateChange: (dateString: string | null) => string
}) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="text-right text-slate-400 text-xs block">
            {label}
        </Label>
        <Input
            id={id}
            name={id}
            type={type}
            value={type === 'date' ? onDateChange(formData[id]) : (formData[id] || "")}
            onChange={onChange}
            className="bg-slate-900/50 border-slate-700 text-white text-right h-10 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
        />
    </div>
);

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(user || {});

    // Update formData when user changes
    const identifier = user?.id || user?.excelRow;
    const currentIdentifier = formData?.id || formData?.excelRow;

    if (user && identifier !== currentIdentifier) {
        setFormData(user);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'date' && value ? new Date(value).toISOString() : value
        });
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
            return "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    const inputProps = {
        formData,
        onChange: handleChange,
        onDateChange: formatDateForInput
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border border-white/10 text-white sm:max-w-2xl p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]" dir="rtl">
                <DialogHeader className="p-6 text-right border-b border-white/5 bg-white/[0.03] shrink-0">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">עריכת פרטי חבר</DialogTitle>
                    <DialogDescription className="text-slate-400 mt-1">
                        נהלו את כל הנתונים של {formData.firstName} {formData.lastName} המאוחסנים במערכת.
                    </DialogDescription>

                    {formData.errors && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs">
                            <p className="font-bold mb-1 underline underline-offset-2">שגיאות שנמצאו:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(formData.errors).map(([key, msgs]: [string, any]) => (
                                    <li key={key}>
                                        <span className="font-medium">{key === 'db' || key === 'idCard' ? '' : (key + ': ')}</span>
                                        {Array.isArray(msgs) ? msgs.join(", ") : msgs}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                        <FieldGroup title="מידע אישי" icon={User}>
                            <InputField id="firstName" label="שם פרטי" {...inputProps} />
                            <InputField id="lastName" label="שם משפחה" {...inputProps} />
                            <InputField id="idCard" label="תעודת זהות" {...inputProps} />
                            <InputField id="gender" label="מין" {...inputProps} />
                            <InputField id="birthDate" label="תאריך לידה" type="date" {...inputProps} />
                            <InputField id="education" label="השכלה" {...inputProps} />
                            <InputField id="institution" label="מוסד לימודים" {...inputProps} />
                        </FieldGroup>

                        <FieldGroup title="מידע תעסוקתי וארגוני" icon={Briefcase}>
                            <InputField id="employer" label="מעסיק" {...inputProps} />
                            <InputField id="branch" label="סניף" {...inputProps} />
                            <InputField id="association" label="אגודה" {...inputProps} />
                            <InputField id="status" label="סטטוס" {...inputProps} />
                            <InputField id="membershipType" label="סוג חברות" {...inputProps} />
                            <InputField id="joinDate" label="תאריך הצטרפות" type="date" {...inputProps} />
                            <InputField id="approvalDate" label="תאריך אישור/דחייה" type="date" {...inputProps} />
                            <InputField id="aliyahOrStudiesDate" label="תאריך עליה/לימודים" type="date" {...inputProps} />
                            <InputField id="exceptionReason" label="סיבת חריגים" {...inputProps} />
                        </FieldGroup>

                        <FieldGroup title="קשר וכתובת" icon={MapPin}>
                            <InputField id="email" label="אימייל" type="email" {...inputProps} />
                            <InputField id="mobilePhone" label="טלפון נייד" {...inputProps} />
                            <InputField id="city" label="עיר" {...inputProps} />
                            <InputField id="street" label="רחוב ומספר" {...inputProps} />
                            <InputField id="mailingApproval" label="אישור דיוור" {...inputProps} />
                        </FieldGroup>
                    </div>

                    <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                        <p className="text-[10px] text-slate-500 text-right">עודכן לאחרונה: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString("he-IL") : "מעולם לא"}</p>
                        <div className="flex gap-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
                                ביטול
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20 min-w-32 rounded-xl h-11">
                                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                שמירת שינויים
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

