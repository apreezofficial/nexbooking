"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { categories, servicesByStudio, studios } from "@/lib/dashboard/data";
import { useSaved } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Chips, FeedCard, SpotlightTile, Title } from "../ui";

export default function ExploreScreen() {
  const saved = useSaved();
  const [filter, setFilter] = useState("All");
  const matching = studios.filter((studio) => filter === "All" || studio.category.toLowerCase().includes(filter.toLowerCase()));
  const topRated = [...matching].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 2);

  return (
    <Page wide>
      <Title sub="Discover the best local talent for you.">Explore</Title>
      <Link href="/dashboard/search" className="d-searchbar" aria-label="Search studios, stylists, and services">
        <Search size={22} strokeWidth={1.8} aria-hidden="true" />
        <span>Search studios, stylists, services</span>
        <ChevronRight size={20} aria-hidden="true" />
      </Link>
      <Chips scroll items={categories} value={filter} onChange={setFilter} />

      <h2 className="d-h2">Popular near you</h2>
      {matching.length === 0 ? (
        <p className="d-muted">No studios in {filter} near you yet.</p>
      ) : (
        <div className="d-spots">
          {matching.slice(0, 4).map((studio) => <SpotlightTile key={studio.id} studio={studio} rating href={`/dashboard/studios/${studio.id}`} />)}
        </div>
      )}

      <div className="d-between">
        <h2 className="d-h2">Top rated</h2>
        <Button variant="text" href="/dashboard/search">See all</Button>
      </div>
      <div className="d-feedgrid is-two">
        {topRated.map((studio) => {
          const first = servicesByStudio[studio.id]?.[0];
          return (
            <FeedCard key={studio.id} studio={studio} saved={Boolean(saved[studio.id])} onSave={() => void api.studio.toggleSaved(studio.id)} serviceName={first?.name} detail={first ? `${first.detail.split(" · ")[0]} · Next slot today` : undefined} />
          );
        })}
      </div>
    </Page>
  );
}
