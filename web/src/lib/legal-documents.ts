export type LegalKey = "privacy" | "terms" | "cookies" | "data-protection" | "third-parties" | "acceptable-use";

export const documents: Record<LegalKey, { label: string; href: string; summary: string }> = {
  "data-protection": { label: "Data Protection", href: "/data-protection", summary: "Your data rights and how to make a request." },
  "third-parties": { label: "Third Parties We Use", href: "/third-parties", summary: "External services used by EdeBooking." },
  "acceptable-use": { label: "Acceptable Use & Guidelines", href: "/acceptable-use", summary: "Standards for safe and fair use." },
  privacy: { label: "Privacy Policy", href: "/privacy", summary: "How we handle your information." },
  terms: { label: "Terms of Service", href: "/terms", summary: "The rules for using EdeBooking." },
  cookies: { label: "Cookie Policy", href: "/cookies", summary: "What your browser stores, and why." },
};

