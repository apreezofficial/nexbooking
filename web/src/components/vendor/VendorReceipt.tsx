"use client";

import { Printer, X } from "lucide-react";

type Booking = { id: string; client: string; service: string; date: string; time: string; staff: string; amount: number; status: string };

const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const VAT_RATE = 0.075;

/** A receipt for one confirmed or completed booking. Print uses the browser's print sheet, showing only this receipt. */
export default function VendorReceipt({ booking, business, onClose }: { booking: Booking; business: string; onClose: () => void }) {
  const vat = Math.round(booking.amount * VAT_RATE);
  const total = booking.amount + vat;
  const ref = `RCT-${booking.id}`;
  const rows: [string, string][] = [["Business", business], ["Client", booking.client], ["Service", booking.service], ["Staff", booking.staff], ["Appointment", `${booking.date}, ${booking.time}`], ["Booking", booking.id]];

  return <section className="vd-card vd-receipt-card" aria-label={`Receipt ${ref}`}>
    <div className="vd-section-head vd-receipt-actions">
      <div><h2>Receipt {ref}</h2><p>{booking.status === "Completed" ? "Completed appointment" : "Confirmed appointment"}</p></div>
      <div className="vd-receipt-buttons">
        <button type="button" className="vd-outline vd-compact" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print</button>
        <button type="button" className="vd-outline vd-compact" onClick={onClose} aria-label="Close receipt"><X size={16} aria-hidden="true" /></button>
      </div>
    </div>
    <article className="vd-receipt vd-receipt-print">
      <header><span className="vd-receipt-brand">{business}</span><strong>{money(total)}</strong><small>Total paid</small></header>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <footer>
        <div><span>Subtotal</span><b>{money(booking.amount)}</b></div>
        <div><span>VAT (7.5%)</span><b>{money(vat)}</b></div>
        <div className="is-total"><span>Total</span><b>{money(total)}</b></div>
      </footer>
    </article>
  </section>;
}
