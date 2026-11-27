"use client";

import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { naira, servicesByStudio, studioById } from "@/lib/dashboard/data";
import { useFlow, useFollowing, useReviews } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Badge, Button, Card, Chips, IconButton, Row, VerifiedMark } from "../ui";

export default function StorefrontScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const studio = studioById(id);
  const following = useFollowing();
  const reviews = useReviews().filter((review) => review.studioId === studio.id);
  const flow = useFlow();
  const services = servicesByStudio[studio.id] ?? [];
  const [tab, setTab] = useState("Works");
  const lowest = Math.min(...services.map((service) => service.price));

  const book = (serviceId?: string) => {
    flow.set({ ...flow.value, studioId: studio.id, serviceId: serviceId ?? services[0]?.id ?? "", date: "", time: "13:00", promo: "" });
    router.push("/dashboard/book/service");
  };

  return (
    <Page wide>
      <div className="d-cover">
        <Image src={studio.photo} alt={`${studio.name} studio`} fill priority sizes="(max-width: 1100px) 100vw, 1000px" />
        <div className="d-cover-back"><IconButton icon={ArrowLeft} label="Back" onClick={() => router.back()} /></div>
      </div>
      <div className="d-storehead">
        <div>
          <h1>{studio.name}{studio.verified ? <VerifiedMark /> : null}</h1>
          <p className="d-muted">{studio.category} · {studio.area}</p>
          <Badge label={`★ ${studio.rating} · ${studio.reviews} reviews`} />
        </div>
        <div className="d-inline">
          <Button variant="outline" href={`/dashboard/inbox/${studio.id}`}>Message</Button>
          <Button variant="outline" onClick={() => void api.studio.toggleFollow(studio.id)}>{following[studio.id] ? "Following" : "Follow"}</Button>
        </div>
      </div>

      <Chips items={["Works", "Services", "Reviews", "About"]} value={tab} onChange={setTab} />

      {tab === "Works" ? (
        <div className="d-works">
          {studio.works.map((photo, index) => (
            <button key={photo} type="button" className="d-work" onClick={() => book()} aria-label={`${studio.name} work ${index + 1}. Book now`}>
              <Image src={photo} alt="" fill sizes="(max-width: 700px) 50vw, 330px" />
            </button>
          ))}
        </div>
      ) : null}

      {tab === "Services" ? (
        <div className="d-stack">
          {services.map((service) => (
            <div key={service.id} className="d-box">
              <span className="d-between"><b>{service.name}</b><b>{naira(service.price)}</b></span>
              <small>{service.detail}</small>
              <div><Button size="small" onClick={() => book(service.id)}>Book this</Button></div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Reviews" ? (
        <div className="d-stack">
          {reviews.length === 0 ? <p className="d-muted">{studio.reviews} reviews so far. Yours will appear here once you’ve visited.</p> : null}
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="d-between"><b>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</b><small className="d-muted">{review.date}</small></div>
              <p className="d-muted">{review.text}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "About" ? (
        <Card>
          <p className="d-muted">{studio.about}</p>
          <Row label="Rating" value={`★ ${studio.rating}`} />
          <Row label="Location" value={studio.area} />
          <Row label="Distance" value={studio.distance} />
        </Card>
      ) : null}

      <div className="d-between d-bookbar">
        <h2 className="d-h2">From {naira(lowest)}</h2>
        <Button size="large" onClick={() => book()}>Book now</Button>
      </div>
    </Page>
  );
}
