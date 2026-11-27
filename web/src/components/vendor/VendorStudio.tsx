"use client";

import { useState, type FormEvent } from "react";
import { Images, TicketPercent, Plus, Star, MessageSquare, Trash2, Check, ImagePlus } from "lucide-react";
import SideDrawer from "@/components/dashboard/SideDrawer";

export type StudioPage = "Portfolio" | "Reviews" | "Promo codes";
type Promo = { code: string; kind: string; value: number; start: string; end: string; service: string; limit: number; first: boolean; active: boolean };
type Photo = { id: string; title: string; image: string };
type Studio = { promos: Promo[]; photos: Photo[]; replies: Record<string, string> };
const initial: Studio = { promos: [], photos: [], replies: {} };
const reviews = [
  { name: "Ada O.", stars: 5, body: "The studio was spotless and my appointment started right on time." },
  { name: "Tolu B.", stars: 4, body: "Great service. I would have liked a reminder before my visit." },
];

export default function VendorStudio({ page, owner, services }: {page: StudioPage; owner: string; services: string[]}) {
  const key = "edebooking-studio:" + owner.toLowerCase();
  const [data, setData] = useState<Studio>(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(key) ?? "{}") }; } catch { return initial; }
  });
  const [drawer, setDrawer] = useState("");
  const [error, setError] = useState("");
  const [kind, setKind] = useState("Percentage");
  const [filter, setFilter] = useState("All");
  const [busy, setBusy] = useState(false);
  function save(next: Studio) {
    try { localStorage.setItem(key, JSON.stringify(next)); setData(next); setError(""); return true; }
    catch { setError("Browser storage is full or unavailable. Try a smaller photo."); return false; }
  }
  function open(title: string) { setDrawer(title); setError(""); setKind("Percentage"); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const field = (name: string) => String(fields.get(name) ?? "").trim();
    let next = data;
    if (page === "Promo codes") {
      const code = field("code").toUpperCase();
      if (data.promos.some(p => p.code === code)) return setError("This code already exists.");
      if (field("end") < field("start")) return setError("Choose an end date on or after the start date.");
      next = { ...data, promos: [...data.promos, { code, kind, value: Number(field("value")), start: field("start"), end: field("end"), service: field("service"), limit: Number(field("limit")), first: fields.has("first"), active: true }] };
    } else if (page === "Reviews") {
      if (!field("reply")) return setError("Write a reply before saving.");
      next = { ...data, replies: { ...data.replies, [drawer]: field("reply") } };
    } else {
      const file = fields.get("photo");
      if (!(file instanceof File) || !["image/jpeg","image/webp","image/png"].includes(file.type) || file.size > 1024 * 1024)
        return setError("Choose a JPEG, PNG or WebP under 1 MB.");
      setBusy(true);
      try {
        const image = await new Promise<string>((resolve,reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        next = { ...data, photos: [...data.photos, { id: crypto.randomUUID(), title: field("title"), image }] };
      } catch { setError("This file could not be opened."); return; } finally { setBusy(false); }
    }
    if (save(next)) setDrawer("");
  }
  return <section className="vendor-studio">
    {page === "Portfolio" && <>
      <div className="vendor-portfolio-head"><div><span className="vendor-eyebrow">YOUR SHOWCASE</span><h2>Work worth sharing.</h2><p>A collection of the details that make your business yours.</p></div><button className="vd-primary" disabled={data.photos.length >= 20} onClick={() => open("Add photo")}><Plus size={18}/> Add photo</button></div>
      <div className="vendor-collection-meta"><span>{data.photos.length} / 20 photos</span><span>First photo appears as your cover</span></div>
      <div className="vendor-gallery">{data.photos.map((photo,i) => <figure className="vendor-photo" key={photo.id}>
        <div className="vendor-photo-image"><img src={photo.image} alt={photo.title}/>{i === 0 && <span className="vendor-cover"><Check size={13}/> Cover photo</span>}</div>
        <figcaption><strong>{photo.title}</strong><div className="vendor-photo-actions">
          {i !== 0 && <button onClick={() => save({ ...data, photos: [photo,...data.photos.filter(p => p.id !== photo.id)] })}>Set as cover</button>}
          <button className="vendor-remove" aria-label={"Remove " + photo.title} onClick={() => { if (window.confirm("Remove this portfolio photo?")) save({ ...data, photos: data.photos.filter(p => p.id !== photo.id) }); }}><Trash2 size={16}/> Remove</button>
        </div></figcaption>
      </figure>)}
      {data.photos.length < 20 && <button className="vendor-upload-tile" onClick={() => open("Add photo")}><span><ImagePlus size={28}/></span><strong>{data.photos.length ? "Add to your collection" : "Your portfolio starts here"}</strong><small>Upload a photo of your work</small></button>}
      </div>
    </>}
    {page === "Reviews" && <>
      <div className="vendor-review-summary"><div className="vendor-rating"><span className="vendor-eyebrow">CUSTOMER EXPERIENCE</span><strong>4.5<span>/ 5</span></strong><div className="vendor-stars" aria-label="Average 4.5 out of 5">{[1,2,3,4,5].map(n => <Star key={n} size={18} fill={n < 5 ? "currentColor" : "none"}/>)}</div><p>Based on 2 sample reviews</p></div><div className="vendor-rating-bars">{[5,4,3,2,1].map(n => <div key={n}><span>{n} <Star size={11}/></span><progress max="2" value={reviews.filter(r => r.stars === n).length}/><small>{reviews.filter(r => r.stars === n).length}</small></div>)}</div></div>
      <div className="vendor-review-toolbar"><h2>Customer reviews</h2><div className="vendor-segments" aria-label="Filter reviews">{["All","Needs reply","Low ratings"].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
      <div className="vendor-review-grid">{reviews.filter(r => filter === "All" || (filter === "Needs reply" ? !data.replies[r.name] : r.stars <= 3)).map(r => <article className="vendor-review" key={r.name}>
        <header><span className="vendor-review-avatar">{r.name.split(" ").map(n => n[0]).join("")}</span><div><strong>{r.name}</strong><small>Sample customer review</small></div><span className="vendor-review-score"><Star size={14} fill="currentColor"/>{r.stars}.0</span></header>
        <p>{r.body}</p>{data.replies[r.name] && <blockquote><strong>Your reply</strong>{data.replies[r.name]}</blockquote>}
        <button className="vd-outline" onClick={() => open(r.name)}><MessageSquare size={15}/>{data.replies[r.name] ? "Edit reply" : "Write a reply"}</button>
      </article>)}</div>
      {(filter === "Low ratings" || (filter === "Needs reply" && reviews.every(r => data.replies[r.name]))) && <div className="vendor-empty"><Check size={28}/><h3>You’re all caught up</h3><p>No reviews match this filter.</p></div>}
    </>}
    {page === "Promo codes" && <>
      <div className="vd-section-head"><h2>Your offers</h2><button className="vd-primary" onClick={() => open("Create promo code")}>Create code</button></div>
      {!data.promos.length && <div className="vendor-empty"><TicketPercent size={32}/><h3>Give customers a reason to return</h3><p>Create an offer for a service or your entire menu.</p></div>}
      {data.promos.map(p => <article className="vendor-studio-row" key={p.code}><strong>{p.code}</strong><p>{p.kind === "Percentage" ? p.value + "%" : "₦" + p.value} off · {p.service} · {p.start} to {p.end}</p><p>{p.first ? "First-time customers" : "All customers"} · {p.limit} uses</p><button className="vd-outline" onClick={() => save({ ...data, promos: data.promos.map(item => item.code === p.code ? {...item,active: !item.active} : item) })}>{p.active ? "Pause" : "Activate"}</button></article>)}
    </>}
    {!drawer && error && <p role="alert">{error}</p>}
    <SideDrawer title={page === "Reviews" ? "Reply to " + drawer : drawer} trigger={null} open={Boolean(drawer)} onOpenChange={v => { if (!v) setDrawer(""); }}>
      <form className="vd-drawer-form" onSubmit={submit}>
        {page === "Reviews" && <label>Your reply<textarea required name="reply" defaultValue={data.replies[drawer]}/></label>}
        {page === "Portfolio" && <><label>Photo<input type="file" name="photo" accept="image/png,image/jpeg,image/webp" required/></label><label>Caption<input name="title" required/></label></>}
        {page === "Promo codes" && <>
          <label>Code<input name="code" required pattern="[a-zA-Z0-9_-]+" maxLength={32}/></label>
          <label>Discount type<select value={kind} onChange={e => setKind(e.target.value)}><option>Percentage</option><option>Fixed amount</option></select></label>
          <label>{kind === "Percentage" ? "Percentage off" : "Amount off in naira"}<input name="value" type="number" required min="1" max={kind === "Percentage" ? 100 : undefined}/></label>
          <label>Applies to<select name="service"><option>All services</option>{services.map((s,i) => <option key={i}>{s}</option>)}</select></label>
          <label>Start date<input required name="start" type="date"/></label><label>End date<input required name="end" type="date"/></label>
          <label>Total usage limit<input required name="limit" type="number" min="1" defaultValue="100"/></label>
          <label><input name="first" type="checkbox"/> First-time customers only</label>
        </>}
        {error && <p role="alert">{error}</p>}<button className="vd-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </form>
    </SideDrawer>
  </section>;
}
