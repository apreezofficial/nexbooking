"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
const tabs=[['shop','Services'],['chat','Consultation'],['calendar','Appointments'],['ticket','Events'],['book','Classes'],['key','Rentals']];
function BookingSearchContent(){
 const router = useRouter();
 const searchParams = useSearchParams();
 const [tab,setTab]=useState(searchParams.get('type') || 'Services');
 const selectedProvider = searchParams.get('provider') || '';
 return <div className="search-card anim-card" id="booking">
 <div className="tabs" role="tablist" aria-label="Booking type">{tabs.map(([icon,label])=><button key={label} type="button" role="tab" aria-selected={tab===label} onClick={()=>setTab(label)} className={`tab ${tab===label?'tab-active':''}`}><Icon name={icon}/>{label}</button>)}</div>
 <form className="search-row" onSubmit={e=>{
 e.preventDefault();
 const data = new FormData(e.currentTarget);
 const params = new URLSearchParams();
 for (const key of ["q", "date", "people"]) {
   const value = String(data.get(key) || "").trim();
   if (value) params.set(key, value);
 }
 params.set("type", tab);
 if (selectedProvider) params.set("provider", selectedProvider);
 router.push("/services?" + params.toString());
}}>
 <label className="field"><Icon name="search"/><span><span className="field-label">What are you looking for?</span><input name="q" aria-label="Business or service" defaultValue={searchParams.get('q') || ''} placeholder={tab==='Services'?'Try massage, braids, yoga…':`Search ${tab.toLowerCase()}…`}/></span></label>
 <label className="field"><Icon name="calendar"/><span><span className="field-label">When works for you?</span><input name="date" aria-label="Booking date" type="date" min={new Date().toISOString().slice(0,10)} defaultValue={searchParams.get('date') || ''}/></span></label>
 <label className="field people-field"><Icon name="users"/><span><span className="field-label">How many people?</span><select name="people" aria-label="Number of people" defaultValue={searchParams.get('people') || '1 Person'}><option>1 Person</option><option>2 People</option><option>3 People</option><option>4+ People</option></select></span></label>
 <button type="submit" className="btn btn-search">Search</button>
 </form>
 <p className="app-note" role="status">Your next great connection starts here. <Link href="/#download">Explore EdeBooking</Link></p>
 </div>
}

export default function BookingSearch(){
 return <Suspense fallback={<div className="search-card" aria-busy="true">Loading search…</div>}><BookingSearchContent/></Suspense>;
}
