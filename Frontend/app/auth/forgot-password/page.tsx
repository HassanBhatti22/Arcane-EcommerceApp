"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiBase}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setMessage(data.message || "Reset link sent!");
            setStatus("done");
        } catch {
            setMessage("Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md">
                <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <h1 className="font-display text-3xl font-bold mb-2">Forgot Password</h1>
                <p className="text-muted-foreground mb-8">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {status === "done" ? (
                    <div className="flex flex-col items-center text-center py-8 gap-4">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                        </div>
                        <p className="font-semibold text-lg">Check your inbox!</p>
                        <p className="text-muted-foreground text-sm">{message}</p>
                        <Link href="/auth" className="text-sm underline hover:text-primary">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
