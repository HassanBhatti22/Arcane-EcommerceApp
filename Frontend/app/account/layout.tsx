"use client";

import React from "react";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen pt-20 lg:pt-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
            <AccountSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </CartProvider>
  );
}
