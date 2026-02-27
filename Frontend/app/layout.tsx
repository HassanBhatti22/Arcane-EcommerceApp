import React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google"; // Added JetBrains Mono
import { Providers } from "@/components/providers";
import "./globals.css";

// Elegant Serif for Headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Clean Sans for Body
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Technical Mono for Numbers/Prices
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARCANE | Modern Editorial E-Commerce",
  description:
    "A distinctive, high-performance e-commerce platform with bold editorial design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} ${mono.variable} font-sans antialiased bg-white text-gray-900 selection:bg-orange-100 selection:text-orange-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
