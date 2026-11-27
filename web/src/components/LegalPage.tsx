import Link from "next/link";
import { documents, type LegalKey } from "@/lib/legal-documents";
import Icon from "@/components/Icon";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";

export type LegalSection = {
  id: string;
  title: string;
  /** Plain strings render as paragraphs; { list } renders a bulleted list. */
  body: Array<string | { list: string[] }>;
};

export default function LegalPage({ doc, eyebrow, title, description, image, updated, sections }: {
  doc: LegalKey;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  updated: string;
  sections: LegalSection[];
}) {
  const current = documents[doc];
  const others = (Object.keys(documents) as LegalKey[]).filter((key) => key !== doc);

  return (
    <RouteShell crumb={current ? { name: current.label, path: current.href } : undefined}>
      <RouteHero compact hideCta eyebrow={eyebrow} title={title} description={description} image={image} />
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

          <article className="legal-article">
            <p className="legal-updated"><Icon name="clock" /> Last updated {updated}</p>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id}>
                <h2><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
                {section.body.map((block, i) =>
                  typeof block === "string"
                    ? <p key={i}>{block}</p>
                    : <ul key={i}>{block.list.map((item) => <li key={item}>{item}</li>)}</ul>,
                )}
              </section>
            ))}
            <aside className="legal-help">
              <div>
                <h3>Questions about this page?</h3>
                <p>Tell us what you need and we’ll point you in the right direction.</p>
              </div>
              <Link className="btn btn-gradient" href="/contact">Contact us</Link>
            </aside>
          </article>
        </div>

        <div className="legal-switch">
          {others.map((key) => (
            <Link key={key} href={documents[key].href}>
              <small>ALSO READ</small>
              <strong>{documents[key].label}</strong>
              <span>{documents[key].summary}</span>
            </Link>
          ))}
        </div>
      </section>
    </RouteShell>
  );
}
