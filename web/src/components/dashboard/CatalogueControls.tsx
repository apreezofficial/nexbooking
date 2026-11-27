"use client";

import { Combobox } from "@base-ui/react/combobox";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { providers, serviceCategories, servicePreviews } from "@/lib/services";
import SideDrawer, { SideDrawerTrigger } from "./SideDrawer";

const suggestions = Array.from(new Set([
  ...serviceCategories.map(category => category.en),
  ...servicePreviews.map(service => service.title),
  ...providers.map(provider => provider.business),
]));

export default function CatalogueControls({ params, category }: { params: string; category: string }) {
  const router = useRouter();
  const current = new URLSearchParams(params);
  const [query, setQuery] = useState(current.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(category);
  const [sort, setSort] = useState(current.get("sort") ?? "");
  const [budget, setBudget] = useState(current.get("budget") ?? "");
  const typed = query.trim().toLowerCase();
  const items = typed ? suggestions.filter(label => label.toLowerCase().includes(typed)).slice(0, 7) : [];
  if (/\b(gym|workout|exercise)\b/.test(typed) && !items.includes("Fitness")) items.unshift("Fitness");

  function navigate(values: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(next.size ? `/dashboard/explore?${next}` : "/dashboard/explore");
  }

  return (
    <div className="dashboard-catalogue-controls">
      <form className="dashboard-catalogue-search" onSubmit={event => {
        event.preventDefault();
        navigate({ q: query.trim() });
      }}>
        <label htmlFor="dashboard-service-query">Search services or providers</label>
        <Combobox.Root<string> items={items} filter={null} inputValue={query}
          onInputValueChange={setQuery} onValueChange={value => {
            if (value) navigate({ q: value === "Fitness" ? "" : value, ...(value === "Fitness" ? { category: "fitness", type: null } : {}) });
          }}>
          <Combobox.Input id="dashboard-service-query" type="search" placeholder="Try massage, braids or yoga" />
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={6} className="d-search-positioner">
              {items.length > 0 && <Combobox.Popup className="d-search-suggestions">
                <Combobox.List>{(item: string) => <Combobox.Item key={item} value={item}>{item}</Combobox.Item>}</Combobox.List>
              </Combobox.Popup>}
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <button className="btn btn-gradient" type="submit">Search</button>
      </form>
      <SideDrawer open={open} onOpenChange={next => {
        if (next) {
          setDraftCategory(category);
          setSort(current.get("sort") ?? "");
          setBudget(current.get("budget") ?? "");
        }
        setOpen(next);
      }} title="Explore filters"
        trigger={<SideDrawerTrigger className="btn dashboard-location-trigger"><SlidersHorizontal size={16} aria-hidden="true" />Filters</SideDrawerTrigger>}>
        <form className="d-stack provider-modal-form" onSubmit={event => {
          event.preventDefault();
          navigate({ category: draftCategory, sort, budget, type: null });
          setOpen(false);
        }}>
          <label>Category<select value={draftCategory} onChange={event => setDraftCategory(event.target.value)}>
            <option value="">All categories</option>
            {serviceCategories.map(item => <option key={item.slug} value={item.slug}>{item.en}</option>)}
          </select></label>
          <label>Budget per person<select value={budget} onChange={event => setBudget(event.target.value)}>
            <option value="">Any price</option>
            <option value="10000">Up to ₦10,000</option>
            <option value="20000">Up to ₦20,000</option>
            <option value="30000">Up to ₦30,000</option>
          </select></label>
          <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="">Recommended</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select></label>
          <button type="submit" className="btn btn-gradient">Show services</button>
          <button type="button" className="btn btn-ghost" onClick={() => {
            setDraftCategory(""); setBudget(""); setSort("");
          }}>Reset filters</button>
        </form>
      </SideDrawer>
    </div>
  );
}
