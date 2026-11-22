"use client";

import Image from "next/image";
import { useState } from "react";

export default function ServicePhoto({ file, className = "" }: { file: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={`art service-photo ${className} ${loaded || failed ? "photo-ready" : ""}`} aria-busy={!loaded && !failed}>
      {!failed && <Image src={`/assets/${file}`} alt="" fill sizes="(max-width: 600px) 95vw, 480px" loading="lazy" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
      {failed && <span className="photo-unavailable">Photo unavailable</span>}
    </div>
  );
}
