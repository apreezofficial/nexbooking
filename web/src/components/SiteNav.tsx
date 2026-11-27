import { ChevronDown } from "lucide-react";
import { documents } from "@/lib/legal-documents";
import Link from "next/link";
import NavActions from "./NavActions";
import BrandLogo from "./BrandLogo";

const items = [
  ["Features", "/features"],
  ["Services", "/services"],
  ["Discover", "/discover"],
  ["For business", "/business"],
  ["Booking", "/booking"],
  ["FAQ", "/faq"],
] as const;

export default function SiteNav({ current }: { current?: (typeof items)[number][0] }) {
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <BrandLogo />
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
        <details className="nav-legal">
          <summary className="nav-item">Legal <ChevronDown size={13} aria-hidden="true" /></summary>
          <ul aria-label="Legal">
            {Object.values(documents).map(({ label, href }) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </details>
        <NavActions />
      </nav>
    </header>
  );
}
