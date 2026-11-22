"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import SiteArt from "./SiteArt";
import StoryMarquee from "./StoryMarquee";
import ServicePhoto from "./ServicePhoto";

import { serviceCategories, servicePreviews, providerForService, providers } from "@/lib/services";

const categories = [{ slug: "", en: "All", fr: "Tout", image: "discover-studio.png" }, ...serviceCategories];
function subscribe(callback: () => void) {
  window.addEventListener("edebooking-language", callback);
  return () => window.removeEventListener("edebooking-language", callback);
}
function readLanguage(): "en" | "fr" {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}
export function LanguageSelect() {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as const);
  return <select className="language-select" aria-label="Website language" value={language} onChange={event => {
    document.documentElement.lang = event.target.value;
    window.dispatchEvent(new Event("edebooking-language"));
  }}><option value="en">EN · English</option><option value="fr">FR · Français</option></select>;
}
export function HeroServices() {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as const);
  return (
    <div className="hero-services">
      <h1 className="hero-title">{language === "fr" ? "Vos services à portée de clic" : "Your services a click away"}</h1>
      <p className="hero-sub">{language === "fr" ? "Découvrez, explorez et réservez." : "Discover the work. Find your service. Make it yours."}</p>
      <StoryMarquee label={language === "fr" ? "Services" : "Browse services"} items={categories.slice(1).map(c => ({ slug: c.slug, image: c.image, label: c[language] }))} />
      <Link href="/services" className="btn btn-gradient">
        {language === "fr" ? "Voir les services" : "Explore services"}
      </Link>
    </div>
  );
}
function ServicesFeedContent({ categorySlug = "" }: { categorySlug?: string }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as const);
  const [count, setCount] = useState(8);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const search = useSearchParams();
  const query = search.get("q")?.toLowerCase().trim() || "";
  const type = search.get("type") || "Services";
  const typeCategory: Record<string, string> = { Consultation: "consultations", Appointments: "appointments", Events: "events", Classes: "classes", Rentals: "rentals" };
  const selectedCategory = categorySlug || typeCategory[type] || "";
  const selectedProvider = search.get("provider") || "";
  const category = serviceCategories.find(item => item.slug === categorySlug);
  const services = servicePreviews.filter(item => {
    const provider = providerForService(item);
    return (!selectedCategory || item.category === selectedCategory) &&
      (!selectedProvider || provider.id === selectedProvider) &&
      (!query || (item.title + " " + item.categoryName + " " + provider.business).toLowerCase().includes(query));
  });
  const hasMore = count < services.length;

  function loadMore() {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    batchTimer.current = setTimeout(() => {
      setCount(value => Math.min(value + 6, services.length));
      setLoading(false);
      loadingRef.current = false;
    }, 450);
  }

  useEffect(() => () => {
    if (batchTimer.current) clearTimeout(batchTimer.current);
  }, []);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      batchTimer.current = setTimeout(() => {
        setCount(value => Math.min(value + 6, services.length));
        setLoading(false);
        loadingRef.current = false;
      }, 450);
    }, { rootMargin: "180px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, count, services.length]);

  return <section className="services-feed">
    <h1>{category ? category[language] : language === "fr" ? "Découvrez votre prochain service" : "Find your next favourite service"}</h1>
    <p>{language === "fr" ? "Catalogue de démonstration. Les prestataires seront disponibles au lancement." : "Explore our demo service catalogue. Provider profiles and availability are coming at launch."}</p>
    {(query || search.get("date") || selectedProvider) && <p className="search-results-summary">{services.length} matching services{query ? ` for “${query}”` : ""}{selectedProvider ? ` · From ${providers.find(item => item.id === selectedProvider)?.business || "selected provider"}` : ""}{search.get("date") ? ` · Requested date: ${search.get("date")}` : ""}{search.get("people") ? ` · ${search.get("people")}` : ""}. Availability is confirmed by the provider.</p>}
    <div className="service-stories">{categories.map(item => <Link key={item.en} href={item.slug ? `/services/${item.slug}` : "/services"} aria-current={categorySlug === item.slug ? "page" : undefined}><SiteArt file={item.image}/><span>{item[language]}</span></Link>)}</div>
    <div className="service-feed-grid" aria-busy={loading}>{services.slice(0, count).map(service => <article key={service.id}>
      <header><SiteArt file={providerForService(service).avatar} className="service-avatar" alt={`Demo portrait of ${providerForService(service).name}`}/><Link href={`/providers/${providerForService(service).id}`}><strong>{providerForService(service).business}</strong></Link><small>{language === "fr" ? "Démo" : "Demo"}</small></header>
      <Link href={`/book/${service.id}`} aria-label={`Book ${service.title} with ${providerForService(service).name}`}><ServicePhoto file={service.image} className="service-post-image"/></Link>
      <div className="service-post-actions">
        <button
          aria-pressed={saved.includes(service.id)}
          aria-label={`Save ${service.title}`}
          onClick={() => setSaved(items => items.includes(service.id) ? items.filter(item => item !== service.id) : [...items, service.id])}
        >
          {saved.includes(service.id) ? "♥" : "♡"}
        </button>
        <Link href={`/book/${service.id}`} className="btn btn-gradient">
          {language === "fr" ? "Réserver" : "Book now"}
        </Link>
      </div>
      <p><strong>{service.title}</strong> · {service.categoryName}</p>
    </article>)}
      {loading && Array.from({ length: 2 }, (_, index) => <div key={`skeleton-${index}`} className="service-skeleton" aria-hidden="true"><div className="skeleton-header"/><div className="skeleton-image"/><div className="skeleton-line"/></div>)}
    </div>
    {!services.length && <p>No matching services. Try a different service or provider name.</p>}
    <div ref={sentinel} className="feed-load-more">{hasMore ? <button type="button" className="btn btn-gradient" disabled={loading} onClick={loadMore}>{loading ? (language === "fr" ? "Chargement…" : "Loading services…") : (language === "fr" ? "Voir plus" : "Load more services")}</button> : <p>{language === "fr" ? "Vous avez tout vu." : "You’re all caught up with this preview."}</p>}</div>
  </section>;
}

export function ServicesFeed({ categorySlug = "" }: { categorySlug?: string }) {
  return <Suspense fallback={<section className="services-feed" aria-busy="true"><h1>Loading services…</h1></section>}><ServicesFeedContent categorySlug={categorySlug}/></Suspense>;
}
