"use client";

import React from "react"

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "inverted";
}

export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const inverted = variant === "inverted";
  const { addItem } = useCart();
  const { user, addToWishlist, removeFromWishlist } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsWishlisted(user.wishlist.some((item: any) => item === product.id || item._id === product.id));
    } else {
      setIsWishlisted(false);
    }
  }, [user, product.id]);

  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      brand: product.brand,
      price: product.price,
      quantity: 1,
      variant: {
        color: product.variants.colors[0]?.name || "",
        size: product.variants.sizes[0] || "",
      },
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div
      className="group relative opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <Link href={`/product/${product.id}`}>
        {/* Image */}
        <div className={`relative aspect-[3/4] overflow-hidden mb-4 ${inverted ? "bg-background/10" : "bg-secondary"}`}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span
                className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 ${product.badge === "sale"
                  ? "bg-primary text-primary-foreground"
                  : product.badge === "new"
                    ? inverted ? "bg-background text-foreground" : "bg-foreground text-background"
                    : product.badge === "bestseller"
                      ? inverted ? "bg-background text-foreground" : "bg-foreground text-background"
                      : "bg-destructive text-destructive-foreground"
                  }`}
              >
                {product.badge === "sale" && discount
                  ? `${discount}% OFF`
                  : product.badge}
              </span>
            </div>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${isAdding
                ? "bg-success text-success-foreground"
                : inverted
                  ? "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
                  : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdding ? "Added" : "Add to Cart"}
            </button>
          </div>

          {/* Wishlist button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!user) {
                alert("Please login to add into wishlist");
                return;
              }

              const success = isWishlisted
                ? await removeFromWishlist(product.id)
                : await addToWishlist(product.id);

              if (success) {
                setIsWishlisted(!isWishlisted);
              } else if (!isWishlisted) {
                alert("This product can only be wishlisted after it has been added to the store database.");
              }
            }}
            className={`absolute top-3 right-3 p-2 backdrop-blur-sm transition-colors ${inverted ? "bg-foreground/80 hover:bg-foreground text-background" : "bg-background/80 hover:bg-background"}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-primary text-primary" : "text-foreground"
                }`}
            />
          </button>
        </div>

        {/* Info */}
        <div>
          <p className={`text-xs uppercase tracking-widest mb-1 ${inverted ? "text-background/50" : "text-muted-foreground"}`}>
            {product.brand}
          </p>
          <h3 className={`font-display font-bold text-base mb-1 group-hover:text-primary transition-colors ${inverted ? "text-background" : ""}`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating)
                    ? inverted ? "fill-background text-background" : "fill-foreground text-foreground"
                    : inverted ? "fill-background/20 text-background/20" : "fill-muted text-muted"
                    }`}
                />
              ))}
            </div>
            <span className={`text-xs ${inverted ? "text-background/50" : "text-muted-foreground"}`}>
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={`font-display font-bold text-lg ${inverted ? "text-background" : ""}`}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className={`text-sm line-through ${inverted ? "text-background/50" : "text-muted-foreground"}`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
