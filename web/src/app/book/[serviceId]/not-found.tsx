import ServicesHalftone404 from "@/components/ServicesHalftone404";
import SiteNav from "@/components/SiteNav";

export default function BookServiceNotFound() {
  return (
    <div className="nf-page">
      <SiteNav current="Booking" />
      <ServicesHalftone404
        message="This booking or service could not be found."
        ctaHref="/services"
        ctaLabel="Explore services"
      />
    </div>
  );
}
