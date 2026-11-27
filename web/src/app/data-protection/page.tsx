import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

const title = "Data Protection";
const description = "How to exercise your rights and protect your information.";

export const metadata = pageMetadata({ title, description, path: "/data-protection" });

const sections: LegalSection[] = [
  {
    id: "your-rights",
    title: "Your data rights",
    body: ["Depending on applicable law, you can ask to access, correct, delete or receive a copy of your personal information. You may also be able to object to or restrict certain uses or withdraw consent where we rely on it."],
  },
  {
    id: "requests",
    title: "Making a request",
    body: ["Use the Contact link below. Include the email associated with your account and explain what you want us to do. We may need to verify your identity. Do not include passwords, payment details or identity documents in your initial message."],
  },
  {
    id: "business-records",
    title: "Records held by businesses",
    body: ["If a business holds your appointment records independently, contact that business about its use of those records. For information held by EdeBooking, contact us directly."],
  },
  {
    id: "incidents",
    title: "Reporting a concern",
    body: ["If you suspect someone accessed your account or exposed personal information, contact us with the relevant dates and details. Where applicable, you can also raise a complaint with your data protection authority."],
  },
];

export default function Page() {
  return <LegalPage doc="data-protection" eyebrow="LEGAL" title={title} description={description} image="business-studio.png" updated="27 November 2026" sections={sections} />;
}
