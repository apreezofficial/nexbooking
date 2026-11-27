"use client";

import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { interests, locations } from "@/lib/dashboard/data";
import { useProfile, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Chip, Chips, Field, PageHeader } from "../ui";

export default function LocationScreen() {
  const router = useRouter();
  const profile = useProfile();
  const { run, busy } = useRun();
  const [location, setLocation] = useState(profile.location || locations[0]);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>(profile.interests);

  const toggle = (interest: string) => setPicked((current) => (current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]));
  const typed = query.trim();

  return (
    <Page>
      <PageHeader title="Set your location" />
      <p className="d-muted">We’ll show available booking services near you.</p>
      <div>
        <Button icon={MapPin} onClick={() => void run(api.profile.detectLocation())}>Use my current location</Button>
      </div>
      <Field
        leading={Search}
        placeholder="Search city or area"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter" && typed) { setLocation(typed); setQuery(""); } }}
      />
      {typed ? <Button variant="outline" onClick={() => { setLocation(typed); setQuery(""); }}>Use “{typed}”</Button> : null}
      <Chips items={locations.includes(location) ? locations : [location, ...locations]} value={location} onChange={setLocation} />

      <h2 className="d-h2">Pick your interests</h2>
      <div className="d-chips">
        {interests.map((interest) => <Chip key={interest} label={interest} selected={picked.includes(interest)} onClick={() => toggle(interest)} />)}
      </div>

      <Button size="large" block loading={busy} onClick={async () => {
        const saved = await run(api.profile.update({ location, interests: picked }), "Location and interests saved.");
        if (saved) router.push("/dashboard");
      }}>Continue</Button>
    </Page>
  );
}
