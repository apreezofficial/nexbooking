"use client";
import { useState } from "react";
export default function HeroMotion() {
 const [paused,setPaused] = useState(false);
 return <>
 <div className={`hero-motion ${paused ? "motion-paused" : ""}`} aria-hidden="true">
  <div className="drift-cloud cloud-one"/><div className="drift-cloud cloud-two"/>
  <svg className="flying-birds" viewBox="0 0 180 70" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 30q15-12 27 0 12-12 27 0M86 15q10-8 18 0 8-8 18 0M120 52q12-10 22 0 10-10 22 0"/></svg>
  <svg className="moving-boat" viewBox="0 0 120 100"><path d="M58 7v68" stroke="#183e67" strokeWidth="3"/><path d="M54 13 16 69h38Z" fill="#fff7e8"/><path d="m62 29 26 40H62Z" fill="#e9e1f7"/><path d="m9 77 100-2-15 14H24Z" fill="#e78b54"/><path d="M15 91q20 6 40 0t50 0" fill="none" stroke="#effaff" strokeWidth="3"/></svg>
  <div className="water-glint glint-one"/><div className="water-glint glint-two"/>
 </div>
 <button className="motion-toggle" type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?"Play scene animation":"Pause scene animation"}>{paused?"▷":"Ⅱ"}<span>{paused?"Play scene":"Pause scene"}</span></button>
 </>;
}
