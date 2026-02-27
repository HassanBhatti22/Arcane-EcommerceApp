"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";

function ResetForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setMessage("Passwords don't match.");
            setStatus("error");
            return;
        }
        if (password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            setStatus("error");
            return;
        }
        setStatus("loading");
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiBase}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.message || "Reset failed.");
                setStatus("error");
                return;
            }
            setStatus("done");
            setTimeout(() => router.push("/auth"), 2000);
        } catch {
            setMessage("Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center py-16">
                <p className="text-destructive font-semibold mb-4">Invalid or missing reset link.</p>
                <Link href="/auth/forgot-password" className="underline hover:text-primary text-sm">
                    Request a new one
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>

            <h1 className="font-display text-3xl font-bold mb-2">Set New Password</h1>
            <p className="text-muted-foreground mb-8 text-sm">
                Resetting password for <span className="font-semibold text-foreground">{email}</span>
            </p>

            {status === "done" ? (
                <div className="flex flex-col items-center text-center py-8 gap-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <p className="font-semibold text-lg">Password Reset!</p>
                    <p className="text-muted-foreground text-sm">Redirecting you to login...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type={showPw ? "text" : "password"}
                            required
                            placeholder="New password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 border border-border bg-background rounded-none focus:outline-none focus:ring-2 focus:ring-foreground text-sm"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type={showPw ? "text" : "password"}
                            required
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background rounded-none focus:outline-none focus:ring-2 focus:ring-foreground text-sm"
                        />
                    </div>

                    {status === "error" && (
                        <p className="text-sm text-destructive">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-3 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {status === "loading" ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <Suspense fallback={<div className="p-16 text-center text-muted-foreground">Loading...</div>}>
                <ResetForm />
            </Suspense>
        </div>
    );
}
