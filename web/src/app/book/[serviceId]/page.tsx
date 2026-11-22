import { Suspense } from "react";
import { notFound } from "next/navigation";
import RouteShell from "@/components/RouteShell";
import SinglePageBooking from "@/components/SinglePageBooking";
import { demoServicePrice, providerForService, servicePreviews } from "@/lib/services";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return servicePreviews.map(service => ({ serviceId: service.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = servicePreviews.find(s => s.id === serviceId);
  if (!service) return {};
  const provider = providerForService(service);
  return pageMetadata({
    title: `Book ${service.title} - ${provider.business}`,
    description: `Book ${service.title} with ${provider.business}. Check availability, schedule your appointment, and book instantly.`,
    path: `/book/${serviceId}`,
  });
}

async function BookContent({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = servicePreviews.find(s => s.id === serviceId);
  if (!service) notFound();

  const provider = providerForService(service);
  const price = demoServicePrice(service.category);

  return (
    <RouteShell>
      <section className="booking-service-page-wrap">
        <SinglePageBooking service={service} provider={provider} price={price} />
      </section>
    </RouteShell>
  );
}

export default function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  return (
    <Suspense fallback={<RouteShell><section className="booking-service-page-wrap"><div className="booking-skeleton"><div className="shimmer sk-bar" /><div className="sk-grid"><div className="shimmer sk-main" /><div className="shimmer sk-side" /></div></div></section></RouteShell>}>
      <BookContent params={params} />
    </Suspense>
  );
}
