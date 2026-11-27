"use client";

import { useRouter } from "next/navigation";
import { naira, servicesByStudio, staffOptions, studioById } from "@/lib/dashboard/data";
import { useFlow } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Chips, PageHeader, Steps } from "../ui";

export default function BookServiceScreen() {
  const router = useRouter();
  const flow = useFlow();
  const studio = studioById(flow.value.studioId);
  const services = servicesByStudio[studio.id] ?? [];
  const selected = services.find((service) => service.id === flow.value.serviceId) ?? services[0];

  return (
    <Page>
      <PageHeader title="Choose service" back={`/dashboard/studios/${studio.id}`} />
      <Steps n={1} label="Service & staff" />
      <h2 className="d-h3">{studio.name}</h2>
      {services.map((service) => (
        <button key={service.id} type="button" className={`d-box${selected?.id === service.id ? " is-selected" : ""}`} aria-pressed={selected?.id === service.id} onClick={() => flow.set({ ...flow.value, serviceId: service.id })}>
          <span className="d-between"><b>{service.name}</b><b>{naira(service.price)}</b></span>
          <small>{service.detail}</small>
        </button>
      ))}
      <h2 className="d-h2">Choose staff</h2>
      <Chips items={staffOptions} value={flow.value.staff} onChange={(staff) => flow.set({ ...flow.value, staff })} />
      <h2 className="d-h2">{selected ? naira(selected.price) : ""}</h2>
      <Button size="large" block onClick={() => router.push("/dashboard/book/date")}>Book now</Button>
    </Page>
  );
}
