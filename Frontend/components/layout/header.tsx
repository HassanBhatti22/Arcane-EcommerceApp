"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { CartPreview } from "@/components/cart/cart-preview";
import { useRouter, usePathname } from "next/navigation";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/lib/data";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const signInHref = `/auth?redirect=${encodeURIComponent(pathname)}`;
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (term.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const products = await fetchProducts({ search: term });
        setSearchResults(products);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleProductClick = (productId: string) => {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(`/product/${productId}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: "/shop/electronics", label: "Electronics" },
    { href: "/shop/fashion", label: "Fashion" },
    { href: "/shop/home-living", label: "Home" },
    { href: "/shop/beauty", label: "Beauty" },
    { href: "/shop/sports", label: "Sports" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${scrolled
          ? "bg-white/90 backdrop-blur-md border-border/50 py-3 shadow-sm"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu & Logo Group */}
            <div className="flex items-center gap-4 lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:text-accent transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo - Centered on Mobile, Left on Desktop */}
            <Link
              href="/"
              className="font-display text-2xl lg:text-3xl font-bold tracking-tight z-50 relative group"
            >
              ARCANE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium uppercase tracking-[0.2em] hover:text-accent transition-colors relative group py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:text-accent transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/account/wishlist"
                className="hidden lg:block p-2 hover:text-accent transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* User Dropdown */}
              <div className="hidden lg:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:text-accent transition-colors flex items-center gap-2"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                  {user && <span className="text-xs font-bold uppercase tracking-widest hidden xl:block">Account</span>}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-white border border-border/50 shadow-2xl rounded-sm p-2 animate-fade-in origin-top-right">
                    {user ? (
                      <>
                        <div className="p-4 bg-secondary/30 mb-2 rounded-sm border border-border/20">
                          <p className="font-display font-bold text-lg">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={user.role === 'admin' ? '/admin/dashboard' : '/account'}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors rounded-sm group"
                          >
                            <span className="flex items-center gap-3">
                              <User className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                              {user.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors rounded-sm group"
                          >
                            <span className="flex items-center gap-3">
                              <Package className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                              Orders
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <Link
                            href="/account/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors rounded-sm group"
                          >
                            <span className="flex items-center gap-3">
                              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                              Settings
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                        <div className="border-t border-border mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full rounded-sm"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <Link
                          href={signInHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-black text-white hover:bg-accent transition-colors rounded-sm uppercase tracking-widest"
                        >
                          Sign In
                        </Link>
                        <p className="text-[10px] text-center text-muted-foreground py-2">
                          New to Arcane? <Link href={signInHref} className="underline hover:text-accent">Create account</Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 hover:text-accent transition-colors group"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-b border-border transition-all duration-300 origin-top shadow-lg ${searchOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
            }`}
        >
          <div className="mx-auto max-w-[1000px] px-6 py-8">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-4 py-4 bg-transparent font-display text-2xl lg:text-3xl placeholder:text-muted-foreground/30 focus:outline-none"
                autoFocus={searchOpen}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8">
              {isSearching ? (
                <div className="text-center py-4 text-muted-foreground">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Results</p>
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center gap-4 w-full p-2 hover:bg-secondary/50 rounded-lg group transition-colors text-left"
                    >
                      <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg group-hover:text-accent transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">${product.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="text-center py-4 text-muted-foreground">No results found for "{searchTerm}"</div>
              ) : (
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2 pt-1">Trending:</span>
                  {['Wireless', 'Summer', 'Watches', 'Essentials'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="px-3 py-1 bg-secondary text-xs rounded-full hover:bg-black hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`fixed inset-0 top-[60px] bg-white z-40 transition-all duration-500 lg:hidden ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
        >
          <div className="flex flex-col h-full p-6 overflow-y-auto">
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-display text-4xl font-bold hover:text-accent transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-border pt-8 pb-20 space-y-4">
              <Link
                href="/account"
                className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-accent"
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-5 h-5" /> Account
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-accent"
                onClick={() => setMenuOpen(false)}
              >
                <Heart className="w-5 h-5" /> Wishlist
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Preview Slide-in */}
      <CartPreview />
    </>
  );
}
