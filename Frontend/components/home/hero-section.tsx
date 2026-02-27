"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// You can easily change the slider images by updating the URLs in this array
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Woman with shopping bags - existing
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop", // Dense Boutique Rack - existing
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop", // Professional mannequin fashion showcase
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop", // Elegant fashion/accessories luxury shot
];

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Changes image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[500px] h-[85vh] max-h-[700px] flex items-center overflow-hidden">
      {/* Background Images Slider */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
        >
          <Image
            src={src}
            alt={`Hero slider image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-8 py-12">
        <div className="max-w-2xl">
          <p
            className="text-xs uppercase tracking-[0.25em] text-background/60 mb-3 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            New Season 2026
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-background leading-[1.1] mb-5">
            <span
              className="block opacity-0 animate-fade-in-up"
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            >
              Redefine
            </span>
            <span
              className="block opacity-0 animate-fade-in-up"
              style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
              Your
            </span>
            <span
              className="block text-primary opacity-0 animate-fade-in-up"
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
              Everyday.
            </span>
          </h1>
          <p
            className="text-background/80 text-base md:text-lg max-w-lg mb-6 opacity-0 animate-fade-in-up leading-relaxed"
            style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
          >
            Curated collections that bridge the gap between artistry and
            function. Bold design for discerning taste.
          </p>
          <div
            className="flex flex-wrap gap-3 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop/electronics"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-background text-background font-bold text-xs uppercase tracking-wider hover:bg-background hover:text-foreground transition-all"
            >
              Explore New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 right-4 lg:right-8 z-10 hidden lg:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-background/40 text-xs uppercase tracking-widest rotate-90 origin-center translate-y-6">
            Scroll
          </span>
          <div className="w-px h-10 bg-background/30 mt-8" />
        </div>
      </div>
    </section>
  );
}
