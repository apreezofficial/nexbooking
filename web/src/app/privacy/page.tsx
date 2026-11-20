import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How NexBooking collects, uses, shares and protects your information, and the choices and rights you have as a customer or a business.",
  path: "/privacy",
});

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "NexBooking helps people discover businesses, book services and keep track of payments, and it helps businesses manage their profiles, appointments, notes and records. This policy explains what information we collect, how we use it and the choices you have. It covers the NexBooking website and app, which we call the “Service”.",
      "NexBooking is a multi-tenant platform: many businesses share one platform, each with its own space. When you book with a business, that business also receives and uses your booking information to deliver its service.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: [
      "We collect information in three ways.",
      {
        list: [
          "Information you give us, such as your name, contact details, account credentials, booking requests, messages to us, and anything you add to a profile, like services, photos and portfolio items.",
          "Records created as you use NexBooking, including bookings, consultations, payment records, proforma invoices and receipts, plus the notes and tasks you create.",
          "Technical information, such as your device and browser type, the pages you visit, basic diagnostic data and the preferences you set, for example your chosen currency.",
        ],
      },
      "Voice notes and audio translation are planned features. If you use them once available, we will process the audio you provide to turn it into text, and we will explain how it is handled at that point.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use information",
    body: [
      "We use information to:",
      {
        list: [
          "Provide and run the Service, including accounts, bookings, payments and receipts.",
          "Show businesses and their portfolios to people who are discovering services.",
          "Send confirmations, reminders and other messages about your account and bookings.",
          "Keep the Service secure, prevent misuse and fix problems.",
          "Understand how the Service is used so we can improve it.",
          "Meet our legal obligations.",
        ],
      },
    ],
  },
  {
    id: "business-spaces",
    title: "Businesses on NexBooking",
    body: [
      "Businesses decide which services, prices and policies they offer. When you book, the business can see the details it needs to deliver the service, such as your name, contact information and your booking history with that business.",
      "Each business is responsible for how it uses the information it receives from its own customers, so please read its own privacy information where it provides one. Information on public business profiles, such as services and portfolio items, may be visible to anyone using NexBooking.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    body: [
      "We share personal information only as described here:",
      {
        list: [
          "With the business you book or contact, so it can provide its service.",
          "With service providers that help us run NexBooking, for example hosting, payment processing, messaging and customer support, under appropriate safeguards.",
          "When the law requires it, or to protect the rights, safety and integrity of people and the Service.",
          "As part of a business change such as a merger or sale, with notice where required.",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: [
      "We keep information for as long as your account is active and as long as we need it to provide the Service, resolve disputes and meet legal, tax and accounting duties, such as retaining invoices and receipts. When information is no longer needed, we delete or anonymise it.",
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, delete or export your personal information, to object to or restrict certain uses, and to withdraw consent where we rely on it.",
      "To make a request, contact us through the Contact page. We may need to confirm your identity first. If a business holds your booking records, we may direct your request to that business.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "We use reasonable technical and organisational measures to protect information. No online service is completely secure, so please use a strong, unique password and tell us promptly if you think your account has been affected.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "NexBooking is not intended for anyone under 18, and we do not knowingly collect personal information from children. If you believe a child has given us information, please contact us and we will take appropriate steps.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy as NexBooking grows. When we make a significant change we will update the date at the top of this page and, where appropriate, let you know in the app or by email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      doc="privacy"
      eyebrow="YOUR INFORMATION"
      title="Privacy Policy"
      description="A plain-language look at what we collect, why we collect it and the choices you have."
      image="discover-landscape.png"
      updated="20 November 2026"
      sections={sections}
    />
  );
}
