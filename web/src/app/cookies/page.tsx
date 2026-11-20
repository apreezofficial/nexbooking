import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "What EdeBooking stores in your browser, such as your cookie choice and preferred currency, why it does so, and how you can change, block or clear it.",
  path: "/cookies",
});

const sections: LegalSection[] = [
  {
    id: "what-they-are",
    title: "What cookies are",
    body: [
      "Cookies are small files stored on your device. Similar technologies, such as your browser’s local storage, do the same job. They help websites remember your choices and work properly.",
    ],
  },
  {
    id: "what-we-use",
    title: "What EdeBooking uses",
    body: [
      "We keep this to a minimum:",
      {
        list: [
          "Essential: we save your cookie preference so we can respect your choice on future visits.",
          "Preferences: if you allow preference storage, your chosen currency is saved in your browser’s local storage so it is remembered next time. It stays on your device.",
          "Analytics and advertising: we do not currently use analytics or advertising cookies. If that changes, we will update this page and ask for your consent where the law requires it.",
        ],
      },
    ],
  },
  {
    id: "third-parties",
    title: "Third parties",
    body: [
      "Parts of the Service may rely on third parties, for example payment providers once payments are available. They may set their own cookies, which are governed by their own policies.",
    ],
  },
  {
    id: "your-controls",
    title: "Managing cookies",
    body: [
      "Use the Cookie settings button at the bottom of any page to change your choice. Choosing Essential only also removes your saved currency. You can block or delete cookies and clear local storage in your browser settings. Doing so may reset your preferences, such as your currency, and some features may not work as expected. Your browser’s help pages explain how.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We will update this page, and the date at the top, if the way we use cookies changes.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      doc="cookies"
      eyebrow="WHAT WE STORE"
      title="Cookie Policy"
      description="A short guide to what your browser keeps for EdeBooking, and how to stay in control of it."
      image="feature-notes-scene.png"
      updated="20 November 2026"
      sections={sections}
    />
  );
}
