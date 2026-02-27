import api from './api';
import type { Product } from './data';

export interface ProductsResponse {
    products: Product[];
    total: number;
}

/**
 * Fetch all products from the backend
 */
export async function fetchProducts(options?: { search?: string; category?: string; sort?: string }): Promise<Product[]> {
    try {
        const params = new URLSearchParams();
        if (options?.search) params.append('search', options.search);
        if (options?.category) params.append('category', options.category);
        if (options?.sort) params.append('sort', options.sort);

        const response = await api.get(`/products?${params.toString()}`);
        console.log('📦 Raw API Products:', response.data);
        return response.data.map((product: any) => ({
            ...product,
            id: product._id,
            images: product.images || [],
            variants: product.variants || { colors: [], sizes: [] },
            specifications: product.specifications || [],
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            stock: product.stock || 0,
            brand: product.brand || 'Unknown',
            subcategory: product.subcategory || '',
        }));
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
    // Short-circuit for mock/static IDs that are not valid MongoDB ObjectIds
    // A valid ObjectId is a 24-character hex string
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
        return null;
    }
    try {
        const response = await api.get(`/products/${id}`);
        const product = response.data;
        return {
            ...product,
            id: product._id,
            images: product.images || [],
            variants: product.variants || { colors: [], sizes: [] },
            specifications: product.specifications || [],
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            stock: product.stock || 0,
            brand: product.brand || 'Unknown',
            subcategory: product.subcategory || '',
        };
    } catch (error) {
        console.warn(`[Product] Could not fetch product ${id}.`);
        return null;
    }
}

/**
 * Filter products by category
 */
export function filterByCategory(products: Product[], category?: string): Product[] {
    if (!category) return products;
    return products.filter(p => p.category === category);
}

/**
 * Get new arrivals (products with 'new' badge or recently added)
 */
export function getNewArrivals(products: Product[]): Product[] {
    return products.filter((p) => p.badge === "new" || !p.badge).slice(0, 8);
}

/**
 * Get bestsellers (high-rated products)
 */
export function getBestSellers(products: Product[]): Product[] {
    return products.filter((p) => p.rating >= 4.5).slice(0, 8);
}

/**
 * Get flash deals (products with discounts)
 */
export function getFlashDeals(products: Product[]): Product[] {
    return products.filter((p) => p.originalPrice).slice(0, 8);
}
