import Image from "next/image";
import Link from "next/link";
import { siteName } from "@/lib/site";

/**
 * The EdeBooking mark with the name beside it, on a transparent background.
 * Use tone="dark" on dark surfaces and the default on light ones.
 */
export default function BrandLogo({ className = "", tone = "light", wordmark = true }: { className?: string; tone?: "light" | "dark"; wordmark?: boolean }) {
  const mark = tone === "dark" ? "/brand/edebooking-mark.png" : "/brand/edebooking-mark-light.png";
  return (
    <Link href="/" className={`brand-lockup ${className}`.trim()} translate="no" aria-label={`${siteName} home`}>
      <Image src={mark} alt="" width={28} height={36} className="brand-lockup-mark" priority />
      {wordmark && <span className="brand-lockup-text">{siteName}</span>}
    </Link>
  );
}
