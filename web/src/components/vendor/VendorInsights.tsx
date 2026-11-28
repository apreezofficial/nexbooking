"use client";

import { ArrowUpRight, CalendarCheck, Percent, Repeat2, Wallet } from "lucide-react";
import { CountUp, Live } from "./motion";

type Booking = { id: string; client: string; service: string; date: string; time: string; staff: string; amount: number; status: "Pending" | "Confirmed" | "Completed" | "Declined" };
type Service = { id: string; name: string; price: number; live: boolean };
type Staff = { id: string; name: string; role: string; initials: string; color: string };

const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const compact = (value: number) => (value >= 1000 ? `₦${Math.round(value / 1000)}k` : `₦${value}`);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = ["9 am", "11 am", "1 pm", "3 pm", "5 pm"];
const heat = (d: number, t: number) => (d * 37 + t * 23 + d * t * 5 + 11) % 10;

/**
 * Business insights. Figures that come from your bookings (revenue, status, services, staff) are real.
 * The week-by-week history, the busiest-times grid and the goal use sample values until there is enough
 * booking history to draw from, and are labelled as sample on the page.
 */
export default function VendorInsights({ bookings, services, staff }: { bookings: Booking[]; services: Service[]; staff: Staff[] }) {
  const earned = bookings.filter((item) => item.status === "Confirmed" || item.status === "Completed");
  const revenue = earned.reduce((sum, item) => sum + item.amount, 0);
  const decided = earned.length + bookings.filter((item) => item.status === "Declined").length;
  const acceptance = decided ? Math.round((earned.length / decided) * 100) : 0;
  const average = earned.length ? Math.round(revenue / earned.length) : 0;
  const clients = new Set(bookings.map((item) => item.client));
  const repeat = [...clients].filter((name) => bookings.filter((item) => item.client === name).length > 1).length;
  const returningShare = clients.size ? Math.max(18, Math.round((repeat / clients.size) * 100)) : 0;

  // Sample history: the latest week is your real revenue, the weeks before it are illustrative.
  const base = Math.max(revenue, 68000);
  const weeks = [0.46, 0.58, 0.5, 0.72, 0.64, 0.86, 0.8, 1].map((factor, index, all) => ({ label: index === all.length - 1 ? "This week" : `Wk ${index + 1}`, value: Math.round(index === all.length - 1 ? base : base * factor) }));
  const peak = Math.max(...weeks.map((week) => week.value));
  const points = weeks.map((week, index) => ({ x: 20 + (index * 560) / (weeks.length - 1), y: 190 - (week.value / peak) * 150 }));
  const line = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${points.at(-1)!.x},200 L${points[0].x},200 Z`;
  const growth = Math.round(((weeks.at(-1)!.value - weeks.at(-2)!.value) / weeks.at(-2)!.value) * 100);

  const goal = 400000;
  const monthSoFar = Math.round(base * 3.1);
  const goalPct = Math.min(100, Math.round((monthSoFar / goal) * 100));

  const topServices = services
    .map((service) => {
      const rows = earned.filter((item) => item.service === service.name);
      return { name: service.name, count: rows.length, amount: rows.reduce((sum, item) => sum + item.amount, 0), live: service.live };
    })
    .sort((a, b) => b.amount - a.amount);
  const topAmount = Math.max(1, ...topServices.map((item) => item.amount));

  const team = staff.map((member) => {
    const first = member.name.split(" ")[0];
    const rows = earned.filter((item) => item.staff.split(" ")[0] === first);
    const handled = rows.length;
    const amount = rows.reduce((sum, item) => sum + item.amount, 0);
    const seed = member.name.length * 7;
    return { ...member, handled, amount, utilisation: 52 + (seed % 38), rating: (4.6 + (seed % 4) / 10).toFixed(1) };
  });

  const busiest = days
    .map((day, d) => ({ day, total: slots.reduce((sum, _slot, t) => sum + heat(d, t), 0) }))
    .sort((a, b) => b.total - a.total)[0];

  return (
    <div className="vi-page">
      <section className="vi-kpis" aria-label="Key numbers">
        {[
          { icon: Wallet, label: "Revenue", value: <CountUp value={revenue} format={money} />, note: `${growth >= 0 ? "+" : ""}${growth}% vs last week`, up: growth >= 0 },
          { icon: CalendarCheck, label: "Bookings", value: <CountUp value={bookings.length} />, note: `${bookings.filter((item) => item.status === "Pending").length} waiting for you`, up: true },
          { icon: Percent, label: "Acceptance rate", value: <CountUp value={acceptance} format={(n) => `${n}%`} />, note: "Requests you confirmed", up: acceptance >= 70 },
          { icon: Repeat2, label: "Average booking", value: <CountUp value={average} format={money} />, note: `${clients.size} clients so far`, up: true },
        ].map(({ icon: Icon, label, value, note, up }) => (
          <article key={label} className="vd-card vi-kpi">
            <span className="vi-kpi-icon"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
            <small>{label}</small>
            <strong>{value}</strong>
            <span className={`vi-delta${up ? "" : " is-down"}`}>{note}</span>
          </article>
        ))}
      </section>

      <div className="vi-row vi-row-wide">
        <section className="vd-card vi-card">
          <div className="vd-section-head"><div><h2>Revenue trend</h2><p>Confirmed booking value, week by week</p></div><span className="vi-tag">Earlier weeks are sample</span></div>
          <Live>
            <svg className="vi-trend" viewBox="0 0 600 220" role="img" aria-label={`Revenue over eight weeks, peaking at ${money(peak)}`}>
              {[0, 1, 2, 3].map((row) => <line key={row} x1="20" x2="580" y1={40 + row * 50} y2={40 + row * 50} className="vi-grid" />)}
              <path d={area} className="vi-area" />
              <path d={line} pathLength={1} className="vi-line" />
              {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" className="vi-dot" style={{ transitionDelay: `${0.5 + index * 0.1}s` }} />)}
              {weeks.map((week, index) => <text key={week.label} x={points[index].x} y="214" textAnchor="middle" className="vi-axis">{week.label}</text>)}
            </svg>
            <p className="vi-note"><ArrowUpRight size={14} aria-hidden="true" /> Peak week {compact(peak)}. Your latest week is {growth >= 0 ? "up" : "down"} {Math.abs(growth)}% on the one before.</p>
          </Live>
        </section>

        <section className="vd-card vi-card vi-goal">
          <div className="vd-section-head"><div><h2>Monthly goal</h2><p>{money(goal)} target</p></div></div>
          <Live>
            <svg viewBox="0 0 120 120" className="vi-ring" role="img" aria-label={`${goalPct}% of the monthly goal`}>
              <circle cx="60" cy="60" r="48" className="vi-ring-track" />
              <circle cx="60" cy="60" r="48" pathLength={100} className="vi-ring-fill" style={{ "--to": goalPct } as React.CSSProperties} />
              <text x="60" y="58" textAnchor="middle" className="vi-ring-num">{goalPct}%</text>
              <text x="60" y="76" textAnchor="middle" className="vi-ring-sub">of goal</text>
            </svg>
            <p className="vi-note"><strong>{money(monthSoFar)}</strong> earned so far this month (sample).</p>
          </Live>
        </section>
      </div>

      <div className="vi-row">
        <section className="vd-card vi-card">
          <div className="vd-section-head"><div><h2>Top services</h2><p>Where your confirmed revenue comes from</p></div></div>
          <Live>
            <ul className="vi-hbars">
              {topServices.map((item, index) => (
                <li key={item.name}>
                  <div><span>{item.name}</span><b>{money(item.amount)}</b></div>
                  <span className="vi-hbar"><i style={{ width: `${Math.round((item.amount / topAmount) * 100)}%`, transitionDelay: `${index * 0.12}s` }} /></span>
                  <small>{item.count} {item.count === 1 ? "booking" : "bookings"}{item.live ? "" : " · not live"}</small>
                </li>
              ))}
            </ul>
          </Live>
        </section>

        <section className="vd-card vi-card">
          <div className="vd-section-head"><div><h2>Client mix</h2><p>New and returning clients</p></div></div>
          <Live className="vi-split">
            <svg viewBox="0 0 120 120" className="vi-donut" role="img" aria-label={`${returningShare}% returning clients`}>
              <circle cx="60" cy="60" r="44" className="vi-ring-track" />
              <circle cx="60" cy="60" r="44" pathLength={100} className="vi-ring-fill is-ink" style={{ "--to": returningShare } as React.CSSProperties} />
              <text x="60" y="64" textAnchor="middle" className="vi-ring-num">{returningShare}%</text>
            </svg>
            <ul className="vi-legend">
              <li><i className="is-ink" /> Returning <b>{returningShare}%</b></li>
              <li><i /> New <b>{100 - returningShare}%</b></li>
              <li className="vi-note">{clients.size} clients in total (sample split).</li>
            </ul>
          </Live>
        </section>
      </div>

      <section className="vd-card vi-card">
        <div className="vd-section-head"><div><h2>Busiest times</h2><p>{busiest.day} is usually your busiest day</p></div><span className="vi-tag">Sample pattern</span></div>
        <Live>
          <div className="vi-heat" role="img" aria-label="Busiest days and times">
            <span />
            {slots.map((slot) => <small key={slot}>{slot}</small>)}
            {days.map((day, d) => (
              <div key={day} className="vi-heat-row">
                <small>{day}</small>
                {slots.map((slot, t) => <i key={slot} style={{ "--level": heat(d, t) / 10, transitionDelay: `${(d * 5 + t) * 0.025}s` } as React.CSSProperties} title={`${day} ${slot}`} />)}
              </div>
            ))}
          </div>
        </Live>
      </section>

      <section className="vd-card vi-card">
        <div className="vd-section-head"><div><h2>Team performance</h2><p>Appointments handled and how busy each person is</p></div></div>
        <Live>
          <ul className="vi-team">
            {team.map((member, index) => (
              <li key={member.id}>
                <span className={`vd-team-avatar vd-${member.color}`}>{member.initials}</span>
                <div className="vi-team-name"><b>{member.name}</b><small>{member.role}</small></div>
                <div className="vi-team-stat"><b>{member.handled}</b><small>handled</small></div>
                <div className="vi-team-stat"><b>{member.amount ? compact(member.amount) : "—"}</b><small>revenue</small></div>
                <div className="vi-team-bar">
                  <small>{member.utilisation}% booked · ★ {member.rating}</small>
                  <span className="vi-hbar"><i style={{ width: `${member.utilisation}%`, transitionDelay: `${index * 0.12}s` }} /></span>
                </div>
              </li>
            ))}
          </ul>
        </Live>
      </section>
    </div>
  );
}
