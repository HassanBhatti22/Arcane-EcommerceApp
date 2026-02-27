"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Heart, MapPin, CreditCard, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { useState, useEffect } from "react";



export default function AccountOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/myorders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const stats = [
    { label: "Total Orders", value: orders.length.toString(), icon: Package },
    { label: "Wishlist Items", value: user?.wishlist?.length.toString() || "0", icon: Heart },
    { label: "Saved Addresses", value: user?.addresses?.length.toString() || "0", icon: MapPin },
    { label: "Payment Methods", value: "0", icon: CreditCard }, // Payment methods not yet implemented
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 border border-border hover:border-foreground transition-colors group"
          >
            <stat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
            <p className="font-display text-2xl lg:text-3xl font-bold">
              {stat.value}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {isLoadingOrders ? (
            <p className="text-sm text-muted-foreground">Loading recent orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found.</p>
          ) : (
            orders.slice(0, 3).map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="flex items-center gap-4 p-4 border border-border hover:border-foreground transition-colors group"
              >
                <div className="relative w-14 h-16 flex-shrink-0 bg-secondary">
                  <Image
                    src={order.orderItems[0]?.image || "/placeholder.svg"}
                    alt={order.orderItems[0]?.name || "Order Item"}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {order.orderItems.length > 1
                      ? `${order.orderItems[0].name} + ${order.orderItems.length - 1} more`
                      : order.orderItems[0]?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order #{order._id.slice(-6).toUpperCase()} &middot; {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">${order.totalPrice.toFixed(2)}</p>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${order.isDelivered
                      ? "text-success"
                      : "text-primary"
                      }`}
                  >
                    {order.isDelivered ? "Delivered" : order.isPaid ? "In Transit" : "Processing"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </Link>
            )))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/settings"
          className="flex items-center gap-4 p-5 bg-secondary hover:bg-foreground hover:text-background transition-colors group"
        >
          <Clock className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">Account Settings</p>
            <p className="text-xs text-muted-foreground group-hover:text-background/60">
              Update your profile and preferences
            </p>
          </div>
        </Link>
        <Link
          href="/shop"
          className="flex items-center gap-4 p-5 bg-primary text-primary-foreground hover:brightness-110 transition-all group"
        >
          <TrendingUp className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">Continue Shopping</p>
            <p className="text-xs text-primary-foreground/70">
              Discover new arrivals and deals
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
