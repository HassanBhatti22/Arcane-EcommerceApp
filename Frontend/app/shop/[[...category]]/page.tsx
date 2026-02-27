"use client";

import { useState, useMemo, useEffect } from "react";
import { categories, type Product } from "@/lib/data";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const defaultFilters = {
  priceRange: [0, 10000] as [number, number],
  brands: [] as string[],
  ratings: [] as number[],
  colors: [] as string[],
  sizes: [] as string[],
};

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Rating", value: "rating" },
];

export default function ShopPage() {
  const params = useParams();
  const categorySlug = params?.category
    ? Array.isArray(params.category)
      ? params.category[0]
      : params.category
    : null;

  const category = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (categorySlug) {
      filtered = filtered.filter((p) => p.category === categorySlug);
    }

    // Filter by price
    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by brand
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Filter by rating
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => (a.badge === "new" ? -1 : 1));
        break;
    }

    return filtered;
  }, [categorySlug, filters, sort, products]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/shop"
            className={`hover:text-foreground transition-colors ${!category ? "text-foreground font-bold" : ""}`}
          >
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-bold">{category.name}</span>
            </>
          )}
        </nav>
      </div>

      {/* Page Header */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pb-8 lg:pb-12">
        <h1 className="font-display text-4xl lg:text-6xl font-bold">
          {category ? category.name : "All Products"}
        </h1>
        {category && (
          <p className="text-muted-foreground mt-2">
            {filteredProducts.length} products
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-y border-border">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <p className="text-sm text-muted-foreground hidden lg:block">
              {filteredProducts.length} products
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm bg-transparent border-none font-bold cursor-pointer outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="hidden lg:flex items-center gap-1 border-l border-border pl-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${viewMode === "grid" ? "text-foreground" : "text-muted-foreground"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${viewMode === "list" ? "text-foreground" : "text-muted-foreground"}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 lg:py-12">
        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[280px] flex-shrink-0 sticky top-24 self-start">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(defaultFilters)}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-24">
                <p className="font-display text-2xl font-bold mb-2">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-2xl font-bold mb-2">
                  No products found
                </p>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to find what you are looking for.
                </p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="px-6 py-3 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-6"
                }
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/40 z-50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-background z-50 lg:hidden overflow-y-auto animate-slide-in-right p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(defaultFilters)}
            />
            <div className="mt-8">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
