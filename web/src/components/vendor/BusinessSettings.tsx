"use client";

import { useState } from "react";
import SideDrawer from "@/components/dashboard/SideDrawer";
import { ArrowUpRight } from "lucide-react";

const groups = {
  "Business details": [
    ["businessName", "Business name", "text", "Serenity House"],
    ["email", "Business email", "email", ""],
    ["phone", "Phone number", "tel", ""],
    ["address", "Address", "text", ""],
    ["tagline", "About your business", "text", ""],
  ],
  "Booking policies": [
    ["graceWindowHours", "Free cancellation window (hours)", "number", "24"],
    ["bufferMinutes", "Time between bookings (minutes)", "number", "15"],
    ["advanceDays", "Book ahead (days)", "number", "60"],
    ["depositPercent", "Deposit percentage", "number", "10"],
  ],
  "Working hours": [],
  "Notifications": [],
} as const;
type Group = keyof typeof groups;
const notifications = ["New booking requests", "Cancellations", "Customer messages", "Payments received", "Payouts", "Billing and plan", "New reviews", "Tips and offers"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const key = "edebooking_vendor_profile";
function read(): Record<string, string | boolean> {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
}
export default function BusinessSettings() {
  const [panel, setPanel] = useState<Group | null>(null);
  const [saved, setSaved] = useState<Record<string, string | boolean>>({});
  const [message, setMessage] = useState("");
  function open(group: Group) { setSaved(read()); setPanel(group); }
  return <>
    <section className="vd-team-grid">
      {(Object.keys(groups) as Group[]).map(group => <button className="vd-card vd-settings-card" key={group} onClick={() => open(group)}><b>{group}</b><ArrowUpRight size={18} /></button>)}
    </section>
    <p role="status" className="vd-save-status">{message}</p>
    <SideDrawer open={panel !== null} onOpenChange={open => { if (!open) setPanel(null); }} title={panel ?? "Settings"} trigger={null}>
      {panel && <form key={panel} className="vd-drawer-form" onSubmit={event => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const form = event.currentTarget;
        if (panel === "Working hours" && days.some(day =>
          fields.has(`open-${day}`) && String(fields.get(`start-${day}`)) >= String(fields.get(`end-${day}`))
        )) {
          setMessage("Closing time must be after opening time for each open day.");
          return;
        }
        const changes: Record<string, string | boolean> = Object.fromEntries(fields.entries()) as Record<string, string>;
        form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => { changes[input.name] = input.checked; });
        try {
          localStorage.setItem(key, JSON.stringify({ ...read(), ...changes }));
          setPanel(null);
          setMessage("Settings saved in this browser.");
        } catch { setMessage("Unable to save settings. Please check browser storage and try again."); }
      }}>
        {groups[panel].map(([name, label, type, fallback]) => <label key={name}>{label}<input name={name} type={type} required={name === "businessName"} min={type === "number" ? 0 : undefined} max={name === "depositPercent" ? 100 : undefined} defaultValue={String(saved[name] ?? fallback)} /></label>)}
        {panel === "Booking policies" && <>
          <label>Accept new bookings<select name="bookingMode" defaultValue={String(saved.bookingMode ?? "approval")}><option value="approval">Request approval</option><option value="instant">Instant booking</option></select></label>
          <fieldset><legend>Customer options</legend>{["Require a deposit", "Allow customer messages"].map(label => <label key={label}><input type="checkbox" name={label} defaultChecked={Boolean(saved[label] ?? true)} />{label}</label>)}</fieldset>
        </>}
        {panel === "Working hours" && days.map(day => <fieldset key={day}><legend>{day}</legend><label><input name={`open-${day}`} type="checkbox" defaultChecked={Boolean(saved[`open-${day}`] ?? day !== "Sun")} />Open</label><label>Opens<input type="time" required name={`start-${day}`} defaultValue={String(saved[`start-${day}`] ?? "09:00")} /></label><label>Closes<input type="time" required name={`end-${day}`} defaultValue={String(saved[`end-${day}`] ?? "19:00")} /></label></fieldset>)}
        {panel === "Notifications" && <fieldset><legend>Notify me about</legend>{notifications.map(label => <label key={label}><input name={`notify-${label}`} type="checkbox" defaultChecked={Boolean(saved[`notify-${label}`] ?? label !== "Tips and offers")} />{label}</label>)}</fieldset>}
        <p role="status">{message}</p>
        <button className="vd-primary">Save settings</button>
      </form>}
    </SideDrawer>
  </>;
}
