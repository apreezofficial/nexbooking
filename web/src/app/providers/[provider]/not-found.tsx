import ServicesHalftone404 from "@/components/ServicesHalftone404";
import SiteNav from "@/components/SiteNav";

export default function ProviderNotFound() {
  return (
    <div className="nf-page">
      <SiteNav current="Discover" />
      <ServicesHalftone404
        message="This provider profile could not be found."
        ctaHref="/services"
        ctaLabel="Explore services"
      />
    </div>
  );
}
