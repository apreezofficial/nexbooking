"use client";

import { api } from "@/lib/dashboard/api";
import { studioById } from "@/lib/dashboard/data";
import { useRun, useReviews } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { BusinessLogo, Button, Card, PageHeader } from "../ui";

export default function ReviewsScreen() {
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
        <Button size="small" href="/dashboard/account/reviews/new">Write review</Button>
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
              <Button variant="text" size="small" href={`/dashboard/account/reviews/${review.id}`}>Edit</Button>
              <Button variant="text" size="small" onClick={() => void run(api.reviews.remove(review.id), "Review deleted.")}>Delete</Button>
            </div>
          </Card>
        );
      })}
    </Page>
  );
}
