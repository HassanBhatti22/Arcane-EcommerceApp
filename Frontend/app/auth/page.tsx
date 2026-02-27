"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type AuthTab = "signin" | "signup";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Sign Up form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn(signInEmail, signInPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      setSuccess(true);
      // Redirect admins to dashboard, others to the redirect param (e.g. /cart) or account
      const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : redirectTo;
      router.push(redirectPath);
    } else {
      setError(result.error || "Sign in failed");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp({
      name: signUpName,
      email: signUpEmail,
      phone: signUpPhone,
      password: signUpPassword,
    });
    setIsSubmitting(false);

    if (result.success) {
      if (result.requiresVerification) {
        setVerificationPending(true);
        setVerificationEmail(signUpEmail);
      } else {
        setSuccess(true);
        router.push(redirectTo);
      }
    } else {
      setError(result.error || "Sign up failed");
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setError("");
    setIsSubmitting(true);
    const result = await signIn(
      `${provider.toLowerCase()}.user@example.com`,
      "social-auth"
    );
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      router.push("/account");
    }
  };

  const resetForm = (tab: AuthTab) => {
    setActiveTab(tab);
    setError("");
    setSuccess(false);
    setShowPassword(false);
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return { level: 0, label: "" };
    if (pw.length < 6) return { level: 1, label: "Weak" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const strength = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(
      Boolean
    ).length;
    if (strength >= 4) return { level: 4, label: "Strong" };
    if (strength >= 3) return { level: 3, label: "Good" };
    if (strength >= 2) return { level: 2, label: "Fair" };
    return { level: 1, label: "Weak" };
  };

  const pwStrength = passwordStrength(signUpPassword);
  const strengthColors = ["", "bg-destructive", "bg-primary", "bg-chart-4", "bg-success"];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel -- Branding */}
      <div className="relative hidden lg:flex lg:w-[45%] bg-foreground text-background flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] border border-background/10 translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            ARCANE
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-6 text-balance">
            Welcome to the future of shopping.
          </h1>
          <p className="text-lg text-background/60 leading-relaxed">
            Discover curated collections from the world&apos;s finest brands. Sign in to unlock exclusive deals, track orders, and personalize your experience.
          </p>

          {/* Trust Features */}
          <div className="mt-12 flex flex-col gap-4">
            {[
              "Free shipping on orders over $50",
              "30-day hassle-free returns",
              "Secure payments with encryption",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm text-background/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-background/30">
          &copy; {new Date().getFullYear()} ARCANE. All rights reserved.
        </p>
      </div>

      {/* Right Panel -- Auth Forms */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-border">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            ARCANE
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Shop
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Email Verification Pending State */}
            {verificationPending ? (
              <div className="text-center animate-fade-in flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center mx-auto rounded-full">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold">Check Your Email</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We sent a verification link to <br />
                  <span className="font-bold text-foreground">{verificationEmail}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the link in the email to activate your account. The link expires in 24 hours.
                </p>
                <button
                  onClick={() => { setVerificationPending(false); setVerificationEmail(""); resetForm("signin"); }}
                  className="text-xs underline text-muted-foreground hover:text-foreground mt-2"
                >
                  Back to Login
                </button>
              </div>
            ) : success ? (
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-success text-success-foreground flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">
                  {activeTab === "signin" ? "Welcome back!" : "Account created!"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex mb-8">
                  <button
                    onClick={() => resetForm("signin")}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "signin"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => resetForm("signup")}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "signup"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Sign In Form */}
                {activeTab === "signin" && (
                  <form onSubmit={handleSignIn} className="flex flex-col gap-5 animate-fade-in">
                    <div>
                      <label
                        htmlFor="signin-email"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Email or Phone Number
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signin-email"
                          type="text"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full pl-10 pr-12 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 border border-border accent-primary"
                        />
                        <span className="text-xs text-muted-foreground">
                          Remember me
                        </span>
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Sign Up Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignUp} className="flex flex-col gap-4 animate-fade-in">
                    <div>
                      <label
                        htmlFor="signup-name"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signup-name"
                          type="text"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-email"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signup-email"
                          type="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-phone"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Phone Number
                        <span className="text-muted-foreground/50 font-normal normal-case ml-1">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signup-phone"
                          type="tel"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-password"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-12 py-3 bg-transparent border border-border text-sm font-sans focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {/* Password strength indicator */}
                      {signUpPassword.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 transition-colors ${i <= pwStrength.level
                                  ? strengthColors[pwStrength.level]
                                  : "bg-border"
                                  }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-xs font-bold ${pwStrength.level <= 1
                              ? "text-destructive"
                              : pwStrength.level === 2
                                ? "text-primary"
                                : pwStrength.level === 3
                                  ? "text-chart-4"
                                  : "text-success"
                              }`}
                          >
                            {pwStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-confirm"
                        className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          value={signUpConfirm}
                          onChange={(e) => setSignUpConfirm(e.target.value)}
                          placeholder="Re-enter your password"
                          required
                          className={`w-full pl-10 pr-10 py-3 bg-transparent border text-sm font-sans focus:outline-none transition-colors placeholder:text-muted-foreground/60 ${signUpConfirm.length > 0 && signUpPassword !== signUpConfirm
                            ? "border-destructive focus:border-destructive"
                            : signUpConfirm.length > 0 && signUpPassword === signUpConfirm
                              ? "border-success focus:border-success"
                              : "border-border focus:border-foreground"
                            }`}
                        />
                        {signUpConfirm.length > 0 && signUpPassword === signUpConfirm && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                        )}
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 border border-border accent-primary"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className="text-foreground font-bold hover:text-primary">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="text-foreground font-bold hover:text-primary">
                          Privacy Policy
                        </button>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Social Login */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSocialLogin("Google")}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-border text-sm font-bold hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    Google
                  </button>
                  <button
                    onClick={() => handleSocialLogin("Facebook")}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-border text-sm font-bold hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                    Facebook
                  </button>
                </div>

                {/* Footer link */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                  {activeTab === "signin" ? (
                    <>
                      {"Don't have an account? "}
                      <button
                        onClick={() => resetForm("signup")}
                        className="font-bold text-foreground hover:text-primary transition-colors"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => resetForm("signin")}
                        className="font-bold text-foreground hover:text-primary transition-colors"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
