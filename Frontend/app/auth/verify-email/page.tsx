"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token || !email) {
            setStatus("error");
            setMessage("Invalid verification link. Please check your email again.");
            return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        fetch(`${apiBase}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message?.toLowerCase().includes("successfully")) {
                    setStatus("success");
                    setMessage(data.message);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            });
    }, [token, email]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md text-center flex flex-col items-center gap-6 py-16">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Verifying your email address...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="font-display text-3xl font-bold">Email Verified!</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <Link
                            href="/auth"
                            className="inline-block bg-foreground text-background px-8 py-3 font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
                        >
                            Log In to Your Account
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="font-display text-3xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/auth"
                                className="inline-block border border-border px-6 py-3 font-bold text-sm uppercase tracking-wider hover:border-foreground transition-colors"
                            >
                                Back to Login
                            </Link>
                            <Link
                                href="/auth/forgot-password"
                                className="inline-block bg-foreground text-background px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
                            >
                                Request New Link
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
