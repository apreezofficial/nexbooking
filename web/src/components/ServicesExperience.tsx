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
type FeedProps = { categorySlug?: string; dashboard?: boolean };

function ServicesFeedContent({ categorySlug = "", dashboard = false }: FeedProps) {
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
  const selectedCategory = categorySlug || search.get("category") || typeCategory[type] || "";
  const listingPath = dashboard ? "/dashboard/explore" : "/services";
  const bookingPath = dashboard ? "/dashboard/book" : "/book";

  function categoryHref(slug: string) {
    if (!dashboard) return slug ? `/services/${slug}` : "/services";
    const filters = new URLSearchParams(search.toString());
    filters.delete("type");
    if (slug) filters.set("category", slug);
    else filters.delete("category");
    return filters.size ? `${listingPath}?${filters}` : listingPath;
  }
  const selectedProvider = search.get("provider") || "";
  const category = serviceCategories.find(item => item.slug === categorySlug);
  const eligible = servicePreviews.filter(item => {
    const provider = providerForService(item);
    return (!selectedCategory || item.category === selectedCategory) &&
      (!selectedProvider || provider.id === selectedProvider);
  });
  const matches = eligible.filter(item =>
    `${item.title} ${item.categoryName} ${providerForService(item).business}`.toLowerCase().includes(query)
  );
  const isRecommendation = Boolean(query) && matches.length === 0 && eligible.length > 0;
  const relatedCategory = /\b(gym|workout|exercise)\b/.test(query) ? "fitness" : "";
  const related = relatedCategory ? eligible.filter(item => item.category === relatedCategory) : [];
  const services = isRecommendation ? (related.length ? related : eligible.slice(0, 6)) : matches;
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

  return <section className={dashboard ? "services-feed dashboard-services-feed" : "services-feed"}>
    <h1>{category ? category[language] : language === "fr" ? "Découvrez votre prochain service" : "Find your next favourite service"}</h1>
    <p>{language === "fr" ? "Catalogue de démonstration. Les prestataires seront disponibles au lancement." : "Explore our demo service catalogue. Provider profiles and availability are coming at launch."}</p>
    {(query || search.get("date") || selectedProvider) && <p className="search-results-summary">{matches.length} matching services{query ? ` for “${query}”` : ""}{selectedProvider ? ` · From ${providers.find(item => item.id === selectedProvider)?.business || "selected provider"}` : ""}{search.get("date") ? ` · Requested date: ${search.get("date")}` : ""}{search.get("people") ? ` · ${search.get("people")}` : ""}. Availability is confirmed by the provider.</p>}
    {dashboard && <form key={search.toString()} action={listingPath} className="dashboard-catalogue-search">
      <label htmlFor="dashboard-service-query">Search services or providers</label>
      <input id="dashboard-service-query" name="q" type="search" defaultValue={search.get("q") ?? ""} placeholder="Try massage, braids or yoga" />
      {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
      <button className="btn btn-gradient" type="submit">Search</button>
    </form>}
    <div className="service-stories">{categories.map(item => <Link key={item.en} href={categoryHref(item.slug)} aria-current={selectedCategory === item.slug ? "page" : undefined}><SiteArt file={item.image}/><span>{item[language]}</span></Link>)}</div>
    {isRecommendation && <div className="service-recommendation-heading">
      <h2>{related.length ? "Recommended fitness services" : "Other services to explore"}</h2>
      <p>We couldn’t find “{query}” in the demo catalogue. Here are {related.length ? "some related services" : "some alternatives"} you can browse.</p>
    </div>}
    <div className="service-feed-grid" aria-busy={loading}>{services.slice(0, count).map(service => <article key={service.id}>
      <header><SiteArt file={providerForService(service).avatar} className="service-avatar" alt={`Demo portrait of ${providerForService(service).name}`}/><Link href={`/providers/${providerForService(service).id}`}><strong>{providerForService(service).business}</strong></Link><small>{language === "fr" ? "Démo" : "Demo"}</small></header>
      <Link href={`${bookingPath}/${service.id}`} aria-label={`Book ${service.title} with ${providerForService(service).name}`}><ServicePhoto file={service.image} className="service-post-image"/></Link>
      <div className="service-post-actions">
        <button
          aria-pressed={saved.includes(service.id)}
          aria-label={`Save ${service.title}`}
          onClick={() => setSaved(items => items.includes(service.id) ? items.filter(item => item !== service.id) : [...items, service.id])}
        >
          {saved.includes(service.id) ? "♥" : "♡"}
        </button>
        <Link href={`${bookingPath}/${service.id}`} className="btn btn-gradient">
          {language === "fr" ? "Réserver" : "Book now"}
        </Link>
      </div>
      <p><strong>{service.title}</strong> · {service.categoryName}</p>
    </article>)}
      {loading && Array.from({ length: 2 }, (_, index) => <div key={`skeleton-${index}`} className="service-skeleton" aria-hidden="true"><div className="skeleton-header"/><div className="skeleton-image"/><div className="skeleton-line"/></div>)}
    </div>
    {!services.length && <p>No matching services. Try a different service or provider name.</p>}
    {services.length > 0 && <div ref={sentinel} className="feed-load-more">{hasMore ? <button type="button" className="btn btn-gradient" disabled={loading} onClick={loadMore}>{loading ? (language === "fr" ? "Chargement…" : "Loading services…") : (language === "fr" ? "Voir plus" : "Load more services")}</button> : <p>{language === "fr" ? "Vous avez tout vu." : "You’re all caught up with this preview."}</p>}</div>}
  </section>;
}

export function ServicesFeed({ categorySlug = "", dashboard = false }: FeedProps) {
  return <Suspense fallback={<section className="services-feed" aria-busy="true"><h1>Loading services…</h1></section>}><ServicesFeedContent categorySlug={categorySlug} dashboard={dashboard}/></Suspense>;
}
