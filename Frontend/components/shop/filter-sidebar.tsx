"use client";

import React from "react"

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

interface Filters {
  priceRange: [number, number];
  brands: string[];
  ratings: number[];
  colors: string[];
  sizes: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const brands = [
  { name: "Aether Audio", count: 24 },
  { name: "Stride", count: 18 },
  { name: "Voss & Co", count: 12 },
  { name: "Norde", count: 31 },
  { name: "Lumiere Studio", count: 9 },
  { name: "Veil Skincare", count: 15 },
  { name: "Maison Raw", count: 7 },
];

const colors = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Navy", hex: "#1b2838" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Brown", hex: "#8b4513" },
  { name: "Orange", hex: "#ff4d00" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  const activeCount =
    filters.brands.length +
    filters.ratings.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-lg font-bold">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            Clear All ({activeCount})
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen>
        <div className="px-1">
          <Slider
            min={0}
            max={10000}
            step={10}
            value={filters.priceRange}
            onValueChange={(value) =>
              onChange({ ...filters, priceRange: value as [number, number] })
            }
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </FilterSection>



      {/* Rating */}
      <FilterSection title="Rating">
        <div className="flex flex-col gap-3">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.ratings.includes(rating)}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...filters.ratings, rating]
                    : filters.ratings.filter((r) => r !== rating);
                  onChange({ ...filters, ratings: next });
                }}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating
                      ? "fill-foreground text-foreground"
                      : "fill-muted text-muted"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{"& up"}</span>
            </label>
          ))}
        </div>
      </FilterSection>




    </aside>
  );
}

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
