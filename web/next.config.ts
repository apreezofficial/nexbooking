import type { NextConfig } from "next";

// Account screens have no search value and are not in the sitemap, so keep them out of search results.
// A header is used so these pages need no per-page metadata. Do not also block them in robots.txt:
// a crawler that cannot fetch a page never sees its noindex.
const noindexPaths = ["/login", "/signup", "/forgot-password", "/dashboard", "/dashboard/:path*"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return noindexPaths.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    }));
  },
};

export default nextConfig;
