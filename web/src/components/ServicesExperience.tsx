"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import SiteArt from "./SiteArt";

import { serviceCategories, servicePreviews } from "@/lib/services";

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
  return <div className="hero-services"><h1 className="hero-title">{language === "fr" ? "Vos services à portée de clic" : "Your services a click away"}</h1><p className="hero-sub">{language === "fr" ? "Découvrez, explorez et réservez." : "Discover the work. Find your service. Make it yours."}</p><div className="service-stories" aria-label={language === "fr" ? "Services" : "Browse services"}>{categories.slice(1).map(category => <Link href={`/services/${category.slug}`} key={category.en}><SiteArt file={category.image} /><span>{category[language]}</span></Link>)}</div><Link href="/services" className="btn btn-gradient">{language === "fr" ? "Voir les services" : "Explore services"}</Link></div>;
}
export function ServicesFeed({ categorySlug = "" }: { categorySlug?: string }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as const);
  const [count, setCount] = useState(8);
  const [saved, setSaved] = useState<string[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);
  const category = serviceCategories.find(item => item.slug === categorySlug);
  const services = servicePreviews.filter(item => !categorySlug || item.category === categorySlug);
  const hasMore = count < services.length;

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setCount(value => value + 8);
    }, { rootMargin: "200px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, count]);

  return <section className="services-feed">
    <h1>{category ? category[language] : language === "fr" ? "Découvrez votre prochain service" : "Find your next favourite service"}</h1>
    <p>{language === "fr" ? "Catalogue de démonstration. Les prestataires seront disponibles au lancement." : "Explore our demo service catalogue. Provider profiles and availability are coming at launch."}</p>
    <div className="service-stories">{categories.map(item => <Link key={item.en} href={item.slug ? `/services/${item.slug}` : "/services"} aria-current={categorySlug === item.slug ? "page" : undefined}><SiteArt file={item.image}/><span>{item[language]}</span></Link>)}</div>
    <div className="service-feed-grid">{services.slice(0, count).map(service => <article key={service.id}>
      <header><span className="service-avatar">{service.title[0]}</span><strong>{service.title}</strong><small>{language === "fr" ? "Démo" : "Demo"}</small></header>
      <SiteArt file={service.image} className="service-post-image"/>
      <div className="service-post-actions"><button aria-pressed={saved.includes(service.id)} aria-label={`Save ${service.title}`} onClick={() => setSaved(items => items.includes(service.id) ? items.filter(item => item !== service.id) : [...items, service.id])}>{saved.includes(service.id) ? "♥" : "♡"}</button><Link href="/booking" className="btn btn-gradient">{language === "fr" ? "Réserver" : "Explore booking"}</Link></div>
      <p><strong>{service.title}</strong> · {service.categoryName}</p>
    </article>)}</div>
    <div ref={sentinel} className="feed-load-more">{hasMore ? <button type="button" className="btn btn-gradient" onClick={() => setCount(value => value + 8)}>{language === "fr" ? "Voir plus" : "Load more services"}</button> : <p>{language === "fr" ? "Vous avez tout vu." : "You’re all caught up with this preview."}</p>}</div>
  </section>;
}
