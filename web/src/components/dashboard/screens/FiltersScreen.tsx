"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/dashboard/data";
import { useStored, writeKey } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Chip, Chips, PageHeader } from "../ui";
import { applyFilters, defaultFilters, type SearchFilters } from "./SearchScreen";

const extras = ["Available today", "Open now", "Verified studios only"];

export default function FiltersScreen() {
  const router = useRouter();
  const { value: saved } = useStored<SearchFilters>("filters", defaultFilters);
  const [draft, setDraft] = useState<SearchFilters>(saved);
  const count = applyFilters("", draft).length;
  const toggle = (option: string) => setDraft((current) => ({ ...current, options: current.options.includes(option) ? current.options.filter((item) => item !== option) : [...current.options, option] }));

  return (
    <Page>
      <PageHeader title="Filters" back="/dashboard/search" />
      <Chips items={categories.filter((item) => item !== "Fitness")} value={draft.category} onChange={(category) => setDraft({ ...draft, category })} />
      <h2 className="d-h3">Distance · Within {draft.km}</h2>
      <Chips items={["1 km", "5 km", "10 km", "20 km"]} value={draft.km} onChange={(km) => setDraft({ ...draft, km })} />
      <h2 className="d-h3">Minimum rating</h2>
      <Chips items={["Any", "4.0+", "4.5+", "4.8+"]} value={draft.rating} onChange={(rating) => setDraft({ ...draft, rating })} />
      <div className="d-chips">
        {extras.map((option) => <Chip key={option} label={option} selected={draft.options.includes(option)} onClick={() => toggle(option)} />)}
      </div>
      <Button variant="text" onClick={() => setDraft(defaultFilters)}>Clear filters</Button>
      <Button size="large" block onClick={() => { writeKey("filters", draft); router.push("/dashboard/search"); }}>
        Show {count} {count === 1 ? "result" : "results"}
      </Button>
    </Page>
  );
}
