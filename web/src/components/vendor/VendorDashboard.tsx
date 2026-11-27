"use client";

import { Select } from "@base-ui/react/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, CalendarDays, Check, ChevronDown, LayoutDashboard, LogOut, Users, ChartNoAxesCombined, CircleDollarSign, Plus, Search, Settings2, MoreHorizontal, NotebookPen, Images, Star, TicketPercent, Crown, ReceiptText, X } from "lucide-react";
import { parseSession, signOut, useSessionRaw } from "@/lib/session";
import BrandLogo from "@/components/BrandLogo";
import ServicesIcon from "@/components/icons/ServicesIcon";
import VendorNotes from "./VendorNotes";
import VendorBilling from "./VendorBilling";
import VendorStudio, { type StudioPage } from "./VendorStudio";
import BusinessSettings from "./BusinessSettings";
import SideDrawer from "@/components/dashboard/SideDrawer";

type Booking = { id: string; client: string; service: string; date: string; time: string; staff: string; staffId?: string; amount: number; status: "Pending" | "Confirmed" | "Completed" | "Declined" };
type Staff = { id: string; name: string; role: string; email?: string; permissions?: string[]; serviceScope?: "all" | "selected"; serviceIds?: string[]; initials: string; color: string };
type Service = { id: string; name: string; duration: string; price: number; description?: string; addons?: string; instant?: boolean; video?: boolean; live: boolean };
type SavedRole = { name: string; permissions: string[] };
type VendorData = { roles?: SavedRole[]; bookings: Booking[]; staff: Staff[]; services: Service[] };
type View = "Overview" | "Bookings" | "Services" | "Team" | "Payments" | "Insights" | "Settings" | "More";

const navigation = [
  ["Overview", LayoutDashboard], ["Bookings", CalendarDays], ["Services", ServicesIcon],
  ["Team", Users], ["Payments", CircleDollarSign], ["Insights", ChartNoAxesCombined], ["More", MoreHorizontal],
] as const;

const permissions = ["View bookings", "Manage bookings", "Manage services", "Manage team", "View payments"] as const;

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

function exportBookings(filename: string, bookings: Booking[]) {
  function cell(value: string | number) {
    const text = String(value);
    const safe = /^[=+@\-\t\r]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  }
  const rows = [
    ["Reference", "Client", "Service", "Day", "Time", "Staff", "Status", "Booking value (NGN)"],
    ...bookings.map(b => [b.id, b.client, b.service, b.date, b.time, b.staff, b.status, b.amount]),
  ];
  const csv = rows.map(row => row.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {type: "text/csv;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadData(): VendorData {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<VendorData>;
      return { roles: parsed.roles, bookings: parsed.bookings ?? defaults.bookings, staff: parsed.staff ?? defaults.staff, services: parsed.services ?? defaults.services };
    }
  } catch { /* use the sample workspace if storage is unavailable */ }
  return defaults;
}

export default function VendorDashboard({ view = "Overview", studio, bookingId }: { view?: View; bookingId?: string; studio?: StudioPage | "Subscription" | "Billing" | "Notes" }) {
  const router = useRouter();
  const raw = useSessionRaw();
  const session = parseSession(raw);
  const [data, setData] = useState<VendorData>(() => typeof window === "undefined" ? defaults : loadData());

  const [period, setPeriod] = useState("All appointments");
  const navigate = (section: View) => router.push(section === "Overview" ? "/business/dashboard" : `/business/dashboard/${section.toLowerCase()}`);
  const [filter, setFilter] = useState("All bookings");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<"staff" | "service" | "role" | null>(null);
  const [businessName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("edebooking_vendor_profile") ?? "{}").businessName || "Serenity House";
    } catch {
      return "Serenity House";
    }
  });
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [staffError, setStaffError] = useState("");
  const roles = data.roles ?? [...new Set(data.staff.map(member => member.role))].map(name => ({
    name, permissions: data.staff.find(member => member.role === name)?.permissions ?? ["View bookings"],
  }));
  const [staffDraft, setStaffDraft] = useState<{ name?: string; email?: string }>({});
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const booking = data.bookings.find(item => item.id === selectedBooking);

  function openStaff(member: Staff | null = null) {
    setStaffDraft({});
    setEditingStaff(member);
    setSelectedRole(member?.role ?? "");
    setSelectedPermissions(member?.permissions ?? []);
    setStaffError("");
    setDrawer("staff");
  }
  const [editingService, setEditingService] = useState<Service | null>(null);
  function openService(service: Service | null = null) {
    setEditingService(service);
    setDrawer("service");
  }

  useEffect(() => {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* keep this session usable without storage */ }
  }, [data]);

  const pendingCount = data.bookings.filter(item => item.status === "Pending").length;
  const weeklyRevenue = data.bookings.filter(item => item.status === "Confirmed" || item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  const visibleBookings = useMemo(() => data.bookings.filter(item => (filter === "All bookings" || item.status === filter) && `${item.client} ${item.service} ${item.id}`.toLowerCase().includes(query.toLowerCase())), [data.bookings, filter, query]);

  if (raw === null) return <main className="vd-loading"><span className="vd-spinner"/><p>Opening your workspace…</p></main>;
  if (!session) return <main className="vd-gate"><BrandLogo /><p className="vd-eyebrow">YOUR BUSINESS, IN ONE PLACE</p><h1>Welcome to your workspace.</h1><p>Sign in to manage appointments, services and your team.</p><Link className="vd-primary" href="/login?next=/business/dashboard">Continue to login <ArrowUpRight size={17}/></Link><Link className="vd-back" href="/">Back to EdeBooking</Link></main>;
  if (session.role !== "vendor") return <main className="vd-gate"><BrandLogo /><p className="vd-eyebrow">VENDOR WORKSPACE</p><h1>Switch to your business account.</h1><p>You are signed in as {session.email}. Log out, then sign in with your vendor account to manage your business.</p><button className="vd-primary" onClick={() => { signOut(); router.push("/login"); }}>Log out and switch account <ArrowUpRight size={17}/></button><Link className="vd-back" href="/dashboard">Go to customer dashboard</Link></main>;

  function updateBooking(id: string, status: Booking["status"]) { setData(current => ({ ...current, bookings: current.bookings.map(item => item.id === id ? { ...item, status } : item) })); }
  function addStaff(event: React.FormEvent) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(fields.get("name")).trim();
    const email = String(fields.get("email")).trim().toLowerCase();
    const role = String(fields.get("role")).trim();
    const serviceScope = fields.get("serviceScope") === "all" ? "all" : "selected";
    const serviceIds = fields.getAll("serviceIds").map(String);
    if (!name || !role) {
      setStaffError("Enter a name and role.");
      return;
    }
    if (data.staff.some(member => member.id !== editingStaff?.id && member.email === email)) {
      setStaffError("A team member already uses this email.");
      return;
    }
    const member: Staff = {
      id: editingStaff?.id ?? crypto.randomUUID(),
      name, email, role, serviceScope, serviceIds,
      permissions: fields.getAll("permissions").map(String),
      initials: name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(),
      color: editingStaff?.color ?? ["mint", "lilac", "peach"][data.staff.length % 3],
    };
    setData(current => ({
      ...current,
      staff: editingStaff ? current.staff.map(item => item.id === member.id ? member : item) : [...current.staff, member],
      bookings: current.bookings.map(item => item.staffId === member.id ? { ...item, staff: name } : item),
    }));
    setDrawer(null);
  }
  function addService(event: React.FormEvent) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget as HTMLFormElement);
    const service: Service = {
      id: editingService?.id ?? crypto.randomUUID(),
      name: String(fields.get("name")).trim(),
      price: Number(fields.get("price")),
      duration: fields.get("minutes") + " min",
      description: String(fields.get("description")).trim(),
      addons: String(fields.get("addons")).trim(),
      instant: fields.has("instant"),
      video: fields.has("video"),
      live: editingService?.live ?? true,
    };
    if (!service.name) return;
    setData(current => ({ ...current, services: editingService
      ? current.services.map(item => item.id === service.id ? service : item)
      : [...current.services, service] }));
    setDrawer(null);
  }

  return <div className="vd-layout">
    <aside className="vd-sidebar">
      <BrandLogo />
      <div className="vd-business-switch"><span className="vd-business-avatar">{businessName.slice(0, 1).toUpperCase()}</span><span><b>{businessName}</b><small>Business account</small></span></div>
      <p className="vd-nav-label">WORKSPACE</p>
      <nav className="vd-nav" aria-label="Vendor dashboard">
        {navigation.map(([label, Icon]) => <Link key={label} aria-label={label} aria-current={(view === label || (label === "More" && Boolean(studio))) ? "page" : undefined} className={(view === label || (label === "More" && Boolean(studio))) ? "is-active" : ""} href={label === "Overview" ? "/business/dashboard" : `/business/dashboard/${label.toLowerCase()}`}><Icon size={20} aria-hidden="true" /><span>{label}</span>{label === "Bookings" && pendingCount > 0 && <i>{pendingCount}</i>}</Link>)}

      </nav>
      <div className="vd-sidebar-bottom"><Link className="vd-settings-link" href="/business/dashboard/settings"><Settings2 size={18} aria-hidden="true" />Business settings</Link><div className="vd-user"><span className="vd-user-avatar">{session.name.slice(0,1).toUpperCase()}</span><span><b>{session.name}</b><small>Owner</small></span><button aria-label="Log out" onClick={() => { signOut(); router.push("/login"); }}><LogOut size={18} aria-hidden="true" /></button></div></div>
    </aside>

    <main className="vd-main">
      <header className="vd-topbar"><BrandLogo className="vd-mobile-brand" /><div className="vd-topbar-actions"><button className="vd-avatar-small" aria-label="Business settings" onClick={() => navigate("Settings")}>{session.name.slice(0,1).toUpperCase()}</button></div></header>
      <div className="vd-content" data-view={view}>
        <div className="vd-heading"><div><p className="vd-eyebrow">{businessName}</p><h1>{studio ?? view}</h1><p>{view === "Overview" ? "Bookings, services and team activity" : view === "Bookings" ? "Keep every appointment running smoothly." : view === "Services" ? "Manage what customers can book with you." : view === "Team" ? "Your people make the experience." : view === "Payments" ? "Track your payouts and payment activity." : view === "More" ? "Your workspace tools and business preferences." : view === "Settings" ? "" : "Understand what is bringing customers through your door."}</p></div>{view === "Team" ? <button className="vd-primary vd-compact" onClick={() => openStaff()}><Plus size={17}/> Add team member</button> : view === "Services" ? <button className="vd-primary vd-compact" onClick={() => openService()}><Plus size={17}/> Add service</button> : view === "More" ? null : view === "Settings" ? <Link className="vd-text-link" href="/business/dashboard/more">All tools <ArrowUpRight size={15}/></Link> : <button className="vd-outline vd-compact" onClick={() => navigate("Bookings")}><CalendarDays size={17}/> View schedule</button>}</div>

        {view === "Overview" && <>
          <div className="vd-overview-controls"><Link className="vd-outline" href="/business/dashboard/notes">Workspace notes</Link>
            <label><CalendarDays size={17} aria-hidden="true" /><select aria-label="Overview period" value={period} onChange={event => setPeriod(event.target.value)}>
              <option>All appointments</option><option>Today</option><option>Tomorrow</option>
            </select></label>
          </div>
          <OverviewAnalytics
            bookings={data.bookings.filter(item => period === "All appointments" || item.date === period)}
            staffCount={data.staff.length}
            openBookings={() => navigate("Bookings")}
            openPayments={() => navigate("Payments")}
            openTeam={() => navigate("Team")}
          />
          <div className="vd-overview-grid">
            <section className="vd-card vd-booking-card"><div className="vd-section-head"><div><h2>Booking requests</h2><p>Review and respond to new appointments</p></div><button className="vd-text-link" onClick={() => navigate("Bookings")}>See all <ArrowUpRight size={15}/></button></div><BookingList onOpen={setSelectedBooking} items={data.bookings.filter(item => item.status === "Pending").slice(0,3)} updateBooking={updateBooking} empty="You’re all caught up. New requests will appear here."/></section>
            <section className="vd-card vd-agenda-card"><div className="vd-section-head"><div><h2>Today’s agenda</h2><p>{data.bookings.filter(item => item.date === "Today" && item.status === "Confirmed").length + 2} appointments scheduled</p></div><button className="vd-icon-button" aria-label="View bookings" onClick={() => navigate("Bookings")}><ArrowUpRight size={17}/></button></div><ol className="vd-agenda">{data.bookings.filter(item => item.date === "Today" && item.status === "Confirmed").map(item => <li key={item.id}><time>{item.time}</time><i/><div><b>{item.client}</b><p>{item.service} · {item.staff}</p></div></li>)}<li><time>3:00 PM</time><i/><div><b>Break</b><p>A little time to reset</p></div></li></ol></section>
          </div>
          <section className="vd-card vd-services-preview"><div className="vd-section-head"><div><h2>Your services</h2><p>What customers can book right now</p></div><button className="vd-text-link" onClick={() => navigate("Services")}>Manage services <ArrowUpRight size={15}/></button></div><div className="vd-service-preview-grid">{data.services.slice(0,3).map(item => <article key={item.id}><span className="vd-service-mark"><ServicesIcon size={18}/></span><div><b>{item.name}</b><p>{item.duration} · {money(item.price)}</p></div><i className={item.live ? "is-live" : ""}/></article>)}</div></section>
        </>}

        {view === "More" && <nav className="vd-card vendor-tools" aria-label="More business tools">
          {([
            ["Insights", "insights", ChartNoAxesCombined, "Understand your business"],
            ["Notes", "notes", NotebookPen, "Tasks and session notes"],
            ["Portfolio", "portfolio", Images, "Showcase your best work"],
            ["Reviews", "reviews", Star, "Customer feedback and replies"],
            ["Promo codes", "promo-codes", TicketPercent, "Create your next offer"],
            ["Subscription", "subscription", Crown, "Your plan and benefits"],
            ["Billing", "billing", ReceiptText, "Invoices and billing history"],
            ["Business settings", "settings", Settings2, "Manage your workspace"],
          ] as const).map(([label, path, Icon, description]) => <Link key={path} href={`/business/dashboard/${path}`}><span className="vendor-tool-icon"><Icon size={23}/></span><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={17} aria-hidden="true"/></Link>)}
        </nav>}
        {studio === "Notes" ? <VendorNotes key={session.email} owner={session.email} staff={data.staff} bookings={data.bookings} bookingId={bookingId}/> : studio === "Subscription" || studio === "Billing" ? <VendorBilling key={session.email} owner={session.email} billing={studio === "Billing"} /> : studio ? <VendorStudio key={session.email + studio} page={studio} owner={session.email} services={data.services.map(s => s.name)} /> : view === "Settings" && <>
          <BusinessSettings />
          <nav className="vd-card vendor-tools" aria-label="Storefront management">
            <Link href="/business/dashboard/notes">Notes ↗</Link>
            <Link href="/business/dashboard/subscription">Subscription ↗</Link>
            <Link href="/business/dashboard/billing">Billing ↗</Link>
            <Link href="/business/dashboard/portfolio">Portfolio ↗</Link>
            <Link href="/business/dashboard/reviews">Reviews ↗</Link>
            <Link href="/business/dashboard/promo-codes">Promo codes ↗</Link>
          </nav>
        </>}
        {view !== "Overview" && view !== "Settings" && view !== "More" && <section className="vd-workspace-summary" aria-label={`${view} summary`}>
          <div className="vd-summary-art" aria-hidden="true">
            {view === "Bookings" ? <CalendarDays /> : view === "Services" ? <ServicesIcon size={31} /> : view === "Team" ? <Users /> : <CircleDollarSign />}
          </div>
          <div><strong>{view === "Team" ? data.staff.length : view === "Services" ? data.services.length : view === "Payments" ? money(weeklyRevenue) : data.bookings.length}</strong><span>{view === "Team" ? "Team members" : view === "Services" ? "Services in your menu" : view === "Payments" ? "Confirmed booking value" : "Appointments in your workspace"}</span></div>
          <div className="vd-summary-detail"><span>{view === "Team" ? "Service coverage" : view === "Services" ? "Published" : "Awaiting response"}</span><b>{view === "Team" ? `${data.staff.filter(member => member.serviceScope !== "selected").length} cover all services` : view === "Services" ? `${data.services.filter(service => service.live).length} live services` : `${pendingCount} requests`}</b></div>
        </section>}

        {view === "Bookings" && <section className="vd-card"><div className="vd-section-head"><div><h2>All bookings</h2><p>Review requests and keep your day on track</p></div><button className="vd-outline vd-compact" onClick={() => exportBookings("bookings.csv", visibleBookings)}><ArrowDownToLine size={16}/> Export</button></div><div className="vd-booking-filters"><label><Search size={17}/><input aria-label="Search bookings" placeholder="Search clients or services" value={query} onChange={event => setQuery(event.target.value)}/></label><select aria-label="Filter bookings" value={filter} onChange={event => setFilter(event.target.value)}><option>All bookings</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Declined</option></select></div><BookingList onOpen={setSelectedBooking} items={visibleBookings} updateBooking={updateBooking} empty="No bookings match this view." /></section>}

        {view === "Services" && <section className="vd-card"><div className="vd-section-head"><div><h2>Service menu</h2><p>Set what you offer and keep your listing up to date</p></div></div><div className="vd-service-list">{data.services.map(item => <article key={item.id}><span className="vd-service-mark"><ServicesIcon size={18}/></span><div className="vd-service-info"><button className="vd-service-edit" onClick={() => openService(item)} aria-label={`Edit ${item.name}`}>{item.name}</button><small>{item.duration} · {money(item.price)}</small></div><span className={item.live ? "vd-live" : "vd-hidden"}>{item.live ? "Live" : "Hidden"}</span><button className={`vd-switch ${item.live ? "is-on" : ""}`} role="switch" aria-checked={item.live} aria-label={`${item.live ? "Hide" : "Publish"} ${item.name}`} onClick={() => setData(current => ({ ...current, services: current.services.map(service => service.id === item.id ? { ...service, live: !service.live } : service) }))}><i/></button></article>)}</div></section>}

        {view === "Team" && <section className="vd-card">
          <div className="vd-section-head"><div><h2>Your team</h2><p>Manage roles, permissions and service assignments.</p></div><button type="button" className="vd-outline vd-compact" onClick={() => { setStaffError(""); setDrawer("role"); }}>Create role</button><div></div></div>
          <div className="vd-team-grid">{data.staff.map(member => (
            <article key={member.id}>
              <span className={`vd-team-avatar ${member.color}`}>{member.initials}</span>
              <div>
                <b>{member.name}</b>
                <p>{member.role}{member.email && <> · {member.email}</>}</p>
                <small>{member.serviceScope === "selected" ? data.services.filter(service => member.serviceIds?.includes(service.id)).map(service => service.name).join(", ") || "No assigned services" : "All services"}</small>
              </div>
              <button type="button" className="vd-outline vd-compact" onClick={() => openStaff(member)}>Edit</button>
            </article>
          ))}</div>
        </section>}

        {view === "Payments" && <section className="vd-card"><div className="vd-section-head"><div><h2>Payment activity</h2><p>Booking values for confirmed and completed appointments</p></div><button className="vd-outline vd-compact" onClick={() => exportBookings("booking-values.csv", data.bookings.filter(b => b.status === "Confirmed" || b.status === "Completed"))}><ArrowDownToLine size={16}/> Export</button></div><div className="vd-service-list">{data.bookings.filter(item => item.status === "Confirmed" || item.status === "Completed").map(item => <article key={item.id}><span className="vd-payment-check"><Check size={16}/></span><div className="vd-service-info"><b>{item.client}</b><small>{item.service} · {item.date}, {item.time}</small></div><strong className="vd-payment-amount">{money(item.amount)}</strong></article>)}</div></section>}

        {view === "Insights" && <div className="vd-insights-grid"><section className="vd-card vd-insights-chart"><div className="vd-section-head"><div><h2>Revenue overview</h2><p>Confirmed booking value · this week</p></div><strong>{money(weeklyRevenue)}</strong></div><div className="vd-bars" aria-label="Weekly revenue chart">{data.services.map(service => [service.name, Math.round(data.bookings.filter(item => item.service === service.name && (item.status === "Confirmed" || item.status === "Completed")).reduce((sum, item) => sum + item.amount, 0) / Math.max(1, weeklyRevenue) * 100)]).map(([day,height])=><div key={day as string}><i style={{height: `${height}%`}}/><small>{day}</small></div>)}</div></section><section className="vd-card"><div className="vd-section-head"><div><h2>At a glance</h2><p>What your activity is showing</p></div></div><div className="vd-insight-row"><span>Booking requests</span><b>{data.bookings.length}</b></div><div className="vd-insight-row"><span>Confirmed</span><b>{data.bookings.filter(item => item.status === "Confirmed").length}</b></div><div className="vd-insight-row"><span>Services listed</span><b>{data.services.filter(item => item.live).length}</b></div><div className="vd-insight-row"><span>Team members</span><b>{data.staff.length}</b></div></section></div>}
      </div>
      <footer className="vd-footer">EdeBooking for business <span>·</span> Making every appointment feel easy.</footer>
    </main>

    <SideDrawer open={Boolean(booking)} onOpenChange={open => { if (!open) setSelectedBooking(null); }} trigger={null} title={booking?.client ?? "Booking details"} description={booking?.id}>
      {booking && <form key={booking.id} className="vd-drawer-form" onSubmit={event => {
        event.preventDefault();
        const id = new FormData(event.currentTarget).get("staff");
        const staff = data.staff.find(member => member.id === id);
        setData(current => ({ ...current, bookings: current.bookings.map(item => item.id !== booking.id ? item : {
          ...item, staffId: staff?.id, staff: id === "existing" ? item.staff : staff?.name ?? "Unassigned",
        }) }));
        setSelectedBooking(null);
      }}>
        <dl className="vd-booking-details">
          <dt>Service</dt><dd>{booking.service}</dd>
          <dt>Appointment</dt><dd>{booking.date} at {booking.time}</dd>
          <dt>Booking value</dt><dd>{money(booking.amount)}</dd>
          <dt>Status</dt><dd>{booking.status}</dd>
        </dl>
        <label>Assigned team member
          <select name="staff" defaultValue={booking.staffId ?? (booking.staff === "Unassigned" ? "" : "existing")}>
            <option value="">Unassigned</option>
            {booking.staff !== "Unassigned" && !booking.staffId && <option value="existing">{booking.staff}</option>}
            {data.staff.filter(member => member.id === booking.staffId || member.serviceScope !== "selected" || data.services.some(service => service.name === booking.service && member.serviceIds?.includes(service.id))).map(member => (
              <option value={member.id} key={member.id}>{member.name}</option>
            ))}
          </select>
        </label>
        <button className="vd-primary">Save assignment</button>
        <Link className="vd-outline" href={`/business/dashboard/notes?booking=${encodeURIComponent(booking.id)}`}>Session notes</Link>
        {booking.status === "Confirmed" && <button type="button" className="vd-outline" onClick={() => updateBooking(booking.id, "Completed")}>Mark completed</button>}
      </form>}
    </SideDrawer>
    <SideDrawer open={drawer === "role"} onOpenChange={open => { if (!open) setDrawer("staff"); }} trigger={null} title="Create a role" description="Save permissions once and reuse them when adding staff.">
      {drawer === "role" && <form className="vd-drawer-form" onSubmit={event => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const name = String(fields.get("roleName") ?? "").trim();
        if (!name) return;
        if (roles.some(role => role.name.toLowerCase() === name.toLowerCase())) {
          setStaffError("That role already exists. Choose a different name.");
          return;
        }
        const role = { name, permissions: fields.getAll("rolePermissions").map(String) };
        setData(current => ({ ...current, roles: [...roles, role] }));
        setSelectedRole(name);
        setSelectedPermissions(role.permissions);
        setStaffError("");
        setDrawer("staff");
      }}>
        <label>Role name<input name="roleName" required maxLength={80} /></label>
        <fieldset><legend>Permissions</legend>{permissions.map(permission => <label key={permission}><input type="checkbox" name="rolePermissions" value={permission} />{permission}</label>)}</fieldset>
        {staffError && <p role="alert">{staffError}</p>}
        <button className="vd-primary">Save role</button>
      </form>}
    </SideDrawer>
    <SideDrawer open={drawer === "staff"} onOpenChange={open => { if (!open) setDrawer(null); }} trigger={null} title={editingStaff ? "Edit team member" : "Add a team member"} description="Set the services and permissions for this team member.">
      {drawer === "staff" && <form className="vd-drawer-form" onSubmit={addStaff}>
        <label>Full name<input name="name" required defaultValue={staffDraft.name ?? editingStaff?.name} /></label>
        <label>Email address<input name="email" type="email" required defaultValue={staffDraft.email ?? editingStaff?.email} /></label>
        <label>Role
          <Select.Root name="role" required value={selectedRole} onValueChange={value => {
            const name = value ?? "";
            setSelectedRole(name);
            setSelectedPermissions(roles.find(role => role.name === name)?.permissions ?? []);
          }}>
            <Select.Trigger className="vd-role-select"><Select.Value placeholder="Choose a saved role" /><Select.Icon><ChevronDown size={18} /></Select.Icon></Select.Trigger>
            <Select.Portal><Select.Positioner sideOffset={6} alignItemWithTrigger={false} className="vd-role-positioner">
              <Select.Popup className="vd-role-popup"><Select.List>
                {roles.map(role => <Select.Item key={role.name} value={role.name} className="vd-role-option"><Select.ItemText>{role.name}</Select.ItemText><Select.ItemIndicator><Check size={16} /></Select.ItemIndicator></Select.Item>)}
              </Select.List></Select.Popup>
            </Select.Positioner></Select.Portal>
          </Select.Root>
        </label>
        <button type="button" className="vd-outline" onClick={event => {
          const form = event.currentTarget.closest("form");
          if (form) {
            const fields = new FormData(form);
            setStaffDraft({ name: String(fields.get("name") ?? ""), email: String(fields.get("email") ?? "") });
          }
          setStaffError("");
          setDrawer("role");
        }}>Create reusable role</button>
        <fieldset>
          <legend>Dashboard permissions</legend>
          {permissions.map(permission => <label key={permission}><input type="checkbox" name="permissions" value={permission} checked={selectedPermissions.includes(permission)} onChange={event => setSelectedPermissions(current => event.target.checked ? [...current, permission] : current.filter(item => item !== permission))} />{permission}</label>)}
          <small>Saved for this demo. Staff sign-in and access enforcement require a backend.</small>
        </fieldset>
        <fieldset>
          <legend>Service assignments</legend>
          <label><input type="radio" name="serviceScope" value="all" defaultChecked={editingStaff?.serviceScope !== "selected"} />All services</label>
          <label><input type="radio" name="serviceScope" value="selected" defaultChecked={editingStaff?.serviceScope === "selected"} />Selected services only</label>
          <div className="vd-service-choices">
            {data.services.map(service => <label key={service.id}><input type="checkbox" name="serviceIds" value={service.id} defaultChecked={editingStaff?.serviceIds?.includes(service.id)} />{service.name}</label>)}
          </div>
        </fieldset>
        {staffError && <p role="alert">{staffError}</p>}
        <button className="vd-primary">{editingStaff ? "Save changes" : "Add team member"}</button>
        {editingStaff?.email && <a className="vd-outline" href={`mailto:${encodeURIComponent(editingStaff.email)}?subject=${encodeURIComponent(`Join ${businessName} on EdeBooking`)}&body=${encodeURIComponent(`Hi ${editingStaff.name}, I’d like you to join ${businessName} as ${editingStaff.role}. Please reply to confirm your interest.`)}`}>Draft invitation email</a>}
      </form>}
    </SideDrawer>
    <SideDrawer open={drawer === "service"} onOpenChange={open => setDrawer(open ? "service" : null)} trigger={null}
      title={editingService ? "Edit service" : "Add a service"} description="Set the details customers see when booking.">
      <form key={editingService?.id ?? "new"} className="vd-drawer-form" onSubmit={addService}>
        <label>Service name<input name="name" required defaultValue={editingService?.name}/></label>
        <label>Description<textarea name="description" defaultValue={editingService?.description}/></label>
        <label>Duration in minutes<input type="number" name="minutes" required min="1" defaultValue={parseInt(editingService?.duration ?? "45", 10)}/></label>
        <label>Price in naira<input type="number" name="price" required min="1" defaultValue={editingService?.price}/></label>
        <label>Optional add-ons<textarea name="addons" defaultValue={editingService?.addons} placeholder="One add-on per line"/></label>
        <label><input type="checkbox" name="instant" defaultChecked={editingService?.instant}/> Allow instant booking</label>
        <label><input type="checkbox" name="video" defaultChecked={editingService?.video}/> Offer video consultations</label>
        <button className="vd-primary">Save service <Check size={17}/></button>
      </form>
    </SideDrawer>
  </div>;
}

function BookingList({ items, updateBooking, empty, onOpen }: { onOpen: (id: string) => void; items: Booking[]; updateBooking: (id: string, status: Booking["status"]) => void; empty: string }) {
  if (!items.length) return <div className="vd-empty"><span><Check size={20}/></span><p>{empty}</p></div>;
  return <div className="vd-request-list">{items.map(item => <article key={item.id}><span className="vd-client-avatar">{item.client.split(" ").map(part => part[0]).join("").slice(0,2)}</span><div className="vd-request-info"><div><button className="vd-booking-link" type="button" onClick={() => onOpen(item.id)}>{item.client}</button><small>{item.id}</small></div><p>{item.service} · {money(item.amount)}</p><small>{item.date} at {item.time} · {item.staff}</small></div>{item.status === "Pending" ? <div className="vd-request-actions"><button className="vd-accept" aria-label={`Accept booking for ${item.client}`} onClick={() => updateBooking(item.id, "Confirmed")}><Check size={16}/><span>Accept</span></button><button className="vd-decline" aria-label={`Decline booking for ${item.client}`} onClick={() => updateBooking(item.id, "Declined")}><X size={16}/><span>Decline</span></button></div> : <span className={`vd-status is-${item.status.toLowerCase()}`}>{item.status}</span>}</article>)}</div>;
}

function OverviewAnalytics({ bookings, staffCount, openBookings, openPayments, openTeam }: {
  bookings: Booking[];
  staffCount: number;
  openBookings: () => void;
  openPayments: () => void;
  openTeam: () => void;
}) {
  const statuses = (["Pending", "Confirmed", "Completed", "Declined"] as const).map(label => ({
    label, count: bookings.filter(item => item.status === label).length,
  }));
  const max = Math.max(1, ...statuses.map(item => item.count));
  const confirmed = bookings.filter(item => item.status === "Confirmed" || item.status === "Completed");
  const value = confirmed.reduce((sum, item) => sum + item.amount, 0);
  const services = [...new Set(confirmed.map(item => item.service))]
    .map(name => ({ name, amount: confirmed.filter(item => item.service === name).reduce((sum, item) => sum + item.amount, 0) }))
    .sort((a, b) => b.amount - a.amount);
  const assigned = confirmed.filter(item => item.staff !== "Unassigned").length;
  const rate = confirmed.length ? Math.round(assigned / confirmed.length * 100) : 0;

  return <div className="vd-analytics">
    <section className="vd-card vd-activity">
      <div className="vd-section-head"><h2>Booking activity</h2><button className="vd-icon-button" type="button" onClick={openBookings} aria-label="Open bookings"><ArrowUpRight size={18} /></button></div>
      <p className="vd-display-number">{bookings.length} <small>appointments</small></p>
      <ul className="vd-status-chart" aria-label="Appointments by status">
        {statuses.map(({ label, count }) => <li key={label}>
          <strong>{count}</strong>
          <div aria-hidden="true"><i style={{ "--bar-size": `${count / max * 100}%`, "--bar-depth": count ? "block" : "none" } as React.CSSProperties} /></div>
          <span>{label}</span>
        </li>)}
      </ul>
    </section>
    <section className="vd-card vd-volume">
      <div className="vd-section-head"><h2>Confirmed booking value</h2><button className="vd-icon-button" type="button" onClick={openPayments} aria-label="Open payments"><ArrowUpRight size={18} /></button></div>
      <p className="vd-display-number">{money(value)}</p>
      {services.length ? <ul className="vd-breakdown">{services.map(({ name, amount }) => <li key={name}>
        <div><span>{name}</span><strong>{money(amount)}</strong></div>
        <progress value={amount} max={value || 1} aria-label={name} />
      </li>)}</ul> : <p className="vd-muted">No confirmed bookings in this period.</p>}
    </section>
    <section className="vd-card vd-mini-metric"><h2>Clients</h2><strong>{new Set(bookings.map(item => item.client)).size}</strong><p>Unique names in this period</p></section>
    <section className="vd-card vd-mini-metric"><h2>Team members</h2><strong>{staffCount}</strong><button className="vd-text-link" type="button" onClick={openTeam}>Manage team <ArrowUpRight size={15} /></button></section>
    <section className="vd-card vd-mini-metric vd-coverage"><h2>Staff coverage</h2><strong>{rate}%</strong><p>{assigned} of {confirmed.length} confirmed or completed appointments assigned</p></section>
  </div>;
}
