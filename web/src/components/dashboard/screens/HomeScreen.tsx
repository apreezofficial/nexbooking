"use client";

import { useState } from "react";
import SideDrawer, { SideDrawerTrigger } from "../SideDrawer";
import { LocationForm } from "./LocationScreen";
import Link from "next/link";
import { Bell, Bookmark, MapPin, Search } from "lucide-react";
import SiteArt from "@/components/SiteArt";
import { ServicesFeed } from "@/components/ServicesExperience";
import { useNotifications, useProfile } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { IconButton } from "../ui";

export default function HomeScreen() {
  const [locationOpen, setLocationOpen] = useState(false);
  const profile = useProfile();
  const unread = useNotifications().some((item) => !item.read);

  return (
    <Page wide>
      <section className="d-home-feature">
        <SiteArt file="services/spa-wellness.jpg" className="d-home-feature-art" />
        <div className="d-home-feature-copy">
          <h1>A little time for yourself.</h1>
          <p>Find a massage, facial, or wellness session that fits your day.</p>
          <Link href="/dashboard/explore?category=spa-wellness" className="btn btn-gradient">Explore spa &amp; wellness</Link>
        </div>
      </section>

      <div className="d-between">
        <SideDrawer open={locationOpen} onOpenChange={setLocationOpen} title="Location and interests"
          trigger={<SideDrawerTrigger className="btn dashboard-location-trigger"><MapPin size={17} aria-hidden="true" />{profile.location || "Set location"}</SideDrawerTrigger>}>
          {locationOpen && <LocationForm onSaved={() => setLocationOpen(false)} />}
        </SideDrawer>
        <Link href="/dashboard/bookmarks" className="btn dashboard-location-trigger"><Bookmark size={17} aria-hidden="true" />Bookmarks</Link>
        <IconButton icon={Bell} label="Notifications" dot={unread} href="/dashboard/notifications" />
      </div>

      <Link href="/dashboard/search" className="d-searchbar" aria-label="Search studios, stylists, services">
        <Search size={22} strokeWidth={1.8} aria-hidden="true" />
        <span>Search studios, stylists, services</span>
      </Link>

      <ServicesFeed dashboard />
    </Page>
  );
}
