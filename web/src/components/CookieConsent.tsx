"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CONSENT_EVENT, CONSENT_KEY, readConsent, subscribeConsent } from "@/lib/cookie-consent";

export default function CookieConsent() {
  const saved = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const [sessionChoice, setSessionChoice] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const visible = editing || (sessionChoice === null && saved === null);

  function save(allowPreferences: boolean) {
    setSessionChoice(allowPreferences);
    setEditing(false);
    try {
      localStorage.setItem(CONSENT_KEY, allowPreferences ? "preferences" : "essential");
      if (!allowPreferences) localStorage.removeItem("nexbooking-currency");
    } catch {
      // The selection still applies for this visit.
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (!visible) {
    return <button type="button" className="cookie-reopen" onClick={() => {
      setPreferences(sessionChoice ?? saved ?? false);
      setExpanded(true);
      setEditing(true);
    }} aria-label="Open cookie preferences">Cookie settings</button>;
  }

  return (
    <section className="cookie-popup" aria-labelledby="cookie-heading">
      <div className="cookie-heading">
        <span className="cookie-symbol" aria-hidden="true">◌</span>
        <div><span className="cookie-kicker">YOUR PRIVACY</span><h2 id="cookie-heading">A little choice goes a long way.</h2></div>
      </div>
      <p>We use essential storage to keep things working. With your permission, we’ll also remember preferences like your currency. We don’t use analytics or advertising cookies.</p>
      <Link href="/cookies" className="cookie-policy-link">Read our cookie policy</Link>
      {expanded && (
        <div className="cookie-options">
          <div><span><strong>Essential</strong><small>Stores your privacy choice.</small></span><span className="cookie-always">Always on</span></div>
          <label><span><strong>Preferences</strong><small>Remembers your currency for next time.</small></span><input type="checkbox" checked={preferences} onChange={event => setPreferences(event.target.checked)} /></label>
        </div>
      )}
      <div className="cookie-actions">
        <button type="button" className="btn btn-gradient" onClick={() => save(expanded ? preferences : true)}>{expanded ? "Save choices" : "Accept preferences"}</button>
        <button type="button" className="btn cookie-essential" onClick={() => save(false)}>Essential only</button>
      </div>
      <button className="cookie-customize" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "Hide preferences" : "Customize choices"}</button>
    </section>
  );
}
