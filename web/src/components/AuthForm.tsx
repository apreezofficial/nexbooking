"use client";

import Link from "next/link";
import SocialIcon from "./SocialIcon";
import { useState, type FormEvent } from "react";

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const strength = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Your details are valid. Account access will be available when authentication is connected.");
  }

  return (
    <main className="auth-page">
      <aside className="auth-scene">
        <Link href="/" className="logo">EdeBooking</Link>
        <div><p className="eyebrow">YOUR EVERYDAY, TOGETHER</p><h2>More time for<br />what matters.</h2><p>Book, pay and manage appointments in one place.</p></div>
        <Link href="/" className="auth-back">Back to the website</Link>
      </aside>
      <section className="auth-panel">
        <Link href="/" className="logo auth-mobile-logo">EdeBooking</Link>
        <div className="auth-form-wrap">
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-description">{signup ? "Book, pay and consult in one place." : "Log in to book, pay and manage appointments."}</p>
          <nav className="auth-switch" aria-label="Account access">
            <Link href="/login" aria-current={!signup ? "page" : undefined}>Login</Link>
            <Link href="/signup" aria-current={signup ? "page" : undefined}>Sign up</Link>
          </nav>
          <form onSubmit={submit}>
            {signup && <div className="form-field"><label htmlFor="full-name">Full name</label><input id="full-name" name="name" autoComplete="name" placeholder="Your full name" required /></div>}
            <div className="form-field"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
            {signup && <div className="form-field"><label htmlFor="auth-phone">Phone number</label><input id="auth-phone" name="phone" type="tel" autoComplete="tel" placeholder="+234 801 234 5678" required /></div>}
            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password"><input id="auth-password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "At least 8 characters" : "Enter your password"} minLength={signup ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></div>
            </div>
            {signup ? <>
              <div className="password-meter" aria-hidden="true">{[1,2,3,4].map(level => <span key={level} className={level <= strength ? "filled" : ""} />)}</div>
              <p className="password-hint">{password ? ["", "Weak", "Fair", "Good", "Strong"][strength] || "Weak" : "Use 8+ characters with a mix of letters, numbers and symbols."}</p>
              <label className="auth-terms"><input type="checkbox" required /> <span>I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</span></label>
            </> : <button type="button" className="auth-forgot" onClick={() => setNotice("Password recovery will be available when authentication is connected.")}>Forgot password?</button>}
            <button className="btn btn-gradient auth-submit" type="submit">{signup ? "Create account" : "Log in"}</button>
          </form>
          <div className="auth-divider"><span />or continue with<span /></div>
          <div className="auth-socials">{(["Google", "Apple", "Facebook"] as const).map(provider => <button key={provider} type="button" aria-label={`Continue with ${provider}`} onClick={() => setNotice(`${provider} sign-in will be available when its authentication provider is connected.`)}><SocialIcon provider={provider} /><span>{provider}</span></button>)}</div>
          <p role="status" className="auth-notice">{notice}</p>
          <p className="auth-other">{signup ? "Already have an account?" : "New here?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
          {!signup && <p className="auth-policy">By continuing you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>}
        </div>
      </section>
    </main>
  );
}
