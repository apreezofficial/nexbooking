"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useProfile, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Field, PageHeader } from "../ui";

const initials = (name: string) => (name || "Ada Okafor").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfile();
  const { run, busy } = useRun();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  return (
    <Page>
      <PageHeader title="Edit profile" back="/dashboard/account" />
      <div className="d-photo">
        <span className="d-avatar is-large">{initials(name)}</span>
        <Button variant="text" onClick={() => void run(api.profile.changePhoto())}>Change photo</Button>
      </div>
      <Field label="Full name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Okafor" autoComplete="name" />
      <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      <Field label="Phone number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+234 801 234 5678" autoComplete="tel" />
      <Link href="/dashboard/location" className="d-box">
        <small>Location</small>
        <b>{profile.location || "Set your location"} ›</b>
      </Link>
      <Button size="large" block loading={busy} onClick={async () => {
        const saved = await run(api.profile.update({ name, email, phone }), "Profile changes saved.");
        if (saved) router.push("/dashboard/account");
      }}>Save changes</Button>
    </Page>
  );
}
