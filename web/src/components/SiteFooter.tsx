import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link className="logo" href="/">EdeBooking</Link>
        <div className="footer-columns">
          <div><h3>Services</h3><Link href="/booking">Appointments</Link><Link href="/booking">Consultations</Link><Link href="/discover">Discover businesses</Link></div>
          <div><h3>For businesses</h3><Link href="/business">Business profiles</Link><Link href="/features">Daily tasks</Link><Link href="/features">Payments and receipts</Link></div>
          <div><h3>Resources</h3><Link href="/faq">Help and FAQs</Link><Link href="/contact">Contact us</Link></div>
          <div><h3>EdeBooking</h3><Link href="/#download">Mobile app</Link><Link href="/features">Product features</Link><Link href="/brand">Brand assets</Link></div>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© 2026 EdeBooking. All rights reserved.</small>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
