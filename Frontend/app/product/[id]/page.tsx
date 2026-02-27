import { fetchProductById } from "@/lib/products";
import { ProductDetail } from "@/components/product/product-detail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} by ${product.brand} | ARCANE`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
