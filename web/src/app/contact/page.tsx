import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";
import { pageMetadata, siteName, siteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact us",
  description: "Questions about a booking, your business space or the EdeBooking app? Send us a note and we'll point you in the right direction.",
  path: "/contact",
});

const shortcuts = [
  { icon: "book", title: "Browse the FAQ", text: "Quick answers about bookings, payments and business tools.", href: "/faq" },
  { icon: "shop", title: "Run a business?", text: "See how a EdeBooking space brings your work and customers together.", href: "/business" },
  { icon: "spark", title: "Explore the features", text: "Notes, bookings, payments and records, working as one.", href: "/features" },
] as const;

export default function ContactPage() {
  return (
    <RouteShell crumb={{ name: "Contact", path: "/contact" }}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: `Contact ${siteName}`, url: `${siteUrl}/contact`, isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl } }} />
      <RouteHero
        eyebrow="WE’RE HERE TO HELP"
        title="Let’s talk."
        description="Questions about a booking, your business space or the EdeBooking app? Send us a note and we’ll point you in the right direction."
        image="discover-landscape.png"
        cta="Browse the FAQ"
        href="/faq"
      />
      <section className="route-content">
        <div className="contact-grid">
          <ContactForm />
          <aside className="contact-aside" aria-label="Other ways to get help">
            {shortcuts.map((item) => (
              <Link key={item.title} className="aside-card" href={item.href}>
                <span className="aside-icon"><Icon name={item.icon} /></span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
                <i aria-hidden="true">→</i>
              </Link>
            ))}
            <div className="aside-mascot">
              <div>
                <p className="eyebrow">✦ GOOD TO KNOW</p>
                <h3>One platform, space for everyone.</h3>
              </div>
              <SiteArt file="mascot-suitcase.png" className="mascot aside-mascot-art" alt="" />
            </div>
          </aside>
        </div>
      </section>
    </RouteShell>
  );
}
