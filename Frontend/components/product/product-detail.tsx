// ... imports
"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Truck,
  RotateCcw,
  Shield,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { ProductGallery } from "./product-gallery";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ProductReviews } from "./product-reviews";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { user, reloadUser } = useAuth();
  const [selectedColor, setSelectedColor] = useState(
    product.variants.colors[0]?.name || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants.sizes[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications"
  >("description");

  useEffect(() => {
    if (user && user.wishlist) {
      const exists = user.wishlist.some((item: any) => item._id === product.id || item.id === product.id);
      setIsWishlisted(exists);
    }
  }, [user, product.id]);

  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      brand: product.brand,
      price: product.price,
      quantity,
      variant: {
        color: selectedColor,
        size: selectedSize,
      },
    });
    setTimeout(() => setIsAdding(false), 1500);
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert("Please login to manage wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/auth/wishlist/${product.id}`);
        setIsWishlisted(false);
      } else {
        await api.post('/auth/wishlist', { productId: product.id });
        setIsWishlisted(true);
      }
      await reloadUser();
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  };



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
            href={`/shop/${product.category}`}
            className="hover:text-foreground transition-colors capitalize"
          >
            {product.category.replace("-", " & ")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Product Main */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Info */}
          <div className="lg:py-4">
            {/* Brand & SKU */}
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
              {product.brand} / SKU: {product.id.padStart(6, "0")}
            </p>

            {/* Name */}
            <h1 className="font-display text-3xl lg:text-5xl font-bold leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating)
                      ? "fill-foreground text-foreground"
                      : "fill-muted text-muted"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-display text-3xl font-bold text-primary">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="text-sm font-bold bg-primary text-primary-foreground px-2 py-1">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>



            {/* Size Variants */}
            {product.variants.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold uppercase tracking-wider">
                    Size: {selectedSize}
                  </p>
                  <button className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary underline transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-sm font-bold border transition-all ${selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider mb-3">
                Quantity
              </p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 font-display font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-3 hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock */}
            <p
              className={`text-sm font-bold mb-6 ${product.stock <= 5 ? "text-destructive" : "text-success"
                }`}
            >
              {product.stock <= 5
                ? `Only ${product.stock} left!`
                : "In Stock"}
            </p>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 ${isAdding
                ? "bg-success text-success-foreground"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                }`}
            >
              {isAdding ? "Added to Cart!" : "Add to Cart"}
            </button>

            {/* Secondary Actions */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={toggleWishlist}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border font-bold text-sm uppercase tracking-wider transition-colors ${isWishlisted ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground'}`}
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button
                className="px-4 py-3 border border-border hover:border-foreground transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trust */}
            <div className="mt-8 pt-8 border-t border-border flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" strokeWidth={1.5} />
                Free shipping on orders over $100
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                30-day free returns
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                2-year warranty included
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 lg:mt-24">
          <div className="flex border-b border-border gap-8">
            {(["description", "specifications"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${activeTab === tab
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="max-w-2xl">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="max-w-2xl">
                <div className="divide-y divide-border">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between py-4"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {spec.label}
                      </span>
                      <span className="text-muted-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews component moved outside tabs */}
          </div>
        </div>

        <ProductReviews
          productId={product.id}
          productRating={product.rating}
          initialReviews={product.reviews || []}
        />
      </div>
    </div>
  );
}
