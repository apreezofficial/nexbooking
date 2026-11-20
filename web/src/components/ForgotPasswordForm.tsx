"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    timer.current = setTimeout(() => {
      setPending(false);
      setComplete(true);
    }, 1400);
  }

  return (
    <main className="auth-page">
      <aside className="auth-scene">
        <Link href="/" className="logo">EdeBooking</Link>
        <div><p className="eyebrow">LET’S GET YOU BACK</p><h2>A fresh start.<br />All yours.</h2><p>Get back to your bookings and everything you’re planning.</p></div>
        <Link href="/" className="auth-back">Back to the website</Link>
      </aside>
      <section className="auth-panel">
        <Link href="/" className="logo auth-mobile-logo">EdeBooking</Link>
        <div className="auth-form-wrap">
          {complete ? (
            <div role="status">
              <span className="auth-success-mark" aria-hidden="true">✓</span>
              <h1>Request preview complete</h1>
              <p className="auth-description">In the live app, we’ll send reset instructions if an account exists for your email. This demo hasn’t sent an email.</p>
              <Link href="/login" className="btn btn-gradient auth-submit">Back to login</Link>
              <button className="auth-custom-reset" type="button" onClick={() => setComplete(false)}>Try another email</button>
            </div>
          ) : (
            <>
              <h1>Forgot password?</h1>
              <p className="auth-description">Enter your account email to request password reset instructions.</p>
              <form onSubmit={submit} aria-busy={pending}>
                <fieldset disabled={pending} className="auth-fieldset">
                  <div className="form-field"><label htmlFor="recovery-email">Email</label><input id="recovery-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></div>
                  <button className="btn btn-gradient auth-submit" type="submit" disabled={pending}>{pending && <span className="auth-spinner" aria-hidden="true" />}{pending ? "Requesting reset…" : "Request reset link"}</button>
                </fieldset>
              </form>
              <p className="auth-policy">Password recovery preview. Email delivery will be available when authentication is connected.</p>
              <p className="auth-other"><Link href="/login">Back to login</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
