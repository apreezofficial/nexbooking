import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

const title = "Third Parties We Use";
const description = "External services involved in running the EdeBooking web preview.";

export const metadata = pageMetadata({ title, description, path: "/third-parties" });

const sections: LegalSection[] = [
  {
    id: "why-we-list-them",
    title: "Why we list these services",
    body: ["Some third parties receive limited information when you use EdeBooking. This list explains who may receive it, what they may receive and why."],
  },
  {
    id: "services",
    title: "Who may receive information",
    body: [{
      list: [
        "Vercel hosts this website. It may receive your IP address and request details to deliver the pages you open.",
        "Independent businesses receive the information you choose to share when you contact them directly, such as your name, contact details or appointment request. They use it to answer you or arrange the service.",
        "Google Fonts supplies the site’s fonts at build time. EdeBooking serves the resulting files, so viewing these fonts does not send your browser requests to Google Fonts.",
      ],
    }],
  },
  {
    id: "demo-integrations",
    title: "Sign-in and checkout in the preview",
    body: ["The Google and Apple sign-in buttons and payment flows are demos. These flows do not send your sign-in details to Google or Apple or submit a payment to a processor."],
  },
];

export default function Page() {
  return <LegalPage doc="third-parties" eyebrow="LEGAL" title={title} description={description} image="business-studio.png" updated="27 November 2026" sections={sections} />;
}
