"use client";

/**
 * THE REQUEST LAYER.
 *
 * Every action the customer mobile app can make is one function here, grouped by area. Screens call
 * these and never touch storage directly. Today each function reads and writes browser storage, so
 * the dashboard works end to end as a demo. To connect a backend, replace the body of a function
 * with a fetch to the endpoint named in its comment: the arguments and return types are the contract.
 *
 * Every function is async and may throw ApiError with a message that is safe to show the customer.
 */

import { readBookings, readSession, replaceBookings, signOut, type BookingItem } from "@/lib/session";
import {
  defaultSettings, emptyFlow, faqs, inboxThreads, naira, seedBookings, seedNotifications, seedPaymentMethods,
  seedProformas, seedReceipts, seedReviews, seedThreads, servicesByStudio, studioById, studios, VAT_RATE, voiceTasks,
} from "./data";
import { addDays, readJson, writeKey } from "./store";
import type { AppNotification, BookingFlow, ChatMessage, Note, PaymentMethod, PaymentMethodId, Profile, Proforma, Receipt, Review, Settings, Studio, StudioService } from "./types";

export class ApiError extends Error {}

const latency = (ms = 140) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;
const hoursUntil = (date: string) => (new Date(`${date}T12:00:00`).getTime() - Date.now()) / 36e5;
const PROMO_CODES: Record<string, number> = { WELCOME20: 0.2 };

export type Quote = { service: StudioService; subtotal: number; discount: number; vat: number; total: number; promoApplied: boolean };
export type SearchFilters = { query?: string; category?: string; maxKm?: number; minRating?: number; verifiedOnly?: boolean };
export type CreatedBooking = { booking: BookingItem; receipt: Receipt; proforma: Proforma };

const load = <T,>(name: string, fallback: T) => readJson<T>(name, fallback);
const save = <T,>(name: string, value: T) => writeKey(name, value);

// ───────────────────────── Session and first-run content ─────────────────────────

/**
 * Called once when the dashboard opens. Fills the dashboard with the same sample content the app shows,
 * so a new login is not empty. Real accounts will not need this.
 */
export async function bootstrap(): Promise<void> {
  const session = readSession();
  if (!session || load<boolean>("seeded", false)) return;
  const today = todayIso();
  save<Profile>("profile", { name: session.name, email: session.email, phone: "", location: "Lekki, Lagos", interests: [] });
  save("settings", defaultSettings);
  save("receipts", seedReceipts);
  save("proformas", seedProformas);
  save("reviews", seedReviews);
  save("payment-methods", seedPaymentMethods);
  save("notifications", seedNotifications);
  save("threads", seedThreads);
  save("flow", emptyFlow);
  if (readBookings().length === 0) {
    replaceBookings(seedBookings.map((booking, index) => ({ ...booking, date: addDays(today, [2, 5, 9][index]) })));
  }
  save("seeded", true);
}

// ───────────────────────── auth ─────────────────────────
export const auth = {
  /** POST /auth/logout */
  async logout() {
    await latency(60);
    signOut();
  },
  /** POST /auth/password/forgot  { email } */
  async forgotPassword(email: string) {
    await latency();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new ApiError("Enter a valid email address first.");
    return { sent: true };
  },
};

// ───────────────────────── profile and location ─────────────────────────
export const profile = {
  /** GET /me */
  async get(): Promise<Profile> {
    const session = readSession();
    return load<Profile>("profile", { name: session?.name ?? "", email: session?.email ?? "", phone: "", location: "Lekki, Lagos", interests: [] });
  },
  /** PATCH /me  { name, email, phone, location, interests } */
  async update(changes: Partial<Profile>): Promise<Profile> {
    await latency();
    if (changes.name !== undefined && !changes.name.trim()) throw new ApiError("Enter your full name.");
    if (changes.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email.trim())) throw new ApiError("Enter a valid email address.");
    const next = { ...(await profile.get()), ...changes };
    save("profile", next);
    return next;
  },
  /** POST /me/photo  (multipart) */
  async changePhoto(): Promise<never> {
    throw new ApiError("Photo upload is ready to connect to file storage.");
  },
  /** POST /me/location/detect  { latitude, longitude } */
  async detectLocation(): Promise<never> {
    throw new ApiError("Location permission and geocoding are not configured yet.");
  },
};

// ───────────────────────── discovery ─────────────────────────
export const discovery = {
  /** GET /studios?query=&category=&maxKm=&minRating=&verified= */
  async search(filters: SearchFilters = {}): Promise<Studio[]> {
    await latency(80);
    const q = filters.query?.trim().toLowerCase() ?? "";
    return studios.filter((studio) => {
      if (q && !`${studio.name} ${studio.category} ${studio.services}`.toLowerCase().includes(q)) return false;
      if (filters.category && filters.category !== "All" && !studio.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.maxKm && parseFloat(studio.distance) > filters.maxKm) return false;
      if (filters.minRating && parseFloat(studio.rating) < filters.minRating) return false;
      if (filters.verifiedOnly && !studio.verified) return false;
      return true;
    });
  },
  /** GET /studios/popular?near= */
  async popular() {
    return studios.slice(0, 4);
  },
  /** GET /studios/top-rated */
  async topRated() {
    return [...studios].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 2);
  },
};

// ───────────────────────── studios ─────────────────────────
export const studio = {
  /** GET /studios/:id */
  async get(id: string) {
    return studioById(id);
  },
  /** GET /studios/:id/services */
  async services(id: string): Promise<StudioService[]> {
    return servicesByStudio[id] ?? servicesByStudio["glow-studio"];
  },
  /** PUT/DELETE /me/saved/:id */
  async toggleSaved(id: string) {
    const saved = load<Record<string, boolean>>("saved", {});
    save("saved", { ...saved, [id]: !saved[id] });
  },
  /** PUT/DELETE /me/following/:id */
  async toggleFollow(id: string) {
    const following = load<Record<string, boolean>>("following", {});
    save("following", { ...following, [id]: !following[id] });
  },
};

// ───────────────────────── booking flow ─────────────────────────
export const booking = {
  /** POST /bookings/quote  { studioId, serviceId, promo } */
  async quote(studioId: string, serviceId: string, promo = ""): Promise<Quote> {
    const service = (servicesByStudio[studioId] ?? servicesByStudio["glow-studio"]).find((item) => item.id === serviceId);
    if (!service) throw new ApiError("That service is no longer available.");
    const rate = PROMO_CODES[promo.trim().toUpperCase()] ?? 0;
    if (promo.trim() && !rate) throw new ApiError("That promo code is not valid.");
    const discount = Math.round(service.price * rate);
    const subtotal = service.price - discount;
    const vat = Math.round(subtotal * VAT_RATE);
    return { service, subtotal, discount, vat, total: subtotal + vat, promoApplied: rate > 0 };
  },
  /** POST /bookings/hold  { studioId, serviceId, date, time }   (holds the slot for 10 minutes) */
  async holdSlot() {
    return { minutes: 10 };
  },
  /** POST /bookings  { ...BookingFlow, payment }  → creates the booking, charges, issues the receipt */
  async create(flow: BookingFlow, card?: { holder: string; number: string; expiry: string; cvc: string }): Promise<CreatedBooking> {
    await latency(600);
    if (!flow.date || !flow.time) throw new ApiError("Choose a date and time first.");
    if (flow.method === "card" && card) {
      if (!card.holder.trim() || card.number.replace(/\D/g, "").length < 12 || !/^\d{2}\/\d{2}$/.test(card.expiry) || card.cvc.replace(/\D/g, "").length < 3) {
        throw new ApiError("Enter valid demo card details to continue.");
      }
    }
    const quote = await booking.quote(flow.studioId, flow.serviceId, flow.promo);
    const studioRecord = studioById(flow.studioId);
    const bookings = readBookings();
    const code = `EB-${studioRecord.monogram}-${1800 + bookings.length + 1}`;
    const receipts = load<Receipt[]>("receipts", seedReceipts);
    const ref = `RC-2026-${String(418 + receipts.length + 1).padStart(4, "0")}`;
    const paidWith = flow.method === "card" ? `Card •••• ${(card?.number.replace(/\D/g, "").slice(-4) || "4417")}` : { transfer: "Bank transfer", apple: "Apple Pay", google: "Google Pay", card: "Card" }[flow.method as PaymentMethodId];
    const newBooking: BookingItem = {
      code, title: quote.service.name, provider: studioRecord.name, date: flow.date, time: flow.time, guests: "1", total: naira(quote.total),
      status: "Confirmed", studioId: flow.studioId, staff: flow.staff, venue: "In person", paidWith, receiptRef: ref, reschedulePolicy: "flexible",
    };
    replaceBookings([newBooking, ...bookings]);
    const receipt: Receipt = {
      ref, studioId: flow.studioId, studio: studioRecord.name, date: new Date(`${flow.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), paidAt: `Paid ${new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}`,
      service: quote.service.name, staff: flow.staff, appointment: `${flow.date} · ${flow.time}`, paidWith, transaction: `txn_••••${uid("").slice(0, 4).toUpperCase()}`,
      subtotal: quote.subtotal, vat: quote.vat, total: quote.total, status: "Paid",
    };
    save("receipts", [receipt, ...receipts]);
    const proforma: Proforma = { ref: `PF-2026-${ref.slice(-4)}`, studio: studioRecord.name, date: flow.date, total: quote.total, status: "Paid" };
    save("proformas", [proforma, ...load<Proforma[]>("proformas", seedProformas)]);
    save("flow", emptyFlow);
    return { booking: newBooking, receipt, proforma };
  },
};

// ───────────────────────── bookings ─────────────────────────
export const bookings = {
  /** GET /bookings?status=upcoming|past|cancelled */
  async list(status: "Upcoming" | "Past" | "Cancelled" = "Upcoming") {
    const today = todayIso();
    return readBookings().filter((item) => {
      if (status === "Cancelled") return item.status === "Cancelled";
      if (item.status === "Cancelled") return false;
      return status === "Past" ? item.date < today : item.date >= today;
    });
  },
  /** GET /bookings/:code */
  async get(code: string) {
    return readBookings().find((item) => item.code === code) ?? null;
  },
  /** POST /bookings/:code/reschedule  { date, time, reason } */
  async reschedule(code: string, date: string, time: string, reason = "") {
    await latency();
    const current = readBookings().find((item) => item.code === code);
    if (!current) throw new ApiError("We could not find that booking.");
    const instant = hoursUntil(current.date) >= 24;
    replaceBookings(readBookings().map((item) => item.code !== code ? item : instant
      ? { ...item, date, time, rescheduleStatus: "approved" as const }
      : { ...item, rescheduleStatus: "pending_vendor" as const, rescheduleRequestedDate: date, rescheduleRequestedTime: time }));
    void reason;
    return { instant };
  },
  /** POST /bookings/:code/cancel  { reason, note }  → refund details */
  async cancel(code: string, reason: string, note = "") {
    await latency();
    const current = readBookings().find((item) => item.code === code);
    if (!current) throw new ApiError("We could not find that booking.");
    const full = hoursUntil(current.date) >= 24;
    const refund = full ? current.total : "";
    replaceBookings(readBookings().map((item) => item.code === code ? { ...item, status: "Cancelled" as const, cancelReason: note ? `${reason}: ${note}` : reason, refund } : item));
    if (full && current.receiptRef) {
      save("receipts", load<Receipt[]>("receipts", seedReceipts).map((r) => r.ref === current.receiptRef ? { ...r, status: "Refunded" as const } : r));
    }
    return { refund, full };
  },
  /** POST /consultations/:code/join  → { roomUrl, token } */
  async joinConsultation(code: string) {
    const item = readBookings().find((entry) => entry.code === code);
    return { code, studio: item?.provider ?? "Glow Studio", staff: item?.staff ?? "Amaka", topic: item?.title ?? "Consult" };
  },
};

// ───────────────────────── reviews ─────────────────────────
export const reviews = {
  /** GET /me/reviews */
  async list() {
    return load<Review[]>("reviews", seedReviews);
  },
  /** POST /reviews  { studioId, rating, tags, text } */
  async create(input: Omit<Review, "id" | "date" | "studio">) {
    await latency();
    if (input.rating < 1) throw new ApiError("Choose a star rating.");
    const review: Review = { ...input, id: uid("r"), studio: studioById(input.studioId).name, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }) };
    save("reviews", [review, ...load<Review[]>("reviews", seedReviews)]);
    return review;
  },
  /** PATCH /reviews/:id */
  async update(id: string, changes: Partial<Review>) {
    await latency();
    save("reviews", load<Review[]>("reviews", seedReviews).map((r) => (r.id === id ? { ...r, ...changes } : r)));
  },
  /** DELETE /reviews/:id */
  async remove(id: string) {
    await latency();
    save("reviews", load<Review[]>("reviews", seedReviews).filter((r) => r.id !== id));
  },
};

// ───────────────────────── billing ─────────────────────────
export const billing = {
  /** GET /me/receipts */
  async receipts() {
    return load<Receipt[]>("receipts", seedReceipts);
  },
  /** GET /me/receipts/:ref */
  async receipt(ref: string) {
    return load<Receipt[]>("receipts", seedReceipts).find((r) => r.ref === ref) ?? null;
  },
  /** GET /me/proformas */
  async proformas() {
    return load<Proforma[]>("proformas", seedProformas);
  },
  /** GET /me/receipts/:ref/pdf  → file */
  async downloadReceipt(receipt: Receipt) {
    const body = [
      `EdeBooking receipt ${receipt.ref}`, "", `Studio: ${receipt.studio}`, `Service: ${receipt.service}`, `Staff: ${receipt.staff}`,
      `Appointment: ${receipt.appointment}`, `Paid with: ${receipt.paidWith}`, `Transaction: ${receipt.transaction}`, "",
      `Subtotal: ${naira(receipt.subtotal)}`, `VAT (7.5%): ${naira(receipt.vat)}`, `Total: ${naira(receipt.total)}`, `Status: ${receipt.status}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.ref}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  },
  /** GET /me/receipts/export  → one PDF of every receipt */
  async downloadAll(list: Receipt[]) {
    const body = list.map((r) => `${r.ref} · ${r.studio} · ${r.date} · ${naira(r.total)} · ${r.status}`).join("\n");
    const url = URL.createObjectURL(new Blob([`EdeBooking receipts\n\n${body}\n`], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "edebooking-receipts.txt";
    link.click();
    URL.revokeObjectURL(url);
  },
  /** GET /me/payment-methods */
  async paymentMethods() {
    return load<PaymentMethod[]>("payment-methods", seedPaymentMethods);
  },
  addDemoCard(brand: "Visa" | "Mastercard") {
    const methods = load<PaymentMethod[]>("payment-methods", seedPaymentMethods);
    const id = `demo-${brand.toLowerCase()}`;
    if (methods.some(method => method.id === id)) return;
    const lastFour = brand === "Visa" ? "4242" : "4444";
    save("payment-methods", [...methods, { id, label: `${brand} demo card`, detail: `•••• ${lastFour}`, isDefault: methods.length === 0 }]);
  },
  setDefaultPaymentMethod(id: string) {
    const methods = load<PaymentMethod[]>("payment-methods", seedPaymentMethods);
    if (!methods.some(method => method.id === id)) return;
    save("payment-methods", methods.map(method => ({ ...method, isDefault: method.id === id })));
  },
};

// ───────────────────────── messages ─────────────────────────
export const messages = {
  /** GET /messages/threads */
  async threads() {
    const all = load<Record<string, ChatMessage[]>>("threads", seedThreads);
    return inboxThreads.map((thread) => ({ ...thread, last: all[thread.id]?.at(-1)?.text ?? "" }));
  },
  /** GET /messages/threads/:id */
  async thread(id: string) {
    return load<Record<string, ChatMessage[]>>("threads", seedThreads)[id] ?? [];
  },
  /** POST /messages/threads/:id  { text } */
  async send(id: string, text: string) {
    if (!text.trim()) return;
    const all = load<Record<string, ChatMessage[]>>("threads", seedThreads);
    save("threads", { ...all, [id]: [...(all[id] ?? []), { id: uid("m"), from: "me", text: text.trim(), at: "Now" }] });
  },
  /** POST /messages/threads/:id/attachments  (multipart) */
  async attach(): Promise<never> {
    throw new ApiError("Attachments need a file picker integration.");
  },
};

// ───────────────────────── notes and voice tasks ─────────────────────────
export const notes = {
  /** GET /me/notes */
  async list() {
    return load<Note[]>("notes", []);
  },
  /** POST /me/notes */
  async create(input: Omit<Note, "id" | "done">) {
    await latency(80);
    if (!input.task.trim()) throw new ApiError("Add a task first.");
    save("notes", [{ ...input, id: uid("t"), done: false }, ...load<Note[]>("notes", [])]);
  },
  /** PATCH /me/notes/:id */
  async toggle(id: string) {
    save("notes", load<Note[]>("notes", []).map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  },
  /** DELETE /me/notes/:id */
  async remove(id: string) {
    save("notes", load<Note[]>("notes", []).filter((n) => n.id !== id));
  },
  /** POST /me/notes/voice  (audio) → tasks found in the recording */
  async fromVoice(): Promise<string[]> {
    await latency(700);
    return voiceTasks;
  },
};

// ───────────────────────── notifications and settings ─────────────────────────
export const notifications = {
  /** GET /me/notifications */
  async list() {
    return load<AppNotification[]>("notifications", seedNotifications);
  },
  /** POST /me/notifications/:id/read */
  async markRead(id: string) {
    save("notifications", load<AppNotification[]>("notifications", seedNotifications).map((n) => (n.id === id ? { ...n, read: true } : n)));
  },
};

export const settings = {
  /** GET /me/settings */
  async get() {
    return load<Settings>("settings", defaultSettings);
  },
  /** PATCH /me/settings */
  async update(changes: Partial<Settings>) {
    save("settings", { ...load<Settings>("settings", defaultSettings), ...changes });
  },
  /** POST /me/password  { current, next } */
  async changePassword(): Promise<never> {
    throw new ApiError("Password change is available after authentication is connected.");
  },
  /** GET /me/sessions */
  async sessions() {
    return [{ device: "This browser", current: true }];
  },
  /** POST /me/data-export */
  async exportData() {
    await latency();
    return { queued: true };
  },
  /** DELETE /me   (asks for a second confirmation first) */
  async deleteAccount(): Promise<never> {
    throw new ApiError("Account deletion requires an additional confirmation.");
  },
};

// ───────────────────────── support ─────────────────────────
export const support = {
  /** GET /help/faqs */
  async faqs() {
    return faqs;
  },
};

export const api = { bootstrap, auth, profile, discovery, studio, booking, bookings, reviews, billing, messages, notes, notifications, settings, support };
export type { BookingFlow };
