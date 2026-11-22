"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Ensures that whenever a route or search navigation occurs:
 * 1. If there's an in-page hash anchor (e.g. #faq), scroll to that element.
 * 2. If it's a new page / route navigation without a hash, instantly scrolls to the top (0, 0).
 * 3. Also listens to internal link clicks to ensure smooth, immediate scroll-to-top transition.
 */
export default function NavigationScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef(pathname);

  useEffect(() => {
    // If the path changed, scroll to top unless there's a hash target
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Scroll to top on pathname changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    prevPath.current = pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links that navigate to pages so scroll reset is immediate
    const handleLinkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement)?.closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      // Only handle internal links
      if (url.origin === window.location.origin) {
        if (!url.hash && (url.pathname !== window.location.pathname || url.search !== window.location.search)) {
          // Navigating to a different page without hash: prepare scroll top
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => document.removeEventListener("click", handleLinkClick, { capture: true });
  }, []);

  return null;
}
