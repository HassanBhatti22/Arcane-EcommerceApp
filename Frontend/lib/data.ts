export interface Review {
  _id?: string;
  user?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  stock: number;
  variants: {
    colors: { name: string; hex: string }[];
    sizes: string[];
  };
  specifications: { label: string; value: string }[];
  badge?: "new" | "bestseller" | "sale" | "limited";
  reviews?: Review[];
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000", productCount: 124 },
  { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000", productCount: 450 },
  { name: "Home & Living", slug: "home-living", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000", productCount: 89 },
  { name: "Beauty", slug: "beauty", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000", productCount: 210 },
  { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000", productCount: 156 },
];

export const products: Product[] = [
  // --- ELECTRONICS (3) ---
  {
    id: "e1",
    name: "Studio Pro Wireless",
    brand: "Aether",
    description: "Premium noise-cancelling headphones.",
    price: 349,
    originalPrice: 449,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000"],
    category: "electronics",
    subcategory: "audio",
    rating: 4.8,
    reviewCount: 342,
    stock: 23,
    variants: { colors: [{ name: "Black", hex: "#000" }], sizes: [] },
    specifications: [{ label: "Battery", value: "40h" }],
    badge: "bestseller",
  },
  {
    id: "e2",
    name: "Pulse Mini Speaker",
    brand: "Aether",
    description: "Portable waterproof speaker.",
    price: 129,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000"],
    category: "electronics",
    subcategory: "audio",
    rating: 4.5,
    reviewCount: 150,
    stock: 50,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Waterproof", value: "IPX7" }],
  },
  {
    id: "e3",
    name: "Smart Watch Elite",
    brand: "Vantage",
    description: "Fitness and notification tracker.",
    price: 199,
    originalPrice: 250,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000"],
    category: "electronics",
    subcategory: "wearables",
    rating: 4.7,
    reviewCount: 89,
    stock: 15,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Display", value: "AMOLED" }],
    badge: "sale",
  },

  // --- FASHION (3) ---
  {
    id: "f1",
    name: "Velocity Runner X",
    brand: "Stride",
    description: "High-performance running shoes.",
    price: 220,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000"],
    category: "fashion",
    subcategory: "footwear",
    rating: 4.6,
    reviewCount: 189,
    stock: 45,
    variants: { colors: [{ name: "Red", hex: "#f00" }], sizes: ["10", "11"] },
    specifications: [{ label: "Weight", value: "220g" }],
    badge: "new",
  },
  {
    id: "f2",
    name: "Archive Bomber Jacket",
    brand: "Norde",
    description: "Classic oversized bomber.",
    price: 285,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000"],
    category: "fashion",
    subcategory: "clothing",
    rating: 4.5,
    reviewCount: 124,
    stock: 34,
    variants: { colors: [], sizes: ["M", "L"] },
    specifications: [{ label: "Material", value: "Cotton" }],
  },
  {
    id: "f3",
    name: "Meridian Chronograph",
    brand: "Voss",
    description: "Elegant swiss-made watch.",
    price: 1250,
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000"],
    category: "fashion",
    subcategory: "watches",
    rating: 4.9,
    reviewCount: 87,
    stock: 8,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Movement", value: "Automatic" }],
    badge: "limited",
  },

  // --- HOME & LIVING (3) ---
  {
    id: "h1",
    name: "Orb Table Lamp",
    brand: "Lumiere",
    description: "Modern sculptural lamp.",
    price: 189,
    images: ["https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1000"],
    category: "home-living",
    subcategory: "decor",
    rating: 4.7,
    reviewCount: 56,
    stock: 19,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Bulb", value: "LED" }],
  },
  {
    id: "h2",
    name: "Velvet Accent Chair",
    brand: "Lumiere",
    description: "Comfortable stylish seating.",
    price: 450,
    images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000"],
    category: "home-living",
    subcategory: "furniture",
    rating: 4.8,
    reviewCount: 42,
    stock: 5,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Fabric", value: "Velvet" }],
  },
  {
    id: "h3",
    name: "Minimalist Wall Clock",
    brand: "Lumiere",
    description: "Clean design for any room.",
    price: 75,
    images: ["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000"],
    category: "home-living",
    subcategory: "decor",
    rating: 4.4,
    reviewCount: 110,
    stock: 25,
    variants: { colors: [], sizes: [] },
    specifications: [{ label: "Diameter", value: "30cm" }],
  },
];

export function getProductById(id: string) { return products.find((p) => p.id === id); }
export function getNewArrivals() { return products.filter((p) => p.badge === "new" || !p.badge).slice(0, 8); }
export function getBestSellers() { return products.filter((p) => p.rating >= 4.5).slice(0, 8); }
export function getFlashDeals() { return products.filter((p) => p.originalPrice).slice(0, 8); }