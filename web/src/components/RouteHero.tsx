import Link from "next/link";
import SiteArt from "@/components/SiteArt";

export default function RouteHero({ eyebrow, title, description, image, cta = "Explore booking", href = "/booking" }: {
  eyebrow: string; title: string; description: string; image: string; cta?: string; href?: string;
}) {
  return (
    <section className="route-hero">
      <div className="route-hero-copy">
        <p className="eyebrow">✦ {eyebrow}</p>
        <h1>{title}</h1>
        <p className="route-hero-description">{description}</p>
        <Link className="btn btn-dark" href={href}>{cta}</Link>
      </div>
      <SiteArt file={image} className="route-hero-art" alt="" />
    </section>
  );
}
