"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-0 items-stretch">
        {/* Image (3/5) */}
        <div className="lg:col-span-3 relative min-h-[400px] lg:min-h-[600px] overflow-hidden">
          <Image
            src="/images/editorial.jpg"
            alt="Editorial collection feature"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {/* Content (2/5) */}
        <div className="lg:col-span-2 bg-secondary flex flex-col justify-center p-8 lg:p-14">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            The Edit
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-6 text-balance">
            The Art of
            <br />
            Modern Living
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
            Our latest collection bridges the gap between contemporary design
            and everyday function. Each piece is thoughtfully curated to
            transform how you experience your space.
          </p>
          <Link
            href="/shop/home-living"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-bold hover:text-primary transition-colors group"
          >
            Explore the Collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
