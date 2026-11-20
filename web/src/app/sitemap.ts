import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "@/lib/site";

// Evaluated once at build time, so "last modified" is the date of the latest deploy.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
