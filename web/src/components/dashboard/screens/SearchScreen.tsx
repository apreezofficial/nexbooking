"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { searchSuggestions, studios } from "@/lib/dashboard/data";
import { useStored } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, Field, Overline, PageHeader } from "../ui";

export type SearchFilters = { category: string; km: string; rating: string; options: string[] };
export const defaultFilters: SearchFilters = { category: "All", km: "5 km", rating: "Any", options: [] };

export function applyFilters(query: string, filters: SearchFilters) {
  const q = query.trim().toLowerCase();
  const maxKm = parseFloat(filters.km);
  const minRating = filters.rating === "Any" ? 0 : parseFloat(filters.rating);
  return studios.filter((studio) => {
    if (q && !`${studio.name} ${studio.category} ${studio.services}`.toLowerCase().includes(q)) return false;
    if (filters.category !== "All" && !studio.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (parseFloat(studio.distance) > maxKm) return false;
    if (parseFloat(studio.rating) < minRating) return false;
    if (filters.options.includes("Verified studios only") && !studio.verified) return false;
    return true;
  });
}

export default function SearchScreen() {
  const { value: filters } = useStored<SearchFilters>("filters", defaultFilters);
  const [query, setQuery] = useState("");
  const results = useMemo(() => applyFilters(query, filters), [query, filters]);
  const active = filters.category !== "All" || filters.km !== "5 km" || filters.rating !== "Any" || filters.options.length > 0;

  return (
    <Page>
      <PageHeader title="Search" />
      <Field leading={Search} placeholder="Search studios, stylists, services" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
      <div>
        <Button icon={SlidersHorizontal} variant={active ? "primary" : "outline"} href="/dashboard/search/filters">Filters{active ? " · on" : ""}</Button>
      </div>
      <Overline>{query.trim() ? "Matching results" : "Suggestions"}</Overline>
      {!query.trim() ? (
        <div className="d-inline">
          {searchSuggestions.map((suggestion) => <Button key={suggestion} variant="text" onClick={() => setQuery(suggestion)}>{suggestion}</Button>)}
        </div>
      ) : null}
      {results.map((studio) => (
        <Link key={studio.id} href={`/dashboard/studios/${studio.id}`} className="d-box">
          <span className="d-between">
            <b>{studio.name} · ★ {studio.rating}</b>
            {studio.verified ? <Badge label="Verified" small /> : null}
          </span>
          <small>{studio.category} · {studio.distance}</small>
        </Link>
      ))}
      {results.length === 0 ? <p className="d-muted">No matching studios yet. Try a different search or clear your filters.</p> : null}
    </Page>
  );
}
