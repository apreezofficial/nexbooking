"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { languages } from "@/lib/dashboard/data";
import { useRun, useSettings } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Card, Overline, PageHeader, RadioRow } from "../ui";

export default function LanguageScreen() {
  const router = useRouter();
  const settings = useSettings();
  const { run, busy } = useRun();
  const [language, setLanguage] = useState(settings.language);

  return (
    <Page>
      <PageHeader title="Language" back="/dashboard/account" />
      <Card tone="tint" className="d-media">
        <Globe size={20} strokeWidth={1.8} aria-hidden="true" />
        <div><b>Choose your app language.</b><small>Studios may offer content in several languages.</small></div>
      </Card>
      {languages.map((option) => (
        <RadioRow key={option} selected={language === option} onSelect={() => setLanguage(option)} title={option} trailing={option === "English" ? <small className="d-muted">Default</small> : undefined} />
      ))}
      <Overline>Region and currency</Overline>
      <Card><b>Nigeria · ₦ NGN</b></Card>
      <Button size="large" block loading={busy} onClick={async () => {
        const saved = await run(api.settings.update({ language }).then(() => true), `${language} saved as your language.`);
        if (saved) router.push("/dashboard/account");
      }}>Save</Button>
    </Page>
  );
}
