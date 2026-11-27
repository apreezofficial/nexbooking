"use client";

import { Bell, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { homeCategories, servicesByStudio, studios } from "@/lib/dashboard/data";
import { useNotifications, useProfile, useSaved } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Chips, FeedCard, IconButton } from "../ui";
import { StudioBubbles } from "../Bubbles";
import Carousel from "../Carousel";
import Link from "next/link";

export default function HomeScreen() {
  const profile = useProfile();
  const saved = useSaved();
  const unread = useNotifications().some((item) => !item.read);
  const [filter, setFilter] = useState("All");
  const visible = studios.filter((studio) => filter === "All" || studio.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Page wide>
      <div className="d-hero">
        <span>EDEBOOKING · DISCOVER</span>
        <div>
          <h2>Find your next favorite.</h2>
          <p>Real talent, ready when you are.</p>
        </div>
      </div>

      <div className="d-between">
        <Button variant="outline" icon={MapPin} href="/dashboard/location">{profile.location || "Set location"}</Button>
        <IconButton icon={Bell} label="Notifications" dot={unread} href="/dashboard/notifications" />
      </div>

      <Link href="/dashboard/search" className="d-searchbar" aria-label="Search studios, stylists, services">
        <Search size={22} strokeWidth={1.8} aria-hidden="true" />
        <span>Search studios, stylists, services</span>
      </Link>

      <Chips scroll items={homeCategories} value={filter} onChange={setFilter} />

      <div className="d-section-head"><h2 className="d-h2">Studios near you</h2><Link href="/dashboard/explore" className="d-seeall">See all</Link></div>
      <StudioBubbles items={studios.slice(0, 6)} hrefFor={(studio) => `/dashboard/studios/${studio.id}`} />

      {visible.length === 0 ? (
        <p className="d-muted">No studios in {filter} near you yet.</p>
      ) : (
        <Carousel label="Studios to book">
          {visible.slice(0, 5).map((studio) => {
            const first = servicesByStudio[studio.id]?.[0];
            return (
              <div key={studio.id} className="d-carousel-item">
              <FeedCard
                studio={studio}
                saved={Boolean(saved[studio.id])}
                onSave={() => void api.studio.toggleSaved(studio.id)}
                serviceName={first?.name}
                detail={first ? `${first.detail.split(" · ")[0]} · Next slot today` : undefined}
              />
              </div>
            );
          })}
        </Carousel>
      )}
    </Page>
  );
}
