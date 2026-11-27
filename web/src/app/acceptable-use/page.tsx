import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

const title = "Acceptable Use & Guidelines";
const description = "Standards for customers, providers and staff using EdeBooking.";

export const metadata = pageMetadata({ title, description, path: "/acceptable-use" });

const sections: LegalSection[] = [
  {
    id: "accounts",
    title: "Account and booking conduct",
    body: ["Use accurate account and booking details. Keep credentials private, use only accounts you are authorised to access and communicate promptly about cancellations or changes."],
  },
  {
    id: "content",
    title: "Listings, reviews and messages",
    body: ["Keep listings accurate and post only material you have permission to share. Reviews should reflect your own experience. Do not impersonate others, post fake reviews, send spam, harass people or publish private information without permission."],
  },
  {
    id: "businesses",
    title: "Responsibilities for businesses",
    body: ["Describe your prices, availability and cancellation policies clearly. Give staff access only as needed and use customer information for the service the customer requested, unless another use is properly authorised."],
  },
  {
    id: "misuse",
    title: "Report misuse",
    body: ["Do not attempt to bypass access controls, interfere with the platform or collect other users’ data without authorisation. Report misuse through the Contact link below and include the relevant listing, booking reference or message."],
  },
];

export default function Page() {
  return <LegalPage doc="acceptable-use" eyebrow="LEGAL" title={title} description={description} image="business-studio.png" updated="27 November 2026" sections={sections} />;
}
