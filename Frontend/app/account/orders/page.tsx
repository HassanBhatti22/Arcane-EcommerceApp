"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "@/lib/api";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  name: string;
  image: string;
  qty: number;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  createdAt: string;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: OrderItem[];
  totalPrice: number;
  tracking?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Package }
> = {
  processing: { label: "Processing", color: "bg-primary text-primary-foreground", icon: Clock },
  shipped: { label: "In Transit", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/myorders');
        setOrders(response.data);
        if (response.data.length > 0) {
          setExpandedOrder(response.data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Map backend order to display status
  const getOrderStatus = (order: Order): OrderStatus => {
    if (order.isDelivered) return "delivered";
    if (order.isPaid) return "shipped";
    return "processing";
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => getOrderStatus(o) === filterStatus);

  return (
    <div>
      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
        My Orders
      </h1>
      <p className="text-muted-foreground mb-8">
        Track and manage your orders.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", "processing", "shipped", "delivered", "cancelled"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filterStatus === status
                ? "bg-foreground text-background"
                : "border border-border hover:border-foreground"
                }`}
            >
              {status === "all" ? "All Orders" : statusConfig[status].label}
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="font-display font-bold text-lg mb-1">Loading orders...</p>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const status = getOrderStatus(order);
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div
                  key={order._id}
                  className="border border-border hover:border-foreground/30 transition-colors"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="relative w-10 h-12 bg-secondary border-2 border-background"
                          >
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <span className="font-display font-bold">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>


                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border p-5 animate-fade-in">
                      {/* Tracking */}
                      {order.tracking && (
                        <div className="mb-5 p-4 bg-secondary">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Tracking Number
                          </p>
                          <p className="font-mono text-sm font-bold">
                            {order.tracking}
                          </p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="flex flex-col gap-4">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="relative w-16 h-20 bg-secondary flex-shrink-0">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/product/${item.product}`}
                                className="font-bold text-sm hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.qty}
                              </p>
                            </div>
                            <span className="font-bold text-sm">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Order Total
                        </span>
                        <span className="font-display text-lg font-bold">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-bold text-lg mb-1">No orders found</p>
              <p className="text-sm text-muted-foreground">
                No orders match the selected filter.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
