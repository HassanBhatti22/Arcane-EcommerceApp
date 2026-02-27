"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data";
import { Zap } from "lucide-react";

interface FlashDealsProps {
  products: Product[];
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export function FlashDeals({ products }: FlashDealsProps) {
  const [endDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 12);
    return d;
  });
  const { hours, minutes, seconds } = useCountdown(endDate);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="bg-foreground text-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary fill-primary" />
              <p className="text-sm uppercase tracking-[0.3em] text-background/50">
                Limited Time
              </p>
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold">
              Flash Deals
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-wider text-background/50">
              Ends in
            </span>
            <div className="flex items-center gap-2">
              <TimerBlock value={pad(hours)} label="HRS" />
              <span className="text-2xl font-display font-bold text-primary">
                :
              </span>
              <TimerBlock value={pad(minutes)} label="MIN" />
              <span className="text-2xl font-display font-bold text-primary">
                :
              </span>
              <TimerBlock value={pad(seconds)} label="SEC" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <div key={product.id} className="flash-deal-card">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimerBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-background/40">
        {label}
      </span>
    </div>
  );
}
