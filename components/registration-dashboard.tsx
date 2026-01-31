"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Upload, CheckCircle, XCircle, FileSpreadsheet, Loader2, Users, AlertCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ErrorTable } from "@/components/error-table";
import { ModeToggle } from "@/components/mode-toggle";
import { EditUserDialog } from "@/components/user-edit-dialog";

export default function RegistrationDashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Persistence
    const [persistentFile, setPersistentFile] = useState<{ name: string, size: number } | null>(null);

    // Initial load from storage
    useEffect(() => {
        const savedResult = localStorage.getItem("lastRegistrationResult");
        const savedFile = localStorage.getItem("lastUploadedFile");

        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
            } catch (e) {
                console.error("Failed to load saved results", e);
            }
        }

        if (savedFile) {
            try {
                setPersistentFile(JSON.parse(savedFile));
            } catch (e) {
                console.error("Failed to load saved file metadata", e);
            }
        }
    }, []);

    // Save results on change
    useEffect(() => {
        if (result) {
            localStorage.setItem("lastRegistrationResult", JSON.stringify(result));
        } else {
            localStorage.removeItem("lastRegistrationResult");
        }
    }, [result]);

    // Editing for failed users
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPersistentFile(null);
            localStorage.removeItem("lastUploadedFile");
            setResult(null);
            setError(null);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const f = e.dataTransfer.files[0];
            setFile(f);
            setPersistentFile(null);
            localStorage.removeItem("lastUploadedFile");
            setResult(null);
            setError(null);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const [res] = await Promise.all([
                fetch("/api/upload", { method: "POST", body: formData }),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "משהו השתבש בעיבוד הקובץ");
            }

            setResult(data);
            // Save file metadata
            const meta = { name: file.name, size: file.size };
            setPersistentFile(meta);
            localStorage.setItem("lastUploadedFile", JSON.stringify(meta));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFailedUser = (user: any) => {
        setEditingUser(user);
        setShowEditDialog(true);
    };

    const handleSaveFailedUser = async (updatedUser: any) => {
        try {
            // Remove error metadata before saving
            const { errors, excelRow, ...userData } = updatedUser;

            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            if (!res.ok) {
                // If it fails again, update the record in the list with new error info
                setResult({
                    ...result,
                    errors: result.errors.map((e: any) =>
                        (e.excelRow === updatedUser.excelRow)
                            ? { ...updatedUser, errors: { db: data.error } }
                            : e
                    )
                });
                return;
            }

            // If success, remove from errors and increment success count
            setResult({
                ...result,
                addedCount: result.addedCount + 1,
                errorCount: result.errorCount - 1,
                errors: result.errors.filter((e: any) => e.excelRow !== updatedUser.excelRow)
            });
            setShowEditDialog(false);
            setEditingUser(null);
        } catch (err: any) {
            console.error("Failed to save edited user:", err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 selection:bg-primary/30 relative" dir="rtl">

            {/* Top Bar for Theme Toggle */}
            <div className="absolute top-8 left-8 z-50">
                <ModeToggle />
            </div>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-12 relative z-10"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl mb-6 ring-1 ring-white/10"
                >
                    <Users className="w-10 h-10 text-blue-400" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-white to-purple-600 leading-tight">
                    לשכת המהנדסים - קליטת חברים מרוכזת
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light tracking-wide">
                    מערכת רישום חברים מתקדמת.
                    <span className="block mt-1 text-slate-500 text-base">מאובטח. מהיר. חכם.</span>
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <div className="glass-card rounded-3xl p-1 overflow-hidden">

                    <div className="bg-slate-900/50 p-8 md:p-12 rounded-[22px]">
                        <div className="mb-8 text-right">
                            <h2 className="text-2xl font-semibold text-white mb-2">ייבוא נתונים</h2>
                            <p className="text-slate-400 text-sm">העלו קובץ Excel מאומת לרישום חברים.</p>
                        </div>

                        <div
                            className={clsx(
                                "relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-out cursor-pointer overflow-hidden",
                                dragActive ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30",
                                file ? "border-green-500/50 bg-green-500/5" : ""
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />

                            <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                                <div className={clsx(
                                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-500",
                                    file ? "bg-green-500/20 text-green-400 shadow-[0_0_30px_-5px_rgba(74,222,128,0.3)]" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-blue-400 group-hover:scale-110"
                                )}>
                                    {file ? <CheckCircle className="w-10 h-10" /> : <FileSpreadsheet className="w-10 h-10" />}
                                </div>

                                {file || persistentFile ? (
                                    <div className="space-y-2">
                                        <p className="text-2xl font-medium text-white tracking-tight leading-tight">
                                            {file?.name || persistentFile?.name}
                                        </p>
                                        <p className="text-sm text-slate-400 font-mono">
                                            {((file?.size || persistentFile?.size || 0) / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xl font-medium text-slate-200">גררו קובץ לכאן או לחצו לבחירה</p>
                                        <p className="text-sm text-slate-500">תומך בפורמטים .xlsx ו-.xls</p>
                                    </div>
                                )}
                            </div>

                            {/* Scanline Effect */}
                            {loading && (
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent w-full h-[20%] animate-scan" />
                            )}
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3 text-red-200">
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                        <div className="text-sm mr-3 text-right">{error}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                            <div className="flex items-center gap-3">
                                <Link href="/users">
                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                        <Users className="ml-2 h-4 w-4" />
                                        מאגר חברים
                                    </Button>
                                </Link>
                                <Link href="/settings/validation">
                                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                                        <ShieldCheck className="ml-2 h-4 w-4" />
                                        חוקי וולידציה
                                    </Button>
                                </Link>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className={clsx(
                                    "h-14 px-8 rounded-xl font-medium text-lg transition-all duration-300",
                                    !file || loading
                                        ? "bg-slate-800 text-slate-500"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.7)] hover:scale-[1.02]"
                                )}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                        <span>מעבד...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span>עיבוד קובץ רישום</span>
                                        <Upload className="mr-2 h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Success Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle className="w-32 h-32 text-emerald-400" />
                            </div>
                            <div className="relative z-10 text-right">
                                <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-4 text-emerald-400 ring-1 ring-emerald-500/20">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-300">חברים שנרשמו</h3>
                                <div className="mt-2 flex items-baseline justify-end space-x-2">
                                    <span className="text-emerald-400 font-medium ml-2">חדשים +</span>
                                    <span className="text-5xl font-bold text-white tracking-tight">{result.addedCount}</span>
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </motion.div>

                        {/* Error Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle className="w-32 h-32 text-rose-400" />
                            </div>
                            <div className="relative z-10 text-right">
                                <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-2xl mb-4 text-rose-400 ring-1 ring-rose-500/20">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-300">שגיאות וולידציה</h3>
                                <div className="mt-2 flex items-baseline justify-end space-x-2">
                                    <span className="text-rose-400 font-medium ml-2">נכשלו</span>
                                    <span className="text-5xl font-bold text-white tracking-tight">{result.errorCount}</span>
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-rose-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </motion.div>

                        {/* Detailed Results with Smart Error Table */}
                        {result.errors.length > 0 && (
                            <div className="col-span-1 md:col-span-2">
                                <ErrorTable
                                    errors={result.errors}
                                    onEdit={handleEditFailedUser}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    onSave={handleSaveFailedUser}
                />
            )}
        </div >
    );
}
