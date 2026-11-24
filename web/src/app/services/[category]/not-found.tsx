import ServicesHalftone404 from "@/components/ServicesHalftone404";
import SiteNav from "@/components/SiteNav";

export default function ServiceCategoryNotFound() {
  return (
    <div className="nf-page">
      <SiteNav current="Services" />
      <ServicesHalftone404
        message="No service category or booking lives here."
        ctaHref="/services"
        ctaLabel="Explore services"
      />
    </div>
  );
}
