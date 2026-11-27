"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/dashboard/api";
import { reviewTags, studioById } from "@/lib/dashboard/data";
import { useReviews, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Chip, PageHeader, TextArea } from "../ui";

/** Write a review, or edit one when `reviewId` is given. `studioId` is the studio being reviewed. */
export default function ReviewScreen({ studioId, reviewId, back }: { studioId: string; reviewId?: string; back: string }) {
  const router = useRouter();
  const existing = useReviews().find((review) => review.id === reviewId);
  const studio = studioById(existing?.studioId ?? studioId);
  const { run, busy } = useRun();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [text, setText] = useState(existing?.text ?? "");

  const toggle = (tag: string) => setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));

  const submit = async () => {
    const done = existing
      ? await run(api.reviews.update(existing.id, { rating, tags, text }).then(() => true), "Review updated.")
      : await run(api.reviews.create({ studioId: studio.id, rating, tags, text }), "Thanks, your review is posted.");
    if (done) router.push(back);
  };

  return (
    <Page>
      <PageHeader title={existing ? "Edit review" : "Submit review"} back={back} />
      <h2 className="d-h1">How was {studio.name}?</h2>
      <div className="d-stars" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} className={value <= rating ? "is-on" : undefined} onClick={() => setRating(value)}>★</button>
        ))}
      </div>
      <h2 className="d-h2">What went well?</h2>
      <div className="d-chips">{reviewTags.map((tag) => <Chip key={tag} label={tag} selected={tags.includes(tag)} onClick={() => toggle(tag)} />)}</div>
      <TextArea label="Your review" value={text} onChange={(event) => setText(event.target.value)} placeholder="Tell others what it was like" />
      <Button size="large" block loading={busy} disabled={rating < 1} onClick={submit}>{existing ? "Save changes" : "Submit review"}</Button>
    </Page>
  );
}
