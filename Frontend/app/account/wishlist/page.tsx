"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X, Star } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

export default function WishlistPage() {
  const { user, reloadUser } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.wishlist) {
      setWishlistItems(user.wishlist);
    }
  }, [user]);

  const removeFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/auth/wishlist/${productId}`);
      await reloadUser();
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      brand: product.brand || 'Brand',
      price: product.price,
      quantity: 1,
      variant: {
        color: "", // Default or selected
        size: "",  // Default or selected
      },
    });
  };

  if (!user) return null; // Or loading state

  return (
    <div>
      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
        Wishlist
      </h1>
      <p className="text-muted-foreground mb-8">
        {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later.
      </p>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-bold text-lg mb-1">
            Your wishlist is empty
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Save items you love to revisit them later.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              className="group border border-border hover:border-foreground transition-colors"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                <Link href={`/product/${product._id}`}>
                  <Image
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </Link>
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Badge */}
                {/* {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                    {product.badge}
                  </span>
                )} */}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {product.brand || 'Brand'}
                </p>
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-bold text-sm hover:text-primary transition-colors mb-1">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-foreground text-foreground" />
                  <span className="text-xs font-bold">{product.rating || 0}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.numReviews || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-display font-bold">
                    ${product.price}
                  </span>
                  {/* {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )} */}
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>

                {/* <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Added {item.addedDate}
                </p> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
