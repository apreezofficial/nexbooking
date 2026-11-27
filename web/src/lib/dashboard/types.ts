/** Shared shapes for the customer dashboard. The same shapes are the contract for the backend requests in api.ts. */

export type Studio = {
  id: string;
  name: string;
  category: string;
  services: string;
  distance: string;
  rating: string;
  reviews: number;
  area: string;
  verified: boolean;
  monogram: string;
  photo: string;
  works: string[];
  about: string;
};

export type StudioService = { id: string; name: string; detail: string; minutes: number; price: number };

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Rescheduled" | "Refunded" | "In progress";

export type PaymentMethodId = "card" | "transfer" | "apple" | "google";

export type Receipt = {
  ref: string;
  studioId: string;
  studio: string;
  date: string;
  paidAt: string;
  service: string;
  staff: string;
  appointment: string;
  paidWith: string;
  transaction: string;
  subtotal: number;
  vat: number;
  total: number;
  status: "Paid" | "Refunded";
};

export type Proforma = { ref: string; studio: string; date: string; total: number; status: "Open" | "Paid" | "Expired" };

export type Review = { id: string; studioId: string; studio: string; rating: number; tags: string[]; text: string; date: string };

export type PaymentMethod = { id: string; label: string; detail: string; isDefault: boolean };

export type ChatMessage = { id: string; from: "studio" | "me"; text: string; at: string };

export type Note = {
  id: string;
  task: string;
  details: string;
  date: string;
  time: string;
  repeat: "Never" | "Daily" | "Weekly" | "Monthly";
  remind: string;
  done: boolean;
};

export type AppNotification = { id: string; kind: "Bookings" | "Payments" | "Offers"; title: string; detail: string; read: boolean };

export type Profile = { name: string; email: string; phone: string; location: string; interests: string[] };

export type Settings = {
  language: string;
  notifications: Record<string, boolean>;
  twoFactor: boolean;
  biometric: boolean;
  reminderTiming: string;
};

/** Where the user is in the booking flow. Carried across steps so a refresh does not lose it. */
export type BookingFlow = {
  studioId: string;
  serviceId: string;
  staff: string;
  date: string;
  time: string;
  promo: string;
  method: PaymentMethodId;
};
