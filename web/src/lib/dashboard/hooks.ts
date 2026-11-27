"use client";

import { useCallback, useState } from "react";
import { parseBookings, parseSession, useBookingsRaw, useSessionRaw } from "@/lib/session";
import { useNotice } from "@/components/dashboard/Notice";
import { ApiError } from "./api";
import {
  defaultSettings, emptyFlow, seedNotifications, seedPaymentMethods, seedProformas, seedReceipts, seedReviews, seedThreads,
} from "./data";
import { useStored } from "./store";
import type { AppNotification, BookingFlow, ChatMessage, Note, PaymentMethod, Profile, Proforma, Receipt, Review, Settings } from "./types";

/** Reads the dashboard's stored data. Each hook returns the data and updates when any screen changes it. */
export function useProfile(): Profile {
  const session = parseSession(useSessionRaw());
  const { value } = useStored<Profile | null>("profile", null);
  return value ?? { name: session?.name ?? "", email: session?.email ?? "", phone: "", location: "Lekki, Lagos", interests: [] };
}
export const useSaved = () => useStored<Record<string, boolean>>("saved", {}).value;
export const useFollowing = () => useStored<Record<string, boolean>>("following", {}).value;
export const useBookings = () => parseBookings(useBookingsRaw());
export const useReceipts = (): Receipt[] => useStored<Receipt[]>("receipts", seedReceipts).value;
export const useProformas = (): Proforma[] => useStored<Proforma[]>("proformas", seedProformas).value;
export const useReviews = (): Review[] => useStored<Review[]>("reviews", seedReviews).value;
export const usePaymentMethods = (): PaymentMethod[] => useStored<PaymentMethod[]>("payment-methods", seedPaymentMethods).value;
export const useThreads = () => useStored<Record<string, ChatMessage[]>>("threads", seedThreads).value;
export const useNotes = (): Note[] => useStored<Note[]>("notes", []).value;
export const useNotifications = (): AppNotification[] => useStored<AppNotification[]>("notifications", seedNotifications).value;
export const useSettings = (): Settings => useStored<Settings>("settings", defaultSettings).value;
export const useFlow = () => useStored<BookingFlow>("flow", emptyFlow);

/**
 * Runs a request and shows its outcome as a notice. A failed request shows the error message instead of
 * throwing, so a screen never crashes on a rejected action.
 */
export function useRun() {
  const notify = useNotice();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T,>(request: Promise<T>, success?: string | ((result: T) => string)): Promise<T | undefined> => {
      setBusy(true);
      try {
        const result = await request;
        if (success) notify(typeof success === "function" ? success(result) : success);
        return result;
      } catch (error) {
        notify(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [notify],
  );
  return { run, busy, notify };
}
