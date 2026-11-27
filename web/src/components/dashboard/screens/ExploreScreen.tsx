"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { categories, servicesByStudio, studios } from "@/lib/dashboard/data";
import { useSaved } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { CategoryStories, StudioBubbles } from "../Bubbles";
import { Button, FeedCard, Overline, Title } from "../ui";

/** The same images the /services page uses for its categories. */
const categoryImages: Record<string, string> = {
  All: "/assets/discover-studio.png",
  Hair: "/assets/discover-salon.png",
  Nails: "/assets/discover-clinic.png",
  Barber: "/assets/discover-tutor.png",
  Photo: "/assets/discover-photography.png",
  Fitness: "/assets/discover-fitness.png",
};

export default function ExploreScreen() {
  const saved = useSaved();
  const [filter, setFilter] = useState("All");
  const matching = studios.filter((studio) => filter === "All" || studio.category.toLowerCase().includes(filter.toLowerCase()));
  const topRated = [...matching].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

  return (
    <Page wide>
      <Title sub="Explore our studios, pick a category, and book the service you want.">Explore</Title>
      <Link href="/dashboard/search" className="d-searchbar" aria-label="Search studios, stylists, and services">
        <Search size={22} strokeWidth={1.8} aria-hidden="true" />
        <span>Search studios, stylists, services</span>
        <ChevronRight size={20} aria-hidden="true" />
      </Link>

      <CategoryStories items={categories.map((label) => ({ label, image: categoryImages[label] ?? categoryImages.All }))} value={filter} onChange={setFilter} />

      <Overline>Popular near you</Overline>
      {matching.length === 0 ? <p className="d-muted">No studios in {filter} near you yet.</p> : <StudioBubbles items={matching} hrefFor={(studio) => `/dashboard/studios/${studio.id}`} />}

      <div className="d-between">
        <h2 className="d-h2">Top rated</h2>
        <Button variant="text" href="/dashboard/search">See all</Button>
      </div>
      <div className="service-feed-grid">
        {topRated.map((studio) => {
          const first = servicesByStudio[studio.id]?.[0];
          return (
            <FeedCard key={studio.id} studio={studio} saved={Boolean(saved[studio.id])} onSave={() => void api.studio.toggleSaved(studio.id)} serviceName={first?.name} detail={first ? first.detail.split(" · ")[0] : undefined} />
          );
        })}
      </div>
    </Page>
  );
}
