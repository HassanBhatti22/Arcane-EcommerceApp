"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    name: string;
    qty: number;
    price: number;
    product: string;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        if (statusFilter === "delivered") return order.isDelivered;
        if (statusFilter === "paid") return order.isPaid && !order.isDelivered;
        if (statusFilter === "pending") return !order.isPaid;
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, isPaid?: boolean, isDelivered?: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid, isDelivered }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      setSuccess("Order status updated successfully!");
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getOrderStatus = (order: Order) => {
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Paid";
    return "Pending";
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Order Management</h2>
          <p className="text-xs text-gray-400 font-medium">Track and process customer transactions ({orders.length} total)</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-sm text-sm outline-none focus:ring-1 focus:ring-orange-600 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-white border border-gray-100 rounded-sm text-sm outline-none focus:ring-1 focus:ring-orange-600 cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-sm flex items-center gap-3">
          <div className="text-green-600 font-bold">✓</div>
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Orders Table */}
      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            {searchTerm || statusFilter !== "all" ? "No orders match your filters" : "No orders found"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredOrders.map((order) => (
                  <OrderTableRow
                    key={order._id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    isExpanded={expandedOrder === order._id}
                    onToggleExpand={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Order Row Component
function OrderTableRow({ order, onUpdateStatus, isExpanded, onToggleExpand }: any) {
  const status = order.isDelivered ? "Delivered" : order.isPaid ? "Paid" : "Pending";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered": return "text-green-600 bg-green-50 border-green-100";
      case "Paid": return "text-blue-600 bg-blue-50 border-blue-100";
      case "Pending": return "text-orange-600 bg-orange-50 border-orange-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle2 size={12} />;
      case "Paid": return <Truck size={12} />;
      case "Pending": return <Clock size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <tr className="group hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-bold font-display">#{order._id.slice(-6).toUpperCase()}</td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-medium text-black">{order.user?.name || "Unknown"}</span>
            <span className="text-[10px] text-gray-400">{order.user?.email || "N/A"}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(status)}`}>
            {getStatusIcon(status)}
            {status}
          </span>
        </td>
        <td className="px-6 py-4 text-right font-bold">${order.totalPrice.toFixed(2)}</td>
        <td className="px-6 py-4">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-white hover:shadow-sm rounded-sm transition-all text-gray-400 hover:text-orange-600"
              title="View Details"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {!order.isPaid && (
              <button
                onClick={() => onUpdateStatus(order._id, true, undefined)}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-sm hover:bg-blue-100 transition-all"
                title="Mark as Paid"
              >
                Mark Paid
              </button>
            )}
            {order.isPaid && !order.isDelivered && (
              <button
                onClick={() => onUpdateStatus(order._id, undefined, true)}
                className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-sm hover:bg-green-100 transition-all"
                title="Mark as Delivered"
              >
                Deliver
              </button>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Order Items</h4>
                <div className="space-y-2">
                  {order.orderItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x {item.qty}</span>
                      <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Payment: <span className="font-bold">{order.paymentMethod}</span>
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}