import Image from "next/image";
import type { CSSProperties } from "react";
import BookingSearch from "@/components/BookingSearch";
import HeroMotion from "@/components/HeroMotion";
import LandingControls from "@/components/LandingControls";
import Icon from "@/components/Icon";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const businesses = [
 {name:"Salon",x:5,y:4,s:15,color:"#f5aab5"},
 {name:"Clinic",x:25,y:14,s:13,color:"#9cdbcb"},
 {name:"Studio",x:44,y:1,s:16,color:"#f9ba88"},
 {name:"Hotel",x:66,y:10,s:15,color:"#91b8ec"},
 {name:"Tutor",x:17,y:51,s:13,color:"#f3ce65"},
 {name:"Photography",x:37,y:57,s:15,color:"#fa997d"},
 {name:"Fitness",x:59,y:48,s:16,color:"#b7a1f2"},
 {name:"Events",x:81,y:45,s:12,color:"#db92c4"},
];
const faqs=[
 ["What can I do with NexBooking?","Discover businesses, book services, arrange consultations and manage payments. Business owners can also organise notes, daily tasks, invoices and their portfolio."],
 ["Does every business get its own space?","Yes. Each business has its own profile, team, services, bookings and records on the shared NexBooking platform."],
 ["Can I create invoices and receipts?","The accounts module is designed for proforma invoices, payment records and receipts, keeping your business paperwork together."],
 ["How will voice notes work?","Voice notes and audio translation are planned to help turn spoken tasks into written lists. Availability will be shared when these features launch."],
 ["Can I showcase my work?","Yes. Your profile brings your work and services together in a familiar visual feed, so customers can explore before booking."],
];
const delay=(i:number)=>({"--d":`${i*90}ms`}) as CSSProperties;
function Art({file,className="",alt="",priority=false}:{file:string;className?:string;alt?:string;priority?:boolean}){
 return <div className={`art ${className}`}><Image src={`/assets/${file}`} alt={alt} fill sizes={className === "hero-scene" ? "(max-width: 600px) 1800px, 100vw" : className.includes("scene")||className.includes("background")?"(max-width: 600px) 1200px, 100vw":"(max-width: 700px) 80vw, 500px"} preload={priority}/></div>
}
function Eyebrow({children,icon="spark"}:{children:React.ReactNode;icon?:string}) {return <p className="eyebrow"><Icon name={icon}/>{children}</p>}
function Checks({items}:{items:string[]}) {return <ul className="check-list">{items.map((item,i)=><li key={item} data-reveal style={delay(i)}><span className="check-symbol">✦</span>{item}</li>)}</ul>}
function Mascot({className=""}:{className?:string}) {return <Art file="mascot-suitcase.png" className={`mascot ${className}`}/>}

export default function Home(){return <main className="page">
 <div className="page-outline" aria-hidden="true"/>
  <SiteNav/>
 <section className="hero">
  <Art file="hero-scene.png" className="hero-scene" priority/>
  <div className="hero-sky"/>

  <div className="hero-copy"><h1 className="hero-title anim-up">Book, pay and manage{" "}<br/>your business in one place</h1><p className="hero-sub anim-up">Your favourite businesses. Your next booking. All together.</p></div>
  <HeroMotion/>
  <BookingSearch/>
 </section>

 <section className="feature-world" id="features">
  <div className="feature-ribbon" aria-hidden="true">
   <Art file="feature-notes-scene.png" className="ribbon-scene ribbon-first"/>
   <Art file="hero-scene.png" className="ribbon-scene ribbon-middle"/>
   <Art file="feature-booking-scene.png" className="ribbon-scene ribbon-last"/>
  </div>
  <div className="feature-row notes-row">
   <div className="feature-picture notes-picture"><Art file="feature-notes-scene.png" className="feature-scene"/>
    <div className="note-mock mock-card" data-reveal><span className="pill"><Icon name="mic"/> YOUR DAY, ORGANISED</span><h3>A little less admin.<br/>A lot more doing.</h3><p className="mock-date"><Icon name="calendar"/> Today’s business tasks</p><ul>{['Confirm Ada’s consultation','Send invoice to Amara','Plan tomorrow’s appointments'].map((t,i)=><li key={t}><span className={i<2?'task-done':''}>{i<2?'✓':''}</span>{t}</li>)}</ul><div className="voice-wave"><Icon name="mic"/><span>{Array.from({length:20},(_,i)=><i key={i} style={{'--bar':`${8+(i*7%21)}px`,'--d':`${i*70}ms`} as CSSProperties}/>)}</span><small>Just say what’s on your mind</small></div></div>
    <Mascot className="notes-mascot"/>
    <div className="floating-chip" data-reveal><Icon name="check"/> Task added to your day</div>
   </div>
   <div className="feature-copy" data-reveal><Eyebrow>SMARTER EVERYDAY</Eyebrow><h2>Say it.<br/>We’ll write it down.</h2><p>Keep daily activities and business tasks in one place. Capture a thought, plan your day and get back to the work you love.</p><Checks items={['Notes and daily task scheduling','Voice input & audio translation planned']}/></div>
  </div>
  <div className="feature-row booking-row">
   <div className="feature-copy" data-reveal><Eyebrow>LESS WORK, MORE FLOW</Eyebrow><h2>Find the right service</h2><p>See a business’s work, explore its services, and book a consultation before you decide.</p><Checks items={['Business portfolios and service previews','Consultations before you book']}/></div>
   <div className="feature-picture booking-picture"><Art file="hero-scene.png" className="feature-scene"/>
    <article className="booking-mock mock-card service-preview" data-reveal>
     <Art file="discover-salon.png" className="service-preview-art"/>
     <div className="service-preview-copy">
      <small>Service preview</small>
      <h3>Salon &amp; wellness consultation</h3>
      <p>Meet your stylist, discuss what you’re looking for, and choose the right service.</p>
     </div>
    </article>
    <Mascot className="booking-mascot"/>
   </div>
  </div>
  <div className="feature-row direct-row">
   <div className="feature-picture notes-picture">
    <Art file="feature-booking-scene.png" className="feature-scene"/>
    <div className="mock-card direct-card" data-reveal>
     <p className="mock-date"><Icon name="calendar"/> Your booking</p>
     <h3>Salon &amp; wellness consultation</h3>
     <div className="mini-summary"><strong>Service · Payment · Receipt</strong></div>
     <a href="#booking" className="btn btn-gradient">Browse appointments</a>
    </div>
    <Mascot className="notes-mascot"/>
   </div>
   <div className="feature-copy" data-reveal>
    <Eyebrow icon="calendar">DIRECT BOOKING</Eyebrow>
    <h2>Book a service in one place</h2>
    <p>Choose a service and a time that works for you. Keep the booking and payment details together.</p>
    <Checks items={["Appointments and consultations", "Payment records and receipts"]}/>
   </div>
  </div>
 </section>

 <section className="recommendations content-section" id="business">
  <Eyebrow>YOUR BUSINESS, YOUR SPACE</Eyebrow><h2 className="section-title">Big ideas. A space of your own.</h2><p className="section-sub">Whatever you do, bring your work and your customers together.</p>
  <div className="business-cards" id="business-cards">{[{name:'Beauty, on your schedule',file:'discover-salon.png',tag:'BEAUTY & WELLNESS',text:'Your work gets noticed. Your next client gets booked.'},{name:'Make room for your craft',file:'discover-studio.png',tag:'CREATIVES & PROFESSIONALS',text:'Show your portfolio and turn interest into a conversation.'},{name:'A better way to connect',file:'discover-clinic.png',tag:'CONSULTATIONS & SERVICES',text:'A welcoming space for appointments and ongoing care.'},{name:'Train on your terms',file:'discover-fitness.png',tag:'FITNESS',text:'Find a class or make time for a personal training session.'},{name:'Plan your next event',file:'discover-events.png',tag:'EVENTS',text:'Discover spaces and services for your next gathering.'}].map((c,i)=><article className="business-card" key={c.name} data-reveal style={delay(i)}><Art file={c.file} className="business-cover"/><span className="card-category">{c.tag}</span><h3>{c.name}</h3><p>{c.text}</p><a href="#booking" className="btn btn-gradient">Explore services</a></article>)}</div>
  <LandingControls mode="carousel"/>
 </section>

 <section className="deals content-section">
  <div className="section-head"><h2>Good things for your growing business.</h2><a className="btn btn-soft" href="#features">See features</a></div>
  <div className="deals-grid">
   <article className="deal deal-big" data-reveal><h3>From the first quote<br/>to the final thank you.</h3><p className="invoice-flow"><span>Proforma</span><strong>Paid.</strong></p><a href="#download" className="btn btn-light">Meet your accounts module</a><Art file="deal-invoice.png" className="deal-art"/></article>
   <article className="deal deal-purple" data-reveal style={delay(1)}><div><h3>A conversation.<br/>A new possibility.</h3><a href="#booking" className="btn btn-purple">BOOK A CONSULTATION</a></div><div className="consult-art" aria-hidden="true"><Icon name="chat"/><span>✦</span><i>•••</i></div></article>
   <article className="deal deal-peach" data-reveal style={delay(2)}><div><h3>Your work deserves<br/>to be seen.</h3><a href="#discover" className="btn btn-light">Explore the feed</a></div><div className="portfolio-art" aria-hidden="true"><Art file="discover-studio.png" className="portfolio-img"/><span>♥</span></div></article>
  </div>
 </section>

 <section id="discover" className="discover">
  <Art file="discover-landscape.png" className="discover-background"/>
  <div className="discover-heading" data-reveal><Eyebrow icon="pin">A WORLD OF GOOD BUSINESSES</Eyebrow><h2 className="section-title">Find your next favourite.</h2><p className="section-sub">A fresh cut. A bright idea. A moment for you. Discover it here.</p></div>
  <div className="discover-bubbles">{businesses.map((b,i)=><a key={b.name} href="#booking" className="business-bubble" style={{'--x':`${b.x}%`,'--y':`${b.y}%`,'--s':`${b.s}%`,'--bubble-color':b.color,'--d':`${i*80}ms`} as CSSProperties} data-reveal><div className="bubble-photo"><Art file={`discover-${b.name.toLowerCase()}.png`} alt=""/></div><span className="bubble-label">{b.name}</span></a>)}{Array.from({length:14},(_,i)=><span key={i} className="bubble-dot" style={{left:`${4+(i*23)%91}%`,top:`${12+(i*17)%70}%`,width:`${8+(i*11)%31}px`,height:`${8+(i*11)%31}px`} as CSSProperties}/>)}</div>
  <Mascot className="discover-mascot"/>
 </section>

 <section className="why content-section"><div className="why-copy" data-reveal><Eyebrow>WHY NEXBOOKING?</Eyebrow><h2 className="section-title">A little simpler.<br/>A whole lot better.</h2><div className="check-grid"><Checks items={['Your own business space','Bookings that stay organised','Payments & records together','A feed that feels familiar']}/></div><p>One platform, with space for everyone. Every business has its own team, services and records. Customers get a familiar way to discover, follow and book.</p></div><div className="why-scene" data-reveal><Art file="feature-notes-scene.png" className="why-background"/><Mascot className="why-mascot"/></div></section>

 <section id="faq" className="faq content-section"><Eyebrow icon="chat">A FEW THINGS YOU MIGHT ASK</Eyebrow><h2 className="section-title">Questions? We’ve got you.</h2><p className="section-sub">Get to know your next everyday essential.</p><LandingControls mode="faq" questions={faqs}/></section>
 <section className="journal content-section" id="articles"><header className="journal-heading"><Eyebrow>BUSINESS GUIDES</Eyebrow><h2 className="section-title">Blog &amp; Articles</h2></header>
  <article className="featured-article" data-reveal>
   <Art file="discover-studio.png" className="featured-article-image"/>
   <div><Eyebrow>FEATURED GUIDE</Eyebrow><h3>Build a business profile customers can book from</h3><p>Show what you do, list your services and give customers a clear way to make an appointment.</p><a href="#business" className="text-link">Explore business profiles</a></div>
  </article><div className="journal-grid">{[{file:'discover-studio.png',tag:'YOUR BUSINESS',title:'Let your work do the talking.',body:'A visual profile gives customers a feel for what makes you, you.'},{file:'discover-tutor.png',tag:'YOUR EVERYDAY',title:'Make room for a calmer day.',body:'Keep the little things together, from today’s tasks to tomorrow’s appointments.'},{file:'discover-events.png',tag:'YOUR COMMUNITY',title:'Great connections start here.',body:'Discover businesses and follow the people behind the work.'}].map((a,i)=><article key={a.title} data-reveal style={delay(i)}><Art file={a.file} className="journal-image"/><div><small>{a.tag}</small><h3>{a.title}</h3><p>{a.body}</p><a href="#features" className="text-link">Explore NexBooking</a></div></article>)}</div></section>

 <section className="app-banner" id="download"><Art file="feature-booking-scene.png" className="app-background"/><div className="app-rays"/><div className="app-copy" data-reveal><Eyebrow icon="phone">ONE APP. SO MANY POSSIBILITIES.</Eyebrow><h2>Your business. Your people.<br/>Your NexBooking.</h2><p>Make a little more room for what you love.</p><div className="store-badges"><a href="#features" className="store-badge"><Icon name="phone"/><span><small>Built for your day</small><strong>Explore the features</strong></span></a><a href="#business" className="store-badge"><Icon name="shop"/><span><small>Made for your business</small><strong>Explore your space</strong></span></a></div></div><Mascot className="app-mascot"/></section>

 <SiteFooter/>
 </main>}
