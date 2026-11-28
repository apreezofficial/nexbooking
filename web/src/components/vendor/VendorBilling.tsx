"use client";

import Link from "next/link";
import { useState } from "react";
import { Crown, ReceiptText, Check, ArrowUpRight } from "lucide-react";
import SideDrawer from "@/components/dashboard/SideDrawer";

type Plan = "Pro" | "Premium";
type Cycle = "Monthly" | "Annual";
type Invoice = { id: string; date: string; plan: Plan; cycle: Cycle; cents: number };
type Account = { plan: Plan; cycle: Cycle; active: boolean; invoices: Invoice[] };
const initial: Account = { plan: "Pro", cycle: "Monthly", active: true, invoices: [] };
/** Plan prices are stored in naira, so they are shown as naira. */
const usd = (naira: number) => `₦${naira.toLocaleString("en-NG")}`;
function price(plan: Plan, cycle: Cycle) {
  const monthly = plan === "Pro" ? 15000 : 35000;
  return cycle === "Monthly" ? monthly : Math.round(monthly * 12 * 0.8);
}
function download(invoice: Invoice) {
  const body = ["EdeBooking · Demo invoice", invoice.id, new Date(invoice.date).toLocaleDateString(), invoice.plan + " · " + invoice.cycle, "Simulated amount: " + usd(invoice.cents), "No payment collected."].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = invoice.id + ".txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function VendorBilling({ owner, billing }: { owner: string; billing: boolean }) {
  const storageKey = "edebooking-billing:" + owner.toLowerCase();
  const [account, setAccount] = useState<Account>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "null") ?? initial; } catch { return initial; }
  });
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(account.plan);
  const [cycle, setCycle] = useState(account.cycle);
  const [message, setMessage] = useState("");
  function save(next: Account) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setAccount(next);
      setOpen(false);
      setMessage("Subscription updated.");
    } catch { setMessage("Your browser could not save this change."); }
  }
  function changePlan() {
    const invoice: Invoice = { id: "EB-" + crypto.randomUUID(), date: new Date().toISOString(), plan, cycle, cents: price(plan, cycle) };
    save({ plan, cycle, active: true, invoices: [invoice, ...account.invoices] });
  }
  return <section className="vendor-billing">
    <div className="vd-section-head"><div><h2>{billing ? "Billing history" : "Current plan"}</h2><p>Demo billing · No payments are collected.</p></div>
      <Link className="vd-text-link" href={billing ? "/business/dashboard/subscription" : "/business/dashboard/billing"}>{billing ? "Manage subscription" : "Billing history"}</Link>
    </div>
    {billing ? <>
      {account.invoices.length === 0 && <div className="vendor-empty"><ReceiptText size={32}/><h3>Your invoices will live here</h3><p>Changing your demo plan creates your first invoice.</p></div>}
      {account.invoices.map(i => <article key={i.id} className="vendor-studio-row"><strong>{i.plan} · {usd(i.cents)}</strong><p>{i.cycle} · {new Date(i.date).toLocaleDateString()}</p><button className="vd-outline" onClick={() => download(i)}>Download demo invoice</button></article>)}
    </> : <>
      <div className="vendor-subscription-grid"><div className="vendor-plan"><Crown size={30}/><span>YOUR PLAN</span><h3>{account.plan}</h3><p>{account.active ? usd(price(account.plan, account.cycle)) + (account.cycle === "Monthly" ? " per month" : " per year") : "Cancelled"}</p>
      <button className="vd-primary" onClick={() => { setPlan(account.plan); setCycle(account.cycle); setMessage(""); setOpen(true); }}>{account.active ? "Change plan" : "Restart subscription"}</button>
      {account.active && <button className="vd-text-link" onClick={() => { if (window.confirm("Cancel this demo subscription?")) save({ ...account, active: false }); }}>Cancel subscription</button>}
    </div><div className="vendor-benefits"><span className="vendor-eyebrow">BUILT FOR YOUR BUSINESS</span><h2>Room to do more.</h2><p>Your tools, together in one workspace.</p><ul>{["Custom business branding", "Booking insights and analytics", "Promo codes and offers", ...(account.plan === "Premium" ? ["Staff management", "Integrations and custom domains"] : [])].map(feature => <li key={feature}><span><Check size={15}/></span>{feature}</li>)}</ul><Link href="/business/dashboard/billing">View billing history <ArrowUpRight size={16}/></Link></div></div>
      <div className="vendor-plan-details"><div><span>Billing cycle</span><strong>{account.cycle}</strong></div><div><span>Subscription status</span><strong>{account.active ? "Active demo plan" : "Cancelled"}</strong></div><div><span>Annual billing</span><strong>Save 20% with annual</strong></div></div></>}
    {!open && <p role="status">{message}</p>}
    <SideDrawer open={open} onOpenChange={setOpen} trigger={null} title="Choose your subscription">
      <form className="vd-drawer-form" onSubmit={e => { e.preventDefault(); changePlan(); }}>
        <label>Plan<select value={plan} onChange={e => setPlan(e.target.value as Plan)}><option>Pro</option><option>Premium</option></select></label>
        <label>Billing cycle<select value={cycle} onChange={e => setCycle(e.target.value as Cycle)}><option>Monthly</option><option>Annual</option></select></label>
        <p>{plan === "Pro" ? "Branding, analytics and promo codes." : "Pro features plus staff management, integrations and custom domains."}</p>
        <strong>Demo invoice total · {usd(price(plan, cycle))}</strong>
        {message && <p role="status">{message}</p>}
        <button className="vd-primary" disabled={account.active && account.plan === plan && account.cycle === cycle}>Confirm demo plan</button>
      </form>
    </SideDrawer>
  </section>;
}
