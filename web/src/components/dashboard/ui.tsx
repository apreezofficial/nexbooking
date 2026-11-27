"use client";

/**
 * The dashboard's building blocks: the web version of the customer app's components
 * (Button, IconButton, Chip, Badge, Card, Input, TabBar, SpotlightTile, FeedCard, Banner, StateView ...).
 * Screens only compose these, so restyling the dashboard means editing this file and dashboard.css.
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import {
  ArrowLeft, Aperture, Bookmark, Check, ChevronRight, Clock3, Compass, CalendarDays, Home, Lock, MessageCircle, Scissors, Sparkles, UserRound,
  type LucideIcon,
} from "lucide-react";
import type { BookingStatus, Studio } from "@/lib/dashboard/types";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

// ───────────── Text ─────────────
export function Overline({ children }: { children: ReactNode }) {
  return <p className="d-overline">{children}</p>;
}
export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="d-title">
      <h1>{children}</h1>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

// ───────────── Buttons ─────────────
type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: "primary" | "dark" | "outline" | "text";
  size?: "small" | "default" | "large";
  icon?: LucideIcon;
  loading?: boolean;
  href?: string;
  block?: boolean;
  className?: string;
};

export function Button({ variant = "primary", size = "default", icon: Icon, loading, href, block, className, children, disabled, ...props }: ButtonProps) {
  const classes = cx("d-btn", `d-btn-${variant}`, `d-btn-${size}`, block && "d-block", className);
  const inner = (
    <>
      {loading ? <span className="d-spinner" aria-hidden="true" /> : Icon ? <Icon size={20} strokeWidth={1.8} aria-hidden="true" /> : null}
      <span>{children}</span>
    </>
  );
  if (href && !disabled) return <Link href={href} className={classes}>{inner}</Link>;
  return (
    <button type="button" {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={classes}>
      {inner}
    </button>
  );
}

export function IconButton({ icon: Icon, label, dot, selected, href, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { icon: LucideIcon; label: string; dot?: boolean; selected?: boolean; href?: string }) {
  const inner = (
    <>
      <Icon size={22} strokeWidth={1.8} fill={selected && /saved|save/i.test(label) ? "var(--gold-500)" : "none"} aria-hidden="true" />
      {dot ? <i className="d-dot" aria-hidden="true" /> : null}
    </>
  );
  const classes = cx("d-iconbtn", selected && "is-selected");
  if (href) return <Link href={href} aria-label={label} className={classes}>{inner}</Link>;
  return (
    <button type="button" aria-label={label} aria-pressed={selected} className={classes} {...props}>
      {inner}
    </button>
  );
}

export function Chip({ label, selected, disabled, onClick }: { label: string; selected?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={cx("d-chip", selected && "is-selected")} aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}

export function Chips({ items, value, onChange, scroll }: { items: readonly string[]; value: string; onChange: (value: string) => void; scroll?: boolean }) {
  return (
    <div className={cx("d-chips", scroll && "is-scroll")} role="group">
      {items.map((item) => <Chip key={item} label={item} selected={item === value} onClick={() => onChange(item)} />)}
    </div>
  );
}

/** Pill tabs for switching a screen's view, like the Login | Sign up switch in the app. */
export function Segmented({ items, value, onChange }: { items: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="d-segmented" role="tablist">
      {items.map((item) => (
        <button key={item} type="button" role="tab" aria-selected={item === value} className={cx(item === value && "is-active")} onClick={() => onChange(item)}>{item}</button>
      ))}
    </div>
  );
}

// ───────────── Status ─────────────
export function Badge({ label, status, small }: { label?: string; status?: BookingStatus | "Paid"; small?: boolean }) {
  const tone = status ? status.toLowerCase().replace(/\s/g, "-") : "plain";
  return <span className={cx("d-badge", `d-badge-${tone}`, small && "is-small")}>{label ?? status}</span>;
}

export function VerifiedMark() {
  return <span className="d-verified" role="img" aria-label="Verified business"><Check size={10} strokeWidth={3} aria-hidden="true" /></span>;
}

// ───────────── Containers ─────────────
export function Card({ children, className, tone, pad = true, as: Tag = "div" }: { children: ReactNode; className?: string; tone?: "tint" | "dark" | "success" | "error"; pad?: boolean; as?: "div" | "section" | "article" }) {
  return <Tag className={cx("d-card", tone && `d-card-${tone}`, !pad && "d-card-flush", className)}>{children}</Tag>;
}

export function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className={cx("d-row", strong && "is-strong")}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
export const Divider = () => <hr className="d-divider" />;

/** A tappable row in a settings list: icon, label, detail and a chevron. */
export function ListItem({ icon: Icon, label, detail, href, onClick, destructive }: { icon: LucideIcon; label: string; detail?: string; href?: string; onClick?: () => void; destructive?: boolean }) {
  const inner = (
    <>
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      <span className="d-li-label">{label}</span>
      {detail ? <small>{detail}</small> : null}
      <ChevronRight size={18} aria-hidden="true" />
    </>
  );
  const classes = cx("d-li", destructive && "is-destructive");
  return href ? <Link href={href} className={classes}>{inner}</Link> : <button type="button" className={classes} onClick={onClick}>{inner}</button>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={cx("d-toggle", checked && "is-on")} onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

export function ToggleRow({ label, detail, checked, onChange }: { label: string; detail?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="d-togglerow">
      <div>
        <b>{label}</b>
        {detail ? <small>{detail}</small> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function RadioRow({ selected, onSelect, title, note, icon: Icon, trailing }: { selected: boolean; onSelect: () => void; title: string; note?: string; icon?: LucideIcon; trailing?: ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={cx("d-radio", selected && "is-selected")} onClick={onSelect}>
      {Icon ? <Icon size={22} strokeWidth={1.8} aria-hidden="true" /> : null}
      <span className="d-radio-text">
        <b>{title}</b>
        {note ? <small>{note}</small> : null}
      </span>
      {trailing}
      <i className="d-radio-dot" aria-hidden="true">{selected ? <Check size={13} strokeWidth={3} /> : null}</i>
    </button>
  );
}

export function Steps({ n, label }: { n: number; label: string }) {
  return (
    <div className="d-steps">
      <div>{[1, 2, 3, 4].map((i) => <i key={i} className={i <= n ? "is-done" : ""} />)}</div>
      <small>Step {n} of 4 · {label}</small>
    </div>
  );
}

// ───────────── Forms ─────────────
type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { label?: string; error?: string; leading?: LucideIcon; trailing?: ReactNode };
export function Field({ label, error, leading: Leading, trailing, id, ...props }: FieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="d-field">
      {label ? <label htmlFor={fieldId}>{label}</label> : null}
      <div className={cx("d-frame", error && "has-error")}>
        {Leading ? <Leading size={20} strokeWidth={1.8} aria-hidden="true" /> : null}
        <input id={fieldId} aria-label={label ? undefined : props.placeholder} aria-invalid={Boolean(error)} {...props} />
        {trailing}
      </div>
      {error ? <small role="alert" className="d-error">{error}</small> : null}
    </div>
  );
}

export function TextArea({ label, id, ...props }: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { label?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="d-field">
      {label ? <label htmlFor={fieldId}>{label}</label> : null}
      <div className="d-frame is-area"><textarea id={fieldId} rows={4} {...props} /></div>
    </div>
  );
}

// ───────────── Business identity ─────────────
const monograms: Record<string, { bg: string; fg: string; Icon: LucideIcon }> = {
  GS: { bg: "var(--gold-secondary)", fg: "var(--ink-900)", Icon: Sparkles },
  ZN: { bg: "var(--ink-900)", fg: "var(--gold-500)", Icon: Sparkles },
  KC: { bg: "var(--gold-100)", fg: "var(--ink-900)", Icon: Scissors },
  LL: { bg: "var(--ink-800)", fg: "var(--gold-secondary)", Icon: Aperture },
  SC: { bg: "var(--gold-100)", fg: "var(--gold-deep)", Icon: Scissors },
};

export function BusinessLogo({ monogram, name, size = 56 }: { monogram: string; name: string; size?: number }) {
  const style = monograms[monogram] ?? monograms.GS;
  const { Icon } = style;
  return (
    <span className="d-logo" role="img" aria-label={`${name} logo`} style={{ width: size, height: size, borderRadius: size * 0.24, background: style.bg, color: style.fg, fontSize: size * 0.3 }}>
      <Icon size={size * 0.25} strokeWidth={1.8} aria-hidden="true" />
      <b>{monogram}</b>
      <i style={{ background: style.fg }} />
    </span>
  );
}

export function SpotlightTile({ studio, rating, href }: { studio: Studio; rating?: boolean; href: string }) {
  return (
    <Link href={href} className="d-spot" aria-label={studio.name}>
      <span className="d-spot-art" style={{ background: studio.monogram === "GS" ? "var(--gold-secondary)" : "var(--ink-900)" }}>
        <BusinessLogo monogram={studio.monogram} name={studio.name} size={58} />
      </span>
      <span className="d-spot-name">{studio.name}</span>
      {rating ? <small>{studio.rating} ★</small> : null}
    </Link>
  );
}

export function FeedCard({ studio, saved, onSave, serviceName = "Silk press & trim", detail = "90 min · Next slot today" }: { studio: Studio; saved: boolean; onSave: () => void; serviceName?: string; detail?: string }) {
  return (
    <Card pad={false} as="article" className="d-feed">
      <div className="d-feed-art">
        <Image src={studio.photo} alt={`${studio.name} studio photo`} fill sizes="(max-width: 760px) 100vw, 480px" />
        <div className="d-feed-top">
          <Badge label={studio.category} />
          <IconButton icon={Bookmark} label={saved ? "Remove saved studio" : "Save studio"} selected={saved} onClick={onSave} />
        </div>
        <span className="d-feed-count">Studio photo · 1/4</span>
      </div>
      <div className="d-feed-body">
        <div className="d-feed-head">
          <BusinessLogo monogram={studio.monogram} name={studio.name} size={44} />
          <div>
            <b>{studio.name}{studio.verified ? <VerifiedMark /> : null}</b>
            <small>{studio.area.split(",")[0]} · {studio.distance} away</small>
          </div>
          <Badge label={`★ ${studio.rating}`} />
        </div>
        <div className="d-feed-foot">
          <div>
            <b>{serviceName}</b>
            <small>{detail}</small>
          </div>
          <Button size="small" href={`/dashboard/studios/${studio.id}`}>Book now</Button>
        </div>
      </div>
    </Card>
  );
}

// ───────────── Feedback ─────────────
export function StateView({ icon: Icon, title, body, primary, secondary, tone }: {
  icon: LucideIcon; title: string; body: string; tone?: "error";
  primary?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className={cx("d-state", tone === "error" && "is-error")}>
      <span className="d-state-ring"><span><Icon size={32} strokeWidth={1.8} aria-hidden="true" /></span></span>
      <h2>{title}</h2>
      <p>{body}</p>
      {primary ? <Button size="large" block href={primary.href} onClick={primary.onClick}>{primary.label}</Button> : null}
      {secondary ? <Button variant="outline" block href={secondary.href} onClick={secondary.onClick}>{secondary.label}</Button> : null}
    </div>
  );
}

/** "Slot held for you" with a live 10 minute countdown, or the Premium upsell. */
export function Banner({ premium, onUpgrade, minutes = 10 }: { premium?: boolean; onUpgrade?: () => void; minutes?: number }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    if (premium) return;
    const timer = setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [premium]);
  const Icon = premium ? Lock : Clock3;
  return (
    <div className={cx("d-banner", premium && "is-premium")}>
      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      <div>
        <b>{premium ? "Staff management is a Premium feature" : left === 0 ? "Your hold has ended" : "Slot held for you"}</b>
        <small>{premium ? "Upgrade to add staff and manage their schedules." : left === 0 ? "Pick the time again to keep it." : "We’re holding this time while you finish booking."}</small>
        {premium ? <Button size="small" onClick={onUpgrade}>Upgrade</Button> : null}
      </div>
      {!premium ? <b className="d-banner-time">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</b> : null}
    </div>
  );
}

export function ConfirmDialog({ open, icon: Icon, title, body, confirm, cancel, onConfirm, onCancel, tone }: {
  open: boolean; icon: LucideIcon; title: string; body: string; confirm: string; cancel: string; onConfirm: () => void; onCancel: () => void; tone?: "error";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="d-scrim" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="d-dialog" role="dialog" aria-modal="true" aria-labelledby="d-dialog-title" ref={ref}>
        <span className={cx("d-dialog-icon", tone === "error" && "is-error")}><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
        <h2 id="d-dialog-title">{title}</h2>
        <p>{body}</p>
        <div>
          <Button variant="outline" onClick={onCancel}>{cancel}</Button>
          <Button variant="dark" onClick={onConfirm}>{confirm}</Button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Navigation ─────────────
export const tabs = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Explore", href: "/dashboard/explore", icon: Compass },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
  { label: "Inbox", href: "/dashboard/inbox", icon: MessageCircle },
  { label: "Account", href: "/dashboard/account", icon: UserRound },
] as const;

export function useActiveTab(): string {
  const path = usePathname() ?? "";
  if (path === "/dashboard") return "Home";
  const match = tabs.find((tab) => tab.href !== "/dashboard" && path.startsWith(tab.href));
  if (match) return match.label;
  // Detail screens belong to the tab they were opened from.
  if (path.startsWith("/dashboard/bookings") || path.startsWith("/dashboard/notes") || path.startsWith("/dashboard/consultation")) return "Schedule";
  if (path.startsWith("/dashboard/search") || path.startsWith("/dashboard/studios") || path.startsWith("/dashboard/book")) return "Explore";
  return "Home";
}

/** The page title row used on every inner screen: a back button and a heading. */
export function PageHeader({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="d-header">
      {back ? <IconButton icon={ArrowLeft} label="Back" href={back} /> : <IconButton icon={ArrowLeft} label="Back" onClick={() => router.back()} />}
      <h1>{title}</h1>
      {action}
    </header>
  );
}
