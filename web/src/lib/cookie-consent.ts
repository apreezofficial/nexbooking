export const CONSENT_KEY = "edebooking-cookie-consent";
export const CONSENT_EVENT = "edebooking-consent-change";

export function readConsent(): boolean | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === "preferences") return true;
    if (value === "essential") return false;
  } catch {
    // Keep the choice in memory when browser storage is unavailable.
  }
  return null;
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
