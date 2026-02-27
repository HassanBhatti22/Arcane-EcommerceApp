"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, Box, ShoppingCart, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);

  // Set mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only check auth after component is mounted and auth is loaded
    if (mounted && !authLoading && !hasRedirected.current) {
      if (!user) {
        // Double check: if we have a token in localStorage, maybe we should give it a moment?
        // But if authLoading is false, it implies we already tried loading.
        // Let's check if the token is present to avoid false negatives on race conditions
        const token = localStorage.getItem('token');
        if (token && !user) {
          console.log('AdminLayout: Token found but user missing. Reloading user...');
          // Ideally we would trigger reloadUser() here but that might cause loops if it fails repeatedly.
          // For now, let's allow the redirect but log it.
          // Actually, let's NOT redirect if token exists, to see if state catches up? 
          // No, we must redirect if auth failed.
          console.log('Redirecting to auth...');
          hasRedirected.current = true;
          router.push('/auth');
        } else {
          console.log('AdminLayout: No user found, redirecting to auth');
          hasRedirected.current = true;
          router.push('/auth');
        }
      } else if (user.role !== 'admin') {
        console.log('AdminLayout: User is not admin, redirecting to home');
        hasRedirected.current = true;
        router.push('/');
      } else {
        console.log('AdminLayout: Admin user authenticated successfully');
      }
    }
  }, [user, authLoading, router, mounted]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading spinner while auth is loading or if we have a user but are just waiting for effect
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg font-bold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user/not admin, render nothing (useEffect will redirect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black text-white p-6 sticky top-0 h-screen flex flex-col">
        <div className="mb-10">
          <h2 className="font-display text-2xl font-bold text-primary tracking-tighter">ARCANE</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Control Center</p>
        </div>

        <nav className="flex-1 space-y-2">
          <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <AdminNavLink href="/admin/products" icon={<Box size={20} />} label="Products" />
          <AdminNavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <AdminNavLink href="/admin/users" icon={<Users size={20} />} label="Customers" />
        </nav>

        <div className="pt-6 border-t border-white/10 space-y-2">
          <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-red-400 hover:bg-white/5 transition-colors rounded-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500">
              Welcome, {user.name}
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Store
            </span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 text-sm font-medium text-white/70 hover:text-primary hover:bg-white/5 transition-all rounded-sm"
    >
      {icon} {label}
    </Link>
  );
}