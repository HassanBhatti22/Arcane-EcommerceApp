"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSearchParams } from "next/navigation";

function CheckoutResult() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  const cod = searchParams.get('cod');
  const orderId = searchParams.get('order_id');

  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  // useRef persists across React 18 Strict Mode double-invocations — useState does not
  const confirmCalledRef = useRef(false);

  useEffect(() => {
    if (cod) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cod]);

  useEffect(() => {
    if (!success || !sessionId) return;
    // Prevent React Strict Mode from firing this twice and creating duplicate orders
    if (confirmCalledRef.current) return;
    confirmCalledRef.current = true;

    setOrderStatus('loading');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${apiBase}/stripe/confirm-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.order || data.message === 'Order already exists') {
          clearCart();
          setOrderStatus('done');
        } else {
          setOrderStatus('error');
        }
      })
      .catch(() => setOrderStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, sessionId]);

  // ── COD Success ──
  if (cod && orderId) {
    return (
      <div className="mx-auto max-w-[960px] px-6 py-24 lg:py-32 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-3xl lg:text-5xl font-bold mb-3">Order Placed!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Your Cash on Delivery order has been confirmed. Pay when it arrives!
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Order ID: #{orderId.slice(-8).toUpperCase()}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/account/orders" className="px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors">
            Track Order
          </Link>
          <Link href="/" className="px-8 py-3.5 border-2 border-foreground font-bold text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Stripe Success ──
  if (success) {
    if (orderStatus === 'loading') {
      return (
        <div className="mx-auto max-w-[960px] px-6 py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Saving your order...</p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[960px] px-6 py-24 lg:py-32 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
        </div>
        <h1 className="font-display text-3xl lg:text-5xl font-bold mb-3">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Thank you for your purchase. Your payment was successfully processed by Stripe.
        </p>
        {orderStatus === 'error' && (
          <p className="text-xs text-destructive mb-4">Order was not saved. Please contact support.</p>
        )}
        <p className="text-sm text-muted-foreground mb-8">
          Session ID: {sessionId?.slice(-8).toUpperCase() || "XXXXXX"}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/account/orders" className="px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors">
            View Order Details
          </Link>
          <Link href="/" className="px-8 py-3.5 border-2 border-foreground font-bold text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Canceled ──
  if (canceled) {
    return (
      <div className="mx-auto max-w-[960px] px-6 py-24 text-center animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-3 text-destructive">Checkout Canceled</h1>
        <p className="text-muted-foreground mb-6">You canceled the payment. Your cart items have been saved.</p>
        <Link href="/cart" className="inline-block px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors">
          Return to Cart
        </Link>
      </div>
    );
  }

  // ── Default ──
  return (
    <div className="mx-auto max-w-[960px] px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold mb-3">Checkout Redirect</h1>
      <p className="text-muted-foreground mb-6">
        Please initiate checkout from your shopping cart to select shipping and payment options.
      </p>
      <Link href="/cart" className="inline-block px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors">
        Go to Cart
      </Link>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center">Loading...</div>}>
      <CheckoutResult />
    </Suspense>
  );
}
