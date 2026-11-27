import { Suspense } from "react";
import { notFound } from "next/navigation";
import SinglePageBooking from "@/components/SinglePageBooking";
import { demoServicePrice, providerForService, servicePreviews } from "@/lib/services";

type Props = { params: Promise<{ serviceId: string }> };

async function Appointment({ params }: Props) {
  const { serviceId } = await params;
  const service = servicePreviews.find(item => item.id === serviceId);
  if (!service) notFound();

  return (
    <section className="booking-service-page-wrap dashboard-service-booking">
      <SinglePageBooking
        service={service}
        provider={providerForService(service)}
        price={demoServicePrice(service.category)}
        dashboard
      />
    </section>
  );
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true">Loading appointment…</div>}>
      <Appointment params={params} />
    </Suspense>
  );
}
