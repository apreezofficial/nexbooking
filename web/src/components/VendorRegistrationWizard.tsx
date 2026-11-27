"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Icon from "./Icon";
import { serviceCategories } from "@/lib/services";

type WizardStep = 1 | 2 | 3 | 4 | 5;

const AREAS = [
  "Lekki, Lagos",
  "Victoria Island, Lagos",
  "Ikoyi, Lagos",
  "Ikeja, Lagos",
  "Yaba, Lagos",
  "Surulere, Lagos",
  "Maitama, Abuja",
  "Wuse, Abuja",
  "Port Harcourt",
];

const NIGERIAN_BANKS = [
  "Access Bank",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Kuda Microfinance Bank",
  "Stanbic IBTC Bank",
  "Fidelity Bank",
  "Opay",
  "Moniepoint",
];

export default function VendorRegistrationWizard() {
  const [step, setStep] = useState<WizardStep>(1);

  // Step 1: Business Identity
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("beauty");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Location & Proximity
  const [serviceMode, setServiceMode] = useState<"studio" | "mobile" | "hybrid">("studio");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Step 3: First Service & Pricing
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDuration, setServiceDuration] = useState("60 min");
  const [servicePrice, setServicePrice] = useState("25000");
  const [graceWindowHours, setGraceWindowHours] = useState(24);

  // Step 4: Working Hours & Payouts
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({
    Mo: true,
    Tu: true,
    We: true,
    Th: true,
    Fr: true,
    Sa: true,
    Su: false,
  });
  const [openTime, setOpenTime] = useState("09:00 AM");
  const [closeTime, setCloseTime] = useState("06:00 PM");
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  // Step 5: Submission & Completed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) {
      setGeoNotice("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setGeoNotice(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        setGeoNotice(`GPS located: (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}). Area set to ${area}.`);
      },
      () => {
        setLocating(false);
        setGeoNotice(`Location accessed. Defaulting to ${area}.`);
      },
      { timeout: 8000 }
    );
  }

  function handleDayToggle(day: string) {
    setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));
  }

  function handleFinish(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const slug = (businessName || "my-studio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const profileData = {
      slug,
      businessName,
      category,
      tagline,
      email,
      phone,
      serviceMode,
      address,
      area,
      radiusKm,
      serviceTitle,
      serviceDuration,
      servicePrice: `₦${Number(servicePrice).toLocaleString("en-NG")}`,
      graceWindowHours,
      openDays,
      openTime,
      closeTime,
      bankName,
      accountNumber,
      accountName: accountName || businessName,
      registeredAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("edebooking_vendor_profile", JSON.stringify(profileData));
    } catch {
      // Storage guard
    }

    setTimeout(() => {
      setCreatedSlug(slug);
      setIsSubmitting(false);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1000);
  }

  const stepTitles: Record<WizardStep, string> = {
    1: "Business Identity",
    2: "Location & Coverage",
    3: "Services & Pricing",
    4: "Hours & Payouts",
    5: "Registration Complete",
  };

  return (
    <div className="vendor-wizard-container">
      {/* Progress Stepper */}
      <div className="wizard-progress-bar" aria-label="Registration steps">
        {([1, 2, 3, 4] as const).map(s => (
          <div
            key={s}
            className={`wizard-step-node ${step === s ? "is-active" : ""} ${step > s ? "is-done" : ""}`}
          >
            <div className="step-circle">{step > s ? <Icon name="check" /> : s}</div>
            <span className="step-label">{stepTitles[s]}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <form
          className="wizard-card"
          onSubmit={e => {
            e.preventDefault();
            setStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="wizard-header">
            <p className="eyebrow"><Icon name="shop" /> STEP 1 OF 4</p>
            <h2>Introduce your business</h2>
            <p>Tell customers who you are and what craft you bring to EdeBooking.</p>
          </div>

          <div className="form-field">
            <label htmlFor="biz-name">Business or Studio Name *</label>
            <input
              id="biz-name"
              type="text"
              required
              placeholder="e.g. Glow Studio & Aesthetics"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="biz-category">Primary Category *</label>
            <select
              id="biz-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {serviceCategories.map(c => (
                <option key={c.slug} value={c.slug}>
                  {c.en}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="biz-tagline">Short Tagline or Description</label>
            <input
              id="biz-tagline"
              type="text"
              placeholder="e.g. Premium hair care, silk presses and custom styling in Lekki."
              value={tagline}
              onChange={e => setTagline(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="biz-email">Business Email *</label>
              <input
                id="biz-email"
                type="email"
                required
                placeholder="bookings@glowstudio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="biz-phone">Phone Number (WhatsApp) *</label>
              <input
                id="biz-phone"
                type="tel"
                required
                placeholder="+234 801 234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="wizard-footer">
            <Link href="/business" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-gradient">
              Next: Location & Coverage <Icon name="arrow" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form
          className="wizard-card"
          onSubmit={e => {
            e.preventDefault();
            setStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="wizard-header">
            <p className="eyebrow"><Icon name="pin" /> STEP 2 OF 4</p>
            <h2>Where do you serve customers?</h2>
            <p>Help local clients discover you when searching near them.</p>
          </div>

          <div className="form-field">
            <label>Service Delivery Mode</label>
            <div className="service-mode-grid">
              <button
                type="button"
                className={`mode-btn ${serviceMode === "studio" ? "is-selected" : ""}`}
                onClick={() => setServiceMode("studio")}
              >
                <Icon name="shop" />
                <strong>At my studio / salon</strong>
                <small>Customers visit your physical venue</small>
              </button>

              <button
                type="button"
                className={`mode-btn ${serviceMode === "mobile" ? "is-selected" : ""}`}
                onClick={() => setServiceMode("mobile")}
              >
                <Icon name="pin" />
                <strong>Mobile / Home visits</strong>
                <small>You travel to client locations</small>
              </button>

              <button
                type="button"
                className={`mode-btn ${serviceMode === "hybrid" ? "is-selected" : ""}`}
                onClick={() => setServiceMode("hybrid")}
              >
                <Icon name="spark" />
                <strong>Hybrid / Online</strong>
                <small>In-person and remote sessions</small>
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="biz-area">Neighborhood / City Area *</label>
            <select
              id="biz-area"
              value={area}
              onChange={e => setArea(e.target.value)}
            >
              {AREAS.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="biz-address">Full Physical Address / Landmark</label>
            <input
              id="biz-address"
              type="text"
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="biz-radius">Service Radius (for &ldquo;Near Me&rdquo; search)</label>
            <div className="radius-selector-bar">
              {[3, 5, 10, 15, 25, 50].map(km => (
                <button
                  key={km}
                  type="button"
                  className={`radius-chip ${radiusKm === km ? "selected" : ""}`}
                  onClick={() => setRadiusKm(km)}
                >
                  Within {km} km
                </button>
              ))}
            </div>
          </div>

          <div className="location-detect-row">
            <button
              type="button"
              className="btn btn-ghost detect-loc-btn"
              onClick={detectLocation}
              disabled={locating}
            >
              <Icon name="pin" /> {locating ? "Detecting GPS..." : "Auto-detect my current coordinates"}
            </button>
            {geoNotice && <p className="geo-notice-text">{geoNotice}</p>}
          </div>

          <div className="wizard-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              <Icon name="back" /> Back
            </button>
            <button type="submit" className="btn btn-gradient">
              Next: Services & Pricing <Icon name="arrow" />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form
          className="wizard-card"
          onSubmit={e => {
            e.preventDefault();
            setStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="wizard-header">
            <p className="eyebrow"><Icon name="spark" /> STEP 3 OF 4</p>
            <h2>Add your primary service</h2>
            <p>Set up your first bookable offering with transparent pricing.</p>
          </div>

          <div className="form-field">
            <label htmlFor="srv-title">Service Title *</label>
            <input
              id="srv-title"
              type="text"
              required
              placeholder="e.g. Deluxe Silk Press & Scalp Care"
              value={serviceTitle}
              onChange={e => setServiceTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="srv-duration">Duration *</label>
              <select
                id="srv-duration"
                value={serviceDuration}
                onChange={e => setServiceDuration(e.target.value)}
              >
                <option value="30 min">30 minutes</option>
                <option value="45 min">45 minutes</option>
                <option value="60 min">60 minutes (1 hr)</option>
                <option value="90 min">90 minutes (1.5 hrs)</option>
                <option value="120 min">2 hours</option>
                <option value="180 min">3 hours</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="srv-price">Price (₦ NGN) *</label>
              <div className="input-wrap">
                <span className="price-prefix">₦</span>
                <input
                  id="srv-price"
                  type="number"
                  min="500"
                  required
                  placeholder="25000"
                  value={servicePrice}
                  onChange={e => setServicePrice(e.target.value)}
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="grace-hours">Reschedule Grace Period</label>
            <select
              id="grace-hours"
              value={graceWindowHours}
              onChange={e => setGraceWindowHours(Number(e.target.value))}
            >
              <option value={12}>12 hours in advance (Instant confirmation)</option>
              <option value={24}>24 hours in advance (Standard industry policy)</option>
              <option value={48}>48 hours in advance (Strict policy for prep-heavy work)</option>
            </select>
            <small style={{ color: "var(--muted)", marginTop: 4, display: "block" }}>
              Changes within this window confirm instantly. Requests under this window require your manual approval.
            </small>
          </div>

          <div className="wizard-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              <Icon name="back" /> Back
            </button>
            <button type="submit" className="btn btn-gradient">
              Next: Hours & Payouts <Icon name="arrow" />
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form className="wizard-card" onSubmit={handleFinish}>
          <div className="wizard-header">
            <p className="eyebrow"><Icon name="bank" /> STEP 4 OF 4</p>
            <h2>Working hours & bank payouts</h2>
            <p>Choose when you are open for bookings and where payouts will be sent.</p>
          </div>

          <div className="form-field">
            <label>Open Days</label>
            <div className="days-toggle-row">
              {Object.keys(openDays).map(d => (
                <button
                  key={d}
                  type="button"
                  className={`day-toggle-pill ${openDays[d] ? "is-open" : "is-closed"}`}
                  onClick={() => handleDayToggle(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <small style={{ color: "var(--muted)", marginTop: 6, display: "block" }}>
              Unselected days will show as &ldquo;Unavailable&rdquo; on your calendar.
            </small>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="open-time">Opening Time</label>
              <select id="open-time" value={openTime} onChange={e => setOpenTime(e.target.value)}>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="close-time">Closing Time</label>
              <select id="close-time" value={closeTime} onChange={e => setCloseTime(e.target.value)}>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>

          <div className="bank-section-box">
            <div className="bank-section-head">
              <Icon name="bank" />
              <div>
                <strong>Settlement Bank Details</strong>
                <p>Direct deposits for your client appointments and consultations.</p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="bank-select">Bank Name *</label>
              <select
                id="bank-select"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
              >
                {NIGERIAN_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="acct-num">10-Digit Account Number *</label>
                <input
                  id="acct-num"
                  type="text"
                  maxLength={10}
                  required
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="acct-name">Account Name (Optional)</label>
                <input
                  id="acct-name"
                  type="text"
                  placeholder="Glow Studio Ltd"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>
              <Icon name="back" /> Back
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-gradient">
              {isSubmitting ? "Creating Your Business Space..." : "Launch My Business Storefront ✓"}
            </button>
          </div>
        </form>
      )}

      {step === 5 && (
        <div className="wizard-card wizard-success-card">
          <div className="success-icon-badge">
            <Icon name="check" />
          </div>
          <h2>Welcome to EdeBooking!</h2>
          <p className="success-sub">
            <strong>{businessName}</strong> is now registered. Your digital storefront, booking calendar, and client management tools are live.
          </p>

          <div className="storefront-preview-box">
            <div className="preview-row">
              <span className="preview-label">Category:</span>
              <strong>{category.toUpperCase()}</strong>
            </div>
            <div className="preview-row">
              <span className="preview-label">Location:</span>
              <strong>{area}</strong>
            </div>
            <div className="preview-row">
              <span className="preview-label">First Service:</span>
              <strong>{serviceTitle || "Custom Consultation"} · ₦{Number(servicePrice).toLocaleString("en-NG")}</strong>
            </div>
            <div className="preview-row">
              <span className="preview-label">Payout Bank:</span>
              <strong>{bankName} (•••• {accountNumber.slice(-4) || "1234"})</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link href={createdSlug ? `/providers/${createdSlug}` : "/providers/spa-wellness-0"} className="btn btn-gradient">
              View Public Storefront <Icon name="arrow" />
            </Link>
            <Link href="/business/dashboard" className="btn btn-dark">
              Open My Dashboard
            </Link>
            <Link href="/services" className="btn btn-ghost">
              Explore Services Feed
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
