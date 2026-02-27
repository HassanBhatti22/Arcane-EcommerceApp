"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  Tag,
  CreditCard,
  Truck,
  Check,
  Loader2,
  MapPin,
  Shield,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import getStripe from "@/lib/get-stripe";
import { products } from "@/lib/data";

type PaymentMethod = "stripe" | "cod";

interface CODAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [codError, setCodError] = useState("");
  const [codAddress, setCodAddress] = useState<CODAddress>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const discount = promoApplied ? totalPrice * 0.1 : 0;
  const grandTotal = totalPrice - discount + shipping;

  const handleStripeCheckout = async () => {
    if (!user) {
      router.push("/auth?redirect=/cart");
      return;
    }
    setIsLoading(true);
    try {
      const stripe = await getStripe();
      if (!stripe) return;
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCODCheckout = async () => {
    if (!user) {
      router.push("/auth?redirect=/cart");
      return;
    }
    setCodError("");
    const { fullName, address, city, postalCode, country, phone } = codAddress;
    if (!fullName || !address || !city || !postalCode || !country || !phone) {
      setCodError("Please fill in all delivery fields.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const orderItems = items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || "",
        price: item.price,
        product: item.productId,
      }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress: { address: codAddress.address, city: codAddress.city, postalCode: codAddress.postalCode, country: codAddress.country },
          paymentMethod: "Cash on Delivery",
          itemsPrice: totalPrice - discount,
          shippingPrice: shipping,
          totalPrice: grandTotal,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to place COD order");
      }
      const order = await response.json();
      clearCart();
      router.push(`/checkout?cod=true&order_id=${order._id}`);
    } catch (error: unknown) {
      setCodError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const recommendedProducts = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" strokeWidth={1} />
          <h1 className="font-display text-3xl lg:text-5xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            Looks like you haven&apos;t found anything yet.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors group">
            Continue Shopping
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-24">
          <h2 className="font-display text-2xl font-bold mb-8">You Might Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-bold">Cart</span>
      </nav>

      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ─── LEFT: Cart Items (3 cols) ─── */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Cart Items */}
          <div className="bg-secondary/40 border border-border">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-6 px-6 py-3 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <span>Product</span>
              <span className="w-28 text-center">Quantity</span>
              <span className="w-20 text-right">Total</span>
              <span className="w-8" />
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant.color}-${item.variant.size}`}
                  className="px-6 py-5 grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_auto_auto_auto] gap-4 sm:gap-6 items-center">
                  <div className="flex gap-4 col-span-2 sm:col-span-1">
                    <Link href={`/product/${item.productId}`}
                      className="relative w-20 h-24 flex-shrink-0 bg-secondary overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
                    </Link>
                    <div className="flex flex-col justify-center">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.brand}</p>
                      <Link href={`/product/${item.productId}`} className="font-display font-bold hover:text-primary transition-colors text-sm">
                        {item.name}
                      </Link>
                      {(item.variant.color || item.variant.size) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      <p className="font-bold text-sm mt-1 sm:hidden">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center border border-border w-fit sm:w-28 justify-center">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-secondary transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 font-display font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-secondary transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="hidden sm:block w-20 text-right font-display font-bold text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button onClick={() => removeItem(item.productId)} className="w-8 flex justify-end text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border">
              <Link href="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors">
                <ArrowRight className="w-3 h-3 rotate-180" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* ─── Payment Method ─── */}
          <div className="border border-border p-6">
            <h2 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Choose Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stripe */}
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`relative flex items-start gap-4 p-5 border-2 transition-all text-left ${paymentMethod === "stripe" ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"
                  }`}
              >
                {paymentMethod === "stripe" && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-background" />
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Pay Online</p>
                  <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard, and more — powered by Stripe.</p>
                </div>
              </button>

              {/* COD */}
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`relative flex items-start gap-4 p-5 border-2 transition-all text-left ${paymentMethod === "cod" ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"
                  }`}
              >
                {paymentMethod === "cod" && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-background" />
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">Pay in cash when your order arrives at the door.</p>
                </div>
              </button>
            </div>

            {/* COD Address Form */}
            {paymentMethod === "cod" && (
              <div className="mt-6 animate-fade-in">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "fullName", placeholder: "Full Name", span: true },
                    { key: "address", placeholder: "Street Address", span: true },
                    { key: "city", placeholder: "City" },
                    { key: "postalCode", placeholder: "ZIP / Postal Code" },
                    { key: "country", placeholder: "Country" },
                    { key: "phone", placeholder: "Phone Number" },
                  ].map(({ key, placeholder, span }) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={placeholder}
                      value={codAddress[key as keyof CODAddress]}
                      onChange={(e) => setCodAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                      className={`px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors ${span ? "sm:col-span-2" : ""}`}
                    />
                  ))}
                </div>
                {codError && (
                  <p className="text-xs text-destructive font-bold mt-3">{codError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Order Summary (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 border border-border p-6 flex flex-col gap-5">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>

            {/* Promo */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border text-sm outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <button
                  onClick={() => { if (promoCode.toUpperCase() === "SAVE10") setPromoApplied(true); }}
                  className="px-4 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && <p className="text-xs text-success font-bold mt-2">Code SAVE10 applied! 10% off.</p>}
              {!promoApplied && <p className="text-xs text-muted-foreground mt-1">Try &quot;SAVE10&quot; for 10% off</p>}
            </div>

            {/* Totals */}
            <div className="divide-y divide-border/50">
              <div className="flex justify-between py-3 text-sm">
                <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-success">Discount (10%)</span>
                  <span className="text-success font-bold">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-bold">{shipping === 0 ? "Free 🎉" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="font-display font-bold text-lg">Total</span>
                <span className="font-display font-bold text-2xl">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Selected method badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2">
              {paymentMethod === "stripe" ? <CreditCard className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
              <span>{paymentMethod === "stripe" ? "Paying online via Stripe" : "Paying cash on delivery"}</span>
            </div>

            {/* Guest sign-in notice */}
            {!authLoading && !user && (
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-4 py-3 text-sm">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  <span className="font-bold">Sign in</span> to complete your purchase.{" "}
                  <button
                    onClick={() => router.push("/auth?redirect=/cart")}
                    className="underline font-bold text-primary hover:opacity-80 transition-opacity"
                  >
                    Sign in now
                  </button>
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={paymentMethod === "stripe" ? handleStripeCheckout : handleCODCheckout}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-4 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : paymentMethod === "stripe" ? (
                "Proceed to Checkout"
              ) : (
                "Place Order"
              )}
            </button>

            {shipping > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Add ${(100 - totalPrice).toFixed(2)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
