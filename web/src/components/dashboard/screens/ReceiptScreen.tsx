"use client";

import { use } from "react";
import { Download, FileX, Share2 } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { naira } from "@/lib/dashboard/data";
import { useReceipts, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Badge, Button, PageHeader, StateView } from "../ui";

export default function ReceiptScreen({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const receipt = useReceipts().find((item) => item.ref === ref);
  const { run, notify } = useRun();

  if (!receipt) {
    return (
      <Page>
        <PageHeader title="Receipt" back="/dashboard/account/invoices" />
        <StateView icon={FileX} title="We couldn’t find that receipt" body="Your other receipts are in Invoices & receipts." primary={{ label: "See all receipts", href: "/dashboard/account/invoices" }} />
      </Page>
    );
  }

  const share = async () => {
    const text = `EdeBooking receipt ${receipt.ref} · ${receipt.studio} · ${naira(receipt.total)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Receipt ${receipt.ref}`, text });
      else {
        await navigator.clipboard.writeText(text);
        notify("Receipt details copied.");
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  const rows: [string, string][] = [
    ["Studio", receipt.studio], ["Service", receipt.service], ["Staff", receipt.staff], ["Appointment", receipt.appointment],
    ["Paid with", receipt.paidWith], ["Transaction", receipt.transaction],
  ];

  return (
    <Page>
      <PageHeader title="Receipt" back="/dashboard/account/invoices" />
      <article className="d-ticket" aria-label={`Receipt ${receipt.ref}`}>
        <header className="d-ticket-top">
          <Badge status={receipt.status === "Paid" ? "Confirmed" : "Refunded"} label={receipt.status === "Paid" ? "✓ Paid" : "Refunded"} />
          <b className="d-ticket-total">{naira(receipt.total)}</b>
          <small>{receipt.paidAt}</small>
        </header>
        <span className="d-ticket-tear" aria-hidden="true" />
        <dl className="d-ticket-body">
          <div className="d-ticket-row"><dt>Receipt no.</dt><dd>{receipt.ref}</dd></div>
          {rows.map(([label, value]) => (
            <div key={label} className="d-ticket-row"><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        <footer className="d-ticket-totals">
          <div><span>Subtotal</span><b>{naira(receipt.subtotal)}</b></div>
          <div><span>VAT (7.5%)</span><b>{naira(receipt.vat)}</b></div>
          <div className="is-total"><span>Total</span><b>{naira(receipt.total)}</b></div>
        </footer>
      </article>
      <div className="d-grid-2">
        <Button variant="outline" icon={Share2} onClick={share}>Share</Button>
        <Button icon={Download} onClick={() => void run(api.billing.downloadReceipt(receipt), "Receipt downloaded.")}>Download</Button>
      </div>
    </Page>
  );
}
