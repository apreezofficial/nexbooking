"use client";

import { use } from "react";
import { threadName } from "@/lib/dashboard/data";
import { Page } from "../DashboardShell";
import ChatPane from "../ChatPane";
import { PageHeader } from "../ui";

/** A single conversation, full page. Used on phones and when a thread is opened directly. */
export default function MessageScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Page>
      <PageHeader title={threadName(id)} back="/dashboard/inbox" />
      <ChatPane id={id} compact />
    </Page>
  );
}
