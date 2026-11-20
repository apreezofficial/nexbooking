import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that apply when you use NexBooking to book services, make payments or run a business space on the platform.",
  path: "/terms",
});

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Agreeing to these terms",
    body: [
      "By creating an account or using NexBooking you agree to these Terms and to our Privacy Policy. If you use NexBooking on behalf of a business, you confirm that you have the authority to bind that business. If you do not agree, please do not use the Service.",
    ],
  },
  {
    id: "the-service",
    title: "The service",
    body: [
      "NexBooking is a platform where people can discover businesses, book appointments and consultations, and make and record payments, and where businesses can manage a profile, bookings, notes, tasks and accounting records such as proforma invoices and receipts.",
      "Some features, including voice notes and audio translation, are planned and may change before and after launch. We may add, change or remove features over time.",
    ],
  },
  {
    id: "accounts",
    title: "Your account",
    body: [
      {
        list: [
          "Give accurate information and keep it up to date.",
          "Keep your login details secure. You are responsible for activity under your account.",
          "Tell us promptly if you suspect unauthorised use.",
          "You must be at least 18 to hold an account.",
        ],
      },
    ],
  },
  {
    id: "businesses",
    title: "Businesses and their services",
    body: [
      "Each business on NexBooking runs its own space and is responsible for its services, prices, availability, cancellation and refund terms, and for meeting the laws that apply to it.",
      "NexBooking provides the platform. We are not a party to the agreement between a customer and a business, and we do not guarantee any business’s work.",
    ],
  },
  {
    id: "bookings-and-payments",
    title: "Bookings, payments and records",
    body: [
      {
        list: [
          "A booking is an arrangement between you and the business. Check the service details, price and any cancellation policy before you confirm.",
          "Payments may be handled by third-party payment providers, whose own terms apply.",
          "Proforma invoices and receipts created in NexBooking are records for convenience. Businesses remain responsible for their own tax, accounting and legal obligations, and NexBooking does not provide tax or legal advice.",
        ],
      },
    ],
  },
  {
    id: "notes-and-voice",
    title: "Notes, voice and translation",
    body: [
      "Notes and tasks are there to help you organise your day. Where voice or translation features are available, results can contain mistakes, so please review them before relying on them, especially for anything involving money, health or legal matters.",
    ],
  },
  {
    id: "your-content",
    title: "Your content",
    body: [
      "You keep ownership of the content you add, such as profile text, photos and portfolio items. You give NexBooking a non-exclusive licence to host, display and distribute that content to operate and promote the Service.",
      "You are responsible for your content and must have the rights needed to use it.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Using NexBooking responsibly",
    body: [
      "Please do not:",
      {
        list: [
          "Break the law or infringe other people’s rights.",
          "Post content that is false, misleading, abusive or unsafe.",
          "Try to access accounts, data or systems without permission.",
          "Disrupt or overload the Service, or scrape it without permission.",
          "Use the Service to send spam or to harass others.",
        ],
      },
    ],
  },
  {
    id: "our-property",
    title: "Our property",
    body: [
      "NexBooking, including its design, software, illustrations and branding, belongs to us or our licensors. These Terms do not give you any right to use them except to use the Service as intended.",
    ],
  },
  {
    id: "availability",
    title: "Availability",
    body: [
      "We work to keep NexBooking available, but we cannot promise it will always be uninterrupted or error-free. We may suspend or change parts of the Service for maintenance, security or legal reasons.",
    ],
  },
  {
    id: "liability",
    title: "Liability",
    body: [
      "To the extent the law allows, NexBooking is provided “as is”, and we are not liable for indirect or consequential losses, or for the acts or omissions of businesses and other users. Nothing in these Terms limits liability that cannot be limited by law.",
    ],
  },
  {
    id: "ending-use",
    title: "Ending your use",
    body: [
      "You can stop using NexBooking at any time. We may suspend or end access if you break these Terms or put the Service or other people at risk. Provisions that should continue after access ends, such as those about content, liability and payments already made, will continue.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may update these Terms. We will update the date at the top of this page and, for significant changes, tell you in advance where we can. Continuing to use NexBooking after changes take effect means you accept them.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      doc="terms"
      eyebrow="THE GROUND RULES"
      title="Terms of Service"
      description="The simple rules that keep NexBooking fair and useful for customers and businesses alike."
      image="feature-booking-scene.png"
      updated="20 November 2026"
      sections={sections}
    />
  );
}
