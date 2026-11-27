"use client";

import { useState } from "react";
import SideDrawer, { SideDrawerTrigger } from "../SideDrawer";
import ReviewScreen from "./ReviewScreen";
import { api } from "@/lib/dashboard/api";
import { studioById } from "@/lib/dashboard/data";
import { useRun, useReviews } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { BusinessLogo, Button, Card, PageHeader } from "../ui";

export default function ReviewsScreen() {
  const [editing, setEditing] = useState<string | null>(null);
  const close = () => setEditing(null);
  const reviews = useReviews();
  const { run } = useRun();
  const zara = studioById("zara-nails");

  return (
    <Page>
      <PageHeader title="My reviews" back="/dashboard/account" />
      <Card tone="tint" className="d-media">
        <BusinessLogo monogram={zara.monogram} name={zara.name} size={42} />
        <div>
          <b>Rate your visit at Zara Nails</b>
          <small>Wash & style · 10 Nov</small>
        </div>
        <SideDrawer title="Write review" open={editing === "new"} onOpenChange={open => setEditing(open ? "new" : null)}
          trigger={<SideDrawerTrigger className="btn btn-gradient">Write review</SideDrawerTrigger>}>
          {editing === "new" && <ReviewScreen studioId={zara.id} back="/dashboard/account/reviews" onDone={close} />}
        </SideDrawer>
      </Card>
      <div className="d-between"><h2 className="d-h2">Your reviews</h2><span className="d-muted">{reviews.length}</span></div>
      {reviews.length === 0 ? <p className="d-muted">You haven’t written any reviews yet.</p> : null}
      {reviews.map((review) => {
        const studio = studioById(review.studioId);
        return (
          <Card key={review.id} className="d-stack">
            <div className="d-media">
              <BusinessLogo monogram={studio.monogram} name={review.studio} size={42} />
              <div><b>{review.studio}</b><small className="d-stars-text">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</small></div>
              <small className="d-muted">{review.date}</small>
            </div>
            <p className="d-muted">{review.text}</p>
            <div className="d-inline">
              <SideDrawer title="Edit review" open={editing === review.id} onOpenChange={open => setEditing(open ? review.id : null)}
                trigger={<SideDrawerTrigger className="btn btn-ghost">Edit</SideDrawerTrigger>}>
                {editing === review.id && <ReviewScreen studioId={review.studioId} reviewId={review.id} back="/dashboard/account/reviews" onDone={close} />}
              </SideDrawer>
              <Button variant="text" size="small" onClick={() => void run(api.reviews.remove(review.id), "Review deleted.")}>Delete</Button>
            </div>
          </Card>
        );
      })}
    </Page>
  );
}
