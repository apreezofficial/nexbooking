"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, CalendarDays, Check, ChevronDown, CircleDollarSign, Clock3, Plus, Search, Settings2, Sparkles, X } from "lucide-react";
import { parseSession, signOut, useSessionRaw } from "@/lib/session";

type Booking = { id: string; client: string; service: string; date: string; time: string; staff: string; amount: number; status: "Pending" | "Confirmed" | "Completed" | "Declined" };
type Staff = { id: string; name: string; role: string; initials: string; color: string };
type Service = { id: string; name: string; duration: string; price: number; live: boolean };
type VendorData = { bookings: Booking[]; staff: Staff[]; services: Service[] };
type View = "Overview" | "Bookings" | "Services" | "Team";

const DATA_KEY = "edebooking-vendor-workspace";
const defaults: VendorData = {
  bookings: [
    { id: "EB-2048", client: "Amara Okafor", service: "Deep tissue massage", date: "Today", time: "10:00 AM", staff: "Ruth A.", amount: 28000, status: "Pending" },
    { id: "EB-2047", client: "Tunde Adeyemi", service: "Signature facial", date: "Today", time: "11:30 AM", staff: "Kemi O.", amount: 22000, status: "Confirmed" },
    { id: "EB-2046", client: "Chioma Eze", service: "Body scrub", date: "Today", time: "1:00 PM", staff: "Ruth A.", amount: 18000, status: "Confirmed" },
    { id: "EB-2045", client: "David Mensah", service: "Couples massage", date: "Tomorrow", time: "9:30 AM", staff: "Unassigned", amount: 52000, status: "Pending" },
    { id: "EB-2044", client: "Sade Bello", service: "Deep tissue massage", date: "Tomorrow", time: "2:00 PM", staff: "Kemi O.", amount: 28000, status: "Confirmed" },
  ],
  staff: [
    { id: "s1", name: "Ruth Adebayo", role: "Senior therapist", initials: "RA", color: "mint" },
    { id: "s2", name: "Kemi Okonkwo", role: "Massage therapist", initials: "KO", color: "lilac" },
    { id: "s3", name: "Zara Ibrahim", role: "Esthetician", initials: "ZI", color: "peach" },
  ],
  services: [
    { id: "v1", name: "Deep tissue massage", duration: "60 min", price: 28000, live: true },
    { id: "v2", name: "Signature facial", duration: "45 min", price: 22000, live: true },
    { id: "v3", name: "Body scrub", duration: "45 min", price: 18000, live: true },
    { id: "v4", name: "Couples massage", duration: "90 min", price: 52000, live: true },
  ],
};
const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

function loadData(): VendorData {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<VendorData>;
      return { bookings: parsed.bookings ?? defaults.bookings, staff: parsed.staff ?? defaults.staff, services: parsed.services ?? defaults.services };
    }
  } catch { /* use the sample workspace if storage is unavailable */ }
  return defaults;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const raw = useSessionRaw();
  const session = parseSession(raw);
  const [data, setData] = useState<VendorData>(() => typeof window === "undefined" ? defaults : loadData());

  const [view, setView] = useState<View>("Overview");
  const [filter, setFilter] = useState("All bookings");
  const [query, setQuery] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [addingService, setAddingService] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  useEffect(() => {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* keep this session usable without storage */ }
  }, [data]);

  const pendingCount = data.bookings.filter(item => item.status === "Pending").length;
  const weeklyRevenue = data.bookings.filter(item => item.status === "Confirmed" || item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  const visibleBookings = useMemo(() => data.bookings.filter(item => (filter === "All bookings" || item.status === filter) && `${item.client} ${item.service} ${item.id}`.toLowerCase().includes(query.toLowerCase())), [data.bookings, filter, query]);

  if (raw === null) return <main className="vd-loading"><span className="vd-spinner"/><p>Opening your workspace…</p></main>;
  if (!session) return <main className="vd-gate"><div className="vd-brand">ede<span>booking</span></div><p className="vd-eyebrow">YOUR BUSINESS, IN ONE PLACE</p><h1>Welcome to your workspace.</h1><p>Sign in to manage appointments, services and your team.</p><Link className="vd-primary" href="/login?next=/business/dashboard">Continue to login <ArrowUpRight size={17}/></Link><Link className="vd-back" href="/">Back to EdeBooking</Link></main>;
  if (session.role !== "vendor") return <main className="vd-gate"><div className="vd-brand">ede<span>booking</span></div><p className="vd-eyebrow">VENDOR WORKSPACE</p><h1>Switch to your business account.</h1><p>You are signed in as {session.email}. Log out, then sign in with your vendor account to manage your business.</p><button className="vd-primary" onClick={() => { signOut(); router.push("/login"); }}>Log out and switch account <ArrowUpRight size={17}/></button><Link className="vd-back" href="/dashboard">Go to customer dashboard</Link></main>;

  function updateBooking(id: string, status: Booking["status"]) { setData(current => ({ ...current, bookings: current.bookings.map(item => item.id === id ? { ...item, status } : item) })); }
  function addStaff(event: React.FormEvent) {
    event.preventDefault();
    const name = staffName.trim();
    if (!name) return;
    const initials = name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    setData(current => ({ ...current, staff: [...current.staff, { id: crypto.randomUUID(), name, role: staffRole.trim() || "Team member", initials, color: ["mint", "lilac", "peach"][current.staff.length % 3] }] }));
    setStaffName(""); setStaffRole(""); setAddingStaff(false);
  }
  function addService(event: React.FormEvent) {
    event.preventDefault();
    const name = serviceName.trim(); const price = Number(servicePrice);
    if (!name || !price) return;
    setData(current => ({ ...current, services: [...current.services, { id: crypto.randomUUID(), name, duration: "45 min", price, live: true }] }));
    setServiceName(""); setServicePrice(""); setAddingService(false);
  }

  return <div className="vd-layout">
    <aside className="vd-sidebar">
      <Link href="/" className="vd-brand">ede<span>booking</span></Link>
      <div className="vd-business-switch"><span className="vd-business-avatar">S</span><span><b>Serenity House</b><small>Business account</small></span><ChevronDown size={16}/></div>
      <p className="vd-nav-label">WORKSPACE</p>
      <nav className="vd-nav" aria-label="Vendor dashboard">
        {([ ["Overview", "⌂"], ["Bookings", "▦"], ["Services", "◇"], ["Team", "♧"] ] as [View, string][]).map(([label, icon]) => <button key={label} type="button" className={view === label ? "is-active" : ""} onClick={() => setView(label)}><span className="vd-nav-icon">{icon}</span>{label}{label === "Bookings" && pendingCount > 0 && <i>{pendingCount}</i>}</button>)}
      </nav>
      <div className="vd-sidebar-bottom"><Link href="/business/register"><Settings2 size={18}/>Business settings</Link><div className="vd-user"><span className="vd-user-avatar">{session.name.slice(0,1).toUpperCase()}</span><span><b>{session.name}</b><small>Owner</small></span><button aria-label="Log out" onClick={() => { signOut(); router.push("/login"); }}>↗</button></div></div>
    </aside>

    <main className="vd-main">
      <header className="vd-topbar"><div className="vd-mobile-brand">ede<span>booking</span></div><div className="vd-topbar-actions"><span className="vd-today"><CalendarDays size={16}/> Thursday, November 27</span><button className="vd-avatar-small" aria-label="Account menu">{session.name.slice(0,1).toUpperCase()}</button></div></header>
      <div className="vd-content">
        <div className="vd-heading"><div><p className="vd-eyebrow">{view === "Overview" ? "THURSDAY, NOVEMBER 27" : "YOUR BUSINESS"}</p><h1>{view === "Overview" ? `Good morning, ${session.name.split(" ")[0]}` : view}</h1><p>{view === "Overview" ? "Here’s what’s happening with your business today." : view === "Bookings" ? "Keep every appointment running smoothly." : view === "Services" ? "Manage what customers can book with you." : "Your people make the experience."}</p></div>{view === "Team" ? <button className="vd-primary vd-compact" onClick={() => setAddingStaff(true)}><Plus size={17}/> Add team member</button> : view === "Services" ? <button className="vd-primary vd-compact" onClick={() => setAddingService(true)}><Plus size={17}/> Add service</button> : <button className="vd-outline vd-compact" onClick={() => setView("Bookings")}><CalendarDays size={17}/> View schedule</button>}</div>

        {view === "Overview" && <>
          <section className="vd-stats"><article className="vd-stat-highlight"><span className="vd-stat-icon"><CalendarDays size={19}/></span><small>Today’s appointments</small><strong>{data.bookings.filter(item => item.date === "Today" && item.status === "Confirmed").length + 2}</strong><p><span>↗ 2</span> compared to last week</p></article><article><span className="vd-stat-icon gold"><Clock3 size={19}/></span><small>Awaiting your response</small><strong>{pendingCount}</strong><p>Booking requests to review</p></article><article><span className="vd-stat-icon green"><CircleDollarSign size={19}/></span><small>Revenue this week</small><strong>{money(weeklyRevenue)}</strong><p><span>↗ 12%</span> from last week</p></article></section>
          <div className="vd-overview-grid">
            <section className="vd-card vd-booking-card"><div className="vd-section-head"><div><h2>Booking requests</h2><p>Review and respond to new appointments</p></div><button className="vd-text-link" onClick={() => setView("Bookings")}>See all <ArrowUpRight size={15}/></button></div><BookingList items={data.bookings.filter(item => item.status === "Pending").slice(0,3)} updateBooking={updateBooking} empty="You’re all caught up. New requests will appear here."/></section>
            <section className="vd-card vd-agenda-card"><div className="vd-section-head"><div><h2>Today’s agenda</h2><p>{data.bookings.filter(item => item.date === "Today" && item.status === "Confirmed").length + 2} appointments scheduled</p></div><button className="vd-icon-button" aria-label="View bookings" onClick={() => setView("Bookings")}><ArrowUpRight size={17}/></button></div><ol className="vd-agenda">{data.bookings.filter(item => item.date === "Today" && item.status === "Confirmed").map(item => <li key={item.id}><time>{item.time}</time><i/><div><b>{item.client}</b><p>{item.service} · {item.staff}</p></div></li>)}<li><time>3:00 PM</time><i/><div><b>Break</b><p>A little time to reset</p></div></li></ol></section>
          </div>
          <section className="vd-card vd-services-preview"><div className="vd-section-head"><div><h2>Your services</h2><p>What customers can book right now</p></div><button className="vd-text-link" onClick={() => setView("Services")}>Manage services <ArrowUpRight size={15}/></button></div><div className="vd-service-preview-grid">{data.services.slice(0,3).map(item => <article key={item.id}><span className="vd-service-mark"><Sparkles size={18}/></span><div><b>{item.name}</b><p>{item.duration} · {money(item.price)}</p></div><i className={item.live ? "is-live" : ""}/></article>)}</div></section>
        </>}

        {view === "Bookings" && <section className="vd-card"><div className="vd-section-head"><div><h2>All bookings</h2><p>Review requests and keep your day on track</p></div><button className="vd-outline vd-compact"><ArrowDownToLine size={16}/> Export</button></div><div className="vd-booking-filters"><label><Search size={17}/><input aria-label="Search bookings" placeholder="Search clients or services" value={query} onChange={event => setQuery(event.target.value)}/></label><select aria-label="Filter bookings" value={filter} onChange={event => setFilter(event.target.value)}><option>All bookings</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Declined</option></select></div><BookingList items={visibleBookings} updateBooking={updateBooking} empty="No bookings match this view." /></section>}

        {view === "Services" && <section className="vd-card"><div className="vd-section-head"><div><h2>Service menu</h2><p>Set what you offer and keep your listing up to date</p></div><button className="vd-primary vd-compact" onClick={() => setAddingService(true)}><Plus size={17}/> Add service</button></div><div className="vd-service-list">{data.services.map(item => <article key={item.id}><span className="vd-service-mark"><Sparkles size={18}/></span><div className="vd-service-info"><b>{item.name}</b><small>{item.duration} · {money(item.price)}</small></div><span className={item.live ? "vd-live" : "vd-hidden"}>{item.live ? "Live" : "Hidden"}</span><button className={`vd-switch ${item.live ? "is-on" : ""}`} role="switch" aria-checked={item.live} aria-label={`${item.live ? "Hide" : "Publish"} ${item.name}`} onClick={() => setData(current => ({ ...current, services: current.services.map(service => service.id === item.id ? { ...service, live: !service.live } : service) }))}><i/></button></article>)}</div></section>}

        {view === "Team" && <section className="vd-card"><div className="vd-section-head"><div><h2>Your team</h2><p>Manage staff and who is available for appointments</p></div><button className="vd-primary vd-compact" onClick={() => setAddingStaff(true)}><Plus size={17}/> Add team member</button></div><div className="vd-team-grid">{data.staff.map(member => <article key={member.id}><span className={`vd-team-avatar ${member.color}`}>{member.initials}</span><div><b>{member.name}</b><p>{member.role}</p><small><i/> Available today</small></div><button className="vd-icon-button" aria-label={`Remove ${member.name}`} onClick={() => setData(current => ({ ...current, staff: current.staff.filter(item => item.id !== member.id) }))}><X size={17}/></button></article>)}</div></section>}
      </div>
      <footer className="vd-footer">EdeBooking for business <span>·</span> Making every appointment feel easy.</footer>
    </main>

    {(addingStaff || addingService) && <div className="vd-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setAddingStaff(false); setAddingService(false); } }}><section className="vd-modal" role="dialog" aria-modal="true" aria-labelledby="vd-modal-title"><button className="vd-modal-close" aria-label="Close" onClick={() => { setAddingStaff(false); setAddingService(false); }}><X size={19}/></button><p className="vd-eyebrow">{addingStaff ? "GROW YOUR TEAM" : "YOUR SERVICE MENU"}</p><h2 id="vd-modal-title">{addingStaff ? "Add a team member" : "Add a service"}</h2><p>{addingStaff ? "Add someone who helps deliver a great customer experience." : "Create a service customers can discover and book."}</p>{addingStaff ? <form onSubmit={addStaff}><label>Full name<input required autoFocus value={staffName} onChange={event => setStaffName(event.target.value)} placeholder="e.g. Ada Okafor"/></label><label>Role<input value={staffRole} onChange={event => setStaffRole(event.target.value)} placeholder="e.g. Senior therapist"/></label><button className="vd-primary">Add team member <Check size={17}/></button></form> : <form onSubmit={addService}><label>Service name<input required autoFocus value={serviceName} onChange={event => setServiceName(event.target.value)} placeholder="e.g. Relaxation massage"/></label><label>Price in naira<input required type="number" min="1" value={servicePrice} onChange={event => setServicePrice(event.target.value)} placeholder="25000"/></label><button className="vd-primary">Add service <Check size={17}/></button></form>}</section></div>}
  </div>;
}

function BookingList({ items, updateBooking, empty }: { items: Booking[]; updateBooking: (id: string, status: Booking["status"]) => void; empty: string }) {
  if (!items.length) return <div className="vd-empty"><span><Check size={20}/></span><p>{empty}</p></div>;
  return <div className="vd-request-list">{items.map(item => <article key={item.id}><span className="vd-client-avatar">{item.client.split(" ").map(part => part[0]).join("").slice(0,2)}</span><div className="vd-request-info"><div><b>{item.client}</b><small>{item.id}</small></div><p>{item.service} · {money(item.amount)}</p><small>{item.date} at {item.time} · {item.staff}</small></div>{item.status === "Pending" ? <div className="vd-request-actions"><button className="vd-accept" aria-label={`Accept booking for ${item.client}`} onClick={() => updateBooking(item.id, "Confirmed")}><Check size={16}/><span>Accept</span></button><button className="vd-decline" aria-label={`Decline booking for ${item.client}`} onClick={() => updateBooking(item.id, "Declined")}><X size={16}/><span>Decline</span></button></div> : <span className={`vd-status is-${item.status.toLowerCase()}`}>{item.status}</span>}</article>)}</div>;
}
