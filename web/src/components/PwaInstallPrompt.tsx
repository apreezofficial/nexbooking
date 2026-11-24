"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Icon from "./Icon";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = "edebooking-pwa-prompt-dismissed";

function readIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error navigator.standalone is iOS Safari specific
    window.navigator.standalone === true
  );
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function readIsIos(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && !("MSStream" in window);
}

function subscribeIos() {
  return () => {};
}

export default function PwaInstallPrompt() {
  const isStandalone = useSyncExternalStore(subscribeStandalone, readIsStandalone, () => false);
  const isIos = useSyncExternalStore(subscribeIos, readIsIos, () => false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Register service worker if supported
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker optional in development
      });
    }

    if (isStandalone) return;

    // 2. Capture browser beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Evaluate if prompt should open after a polite delay
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      const isDismissedRecently = dismissed && Date.now() - Number(dismissed) < 1000 * 60 * 60 * 24 * 5; // 5 days

      if (!isDismissedRecently) {
        // Wait 4.2 seconds so location prompt has priority first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 4200);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
          window.removeEventListener("appinstalled", handleAppInstalled);
        };
      }
    } catch {
      // Storage unavailable
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setIsOpen(false);
    setShowIosSteps(false);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIos) {
      setShowIosSteps(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosSteps(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalledSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 2800);
      } else {
        handleDismiss();
      }
    } catch {
      handleDismiss();
    }
  }, [deferredPrompt, handleDismiss, isIos]);

  // If already running inside standalone app, do not display prompts
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating Reopen / Install Pill */}
      <button
        type="button"
        className="prompt-pwa-pill"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowIosSteps(false);
        }}
        aria-label="Install EdeBooking web app"
        title="Install EdeBooking on your device"
      >
        <span className="prompt-pill-spark">⚡</span>
        <Icon name="download" className="prompt-pill-icon" />
        <span>Install App</span>
      </button>

      {/* Main PWA Install Prompt Card */}
      {isOpen && (
        <section className="prompt-card prompt-pwa" aria-labelledby="pwa-prompt-heading">
          <div className="prompt-header">
            <div className="prompt-badge prompt-pwa-badge">
              <img src="/brand/edebooking-badge.png" alt="" width={44} height={44} className="prompt-logo-img" />
            </div>
            <div className="prompt-title-wrap">
              <span className="prompt-kicker">FASTER & OFFLINE</span>
              <h2 id="pwa-prompt-heading">Install EdeBooking App</h2>
            </div>
            <button
              type="button"
              className="prompt-close-btn"
              onClick={handleDismiss}
              aria-label="Close install prompt"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="prompt-body">
            {installedSuccess ? (
              <div className="prompt-state-box prompt-success-box">
                <div className="prompt-check-icon">
                  <Icon name="check" />
                </div>
                <p><strong>App successfully installed!</strong></p>
                <small>You can now open EdeBooking directly from your home screen.</small>
              </div>
            ) : showIosSteps ? (
              <div className="prompt-ios-guide">
                <p><strong>To install on your iPhone or iPad:</strong></p>
                <ol className="prompt-ios-steps">
                  <li>
                    <span className="step-num">1</span>
                    <span>Tap the <strong>Share</strong> button <Icon name="share" className="step-inline-icon" /> in Safari’s toolbar.</span>
                  </li>
                  <li>
                    <span className="step-num">2</span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong> <Icon name="plus" className="step-inline-icon" />.</span>
                  </li>
                </ol>
                <div className="prompt-footer-row">
                  <button
                    type="button"
                    className="btn btn-gradient prompt-btn-primary"
                    onClick={handleDismiss}
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>
                  Add EdeBooking to your home screen for instant booking alerts, 1-tap appointments, and offline access without app store downloads.
                </p>
                <div className="prompt-actions">
                  <button
                    type="button"
                    className="btn btn-gradient prompt-btn-primary"
                    onClick={handleInstallClick}
                  >
                    <Icon name="download" />
                    <span>{isIos ? "Add to Home Screen" : "Install App"}</span>
                  </button>
                  <button
                    type="button"
                    className="prompt-dismiss-link"
                    onClick={handleDismiss}
                  >
                    Maybe later
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
