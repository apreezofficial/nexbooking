"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Icon from "./Icon";

export interface UserLocation {
  city: string;
  lat?: number;
  lng?: number;
  isApprox?: boolean;
  updatedAt?: number;
}

const STORAGE_KEY = "edebooking-user-location";
const DISMISSED_KEY = "edebooking-location-prompt-dismissed";
const PROMPT_EVENT = "edebooking:location-changed";

const POPULAR_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
  "London",
  "Remote",
];

function readSavedLocationRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribeLocation(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROMPT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PROMPT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function LocationPrompt() {
  const savedLocationRaw = useSyncExternalStore(subscribeLocation, readSavedLocationRaw, () => null);
  const savedLocation = useMemo<UserLocation | null>(() => {
    if (!savedLocationRaw) return null;
    try {
      return JSON.parse(savedLocationRaw) as UserLocation;
    } catch {
      return null;
    }
  }, [savedLocationRaw]);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"prompt" | "locating" | "success" | "manual" | "denied">("prompt");
  const [customCity, setCustomCity] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    try {
      const dismissedTime = localStorage.getItem(DISMISSED_KEY);
      const isDismissedRecently = dismissedTime && Date.now() - Number(dismissedTime) < 1000 * 60 * 60 * 24 * 3; // 3 days

      // If not dismissed and no location set, reveal prompt after a gentle 1.8s delay
      if (!isDismissedRecently && !savedLocation) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, [savedLocation]);

  const saveLocation = useCallback((location: UserLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(PROMPT_EVENT, { detail: location }));
    setStatus("success");
    setSuccessMessage(`Location set to ${location.city}! Finding verified services near you.`);
    setTimeout(() => {
      setIsOpen(false);
      setStatus("prompt");
    }, 2400);
  }, []);

  const handleUseGps = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        
        let detectedCity = "Your Current Area";
        if (lat >= 6.3 && lat <= 6.7 && lng >= 3.1 && lng <= 3.7) {
          detectedCity = "Lagos";
        } else if (lat >= 8.9 && lat <= 9.2 && lng >= 7.3 && lng <= 7.6) {
          detectedCity = "Abuja";
        } else if (lat >= 4.7 && lat <= 5.0 && lng >= 6.9 && lng <= 7.2) {
          detectedCity = "Port Harcourt";
        }

        saveLocation({
          city: detectedCity,
          lat,
          lng,
          isApprox: false,
        });
      },
      () => {
        setStatus("denied");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [saveLocation]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setIsOpen(false);
  }, []);

  const handleSelectCity = useCallback((city: string) => {
    saveLocation({
      city,
      isApprox: true,
    });
  }, [saveLocation]);

  const handleCustomCitySubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    handleSelectCity(customCity.trim());
    setCustomCity("");
  }, [customCity, handleSelectCity]);

  return (
    <>
      {/* Reopen / Location Indicator pill */}
      <button
        type="button"
        className="prompt-location-pill"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setStatus("prompt");
        }}
        aria-label="Set or update your booking location"
        title="Change your location preference"
      >
        <span className="prompt-pill-dot" />
        <Icon name="pin" className="prompt-pill-icon" />
        <span>{savedLocation ? savedLocation.city : "Near me"}</span>
      </button>

      {/* Main Location Prompt Card */}
      {isOpen && (
        <section className="prompt-card prompt-location" aria-labelledby="loc-prompt-heading">
          <div className="prompt-header">
            <div className="prompt-badge">
              <Icon name="pin" />
            </div>
            <div className="prompt-title-wrap">
              <span className="prompt-kicker">NEARBY EXPERIENCES</span>
              <h2 id="loc-prompt-heading">Find services near you</h2>
            </div>
            <button
              type="button"
              className="prompt-close-btn"
              onClick={handleDismiss}
              aria-label="Dismiss location prompt"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="prompt-body">
            {status === "prompt" && (
              <>
                <p>
                  Share your location to discover verified beauty artists, wellness therapists, and bookings closest to you.
                </p>
                <div className="prompt-actions">
                  <button
                    type="button"
                    className="btn btn-gradient prompt-btn-primary"
                    onClick={handleUseGps}
                  >
                    <Icon name="pin" />
                    <span>Use my location</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost prompt-btn-secondary"
                    onClick={() => setStatus("manual")}
                  >
                    Enter city
                  </button>
                </div>
                <div className="prompt-footer-row">
                  <button type="button" className="prompt-dismiss-link" onClick={handleDismiss}>
                    Not now
                  </button>
                </div>
              </>
            )}

            {status === "locating" && (
              <div className="prompt-state-box">
                <span className="prompt-spinner" aria-hidden="true" />
                <p><strong>Detecting your location…</strong></p>
                <small>Looking for nearby specialists and availability</small>
              </div>
            )}

            {status === "success" && (
              <div className="prompt-state-box prompt-success-box">
                <div className="prompt-check-icon">
                  <Icon name="check" />
                </div>
                <p><strong>{successMessage}</strong></p>
                <small>Filtering providers by proximity</small>
              </div>
            )}

            {status === "denied" && (
              <>
                <p className="prompt-notice">
                  Location access was blocked. You can choose or enter your city below:
                </p>
                <div className="prompt-chips">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`prompt-chip ${savedLocation?.city === c ? "prompt-chip-active" : ""}`}
                      onClick={() => handleSelectCity(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleCustomCitySubmit} className="prompt-custom-city-form">
                  <input
                    type="text"
                    placeholder="Other city or town…"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    aria-label="Enter other city"
                  />
                  <button type="submit" className="btn btn-gradient">Set</button>
                </form>
                <button type="button" className="prompt-back-link" onClick={() => setStatus("prompt")}>
                  ‹ Back
                </button>
              </>
            )}

            {status === "manual" && (
              <>
                <p>Select your city to browse local specialists:</p>
                <div className="prompt-chips">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`prompt-chip ${savedLocation?.city === c ? "prompt-chip-active" : ""}`}
                      onClick={() => handleSelectCity(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleCustomCitySubmit} className="prompt-custom-city-form">
                  <input
                    type="text"
                    placeholder="Enter other city…"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    aria-label="Enter custom city"
                  />
                  <button type="submit" className="btn btn-gradient">Set</button>
                </form>
                <div className="prompt-footer-row">
                  <button type="button" className="prompt-back-link" onClick={() => setStatus("prompt")}>
                    ‹ Back
                  </button>
                  <button type="button" className="prompt-dismiss-link" onClick={handleDismiss}>
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
