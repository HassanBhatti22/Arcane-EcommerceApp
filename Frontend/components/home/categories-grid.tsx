import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { fetchProducts } from "@/lib/products";

export async function CategoriesGrid() {
  // Fetch real products from database
  const products = await fetchProducts();

  // Calculate real product counts per category
  const categoriesWithCounts = categories.map(category => {
    const count = products.filter(p => p.category === category.slug).length;
    return {
      ...category,
      productCount: count
    };
  });

  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16 lg:py-24">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-10 lg:mb-14">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Explore
          </p>
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-balance">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-sm uppercase tracking-wider font-bold text-foreground hover:text-primary transition-colors border-b-2 border-foreground hover:border-primary pb-0.5"
        >
          View All Categories
        </Link>
      </div>

      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Large card - Electronics */}
        <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
          <CategoryCard
            category={categoriesWithCounts[0]}
            className="h-full min-h-[400px] lg:min-h-0"
          />
        </div>

        {/* Fashion */}
        <CategoryCard
          category={categoriesWithCounts[1]}
          className="min-h-[280px]"
        />

        {/* Home & Living */}
        <CategoryCard
          category={categoriesWithCounts[2]}
          className="min-h-[280px]"
        />

        {/* Beauty */}
        <CategoryCard
          category={categoriesWithCounts[3]}
          className="min-h-[280px]"
        />

        {/* Sports */}
        <CategoryCard
          category={categoriesWithCounts[4]}
          className="min-h-[280px]"
        />
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  className = "",
}: {
  category: (typeof categories)[0];
  className?: string;
}) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className={`group relative overflow-hidden block ${className}`}
    >
      <Image
        src={category.image || "/placeholder.svg"}
        alt={category.name}
        fill
        className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/20 transition-colors duration-300" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
        <p className="text-xs uppercase tracking-widest text-background/60 mb-1">
          {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
        </p>
        <h3 className="font-display text-2xl lg:text-3xl font-bold text-background">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}