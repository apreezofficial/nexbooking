"use client";
import { useSyncExternalStore } from "react";

export type Session = { name: string; email: string };
export type Draft = { serviceId: string; date: string; time: string; guests: number; notes: string; method: string };
export type BookingItem = {
  code: string;
  serviceId?: string;
  title: string;
  provider: string;
  date: string;
  time: string;
  guests: string;
  total: string;
  reschedulePolicy?: "flexible" | "strict" | "materials_ordered";
  rescheduleStatus?: "none" | "approved" | "pending_vendor" | "declined";
  rescheduleRequestedDate?: string;
  rescheduleRequestedTime?: string;
  // Added for the customer dashboard (optional so earlier bookings still load).
  status?: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  studioId?: string;
  staff?: string;
  venue?: string;
  paidWith?: string;
  receiptRef?: string;
  cancelReason?: string;
  refund?: string;
};

const SESSION_KEY = "edebooking-session";
const DRAFT_KEY = "edebooking-booking-draft";
const BOOKINGS_KEY = "edebooking-bookings";
const EVENT = "edebooking-session-change";

function read(key: string): string {
  try { return window.localStorage.getItem(key) ?? ""; } catch { return ""; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value);
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}
function useRaw(key: string): string | null {
  return useSyncExternalStore(subscribe, () => read(key), () => null as string | null);
}
function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export const useSessionRaw = () => useRaw(SESSION_KEY);
export const useDraftRaw = () => useRaw(DRAFT_KEY);
export const useBookingsRaw = () => useRaw(BOOKINGS_KEY);
export const parseSession = (raw: string | null) => parse<Session>(raw);
export const parseDraft = (raw: string | null) => parse<Draft>(raw);
export const parseBookings = (raw: string | null) => parse<BookingItem[]>(raw) ?? [];

export const signIn = (s: Session) => write(SESSION_KEY, JSON.stringify(s));
export const signOut = () => write(SESSION_KEY, null);
export const saveDraft = (d: Draft) => write(DRAFT_KEY, JSON.stringify(d));
export const clearDraft = () => write(DRAFT_KEY, null);
export function addBooking(b: BookingItem) {
  write(BOOKINGS_KEY, JSON.stringify([b, ...parseBookings(read(BOOKINGS_KEY))]));
}

export function updateBooking(code: string, updates: Partial<BookingItem>) {
  const current = parseBookings(read(BOOKINGS_KEY));
  const updated = current.map(item => item.code === code ? { ...item, ...updates } : item);
  write(BOOKINGS_KEY, JSON.stringify(updated));
}

/** Sync read of the stored bookings, for request code that runs outside React. */
export const readBookings = () => parseBookings(read(BOOKINGS_KEY));
export const replaceBookings = (items: BookingItem[]) => write(BOOKINGS_KEY, JSON.stringify(items));
export const readSession = () => parseSession(read(SESSION_KEY));
