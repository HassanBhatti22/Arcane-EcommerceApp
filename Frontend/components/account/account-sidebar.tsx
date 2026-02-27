"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  Star,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/account", label: "Dashboard", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="lg:w-64 flex-shrink-0">
      {/* User info */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center font-display text-2xl font-bold mb-3">
          {user ? getInitials(user.name) : 'JD'}
        </div>
        <h2 className="font-display text-xl font-bold">{user?.name || 'John Doe'}</h2>
        <p className="text-sm text-muted-foreground">{user?.email || 'john@example.com'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Member since {user?.joinedDate || 'Jan 2025'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${isActive
                  ? "bg-foreground text-background"
                  : "hover:bg-secondary"
                }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight
                className={`w-3 h-3 hidden lg:block ${isActive ? "opacity-100" : "opacity-0"}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-6 hidden lg:block">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
