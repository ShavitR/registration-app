"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Info } from "lucide-react";
import { motion } from "framer-motion";

const HEBREW_LABELS: Record<string, string> = {
    idCard: "תעודת זהות",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    email: "אימייל",
    mobilePhone: "טלפון נייד"
};

export function RuleEditor() {
    const [rules, setRules] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<any>(null);

    useEffect(() => {
        fetch("/api/rules")
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                    setMessage({ type: "error", text: `שגיאת API: ${errorMsg}` });
                    setLoading(false);
                } else {
                    setRules(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                setMessage({ type: "error", text: "חיבור לשרת נכשל." });
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        if (!rules) return;
        setSaving(true);
        try {
            const res = await fetch("/api/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rules)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: "חוקי הוולידציה עודכנו בהצלחה!" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                setMessage({ type: "error", text: errorMsg || "שמירת החוקים נכשלה." });
            }
        } catch (e) {
            setMessage({ type: "error", text: "שמירת החוקים נכשלה." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12" dir="rtl">
            <Loader2 className="animate-spin w-10 h-10 text-blue-500 mb-4" />
            <p className="text-slate-400">טוען את חוקי הוולידציה...</p>
        </div>
    );

    if (!rules && message?.type === "error") {
        return (
            <div className="max-w-2xl mx-auto" dir="rtl">
                <Card className="glass-card border-rose-500/20 bg-rose-500/5 text-white">
                    <CardHeader>
                        <CardTitle className="text-rose-400 text-right">שגיאת תצורה</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right">
                        <p className="text-slate-300 mb-6">{message.text}</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700">
                            נסה להתחבר שוב
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const fields = Object.keys(rules);

    return (
        <div className="space-y-6 max-w-2xl mx-auto" dir="rtl">
            <Card className="glass-card border-white/10 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-end">
                        ספר חוקי וולידציה
                        <Info className="w-5 h-5 text-blue-400" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map(field => (
                        <div key={field} className="flex flex-col items-end p-5 bg-white/[0.03] rounded-2xl border border-white/5 gap-4">
                            <p className="font-semibold text-white text-lg w-full text-right">{HEBREW_LABELS[field] || rules[field].label || field}</p>

                            <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                                {rules[field].min !== undefined && (
                                    <div className="flex items-center gap-4 bg-slate-800/40 px-4 py-2 rounded-xl border border-white/5 min-w-[200px]">
                                        <span className="text-sm text-slate-300 flex-1 text-right">אורך מינימלי</span>
                                        <Input
                                            type="number"
                                            className="w-16 h-8 bg-slate-900/80 border-slate-700 text-sm text-center focus:border-blue-500 focus:ring-blue-500/20"
                                            value={rules[field].min}
                                            onChange={(e) => setRules({ ...rules, [field]: { ...rules[field], min: parseInt(e.target.value) || 0 } })}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-4 bg-slate-800/40 px-4 py-2 rounded-xl border border-white/5 min-w-[160px]">
                                    <span className="text-sm text-slate-300 font-medium whitespace-nowrap flex-1 text-right">שדה חובה</span>
                                    <div dir="ltr" className="flex items-center">
                                        <Switch
                                            checked={rules[field].required}
                                            onCheckedChange={(val: boolean) => setRules({ ...rules, [field]: { ...rules[field], required: val } })}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-6 flex items-center justify-between border-t border-white/5 mt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 px-8 shadow-lg shadow-blue-600/20"
                        >
                            {saving ? <Loader2 className="animate-spin w-4 h-4 ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                            שמירת חוקים
                        </Button>
                        {message && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={message.type === "success" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}
                            >
                                {message.text}
                            </motion.span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
