import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { MarqueeBanner } from "@/components/home/marquee-banner";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { ProductCarousel } from "@/components/home/product-carousel";
import { FlashDeals } from "@/components/home/flash-deals";
import { EditorialSection } from "@/components/home/editorial-section";
import { TrustIndicators } from "@/components/home/trust-indicators";
import { fetchProducts, getNewArrivals, getBestSellers, getFlashDeals } from "@/lib/products";

// Revalidate every 10 seconds (or use 0 for no caching)
export const revalidate = 10;

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const allProducts = await fetchProducts();
  const newArrivals = getNewArrivals(allProducts);
  const bestSellers = getBestSellers(allProducts);
  const flashDeals = getFlashDeals(allProducts);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <CategoriesGrid />
        <ProductCarousel
          title="New Arrivals"
          subtitle="Just Dropped"
          products={newArrivals}
          viewAllHref="/shop?sort=newest"
        />
        <FlashDeals products={flashDeals} />
        <EditorialSection />
        <ProductCarousel
          title="Best Sellers"
          subtitle="Most Loved"
          products={bestSellers}
          viewAllHref="/shop?sort=bestselling"
        />
        <TrustIndicators />
      </main>
      <Footer />
    </>
  );
}
