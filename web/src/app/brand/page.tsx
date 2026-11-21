import Image from "next/image";
import Link from "next/link";
import AssistantAvatar, { type AssistantFinish, type AssistantShape, type AssistantState } from "@/components/assistant/AssistantAvatar";
import CopyButton from "@/components/CopyButton";
import CopySwatch from "@/components/CopySwatch";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";
import { pageMetadata, siteName } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Brand assets and guidelines",
  description: `The ${siteName} logo, mascot and assistant bot, colours, typography and usage rules, with downloadable files and a press boilerplate for partners and the press.`,
  path: "/brand",
});

const logoSize = { width: 1117, height: 322 };

// Keep these in step with the tokens in src/app/brand-theme.css.
const colourGroups = [
  {
    title: "Brand",
    colours: [
      { name: "Gold deep", hex: "#7A5F0A", role: "The logo, links and labels" },
      { name: "Gold", hex: "#D4AF37", role: "Buttons, highlights and the logo on dark" },
      { name: "Champagne", hex: "#E6BE8A", role: "The end of the button gradient" },
      { name: "Gold tint", hex: "#FAFAD2", role: "Hero and soft backgrounds" },
    ],
  },
  {
    title: "Surfaces and text",
    colours: [
      { name: "Pearl", hex: "#FBFCF8", role: "Page background" },
      { name: "Surface", hex: "#FAFAFA", role: "Cards and panels" },
      { name: "Line", hex: "#E8E6DA", role: "Borders and dividers" },
      { name: "Ink", hex: "#1C1A14", role: "Headings and dark panels" },
      { name: "Ink soft", hex: "#2B2618", role: "Body text" },
      { name: "Muted", hex: "#6B6757", role: "Secondary text" },
    ],
  },
  {
    title: "Status",
    colours: [
      { name: "Success", hex: "#2E7D4F", role: "Confirmations" },
      { name: "Warning", hex: "#B7791F", role: "Cautions" },
      { name: "Error", hex: "#C0392B", role: "Problems and failures" },
      { name: "Info", hex: "#2F6DB5", role: "Notices" },
    ],
  },
];

const botStates: { state: AssistantState; title: string; note: string; file: string }[] = [
  { state: "idle", title: "Ready", note: "A soft smile. Waiting to help.", file: "edebooking-bot-idle.png" },
  { state: "working", title: "Thinking", note: "A wide smile. Handling a request.", file: "edebooking-bot-working.png" },
  { state: "sleeping", title: "Resting", note: "Eyes closed. Between tasks.", file: "edebooking-bot-sleeping.png" },
];

const botShapes: { shape: AssistantShape; name: string }[] = [
  "clover", "flower", "triangle", "square", "blob", "ghost", "circle", "drop", "star",
  "droid", "mech", "alien", "hexagon", "cat", "cloud", "pill", "pebble", "puddle",
].map((shape) => ({ shape: shape as AssistantShape, name: shape[0].toUpperCase() + shape.slice(1) }));

const botFinishes: { finish: AssistantFinish; file: string; name: string; note: string }[] = [
  { finish: "fabric", file: "plush", name: "Plush", note: "Soft fur. Our default." },
  { finish: "plastic", file: "plastic", name: "Plastic", note: "Glossy and smooth." },
  { finish: "crisp", file: "crisp", name: "Crisp", note: "A clean, lit edge." },
  { finish: "smooth", file: "smooth", name: "Smooth", note: "Soft light, no edge." },
  { finish: "flat", file: "flat", name: "Flat", note: "Depth without lighting." },
];

const dos = [
  "Use the logo file from this page, unaltered.",
  "Use the bot file that matches what the message is saying: ready, thinking or resting.",
  "Use the deep gold logo on light surfaces and the bright gold one on dark surfaces.",
  "Leave clear space around the logo, at least the height of the “B”.",
  "Use our colours from the palette above.",
];

const donts = [
  "Don’t stretch, rotate or rearrange it.",
  "Don’t recolour it or add shadows and effects.",
  "Don’t put it on a busy photo or pattern.",
  "Don’t combine it with other logos or marks.",
  "Don’t dress the bot in hats or glasses, and don’t recolour the bot or the mascot.",
  "Don’t redraw it or retype the name in another font.",
];

const boilerplate =
  "EdeBooking is a booking platform where people discover businesses, book appointments and consultations and manage payments, and where businesses run their own space with notes, invoices and receipts.";

const sections = [
  { id: "preface", title: "Preface" },
  { id: "logo", title: "Logo" },
  { id: "bot", title: "Mascot and bot" },
  { id: "colour", title: "Colour" },
  { id: "type", title: "Type" },
  { id: "usage", title: "Usage" },
  { id: "press", title: "Press" },
  { id: "contact", title: "Contact" },
];

const heading = (id: string) => {
  const index = sections.findIndex((section) => section.id === id);
  return { number: String(index + 1).padStart(2, "0"), title: sections[index].title };
};

function SectionHeading({ id }: { id: string }) {
  const { number, title } = heading(id);
  return <h2><span>{number}</span>{title}</h2>;
}

export default function BrandPage() {
  return (
    <RouteShell crumb={{ name: "Brand", path: "/brand" }}>
      <RouteHero
        compact
        hideCta
        eyebrow="BRAND SYSTEM"
        title="Brand assets and guidelines"
        description="Our name, our logo and the standards that hold them together, for customers, businesses, partners and the press."
        image="feature-booking-scene.png"
      />
      <section className="route-content legal-content">
        <div className="legal-layout">
          <nav className="legal-toc" aria-label="On this page">
            <p className="legal-toc-title">On this page</p>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-article brand-article">
            <section id="preface">
              <SectionHeading id="preface" />
              <p>The {siteName} brand is our name, our logo and the standards that hold them together on every surface. It belongs to {siteName}.</p>
              <p>This page exists so customers, businesses, partners and the press can represent {siteName} accurately: keep the logo intact and make it clear who built what.</p>
              <p>If you need any help, <Link className="brand-link" href="/contact">contact us</Link>.</p>
            </section>

            <section id="logo">
              <div className="brand-head">
                <SectionHeading id="logo" />
                <a className="btn btn-gradient" href="/brand/edebooking-logo-assets.zip" download>Download assets</a>
              </div>
              <p>The {siteName} logo is the name written by hand in a flowing script. On light surfaces it is set in deep gold, and on dark ones in bright gold.</p>
              <p>It is how we sign our work across the app, the web and print. Use the artwork from this page and keep its geometry intact.</p>
              <div className="brand-plates">
                <figure className="brand-plate brand-plate-light">
                  <div className="brand-plate-stage">
                    <Image src="/brand/edebooking-logo-gold.png" alt={`${siteName} logo in deep gold`} {...logoSize} />
                  </div>
                  <figcaption>
                    <span>For light surfaces</span>
                    <a href="/brand/edebooking-logo-gold.png" download>Download PNG</a>
                  </figcaption>
                </figure>
                <figure className="brand-plate brand-plate-dark">
                  <div className="brand-plate-stage">
                    <Image src="/brand/edebooking-logo-light.png" alt={`${siteName} logo in bright gold`} {...logoSize} />
                  </div>
                  <figcaption>
                    <span>For dark surfaces</span>
                    <a href="/brand/edebooking-logo-light.png" download>Download PNG</a>
                  </figcaption>
                </figure>
              </div>
              <p>The files are {logoSize.width} × {logoSize.height} px with a transparent background. Need a larger version or a vector (SVG)? <Link className="brand-link" href="/contact">Contact us</Link> and we will send one.</p>
            </section>

            <section id="bot">
              <div className="brand-head">
                <SectionHeading id="bot" />
                <a className="btn btn-gradient" href="/brand/edebooking-bot-assets.zip" download>Download bot assets</a>
              </div>
              <p>The {siteName} assistant is a small plush bot in brand gold. Its face shows what it is doing: a soft smile when it is ready, a wide one when it is thinking, and closed eyes when it is resting.</p>
              <div className="bot-grid">
                {botStates.map(({ state, title, note, file }) => (
                  <figure className="bot-card" key={state}>
                    <div className="bot-stage"><AssistantAvatar state={state} size={104} /></div>
                    <figcaption>
                      <strong>{title}</strong>
                      <small>{note}</small>
                      <a href={`/brand/${file}`} download>Download PNG</a>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <p>Use the PNG files from this page in print and press. The live, moving bot is for the app and the web. Each file is 413 × 419 px with a transparent background.</p>
              <div className="brand-head bot-subhead">
                <h3>Shapes</h3>
                <a className="btn btn-soft" href="/brand/edebooking-bot-family.zip" download>Download the whole family</a>
              </div>
              <p>The assistant is the square, but the bot comes in eighteen shapes, from the star and the clover to the cat and the cloud. They share one face and one gold. Click a shape to download it.</p>
              <div className="variant-grid">
                {botShapes.map(({ shape, name }) => (
                  <a className="variant-card" key={shape} href={`/brand/bot/shapes/edebooking-bot-${shape}.png`} download aria-label={`Download the ${name.toLowerCase()} bot`}>
                    <span className="variant-stage"><Image src={`/brand/bot/shapes/edebooking-bot-${shape}.png`} alt="" fill sizes="150px" /></span>
                    <strong>{name}</strong>
                    {shape === "square" ? <small>The assistant</small> : <small>Download</small>}
                  </a>
                ))}
              </div>

              <div className="brand-head bot-subhead">
                <h3>Finishes</h3>
              </div>
              <p>Plush fur is our default. The same bot also comes in plastic, crisp, smooth and flat finishes, for when you need a cleaner or lighter look. Shown here on the square.</p>
              <div className="variant-grid variant-grid-finishes">
                {botFinishes.map(({ finish, file, name, note }) => (
                  <a className="variant-card" key={finish} href={`/brand/bot/finishes/edebooking-bot-square-${file}.png`} download aria-label={`Download the ${name.toLowerCase()} finish`}>
                    <span className="variant-stage"><Image src={`/brand/bot/finishes/edebooking-bot-square-${file}.png`} alt="" fill sizes="170px" /></span>
                    <strong>{name}</strong>
                    <small>{note}</small>
                  </a>
                ))}
              </div>
              <p>Shape and finish files are trimmed to the bot, roughly 250 to 330 px wide, with transparent backgrounds.</p>

              <div className="mascot-card">
                <SiteArt file="mascot-suitcase.png" className="mascot brand-mascot" alt={`The ${siteName} suitcase mascot`} />
                <div>
                  <h3>The suitcase mascot</h3>
                  <p>Our blue suitcase appears across our illustrations and scenes. It is a character for artwork, so keep the {siteName} logo as the mark that signs your work.</p>
                  <a className="btn btn-soft" href="/assets/mascot-suitcase.png" download>Download mascot PNG</a>
                </div>
              </div>
            </section>

            <section id="colour">
              <SectionHeading id="colour" />
              <p>Three groups: the colours that carry the brand, the surfaces and text they sit on, and the status colours we use for feedback. Click a colour to copy its code.</p>
              {colourGroups.map((group) => (
                <div className="swatch-group" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="swatch-grid">
                    {group.colours.map((colour) => (
                      <CopySwatch key={colour.hex} {...colour} />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section id="type">
              <SectionHeading id="type" />
              <p>On the web we set text in Plus Jakarta Sans and headlines in DM Serif Display. The logo is hand lettering set in Kalam Bold, so use the logo files from this page rather than retyping it.</p>
              <div className="type-grid">
                <div className="type-card">
                  <span className="type-aa type-aa-sans" aria-hidden="true">Aa</span>
                  <strong>Plus Jakarta Sans</strong>
                  <small>Regular, Medium, Semibold, Bold, Extrabold</small>
                </div>
                <div className="type-card">
                  <span className="type-aa type-aa-serif" aria-hidden="true">Aa</span>
                  <strong>DM Serif Display</strong>
                  <small>Regular, for headlines</small>
                </div>
              </div>
            </section>

            <section id="usage">
              <SectionHeading id="usage" />
              <div className="usage-grid">
                <div className="usage-card usage-do">
                  <h3>Dos</h3>
                  <ul>{dos.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="usage-card usage-dont">
                  <h3>Don’ts</h3>
                  <ul>{donts.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </section>

            <section id="press">
              <SectionHeading id="press" />
              <p>When you write about {siteName}, describe us as a booking platform for discovering businesses, booking services and running your own business space. For articles and announcements you can use this boilerplate:</p>
              <blockquote className="boilerplate">
                <p>{boilerplate}</p>
                <CopyButton text={boilerplate} label="Copy text" />
              </blockquote>
              <p>Refer to the company as {siteName}: one word, with a capital E and a capital B. Don’t abbreviate, pluralise or reword the name. If that doesn’t fit your piece, <Link className="brand-link" href="/contact">contact us</Link> and we will agree on language that does.</p>
            </section>

            <section id="contact">
              <SectionHeading id="contact" />
              <p>Questions about the brand, or need help with it? <Link className="brand-link" href="/contact">Contact us</Link>. Looking for something else? Try the <Link className="brand-link" href="/faq">FAQ</Link>.</p>
            </section>
          </article>
        </div>
      </section>
    </RouteShell>
  );
}
