import Link from "next/link";
import { notFound } from "next/navigation";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";
import { ProviderInquiry } from "@/components/ProviderActions";
import { demoServicePrice, providers, providerForService, servicePreviews } from "@/lib/services";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return providers.map(provider => ({ provider: provider.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await params;
  const provider = providers.find(item => item.id === id);
  if (!provider) return {};
  return pageMetadata({
    title: `${provider.name} · ${provider.category[0].toUpperCase()}${provider.category.slice(1).replaceAll("-", " ")} provider`,
    description: `Explore ${provider.name}'s demo profile and services on EdeBooking.`,
    path: `/providers/${id}`,
  });
}

export default async function ProviderPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await params;
  const provider = providers.find(item => item.id === id);
  if (!provider) notFound();
  const services = servicePreviews.filter(service => providerForService(service).id === id);
  return <RouteShell><section className="provider-page">
    <Link href="/services" className="text-link">Back to services</Link>
    <div className="provider-profile">
      <div className="provider-cover"><SiteArt file={provider.avatar} alt={`Demo portrait of ${provider.name}`}/><span>{provider.category.replaceAll("-", " & ")}</span></div>
      <div><p className="eyebrow">DEMO PROVIDER</p><h1>{provider.business}</h1><p>{provider.bio}</p><p>Contact details and appointment availability will be supplied by this business when it joins.</p><ProviderInquiry providerName={provider.name}/></div>
    </div>
    <h2>Services offered by {provider.name}</h2>
    <div className="provider-services">
      {services.map(service => (
        <article id={service.id} key={service.id} className="provider-service-card">
          <div className="service-card-meta">
            <h3>{service.title}</h3>
            <p>Offered by {provider.business}</p>
            <span className="service-card-price">
              {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(demoServicePrice(service.category))}
            </span>
          </div>
          <Link href={`/book/${service.id}`} className="btn btn-gradient book-page-btn">
            Book this service →
          </Link>
        </article>
      ))}
    </div>
    <p className="auth-description">Demo catalogue. Bookings and provider messages are not sent yet.</p>
  </section></RouteShell>;
}
