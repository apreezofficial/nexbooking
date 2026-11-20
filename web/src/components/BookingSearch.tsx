"use client";
import Link from "next/link";
import {useState} from "react";
import Icon from "./Icon";
const tabs=[['shop','Services'],['chat','Consultation'],['calendar','Appointments'],['ticket','Events'],['book','Classes'],['key','Rentals']];
export default function BookingSearch(){
 const [tab,setTab]=useState('Services'); const [message,setMessage]=useState('');
 return <div className="search-card anim-card" id="booking">
 <div className="tabs" role="tablist" aria-label="Booking type">{tabs.map(([icon,label])=><button key={label} role="tab" aria-selected={tab===label} onClick={()=>{setTab(label);setMessage('')}} className={`tab ${tab===label?'tab-active':''}`}><Icon name={icon}/>{label}</button>)}</div>
 <form className="search-row" onSubmit={e=>{e.preventDefault();setMessage(`${tab} discovery is coming soon. Join EdeBooking to get updates.`)}}>
 <label className="field"><Icon name="search"/><span><span className="field-label">What are you looking for?</span><input aria-label="Business or service" placeholder={tab==='Services'?'Salon, spa or a service':tab}/></span></label>
 <label className="field"><Icon name="calendar"/><span><span className="field-label">When works for you?</span><input aria-label="Booking date" type="date"/></span></label>
 <label className="field people-field"><Icon name="users"/><span><span className="field-label">Add people</span><select aria-label="Number of people"><option>1 Person</option><option>2 People</option><option>3 People</option><option>4+ People</option></select></span></label>
 <button type="submit" className="btn btn-search">Search</button>
 </form>
 <p className="app-note" role="status">{message||<>Your next great connection starts here. <Link href="/#download">Explore EdeBooking</Link></>}</p>
 </div>
}
