import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m7 .13a4 4 0 0 1 0 7.75",
  shop: "M3 10v11h18V10M2 10l2-7h16l2 7M2 10c0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0M9 21v-7h6v7",
  chat: "M21 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 1 1 19 0M7 10h10m-10 4h6",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  ticket: "M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6m12 0v3m0 3v2m0 2v2",
  book: "M12 5v16M2 3c5-1 8 0 10 2 2-2 5-3 10-2v16c-4-1-7 0-10 2-3-2-6-3-10-2V3",
  key: "M14 10a5 5 0 1 0-4 4l7 7 4-4-3-3-2 2-2-2 2-2-2-2",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7",
  check: "m5 12 4 4L19 6",
  mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5m-4 6a7 7 0 0 0 14 0m-7 7v4m-4 0h8",
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m2 3h6m-4 14h2",
  receipt: "M5 2l3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2V2m4 6h6m-6 4h6m-6 4h4",
  heart: "M20 4c-3-3-6-1-8 1-2-2-5-4-8-1-6 6 8 17 8 17S26 10 20 4",
};
export default function Icon({name, className = "", style}: {name:string;className?:string;style?:CSSProperties}) {
 return <svg className={`icon ${className}`} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.spark}/></svg>;
}
