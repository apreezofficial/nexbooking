import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link className="logo" href="/">NexBooking</Link>
        <div className="footer-columns">
          <div><h3>Services</h3><Link href="/booking">Appointments</Link><Link href="/booking">Consultations</Link><Link href="/discover">Discover businesses</Link></div>
          <div><h3>For businesses</h3><Link href="/business">Business profiles</Link><Link href="/features">Daily tasks</Link><Link href="/features">Payments and receipts</Link></div>
          <div><h3>Resources</h3><Link href="/faq">Help and FAQs</Link></div>
          <div><h3>NexBooking</h3><Link href="/#download">Mobile app</Link><Link href="/features">Product features</Link></div>
        </div>
      </div>
      <small>© 2026 NexBooking. All rights reserved.</small>
    </footer>
  );
}
