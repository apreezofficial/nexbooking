"use client";

import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import { parseSession, useSessionRaw } from "@/lib/session";
import { useStored } from "@/lib/dashboard/store";
import { Suspense } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import SiteArt from "./SiteArt";
import StoryMarquee from "./StoryMarquee";
import CatalogueControls from "./dashboard/CatalogueControls";
import ServicePhoto from "./ServicePhoto";

import { serviceCategories, servicePreviews, providerForService, providers, demoServicePrice } from "@/lib/services";

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
const noBookmarks: string[] = [];
type FeedProps = { categorySlug?: string; dashboard?: boolean; bookmarksOnly?: boolean };

function ServicesFeedContent({ categorySlug = "", dashboard = false, bookmarksOnly = false }: FeedProps) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as const);
  const [count, setCount] = useState(8);
  const account = parseSession(useSessionRaw());
  const { value: saved, set: setSaved } = useStored(
    `service-bookmarks:${account?.email.trim().toLowerCase() ?? ""}`, noBookmarks
  );
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
  const budget = dashboard ? Number(search.get("budget")) : 0;
  const sort = dashboard ? search.get("sort") : null;
  const eligible = servicePreviews.filter(item => {
    const provider = providerForService(item);
    return (!bookmarksOnly || saved.includes(item.id)) &&
      (!selectedCategory || item.category === selectedCategory) &&
      (!selectedProvider || provider.id === selectedProvider) &&
      (!(budget > 0) || demoServicePrice(item.category) <= budget);
  });
  const matches = eligible.filter(item =>
    `${item.title} ${item.categoryName} ${providerForService(item).business}`.toLowerCase().includes(query)
  );
  const isRecommendation = Boolean(query) && matches.length === 0 && eligible.length > 0;
  const relatedCategory = /\b(gym|workout|exercise)\b/.test(query) ? "fitness" : "";
  const related = relatedCategory ? eligible.filter(item => item.category === relatedCategory) : [];
  const services = isRecommendation ? (related.length ? related : eligible.slice(0, 6)) : matches;
  if (sort === "low" || sort === "high") {
    const direction = sort === "low" ? 1 : -1;
    services.sort((a, b) => direction * (demoServicePrice(a.category) - demoServicePrice(b.category)));
  }
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
    <h1>{bookmarksOnly ? "Bookmarked services" : category ? category[language] : language === "fr" ? "Découvrez votre prochain service" : "Find your next favourite service"}</h1>
    <p>{language === "fr" ? "Catalogue de démonstration. Les prestataires seront disponibles au lancement." : "Explore our demo service catalogue. Provider profiles and availability are coming at launch."}</p>
    {(query || search.get("date") || selectedProvider) && <p className="search-results-summary">{matches.length} matching services{query ? ` for “${query}”` : ""}{selectedProvider ? ` · From ${providers.find(item => item.id === selectedProvider)?.business || "selected provider"}` : ""}{search.get("date") ? ` · Requested date: ${search.get("date")}` : ""}{search.get("people") ? ` · ${search.get("people")}` : ""}. Availability is confirmed by the provider.</p>}
    {dashboard && !bookmarksOnly && <CatalogueControls key={search.toString()} params={search.toString()} category={selectedCategory} />}
    {!bookmarksOnly && <div className="service-stories">{categories.map(item => <Link key={item.en} href={categoryHref(item.slug)} aria-current={selectedCategory === item.slug ? "page" : undefined}><SiteArt file={item.image}/><span>{item[language]}</span></Link>)}</div>}
    {isRecommendation && <div className="service-recommendation-heading">
      <h2>{related.length ? "Recommended fitness services" : "Other services to explore"}</h2>
      <p>We couldn’t find “{query}” in the demo catalogue. Here are {related.length ? "some related services" : "some alternatives"} you can browse.</p>
    </div>}
    <div className="service-feed-grid" aria-busy={loading}>{services.slice(0, count).map(service => {
      const sample = Array.from(service.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const rating = (4.4 + (sample % 6) / 10).toFixed(1);
      return <article key={service.id}>
      <header><SiteArt file={providerForService(service).avatar} className="service-avatar" alt={`Demo portrait of ${providerForService(service).name}`}/><Link href={`/providers/${providerForService(service).id}`}><strong>{providerForService(service).business}</strong></Link><small>{language === "fr" ? "Démo" : "Demo"}</small></header>
      <Link href={`${bookingPath}/${service.id}`} aria-label={`Book ${service.title} with ${providerForService(service).name}`}><ServicePhoto file={service.image} className="service-post-image"/></Link>
      <div className="service-post-actions">
        <span className="service-card-rating" aria-label={`Sample rating: ${rating} out of 5`}><Star size={15} fill="currentColor" aria-hidden="true" />{rating}<small>Demo</small></span>
        {account && <button type="button" className="service-bookmark"
          aria-pressed={saved.includes(service.id)}
          aria-label={`${saved.includes(service.id) ? "Remove bookmark for" : "Bookmark"} ${service.title}`}
          onClick={() => setSaved(items => items.includes(service.id) ? items.filter(item => item !== service.id) : [...items, service.id])}>
          <Bookmark size={20} fill={saved.includes(service.id) ? "currentColor" : "none"} aria-hidden="true" />
        </button>}
        <Link href={`${bookingPath}/${service.id}`} className="btn btn-gradient">
          {language === "fr" ? "Réserver" : "Book now"}
        </Link>
      </div>
      <p><strong>{service.title}</strong> · {service.categoryName}{dashboard && <> · ₦{demoServicePrice(service.category).toLocaleString("en-NG")} / person</>}</p>
    </article>;
    })}
      {loading && Array.from({ length: 2 }, (_, index) => <div key={`skeleton-${index}`} className="service-skeleton" aria-hidden="true"><div className="skeleton-header"/><div className="skeleton-image"/><div className="skeleton-line"/></div>)}
    </div>
    {!services.length && (bookmarksOnly
      ? <p>No bookmarks yet. <Link href="/dashboard/explore" className="text-link">Explore services</Link></p>
      : <p>No matching services. Try a different search or clear your filters.</p>)}
    {services.length > 0 && <div ref={sentinel} className="feed-load-more">{hasMore ? <button type="button" className="btn btn-gradient" disabled={loading} onClick={loadMore}>{loading ? (language === "fr" ? "Chargement…" : "Loading services…") : (language === "fr" ? "Voir plus" : "Load more services")}</button> : <p>{language === "fr" ? "Vous avez tout vu." : "You’re all caught up with this preview."}</p>}</div>}
  </section>;
}

export function ServicesFeed({ categorySlug = "", dashboard = false, bookmarksOnly = false }: FeedProps) {
  return <Suspense fallback={<section className="services-feed" aria-busy="true"><h1>Loading services…</h1></section>}><ServicesFeedContent categorySlug={categorySlug} dashboard={dashboard} bookmarksOnly={bookmarksOnly}/></Suspense>;
}
