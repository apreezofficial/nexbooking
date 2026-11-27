"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * A small browser-storage store behind the dashboard, so every screen shares state and survives a refresh.
 * This is a stand-in for the backend: api.ts reads and writes through it today, and will call real
 * endpoints later without the screens changing.
 */

const EVENT = "edebooking-dashboard-change";
const PREFIX = "edebooking-dash-";

export function readKey(name: string): string {
  try {
    return window.localStorage.getItem(PREFIX + name) ?? "";
  } catch {
    return "";
  }
}

export function writeKey(name: string, value: unknown) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(PREFIX + name);
    else window.localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function readJson<T>(name: string, fallback: T): T {
  const raw = readKey(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Reactive read of one stored value. `ready` is false on the server and before the first client read. */
export function useStored<T>(name: string, fallback: T): { value: T; ready: boolean; set: (next: T | ((current: T) => T)) => void } {
  const raw = useSyncExternalStore(subscribe, () => readKey(name), () => null as string | null);
  const value = useMemo(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
    // `fallback` is a stable literal at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = readJson<T>(name, fallback);
      writeKey(name, typeof next === "function" ? (next as (current: T) => T)(current) : next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name],
  );

  return { value, ready: raw !== null, set };
}

const noopSubscribe = () => () => {};
const todayKey = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/** Today's date as YYYY-MM-DD in the visitor's time zone. Empty on the server so markup matches. */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, todayKey, () => "");
}

export const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const formatDay = (isoDate: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  isoDate ? new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", options) : "";
