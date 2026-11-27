import { documents } from "@/lib/legal-documents";
import Link from "next/link";
import StoreBadges from "@/components/StoreBadges";
import BrandLogo from "./BrandLogo";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <BrandLogo tone="dark" />
        <div className="footer-columns">
          <div><h3>Services</h3><Link href="/booking">Appointments</Link><Link href="/booking">Consultations</Link><Link href="/discover">Discover businesses</Link></div>
          <div><h3>For businesses</h3><Link href="/business">Business profiles</Link><Link href="/features">Daily tasks</Link><Link href="/features">Payments and receipts</Link></div>
          <div><h3>Resources</h3><Link href="/faq">Help and FAQs</Link><Link href="/contact">Contact us</Link></div>
          <div><h3>EdeBooking</h3><Link href="/#download">Mobile app</Link><Link href="/features">Product features</Link></div>
          <nav className="footer-legal-grid" aria-label="Legal">
            <h3>Legal</h3>
            <div>{Object.values(documents).map(({ label, href }) => <Link key={href} href={href}>{label}</Link>)}</div>
          </nav>
        </div>
        <div className="footer-app">
          <div>
            <h3>Take EdeBooking with you</h3>
            <p>Book, pay and keep your business moving from your phone.</p>
          </div>
          <StoreBadges />
        </div>
      </div>
      <div className="footer-bottom">
        <small>© 2026 EdeBooking. All rights reserved.</small>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
