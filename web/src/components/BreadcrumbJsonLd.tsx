import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";

export type Crumb = { name: string; path: string };

/** schema.org BreadcrumbList for a page. Search engines can show it in place of the raw URL. */
export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
        })),
      }}
    />
  );
}
