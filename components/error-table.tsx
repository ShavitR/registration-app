"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Info, Pencil, Search, X } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ErrorTableProps {
    errors: any[];
    onEdit?: (user: any) => void;
}

// Map English keys back to Hebrew headers for display
const DISPLAY_HEADERS: Record<string, string> = {
    idCard: "תעודת זהות",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    gender: "מין",
    birthDate: "תאריך לידה",
    association: "אגודה",
    employer: "מעסיק",
    status: "סטטוס",
    branch: "סניף",
    joinDate: "תאריך הצטרפות",
    aliyahOrStudiesDate: "תאריך עליה/לימודים",
    membershipType: "סוג חברות",
    exceptionReason: "סיבת חריגים",
    city: "עיר",
    street: "רחוב ומספר",
    email: "אימייל",
    mobilePhone: "טלפון נייד",
    mailingApproval: "אישור דיוור",
    approvalDate: "תאריך דחייה/אישור",
    education: "השכלה",
    institution: "מוסד לימודים",
    db: "שגיאת מערכת"
};

const CORE_FIELDS = ["idCard", "firstName", "lastName", "email", "mobilePhone"];

export function ErrorTable({ errors, onEdit }: ErrorTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchBy, setSearchBy] = useState("all");

    const filteredErrors = useMemo(() => {
        if (!searchQuery.trim()) return errors;
        const q = searchQuery.toLowerCase();

        return errors.filter(item => {
            if (searchBy === "all") {
                return (
                    (item.firstName?.toLowerCase().includes(q)) ||
                    (item.lastName?.toLowerCase().includes(q)) ||
                    (item.email?.toLowerCase().includes(q)) ||
                    (item.idCard?.toLowerCase().includes(q))
                );
            }

            const val = item[searchBy]?.toString().toLowerCase() || "";
            return val.includes(q);
        });
    }, [errors, searchQuery, searchBy]);

    if (!errors || errors.length === 0) return null;

    const renderCell = (field: string, value: any, errorList: any) => {
        const hasError = !!(errorList && errorList[field]);
        const errorMessage = hasError ? (Array.isArray(errorList[field]) ? errorList[field][0] : errorList[field]) : "";

        let displayValue = value?.toString() || "-";

        // Translate boolean-like values
        if (displayValue.toLowerCase() === 'yes' || displayValue.toLowerCase() === 'true') displayValue = "כן";
        else if (displayValue.toLowerCase() === 'no' || displayValue.toLowerCase() === 'false') displayValue = "לא";

        const isDate = field.toLowerCase().includes('date') && value;

        if (isDate) {
            try {
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    displayValue = d.toLocaleDateString("he-IL");
                }
            } catch (e) {
                // Keep original
            }
        }

        if (!hasError) {
            return (
                <span className="text-slate-300">
                    {displayValue}
                </span>
            )
        }

        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger className="cursor-help text-right w-full">
                        <span className="text-red-400 font-bold underline decoration-red-500/40 underline-offset-4 decoration-dotted">
                            {displayValue === "-" ? "חסר" : displayValue}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-950 border-red-500/30 text-red-200 p-3 shadow-xl">
                        <p className="text-right font-medium">{errorMessage}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    };

    return (
        <div className="glass-card rounded-3xl overflow-hidden mt-8" dir="rtl">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
                <div className="text-right">
                    <h3 className="text-lg font-semibold text-white">שגיאות וולידציה</h3>
                    <p className="text-sm text-slate-400">השורות הבאות לא יכלו להירשם במערכת. שגיאות מודגשות באדום.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="חיפוש חבר שנכשל..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-right h-10 rounded-xl"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchQuery("")}
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10 rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 whitespace-nowrap">חפש על פי:</span>
                        <Select value={searchBy} onValueChange={setSearchBy}>
                            <SelectTrigger className="w-32 h-10 bg-slate-900/50 border-slate-700 rounded-xl text-slate-300 text-xs">
                                <SelectValue placeholder="בחר שדה" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                <SelectItem value="all">הכל</SelectItem>
                                <SelectItem value="idCard">תעודת זהות</SelectItem>
                                <SelectItem value="firstName">שם פרטי</SelectItem>
                                <SelectItem value="lastName">שם משפחה</SelectItem>
                                <SelectItem value="email">אימייל</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[80px] text-slate-400 text-right font-bold underline decoration-slate-600 underline-offset-4">שורה</TableHead>
                            {CORE_FIELDS.map(field => (
                                <TableHead key={field} className="text-slate-400 text-right font-bold underline decoration-slate-600 underline-offset-4">
                                    {DISPLAY_HEADERS[field]}
                                </TableHead>
                            ))}
                            <TableHead className="text-slate-400 text-right font-bold underline decoration-slate-600 underline-offset-4">מידע נוסף מהקובץ</TableHead>
                            <TableHead className="text-slate-400 text-right font-bold underline decoration-slate-600 underline-offset-4">שגיאת מערכת</TableHead>
                            <TableHead className="text-slate-400 text-right font-bold underline decoration-slate-600 underline-offset-4">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredErrors.length > 0 ? (
                            filteredErrors.map((item, idx) => (
                                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-mono text-slate-500 text-right">
                                        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                                            {item.excelRow || idx + 1}
                                        </Badge>
                                    </TableCell>

                                    {CORE_FIELDS.map(field => (
                                        <TableCell key={field} className="text-right">
                                            {renderCell(field, item[field], item.errors)}
                                        </TableCell>
                                    ))}

                                    <TableCell className="text-right max-w-md">
                                        {(() => {
                                            const extraFields = Object.entries(item)
                                                .filter(([key]) => !CORE_FIELDS.includes(key) && key !== "errors" && key !== "excelRow" && item[key])
                                                .map(([key, value]) => ({
                                                    label: DISPLAY_HEADERS[key] || key,
                                                    value: value,
                                                    key: key
                                                }));

                                            if (extraFields.length === 0) return "-";

                                            return (
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl">
                                                                <Info className="w-4 h-4 shrink-0" />
                                                                <span className="text-xs">{extraFields.length} שדות</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="bg-slate-950 border-slate-800 p-0 shadow-2xl">
                                                            <div className="p-4 w-64 space-y-3" dir="rtl">
                                                                <h4 className="font-semibold text-white border-b border-white/10 pb-2 text-sm">מידע נוסף מהקובץ</h4>
                                                                <div className="space-y-2">
                                                                    {extraFields.map((f, i) => (
                                                                        <div key={i} className="flex justify-between items-start gap-4 text-xs">
                                                                            <span className="text-slate-500 whitespace-nowrap">{f.label}:</span>
                                                                            <div className="text-right">
                                                                                {renderCell(f.key, f.value, item.errors)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        })()}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {item.errors.db && (
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                                                <AlertCircle className="w-3 h-3 ml-1 shrink-0" />
                                                <span className="truncate max-w-[150px]">{item.errors.db}</span>
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit?.(item)}
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={CORE_FIELDS.length + 4} className="h-32 text-center text-slate-500">
                                    לא נמצאו תוצאות לחיפוש "{searchQuery}"
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

