"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            {subtitle && (
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {subtitle}
              </p>
            )}
            <h2 className="font-display text-3xl lg:text-5xl font-bold">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden lg:block text-sm uppercase tracking-wider font-bold hover:text-primary transition-colors border-b-2 border-foreground hover:border-primary pb-0.5"
              >
                View All
              </Link>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2.5 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2.5 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide px-6 lg:px-12 snap-x snap-mandatory"
        style={{ scrollPaddingLeft: "1.5rem" }}
      >
        {/* Left spacer for alignment */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: "calc((100vw - 1440px) / 2)" }} />
        {products.map((product, i) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[280px] lg:w-[320px] snap-start"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
        <div className="flex-shrink-0 w-6 lg:w-12" />
      </div>
    </section>
  );
}
