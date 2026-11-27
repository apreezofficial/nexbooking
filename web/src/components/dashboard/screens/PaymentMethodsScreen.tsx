"use client";

import { useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { usePaymentMethods } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import SideDrawer, { SideDrawerTrigger } from "../SideDrawer";
import { Button, PageHeader } from "../ui";

export default function PaymentMethodsScreen() {
  const methods = usePaymentMethods();
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState<"Visa" | "Mastercard">("Visa");
  const [notice, setNotice] = useState("");
  const hasCard = (name: string) => methods.some(method => method.id === `demo-${name.toLowerCase()}`);
  const available = ["Visa", "Mastercard"].some(name => !hasCard(name));

  return (
    <Page>
      <PageHeader title="Payment methods" back="/dashboard/account" />
      <p className="d-muted">Cards saved in this demo</p>
      <div className="d-stack" role="group" aria-label="Default card">
        {methods.map(method => (
          <button key={method.id} type="button" className={`d-box d-media${method.isDefault ? " is-selected" : ""}`}
            aria-pressed={method.isDefault} onClick={() => {
              api.billing.setDefaultPaymentMethod(method.id);
              setNotice(`${method.label} is now your default card.`);
            }}>
            <CreditCard size={24} aria-hidden="true" />
            <span><b>{method.label}</b><small>{method.detail}</small></span>
            {method.isDefault && <><Check size={18} aria-hidden="true" /><small>Default</small></>}
          </button>
        ))}
      </div>
      {!available && <p className="d-muted">Both sample cards are saved.</p>}
      <p className="d-muted" role="status">{notice}</p>

      <SideDrawer open={open} onOpenChange={next => {
        if (next) setBrand(hasCard("Visa") ? "Mastercard" : "Visa");
        setOpen(next);
      }} title="Add a demo card" description="Choose a sample card to try saving a payment method."
        trigger={<SideDrawerTrigger className="btn btn-gradient" disabled={!available}>＋ Add a new card</SideDrawerTrigger>}>
        <form className="d-stack provider-modal-form" onSubmit={event => {
          event.preventDefault();
          api.billing.addDemoCard(brand);
          setNotice(`${brand} demo card added.`);
          setOpen(false);
        }}>
          <label>Sample card
            <select value={brand} onChange={event => setBrand(event.target.value === "Mastercard" ? "Mastercard" : "Visa")}>
              <option disabled={hasCard("Visa")}>Visa</option>
              <option disabled={hasCard("Mastercard")}>Mastercard</option>
            </select>
          </label>
          <Button type="submit">Save demo card</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </form>
      </SideDrawer>
    </Page>
  );
}
