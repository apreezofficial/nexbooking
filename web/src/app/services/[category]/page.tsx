import { notFound } from "next/navigation";
import RouteShell from "@/components/RouteShell";
import { ServicesFeed } from "@/components/ServicesExperience";
import { serviceCategories } from "@/lib/services";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return serviceCategories.map(category => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = serviceCategories.find(item => item.slug === slug);
  if (!category) return {};
  return pageMetadata({ title: category.en, description: `Explore ${category.en.toLowerCase()} services on EdeBooking.`, path: `/services/${slug}` });
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!serviceCategories.some(item => item.slug === category)) notFound();
  return <RouteShell><ServicesFeed key={category} categorySlug={category}/></RouteShell>;
}
