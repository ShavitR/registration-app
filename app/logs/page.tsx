"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Info, Database, Upload, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Log = {
    id: number;
    action: string;
    details: string;
    entityId: string | null;
    admin: string | null;
    createdAt: string;
};

const ActionIcon = ({ action }: { action: string }) => {
    switch (action) {
        case "UPLOAD": return <Upload className="w-4 h-4" />;
        case "UPDATE_USER": return <Edit3 className="w-4 h-4" />;
        case "DELETE_USER": return <Trash2 className="w-4 h-4" />;
        default: return <Info className="w-4 h-4" />;
    }
};

const ActionBadgeColor = (action: string) => {
    switch (action) {
        case "UPLOAD": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "UPDATE_USER": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "DELETE_USER": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
};

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/logs");
                const data = await res.json();
                setLogs(data.logs || []);
            } catch (err) {
                console.error("Failed to fetch logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen py-12 px-4 selection:bg-blue-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <Link href="/users">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 pr-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Directory
                        </Button>
                    </Link>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
                        <p className="text-slate-500 text-sm">System activity history</p>
                    </div>
                </header>

                <Card className="glass-card border-white/10 overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                        <div className="flex items-center space-x-2 text-slate-300">
                            <Database className="w-5 h-5 text-blue-400" />
                            <CardTitle className="text-lg">Activity Timeline</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[70vh]">
                            <div className="p-6 space-y-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="text-slate-500 animate-pulse">Retrieving history...</p>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500">No activity recorded yet.</p>
                                    </div>
                                ) : (
                                    logs.map((log, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={log.id}
                                            className="relative pl-10 pb-8 last:pb-0 group"
                                        >
                                            {/* Timeline Line */}
                                            {idx !== logs.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-white/5 group-hover:bg-blue-500/20 transition-colors" />
                                            )}

                                            {/* Timeline Point */}
                                            <div className={clsx(
                                                "absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-white/10 bg-slate-900 z-10 transition-all group-hover:scale-110",
                                                ActionBadgeColor(log.action)
                                            )}>
                                                <ActionIcon action={log.action} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className={clsx("font-bold tracking-wider", ActionBadgeColor(log.action))}>
                                                        {log.action}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-white/10 transition-colors shadow-sm">
                                                    <p className="text-slate-200 leading-relaxed">{log.details}</p>
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center text-xs text-slate-500">
                                                            <User className="w-3 h-3 mr-1" />
                                                            {log.admin || "System"}
                                                        </div>
                                                        {log.entityId && (
                                                            <span className="text-[10px] font-mono text-slate-600">ID: {log.entityId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function clsx(...args: any[]) {
    return args.filter(Boolean).join(" ");
}
