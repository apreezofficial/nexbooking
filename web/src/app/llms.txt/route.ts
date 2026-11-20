import { publicRoutes, siteDescription, siteName, siteUrl } from "@/lib/site";

/**
 * /llms.txt: a plain-text map of the site for language-model crawlers and assistants,
 * following the llms.txt convention. Built from the same route list as the sitemap.
 */
export function GET() {
  const line = (route: (typeof publicRoutes)[number]) =>
    `- [${route.label}](${siteUrl}${route.path === "/" ? "" : route.path}): ${route.summary}`;

  const body = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    "## Pages",
    ...publicRoutes.filter((route) => route.group === "main").map(line),
    "",
    "## Policies",
    ...publicRoutes.filter((route) => route.group === "legal").map(line),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
