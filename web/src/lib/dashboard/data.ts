import type { AppNotification, BookingFlow, ChatMessage, Note, PaymentMethod, PaymentMethodId, Proforma, Receipt, Review, Settings, Studio, StudioService } from "./types";

/**
 * Sample content for the customer dashboard, taken from the customer mobile app so both show the same thing.
 * Replace with backend responses (see api.ts). Photos are Pexels samples, see /dashboard/photos/SOURCES.md.
 */

const photo = (name: string) => `/dashboard/photos/${name}.jpg`;
const WORKS = ["hair-service", "hair-wash", "hair-cut", "salon-blowdry", "salon-portrait", "salon-styling"].map(photo);

export const studios: Studio[] = [
  { id: "glow-studio", name: "Glow Studio", category: "Hair & Beauty", services: "silk press, wash, styling", distance: "1.2 km", rating: "4.9", reviews: 128, area: "Lekki, Lagos", verified: true, monogram: "GS", photo: photo("salon-styling"), works: WORKS, about: "A friendly hair and beauty studio in Lekki. Silk press, wash and styling by a small, experienced team." },
  { id: "silk-and-co", name: "Silk & Co Salon", category: "Hair", services: "silk press, silk wrap", distance: "3.4 km", rating: "4.7", reviews: 86, area: "Victoria Island, Lagos", verified: true, monogram: "SC", photo: photo("hair-service"), works: WORKS, about: "A hair salon known for silk presses and silk wraps." },
  { id: "zara-nails", name: "Zara Nails", category: "Nails", services: "manicure, nail art", distance: "2.1 km", rating: "4.8", reviews: 94, area: "Ikeja, Lagos", verified: true, monogram: "ZN", photo: photo("salon-portrait"), works: WORKS, about: "Manicures and nail art with a clean, calm space." },
  { id: "kemi-cuts", name: "Kemi Cuts", category: "Hair", services: "braids, haircuts", distance: "2.8 km", rating: "4.8", reviews: 71, area: "Lekki, Lagos", verified: false, monogram: "KC", photo: photo("hair-cut"), works: WORKS, about: "Braids and haircuts, booked by the hour." },
  { id: "lagos-lens", name: "Lagos Lens", category: "Photography", services: "portrait, photo session", distance: "4.0 km", rating: "4.6", reviews: 52, area: "Victoria Island, Lagos", verified: false, monogram: "LL", photo: photo("salon-blowdry"), works: WORKS, about: "Portrait and photo sessions in studio or on location." },
];

export const studioById = (id: string) => studios.find((studio) => studio.id === id) ?? studios[0];
export const studioByName = (name: string) => studios.find((studio) => studio.name === name);

export const servicesByStudio: Record<string, StudioService[]> = {
  "glow-studio": [
    { id: "silk-press", name: "Silk press & trim", detail: "90 min · Wash, press and trim", minutes: 90, price: 25000 },
    { id: "wash-style", name: "Wash & style", detail: "60 min · Wash, blow-dry, style", minutes: 60, price: 12000 },
    { id: "knotless-braids", name: "Knotless braids", detail: "4 hrs · Medium length", minutes: 240, price: 45000 },
  ],
  "silk-and-co": [
    { id: "silk-press", name: "Silk press", detail: "90 min · Wash and press", minutes: 90, price: 22000 },
    { id: "silk-wrap", name: "Silk wrap", detail: "60 min · Wrap and style", minutes: 60, price: 15000 },
  ],
  "zara-nails": [
    { id: "manicure", name: "Classic manicure", detail: "45 min · Shape, cuticle care, polish", minutes: 45, price: 8000 },
    { id: "nail-art", name: "Nail art", detail: "75 min · Design of your choice", minutes: 75, price: 14000 },
  ],
  "kemi-cuts": [
    { id: "braids", name: "Braids", detail: "3 hrs · Medium length", minutes: 180, price: 35000 },
    { id: "haircut", name: "Haircut", detail: "45 min · Cut and finish", minutes: 45, price: 7000 },
  ],
  "lagos-lens": [
    { id: "portrait", name: "Portrait session", detail: "60 min · 15 edited photos", minutes: 60, price: 40000 },
    { id: "photo-session", name: "Photo session", detail: "2 hrs · 30 edited photos", minutes: 120, price: 70000 },
  ],
};

export const staffOptions = ["Any", "Amaka", "Tolu", "Bisi"];
export const dayParts = [
  { part: "Morning", times: ["09:00", "10:30", "11:30"] },
  { part: "Afternoon", times: ["13:00", "14:30", "16:00"] },
  { part: "Evening", times: ["17:30", "18:30", "19:30"] },
];

export const VAT_RATE = 0.075;
export const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export const categories = ["All", "Hair", "Nails", "Barber", "Photo", "Fitness"];
export const homeCategories = ["All", "Hair", "Nails", "Photo", "Fitness"];
export const locations = ["Lekki, Lagos", "Victoria Island, Lagos", "Ikeja, Lagos"];
export const interests = ["Hair", "Nails", "Makeup", "Barber", "Photography", "Fitness", "Spa", "Tutoring", "Tailoring", "Events"];
export const searchSuggestions = ["silk press", "nails", "braids"];
export const languages = ["English", "Nigerian Pidgin", "Yorùbá", "Igbo", "Hausa", "Français"];

export const paymentMethodOptions: { id: PaymentMethodId; label: string; note: string }[] = [
  { id: "card", label: "Debit / credit card", note: "Secure demo card checkout" },
  { id: "transfer", label: "Transfer", note: "Simulated bank transfer" },
  { id: "apple", label: "Apple Pay", note: "Simulated Apple Pay wallet" },
  { id: "google", label: "Google Pay", note: "Simulated Google Pay wallet" },
];

export const cancelReasons = ["Change of plans", "Found another provider", "Booked by mistake", "Other"];
export const reviewTags = ["On time", "Great service", "Clean space", "Good value", "Friendly"];
export const reminderOptions = ["At time of task", "10 minutes before", "30 minutes before", "1 hour before", "1 day before"];
export const repeatOptions = ["Never", "Daily", "Weekly", "Monthly"] as const;

export const helpTopics = [
  { icon: "calendar", label: "Bookings" },
  { icon: "card", label: "Payments & refunds" },
  { icon: "chat", label: "Consultations" },
  { icon: "user", label: "Account" },
];
export const faqs: { q: string; a: string }[] = [
  { q: "How do I reschedule a booking?", a: "Open the booking in Schedule and tap Reschedule. Changes are free until 24 hours before your appointment." },
  { q: "When will I get my refund?", a: "Refunds usually return to your original payment method within 3–5 business days." },
  { q: "How do I join a video session?", a: "Open your confirmed booking and tap Join consultation at the scheduled time." },
  { q: "How do I use voice tasks?", a: "Open Notes and tap the microphone to dictate a task." },
];

export const voiceTasks = ["Buy a gift for Ada", "Book a haircut", "Pay the electricity bill", "Call the supplier"];

export const defaultSettings: Settings = {
  language: "English",
  notifications: { "Booking updates": true, Reminders: true, Messages: true, Promotions: false, "Receipts and invoices": true, Newsletter: false, "Appointment reminders": true },
  twoFactor: false,
  biometric: true,
  reminderTiming: "30 minutes before",
};

export const seedReceipts: Receipt[] = [
  { ref: "RC-2026-0418", studioId: "glow-studio", studio: "Glow Studio", date: "18 Nov", paidAt: "Paid 17 Nov 2026 · 9:41 AM", service: "Silk press & trim", staff: "Amaka", appointment: "Wed 18 Nov · 13:00", paidWith: "Card •••• 4417", transaction: "txn_••••8F2A", subtotal: 25000, vat: 1875, total: 26875, status: "Paid" },
  { ref: "RC-2026-0407", studioId: "zara-nails", studio: "Zara Nails", date: "10 Nov", paidAt: "Paid 9 Nov 2026 · 4:12 PM", service: "Classic manicure", staff: "Any", appointment: "Tue 10 Nov · 11:30", paidWith: "Card •••• 4417", transaction: "txn_••••2C71", subtotal: 12000, vat: 900, total: 12900, status: "Paid" },
  { ref: "RC-2026-0388", studioId: "kemi-cuts", studio: "Kemi Cuts", date: "28 Oct", paidAt: "Paid 27 Oct 2026 · 6:03 PM", service: "Braids", staff: "Tolu", appointment: "Wed 28 Oct · 10:30", paidWith: "Card •••• 4417", transaction: "txn_••••90AD", subtotal: 45000, vat: 3375, total: 48375, status: "Paid" },
  { ref: "RC-2026-0361", studioId: "glow-studio", studio: "Glow Studio", date: "15 Oct", paidAt: "Paid 14 Oct 2026 · 2:20 PM", service: "Silk press & trim", staff: "Bisi", appointment: "Thu 15 Oct · 14:30", paidWith: "Card •••• 4417", transaction: "txn_••••5E10", subtotal: 25000, vat: 1875, total: 26875, status: "Refunded" },
];

export const seedProformas: Proforma[] = [
  { ref: "PF-2026-0418", studio: "Glow Studio", date: "18 Nov", total: 26875, status: "Paid" },
  { ref: "PF-2026-0431", studio: "Zara Nails", date: "21 Nov", total: 14190, status: "Open" },
];

export const seedReviews: Review[] = [
  { id: "r1", studioId: "kemi-cuts", studio: "Kemi Cuts", rating: 4, tags: ["Great service"], text: "Neat braids and great communication. Will book again.", date: "28 Oct" },
  { id: "r2", studioId: "glow-studio", studio: "Glow Studio", rating: 4, tags: ["Friendly"], text: "Lovely studio and friendly team. Started a little late.", date: "15 Oct" },
];

export const seedPaymentMethods: PaymentMethod[] = [{ id: "pm1", label: "Debit / credit card", detail: "•••• 4417 · Expires 08/28", isDefault: true }];

export const seedNotifications: AppNotification[] = [
  { id: "n1", kind: "Bookings", title: "Booking confirmed", detail: "Glow Studio · Wed 18 Nov", read: false },
  { id: "n2", kind: "Payments", title: "Payment received", detail: "Glow Studio · Wed 18 Nov", read: false },
  { id: "n3", kind: "Bookings", title: "Reminder", detail: "Glow Studio · Wed 18 Nov", read: true },
  { id: "n4", kind: "Bookings", title: "New message from Kemi Cuts", detail: "Glow Studio · Wed 18 Nov", read: true },
  { id: "n5", kind: "Offers", title: "20% off your first booking", detail: "Glow Studio · Wed 18 Nov", read: true },
];

export const seedThreads: Record<string, ChatMessage[]> = {
  "glow-studio": [
    { id: "m1", from: "studio", text: "Hi! Your slot for Wed at 1:00 PM is confirmed.", at: "Today" },
    { id: "m2", from: "me", text: "Thanks! Can I bring a reference photo?", at: "Today" },
    { id: "m3", from: "studio", text: "Of course, send it here.", at: "Today" },
  ],
  "kemi-cuts": [{ id: "m4", from: "studio", text: "Of course, send it here.", at: "Today" }],
  "zara-nails": [{ id: "m5", from: "studio", text: "Of course, send it here.", at: "Today" }],
  "lagos-lens": [{ id: "m6", from: "studio", text: "Of course, send it here.", at: "Today" }],
  fitlab: [{ id: "m7", from: "studio", text: "Of course, send it here.", at: "Today" }],
};
export const inboxThreads = [
  { id: "glow-studio", name: "Glow Studio" },
  { id: "kemi-cuts", name: "Kemi Cuts" },
  { id: "zara-nails", name: "Zara Nails" },
  { id: "lagos-lens", name: "Lagos Lens" },
  { id: "fitlab", name: "FitLab" },
];

export const seedNotes: Note[] = [];

export const emptyFlow: BookingFlow = { studioId: "glow-studio", serviceId: "silk-press", staff: "Amaka", date: "", time: "13:00", promo: "", method: "card" };

/** Sample bookings shown the first time a customer opens the dashboard (the same three the app shows in Schedule). */
export const seedBookings = [
  { code: "EB-GS-1801", title: "Silk press & trim", provider: "Glow Studio", date: "", time: "13:00", guests: "1", total: "₦26,875", status: "Confirmed" as const, studioId: "glow-studio", staff: "Amaka", venue: "In person", reschedulePolicy: "flexible" as const },
  { code: "EB-GS-1802", title: "Knotless braids", provider: "Glow Studio", date: "", time: "13:00", guests: "1", total: "₦48,375", status: "Pending" as const, studioId: "glow-studio", staff: "Tolu", venue: "In person", reschedulePolicy: "flexible" as const },
  { code: "EB-GS-1803", title: "Wash & style", provider: "Glow Studio", date: "", time: "13:00", guests: "1", total: "₦12,900", status: "Confirmed" as const, studioId: "glow-studio", staff: "Bisi", venue: "In person", reschedulePolicy: "flexible" as const },
];
