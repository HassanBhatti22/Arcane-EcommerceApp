"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  Package,
  AlertCircle
} from "lucide-react";

interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  lowStockCount: number;
  lowStockProducts: Array<{ _id: string; name: string; stock: number }>;
  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
  }>;
  topCategories: Array<{ _id: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center gap-3">
        <AlertCircle className="text-red-600" />
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate max category count for percentage
  const maxCategoryCount = Math.max(...stats.topCategories.map(c => c.count), 1);

  return (
    <div className="space-y-10">
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={<DollarSign className="text-orange-600" />}
          trend={stats.revenue > 0 ? "Active" : "No Sales"}
        />
        <StatCard
          title="Orders"
          value={stats.orders.toString()}
          icon={<ShoppingBag className="text-orange-600" />}
          trend={`${stats.orders} Total`}
        />
        <StatCard
          title="Customers"
          value={stats.customers.toString()}
          icon={<Users className="text-orange-600" />}
          trend={`${stats.customers} Users`}
        />
        <StatCard
          title="Stock Alerts"
          value={`${stats.lowStockCount} Items`}
          icon={<Package className="text-red-500" />}
          trend={stats.lowStockCount > 0 ? "Action Needed" : "All Good"}
          isAlert={stats.lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Recent Orders Table (Summary) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl uppercase tracking-tight">Recent Orders</h3>
            <button className="text-xs font-bold text-orange-600 border-b border-orange-600 hover:text-black hover:border-black transition-all">
              VIEW ALL
            </button>
          </div>
          <div className="overflow-x-auto">
            {stats.recentOrders.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-widest">
                    <th className="pb-4 font-medium">Order ID</th>
                    <th className="pb-4 font-medium">Customer</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.map((order) => (
                    <OrderRow
                      key={order._id}
                      id={`#${order._id.slice(-6).toUpperCase()}`}
                      name={order.user?.name || "Unknown"}
                      status={order.isDelivered ? "Delivered" : order.isPaid ? "Paid" : "Pending"}
                      amount={`$${order.totalPrice.toFixed(2)}`}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-400 py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* 3. Category Sales Summary */}
        <div className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm">
          <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-6 text-center">Top Categories</h3>
          <div className="space-y-6">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((category) => (
                <CategoryProgress
                  key={category._id}
                  label={category._id || "Uncategorized"}
                  value={(category.count / maxCategoryCount) * 100}
                  count={category.count.toString()}
                />
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No category data</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <h3 className="font-display font-bold text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            Low Stock Alert
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockProducts.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-sm border border-red-200">
                <p className="font-bold text-sm">{product.name}</p>
                <p className="text-xs text-red-600 mt-1">Stock: {product.stock} units</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, trend, isAlert = false }: any) {
  return (
    <div className="bg-white p-6 border border-gray-100 rounded-sm hover:border-orange-200 transition-all shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-sm">{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isAlert ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
          {trend} {!isAlert && <ArrowUpRight size={10} />}
        </span>
      </div>
      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-3xl font-bold font-display tracking-tighter">{value}</h4>
    </div>
  );
}

function OrderRow({ id, name, status, amount }: any) {
  const statusColors: Record<string, string> = {
    Delivered: "bg-green-100 text-green-800",
    Paid: "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      <td className="py-4 font-medium">{id}</td>
      <td className="py-4 text-gray-600">{name}</td>
      <td className="py-4">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${statusColors[status] || 'bg-gray-100'}`}>
          {status}
        </span>
      </td>
      <td className="py-4 font-bold">{amount}</td>
    </tr>
  );
}

function CategoryProgress({ label, value, count }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-gray-400">{count} Sales</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-600 transition-all duration-1000"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}