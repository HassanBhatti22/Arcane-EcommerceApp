"use client";

import React from "react";
import Link from "next/link";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Minimal checkout header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-[960px] px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            ARCANE
          </Link>
          <span className="text-sm text-muted-foreground uppercase tracking-wider">
            Secure Checkout
          </span>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
