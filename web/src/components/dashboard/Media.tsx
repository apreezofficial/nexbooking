"use client";

import Image from "next/image";

/** The site's photo frame (`.art`), for any image src. Use it wherever the web uses SiteArt or ServicePhoto. */
export function DashArt({ src, alt = "", className = "", sizes = "(max-width: 700px) 90vw, 480px" }: { src: string; alt?: string; className?: string; sizes?: string }) {
  return (
    <div className={`art ${className}`.trim()}>
      <Image src={src} alt={alt} fill sizes={sizes} />
    </div>
  );
}
