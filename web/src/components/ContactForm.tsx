"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import Icon from "@/components/Icon";

const topics = ["General question", "Booking help", "For my business", "Payments and invoices", "Feedback"];

type Values = { name: string; email: string; topic: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { name: "", email: "", topic: topics[0], message: "" };

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (values.message.trim().length < 10) errors.message = "Add a few more details so we can help (at least 10 characters).";
  return errors;
}

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<Values | null>(null);

  const id = (field: keyof Values) => `${uid}-${field}`;
  const update = (field: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (["name", "email", "message"] as const).find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(id(firstInvalid))?.focus();
      return;
    }
    setSentTo(values);
  }

  if (sentTo) {
    const firstName = sentTo.name.trim().split(/\s+/)[0];
    return (
      <div className="contact-card form-success" role="status">
        <span className="form-success-icon"><Icon name="check" /></span>
        <h2>Thanks, {firstName}.</h2>
        <p>
          Your note about “{sentTo.topic.toLowerCase()}” is ready. Direct messaging opens when EdeBooking launches,
          so for now the FAQ covers the questions we hear most.
        </p>
        <div className="form-success-actions">
          <Link className="btn btn-dark" href="/faq">Browse the FAQ</Link>
          <button type="button" className="btn btn-soft" onClick={() => { setValues(empty); setSentTo(null); }}>
            Write another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-card contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form-head">
        <p className="eyebrow">✦ SEND A MESSAGE</p>
        <h2>How can we help?</h2>
        <p>Share a few details and we’ll make sure your question reaches the right place.</p>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={id("name")}>Full name</label>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            placeholder="Ada Okafor"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id("name")}-error` : undefined}
          />
          {errors.name && <p className="field-error" id={`${id("name")}-error`} role="alert">{errors.name}</p>}
        </div>
        <div className="form-field">
          <label htmlFor={id("email")}>Email address</label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id("email")}-error` : undefined}
          />
          {errors.email && <p className="field-error" id={`${id("email")}-error`} role="alert">{errors.email}</p>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor={id("topic")}>I’m getting in touch about</label>
        <select id={id("topic")} name="topic" value={values.topic} onChange={(e) => update("topic", e.target.value)}>
          {topics.map((topic) => <option key={topic}>{topic}</option>)}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={id("message")}>Your message</label>
        <textarea
          id={id("message")}
          name="message"
          rows={6}
          placeholder="Tell us a little about what you need."
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id("message")}-error` : undefined}
        />
        {errors.message && <p className="field-error" id={`${id("message")}-error`} role="alert">{errors.message}</p>}
      </div>

      <div className="form-footer">
        <p>By sending a message you agree to our <Link href="/privacy">Privacy Policy</Link>.</p>
        <button type="submit" className="btn btn-gradient">Send message</button>
      </div>
    </form>
  );
}
