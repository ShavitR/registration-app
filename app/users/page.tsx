"use client";

import { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    RowSelectionState
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowUpDown, Search, User, Home, ArrowLeft, Edit2, Trash2, Download, Clock, Info, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { EditUserDialog } from "@/components/user-edit-dialog";
import { AnalyticsCharts } from "@/components/analytics-charts";

type UserData = {
    id: number;
    idCard: string;
    firstName: string;
    lastName: string;
    gender: string | null;
    birthDate: string | null;
    association: string | null;
    employer: string | null;
    status: string | null;
    branch: string | null;
    joinDate: string | null;
    aliyahOrStudiesDate: string | null;
    membershipType: string | null;
    exceptionReason: string | null;
    city: string | null;
    street: string | null;
    email: string | null;
    mobilePhone: string | null;
    mailingApproval: string | null;
    approvalDate: string | null;
    education: string | null;
    institution: string | null;
    createdAt: string;
    updatedAt: string;
};

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
};

const CORE_FIELDS = ["idCard", "firstName", "lastName", "email", "status", "employer", "branch", "city"];

// Stats Component
function StatsCards({ stats }: { stats: { total: number, today: number } }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl border-r-4 border-r-blue-500"
            >
                <div className="flex items-center justify-between">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">סה"כ רשומים</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{stats.total}</h3>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl border-r-4 border-r-emerald-500"
            >
                <div className="flex items-center justify-between">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">הצטרפו היום</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{stats.today}</h3>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function UsersPage() {
    const [data, setData] = useState<UserData[]>([]);
    const [stats, setStats] = useState<any>({
        total: 0,
        today: 0,
        branches: [],
        statuses: [],
        genders: [],
        membershipTypes: [],
        timeline: []
    });
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [searchColumn, setSearchColumn] = useState("email");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            if (json.users) setData(json.users);
            if (json.stats) setStats(json.stats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("האם אתם בטוחים שברצונכם למחוק משתמש זה?")) return;

        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            setData(data.filter(u => u.id !== id));
            setStats({ ...stats, total: stats.total - 1 });
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkDelete = async () => {
        const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as UserData).id);

        if (selectedIds.length === 0) return;
        if (!confirm(`האם אתם בטוחים שברצונכם למחוק ${selectedIds.length} משתמשים?`)) return;

        try {
            setLoading(true);
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                setData(data.filter(u => !selectedIds.includes(u.id)));
                setRowSelection({});
                await fetchData(); // Refresh everything
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearDB = async () => {
        if (!confirm("⚠️ אזהרה: פעולה זו תמחק לצמיתות את כל החברים מהמאגר. לא ניתן לבטל פעולה זו. להמשיך?")) return;

        try {
            setLoading(true);
            const res = await fetch('/api/users/clear', { method: 'DELETE' });
            if (res.ok) {
                setData([]);
                setStats({
                    total: 0,
                    today: 0,
                    branches: [],
                    statuses: [],
                    genders: [],
                    membershipTypes: [],
                    timeline: []
                });
                alert("המאגר רוקן בהצלחה.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsEditOpen(true);
    };

    const handleSaveUser = async (updatedUser: any) => {
        try {
            const res = await fetch(`/api/users/${updatedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            if (res.ok) {
                const saved = await res.json();
                setData(data.map(u => u.id === saved.user.id ? saved.user : u));
                setIsEditOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = () => {
        const tableData = data.map(user => {
            const exportObj: any = {};
            Object.entries(DISPLAY_HEADERS).forEach(([key, label]) => {
                let value = (user as any)[key];
                if (key.toLowerCase().includes('date') && value) {
                    value = new Date(value).toLocaleDateString("he-IL");
                }
                exportObj[label] = value || "-";
            });
            return exportObj;
        });

        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "חברים");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(blob, "database_export_full.xlsx");
    };

    const columns: ColumnDef<UserData>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="בחר הכל"
                    className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="בחר שורה"
                    className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "idCard",
            header: "תעודת זהות",
            cell: ({ row }) => <span className="font-mono text-slate-300">{row.getValue("idCard")}</span>,
        },
        {
            accessorKey: "firstName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="text-slate-300 hover:text-white pr-0"
                    >
                        שם פרטי
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "lastName",
            header: "שם משפחה",
            cell: ({ row }) => <span className="font-medium text-white">{row.getValue("lastName")}</span>,
        },
        {
            accessorKey: "email",
            header: "דואר אלקטרוני",
            cell: ({ row }) => <span className="text-slate-400">{row.getValue("email") || "-"}</span>,
        },
        {
            accessorKey: "employer",
            header: "מעסיק",
            cell: ({ row }) => <span className="text-slate-400 text-sm">{row.getValue("employer") || "-"}</span>,
        },
        {
            accessorKey: "branch",
            header: "סניף",
            cell: ({ row }) => <span className="text-slate-400 text-sm">{row.getValue("branch") || "-"}</span>,
        },
        {
            accessorKey: "city",
            header: "עיר",
            cell: ({ row }) => <span className="text-slate-400 text-sm">{row.getValue("city") || "-"}</span>,
        },
        {
            accessorKey: "status",
            header: "סטטוס",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant="outline" className={clsx(
                        "border-0",
                        status === "פעיל" || status === "רגיל" ? "bg-green-500/20 text-green-300" : "bg-slate-700/50 text-slate-400"
                    )}>
                        {status || "לא ידוע"}
                    </Badge>
                )
            },
        },
        {
            id: "moreInfo",
            header: "מידע נוסף",
            cell: ({ row }) => {
                const user = row.original;
                const extraFields = Object.entries(user)
                    .filter(([key, val]) => !CORE_FIELDS.includes(key) && !["id", "createdAt", "updatedAt"].includes(key) && val)
                    .map(([key, val]) => {
                        let displayValue = val?.toString() || "-";

                        // Translate boolean-like values
                        if (displayValue.toLowerCase() === 'yes' || displayValue.toLowerCase() === 'true') displayValue = "כן";
                        else if (displayValue.toLowerCase() === 'no' || displayValue.toLowerCase() === 'false') displayValue = "לא";

                        if (key.toLowerCase().includes('date') && val) {
                            try {
                                const d = new Date(val as string);
                                if (!isNaN(d.getTime())) {
                                    displayValue = d.toLocaleDateString("he-IL");
                                }
                            } catch (e) {
                                // Keep original value if parsing fails
                            }
                        }
                        return { label: DISPLAY_HEADERS[key] || key, value: displayValue };
                    });

                if (extraFields.length === 0) return "-";

                return (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl">
                                    <Info className="w-4 h-4" />
                                    <span className="text-xs">{extraFields.length} שדות</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-slate-950 border-slate-800 p-0 shadow-2xl">
                                <div className="p-4 w-64 space-y-3" dir="rtl">
                                    <h4 className="font-semibold text-white border-b border-white/10 pb-2 text-sm">מידע משלים</h4>
                                    <div className="space-y-2">
                                        {extraFields.map((f, i) => (
                                            <div key={i} className="flex justify-between items-start gap-4 text-xs">
                                                <span className="text-slate-500 whitespace-nowrap">{f.label}:</span>
                                                <span className="text-slate-200 text-right">{f.value as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10" onClick={() => handleEdit(user)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4 selection:bg-primary/30" dir="rtl">
            <EditUserDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                user={editingUser}
                onSave={handleSaveUser}
            />
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                חזרה לעמוד הראשי
                            </Button>
                        </Link>
                        <Link href="/logs">
                            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <Clock className="ml-2 h-4 w-4" />
                                צפייה בלוגים
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={handleClearDB}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <Trash2 className="ml-2 h-4 w-4" />
                            ריקון מאגר
                        </Button>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-white leading-tight">מאגר חברים</h1>
                        <p className="text-slate-500">ניהול חברים רשומים במערכת</p>
                    </div>
                </div>

                <StatsCards stats={stats} />
                <AnalyticsCharts data={stats} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl overflow-hidden p-6 mt-8"
                >
                    <div className="flex flex-wrap items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-2 w-full max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder={`חיפוש לפי ${DISPLAY_HEADERS[searchColumn]}...`}
                                    value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                                    }
                                    className="pr-10 pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-right h-10 rounded-xl"
                                />
                                {(table.getColumn(searchColumn)?.getFilterValue() as string) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => table.getColumn(searchColumn)?.setFilterValue("")}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10 rounded-full"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 whitespace-nowrap">חפש על פי:</span>
                                <Select
                                    value={searchColumn}
                                    onValueChange={(val) => {
                                        // Clear current filter before switching
                                        table.getColumn(searchColumn)?.setFilterValue("");
                                        setSearchColumn(val);
                                    }}
                                >
                                    <SelectTrigger className="w-32 h-10 bg-slate-900/50 border-slate-700 rounded-xl text-slate-300 text-xs">
                                        <SelectValue placeholder="בחר שדה" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                        <SelectItem value="email">אימייל</SelectItem>
                                        <SelectItem value="firstName">שם פרטי</SelectItem>
                                        <SelectItem value="lastName">שם משפחה</SelectItem>
                                        <SelectItem value="idCard">תעודת זהות</SelectItem>
                                        <SelectItem value="employer">מעסיק</SelectItem>
                                        <SelectItem value="branch">סניף</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {table.getSelectedRowModel().rows.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                    className="shadow-lg shadow-red-500/20"
                                >
                                    <Trash2 className="ml-2 h-4 w-4" />
                                    מחיקת {table.getSelectedRowModel().rows.length} נבחרים
                                </Button>
                            )}
                        </div>
                        <Button
                            onClick={handleExport}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        >
                            <Download className="ml-2 h-4 w-4" />
                            ייצוא ל-Excel
                        </Button>
                    </div>

                    <div className="rounded-xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} className="text-slate-400 text-right">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-3 text-right">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                                            לא נמצאו תוצאות.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-start space-x-2 space-x-reverse py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            הקודם
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            הבא
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
