"use client";

import { useState } from "react";
import { Bell, Building2, CalendarClock, Clock, Save, type LucideIcon } from "lucide-react";

type Field = readonly [name: string, label: string, type: string, fallback: string];
type Section = { title: string; subtitle: string; icon: LucideIcon; fields: Field[] };

const sections: Record<string, Section> = {
  "Business details": {
    title: "Business details", subtitle: "How customers find and contact your business", icon: Building2,
    fields: [
      ["businessName", "Business name", "text", "Serenity House"],
      ["email", "Business email", "email", ""],
      ["phone", "Phone number", "tel", ""],
      ["address", "Address", "text", ""],
      ["tagline", "About your business", "text", ""],
    ],
  },
  "Booking policies": {
    title: "Booking policies", subtitle: "Cancellations, buffers and deposits", icon: CalendarClock,
    fields: [
      ["graceWindowHours", "Free cancellation window (hours)", "number", "24"],
      ["bufferMinutes", "Time between bookings (minutes)", "number", "15"],
      ["advanceDays", "Book ahead (days)", "number", "60"],
      ["depositPercent", "Deposit percentage", "number", "10"],
    ],
  },
  "Working hours": { title: "Working hours", subtitle: "When customers can book you", icon: Clock, fields: [] },
  Notifications: { title: "Notifications", subtitle: "What we tell you, and when", icon: Bell, fields: [] },
};
const groupNames = Object.keys(sections);
const notifications = ["New booking requests", "Cancellations", "Customer messages", "Payments received", "Payouts", "Billing and plan", "New reviews", "Tips and offers"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const key = "edebooking_vendor_profile";

function read(): Record<string, string | boolean> {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
}

/** Business settings in the same frame as the customer account pages: a sub-nav and one form at a time. */
export default function BusinessSettings() {
  const [panel, setPanel] = useState(groupNames[0]);
  const [saved, setSaved] = useState<Record<string, string | boolean>>(read);
  const [message, setMessage] = useState("");
  const current = sections[panel];
  const Icon = current.icon;

  function choose(name: string) {
    setSaved(read());
    setMessage("");
    setPanel(name);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (panel === "Working hours" && days.some(day => fields.has(`open-${day}`) && String(fields.get(`start-${day}`)) >= String(fields.get(`end-${day}`)))) {
      setMessage("Closing time must be after opening time for each open day.");
      return;
    }
    const changes: Record<string, string | boolean> = Object.fromEntries(fields.entries()) as Record<string, string>;
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => { changes[input.name] = input.checked; });
    try {
      localStorage.setItem(key, JSON.stringify({ ...read(), ...changes }));
      setSaved(read());
      setMessage("Saved in this browser.");
    } catch {
      setMessage("Unable to save settings. Please check browser storage and try again.");
    }
  }

  return <section className="vs-shell">
    <div className="vs-grid">
      <nav className="vs-nav" aria-label="Business settings">
        {groupNames.map(name => {
          const Item = sections[name].icon;
          return <button key={name} type="button" aria-current={name === panel ? "page" : undefined} className={name === panel ? "is-active" : ""} onClick={() => choose(name)}>
            <Item size={17} strokeWidth={1.8} aria-hidden="true" /><span>{name}</span>
          </button>;
        })}
      </nav>

      <form key={panel} className="vd-card vs-panel" onSubmit={submit}>
        <div className="vs-panel-head"><span className="vs-panel-icon"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span><div><h2>{current.title}</h2><p>{current.subtitle}</p></div></div>

        {current.fields.length > 0 && <div className="vs-fields">
          {current.fields.map(([name, label, type, fallback]) => <label key={name} className="vs-field">
            <span>{label}</span>
            <input name={name} type={type} required={name === "businessName"} min={type === "number" ? 0 : undefined} max={name === "depositPercent" ? 100 : undefined} defaultValue={String(saved[name] ?? fallback)} />
          </label>)}
        </div>}

        {panel === "Booking policies" && <>
          <label className="vs-field"><span>Accept new bookings</span><select name="bookingMode" defaultValue={String(saved.bookingMode ?? "approval")}><option value="approval">Request approval</option><option value="instant">Instant booking</option></select></label>
          <fieldset className="vs-checks"><legend>Customer options</legend>{["Require a deposit", "Allow customer messages"].map(label => <label key={label}><input type="checkbox" name={label} defaultChecked={Boolean(saved[label] ?? true)} /><span>{label}</span></label>)}</fieldset>
        </>}

        {panel === "Working hours" && <div className="vs-hours">{days.map(day => <div key={day} className="vs-day">
          <label className="vs-check-inline"><input name={`open-${day}`} type="checkbox" defaultChecked={Boolean(saved[`open-${day}`] ?? day !== "Sun")} /><span>{day}</span></label>
          <label className="vs-time"><span>Opens</span><input type="time" required name={`start-${day}`} defaultValue={String(saved[`start-${day}`] ?? "09:00")} /></label>
          <label className="vs-time"><span>Closes</span><input type="time" required name={`end-${day}`} defaultValue={String(saved[`end-${day}`] ?? "19:00")} /></label>
        </div>)}</div>}

        {panel === "Notifications" && <fieldset className="vs-checks"><legend>Notify me about</legend>{notifications.map(label => <label key={label}><input name={`notify-${label}`} type="checkbox" defaultChecked={Boolean(saved[`notify-${label}`] ?? label !== "Tips and offers")} /><span>{label}</span></label>)}</fieldset>}

        <div className="vs-actions">
          <p role="status">{message}</p>
          <button className="vd-primary" type="submit"><Save size={16} aria-hidden="true" /> Save changes</button>
        </div>
      </form>
    </div>
  </section>;
}
