"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { naira } from "@/lib/dashboard/data";
import { useProformas, useReceipts, useRun } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, Chips, Overline, PageHeader } from "../ui";

export default function InvoicesScreen() {
  const receipts = useReceipts();
  const proformas = useProformas();
  const today = useToday();
  const { run } = useRun();
  const [tab, setTab] = useState("Receipts");
  const [range, setRange] = useState("All");

  const month = today ? new Date(`${today}T12:00:00`).toLocaleDateString("en-GB", { month: "short" }) : "";
  const inRange = (date: string) => range !== "This month" || date.endsWith(month);
  const shownReceipts = receipts.filter((receipt) => inRange(receipt.date));
  const shownProformas = proformas.filter((proforma) => inRange(proforma.date));
  const monthLabel = today ? new Date(`${today}T12:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase() : "";

  return (
    <Page>
      <PageHeader title="Invoices & receipts" back="/dashboard/account" />
      <Chips items={["Receipts", "Proforma"]} value={tab} onChange={setTab} />
      <Chips items={["All", "This month", "2026"]} value={range} onChange={setRange} />
      <Overline>{range === "This month" ? monthLabel : "2026"}</Overline>

      {tab === "Receipts" ? (
        shownReceipts.length === 0 ? <p className="d-muted">No receipts for this period.</p> : shownReceipts.map((receipt) => (
          <Link key={receipt.ref} href={`/dashboard/account/invoices/${receipt.ref}`} className="d-box d-doc">
            <span className="d-doc-icon"><FileText size={20} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="d-doc-text"><b>{receipt.studio}</b><small>{receipt.ref} · {receipt.date}</small></span>
            <span className="d-doc-amount"><b>{naira(receipt.total)}</b><Badge status={receipt.status === "Paid" ? "Completed" : "Refunded"} label={receipt.status} small /></span>
          </Link>
        ))
      ) : (
        shownProformas.length === 0 ? <p className="d-muted">No proforma invoices for this period.</p> : shownProformas.map((proforma) => (
          <div key={proforma.ref} className="d-box d-doc">
            <span className="d-doc-icon"><FileText size={20} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="d-doc-text"><b>{proforma.studio}</b><small>{proforma.ref} · {proforma.date}</small></span>
            <span className="d-doc-amount"><b>{naira(proforma.total)}</b><Badge status={proforma.status === "Paid" ? "Paid" : "Pending"} label={proforma.status} small /></span>
          </div>
        ))
      )}
      <div><Button variant="text" icon={Download} onClick={() => void run(api.billing.downloadAll(shownReceipts), "Your receipts have been downloaded.")}>Download all</Button></div>
    </Page>
  );
}
