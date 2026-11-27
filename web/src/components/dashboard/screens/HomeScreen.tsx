"use client";

import Link from "next/link";
import { Bell, MapPin, Search } from "lucide-react";
import { ServicesFeed } from "@/components/ServicesExperience";
import { useNotifications, useProfile } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, IconButton } from "../ui";

export default function HomeScreen() {
  const profile = useProfile();
  const unread = useNotifications().some((item) => !item.read);

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

      <ServicesFeed dashboard />
    </Page>
  );
}
