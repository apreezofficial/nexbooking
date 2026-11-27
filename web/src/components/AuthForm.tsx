"use client";

import Link from "next/link";
import SocialIcon from "./SocialIcon";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { DistortionWave } from "distortion-waves";
import { signIn } from "@/lib/session";
import BrandLogo from "./BrandLogo";

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [next, setNext] = useState("");
  const [vendor, setVendor] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const strength = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const name = String(data.get("name") || "") || email.split("@")[0];
    setPending(true);
    setNotice("");
    timer.current = setTimeout(() => {
      const isVendor = email.trim().toLowerCase() === "vendor@vendor.com";
      signIn({ name, email, role: isVendor ? "vendor" : "customer" });
      setVendor(isVendor);
      setNext(new URLSearchParams(window.location.search).get("next") || "");
      setPending(false);
      setComplete(true);
      setPassword("");
    }, 1400);
  }

  return (
    <main className="auth-page">
      <aside className="auth-scene">
        <BrandLogo tone="dark" />
        <div><p className="eyebrow">YOUR EVERYDAY, TOGETHER</p><h2>More time for<br />what matters.</h2><p>Book, pay and manage appointments in one place.</p></div>
        <Link href="/" className="auth-back">Back to the website</Link>
      </aside>
      <section className="auth-panel">
        <BrandLogo className="auth-mobile-logo" />
        <div className="auth-form-wrap">
          <DistortionWave
            revealed={complete}
            source={submitButton}
            palette="#D4AF37"
            prewarm={false}
            resolution={1}
            revealedContent={<div className="auth-demo-success" role="status">
              <span className="auth-success-mark" aria-hidden="true">✓</span>
              <h1>{signup ? "You’re all set" : "Welcome back"}</h1>
              <p className="auth-description">Demo {signup ? "signup" : "login"} completed. Explore EdeBooking while account services are being connected.</p>
              <Link href={vendor ? "/business/dashboard" : next.startsWith("/") ? next : "/dashboard"} className="btn btn-gradient auth-submit">{vendor ? "Open vendor dashboard" : next.startsWith("/") ? "Continue your booking" : "Go to your dashboard"}</Link>
              <button className="auth-custom-reset" type="button" onClick={() => setComplete(false)}>Try again</button>
            </div>}
          ><>
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-description">{signup ? "Book, pay and consult in one place." : "Log in to book, pay and manage appointments."}</p>
          <nav className="auth-switch" aria-label="Account access">
            <Link href="/login" aria-current={!signup ? "page" : undefined}>Login</Link>
            <Link href="/signup" aria-current={signup ? "page" : undefined}>Sign up</Link>
          </nav>
          <form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending} className="auth-fieldset">
            {signup && <div className="form-field"><label htmlFor="full-name">Full name</label><input id="full-name" name="name" autoComplete="name" placeholder="Your full name" required /></div>}
            <div className="form-field"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
            {signup && <div className="form-field"><label htmlFor="auth-phone">Phone number</label><input id="auth-phone" name="phone" type="tel" autoComplete="tel" placeholder="+234 801 234 5678" required /></div>}
            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password"><input id="auth-password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "At least 8 characters" : "Enter your password"} minLength={signup ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></div>
            </div>
            {signup ? <>
              <div className="password-meter" data-strength={strength} aria-hidden="true">{[1,2,3,4].map(level => <span key={level} className={level <= strength ? "filled" : ""} />)}</div>
              <p className="password-hint" data-strength={password ? strength : undefined} aria-live="polite">{password ? ["", "Weak", "Fair", "Good", "Strong"][strength] || "Weak" : "Use 8+ characters with a mix of letters, numbers and symbols."}</p>
              <label className="auth-terms"><input type="checkbox" required /> <span>I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</span></label>
            </> : <><Link href="/forgot-password" className="auth-forgot">Forgot password?</Link><p className="auth-vendor-hint">Vendor demo account <strong>vendor@vendor.com</strong> · enter any password</p></>}
            <button ref={submitButton} className="btn btn-gradient auth-submit" type="submit" disabled={pending}>{pending && <span className="auth-spinner" aria-hidden="true" />}{pending ? (signup ? "Creating account…" : "Logging in…") : (signup ? "Create account" : "Log in")}</button>
          </fieldset></form>
          <div className="auth-divider"><span />or continue with<span /></div>
          <div className="auth-socials">{(["Google", "Apple"] as const).map(provider => <button key={provider} type="button" aria-label={`Continue with ${provider}`} onClick={() => setNotice(`${provider} sign-in will be available when its authentication provider is connected.`)}><SocialIcon provider={provider} /><span>{provider}</span></button>)}</div>
          <p role="status" className="auth-notice">{notice}</p>
          <p className="auth-other">{signup ? "Already have an account?" : "New here?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
          {!signup && <p className="auth-policy">By continuing you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>}
          </></DistortionWave>
        </div>
      </section>
    </main>
  );
}
