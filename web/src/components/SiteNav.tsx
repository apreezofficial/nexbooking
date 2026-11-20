import Link from "next/link";
import CurrencySelect from "@/components/CurrencySelect";

const items = [
  ["Features", "/features"],
  ["Discover", "/discover"],
  ["For business", "/business"],
  ["Booking", "/booking"],
  ["FAQ", "/faq"],
] as const;

export default function SiteNav({ current }: { current?: (typeof items)[number][0] }) {
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <Link className="logo" href="/">NexBooking</Link>
        <div className="nav-links">
          {items.map(([label, href], index) => (
            <Link
              key={label}
              className={`nav-item${current === label ? " nav-item-active" : ""}`}
              href={href}
              aria-current={current === label ? "page" : undefined}
              style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <CurrencySelect />
          <Link className="btn btn-ghost" href="/#download">Sign up</Link>
          <Link className="btn btn-dark" href="/#download">Login</Link>
        </div>
      </nav>
    </header>
  );
}
