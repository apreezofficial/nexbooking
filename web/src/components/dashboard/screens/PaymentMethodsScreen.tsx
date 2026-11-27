"use client";

import { Check, CreditCard, Lock } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { usePaymentMethods, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Card, PageHeader } from "../ui";

export default function PaymentMethodsScreen() {
  const methods = usePaymentMethods();
  const { run } = useRun();

  return (
    <Page>
      <PageHeader title="Payment methods" back="/dashboard/account" />
      <p className="d-muted">Your saved payment options</p>
      {methods.map((method) => (
        <div key={method.id} className="d-box is-selected d-media" role="radio" aria-checked={method.isDefault} aria-label={`${method.label}, ${method.detail}`}>
          <CreditCard size={24} strokeWidth={1.8} aria-hidden="true" />
          <div><b>{method.label}</b><small>{method.detail}</small></div>
          {method.isDefault ? <Check size={20} aria-hidden="true" /> : null}
        </div>
      ))}
      <div><Button variant="text" onClick={() => void run(api.billing.addPaymentMethod())}>＋ Add a new card</Button></div>
      <Card className="d-media"><Lock size={20} strokeWidth={1.8} aria-hidden="true" /><span className="d-muted">Your payment details are encrypted.</span></Card>
    </Page>
  );
}
