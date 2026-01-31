"use client";

import { RuleEditor } from "@/components/rule-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ValidationSettingsPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                            <h1 className="text-3xl font-bold text-white">System Settings</h1>
                        </div>
                        <p className="text-slate-500">Configure global validation and constraints</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <RuleEditor />
                </motion.div>
            </div>
        </div>
    );
}
