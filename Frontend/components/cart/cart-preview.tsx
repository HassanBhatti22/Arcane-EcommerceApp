"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

export function CartPreview() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/cart');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/40 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-bold">
            Cart ({totalItems})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:text-primary transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="font-display font-bold text-lg mb-1">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted-foreground">
                  Discover something extraordinary.
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-3 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant.color}-${item.variant.size}`} className="px-6 py-4 flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-secondary">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.brand}
                    </p>
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    {(item.variant.color || item.variant.size) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[item.variant.color, item.variant.size]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                Subtotal
              </span>
              <span className="font-display text-xl font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block w-full text-center px-6 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
            >
              View Cart
            </Link>
            <button
              onClick={handleCheckout}
              className="block w-full text-center mt-2 px-6 py-3.5 border-2 border-foreground text-foreground font-bold text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}