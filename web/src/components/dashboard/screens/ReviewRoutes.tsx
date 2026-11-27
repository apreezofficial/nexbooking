"use client";

import { use } from "react";
import { useBookings } from "@/lib/dashboard/hooks";
import ReviewScreen from "./ReviewScreen";

/** Review the studio of a booking: /dashboard/bookings/:code/review */
export function BookingReviewRoute({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const booking = useBookings().find((item) => item.code === code);
  return <ReviewScreen studioId={booking?.studioId ?? "glow-studio"} back={`/dashboard/bookings/${code}`} />;
}

/** Edit one of your reviews: /dashboard/account/reviews/:id */
export function ReviewEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReviewScreen studioId="glow-studio" reviewId={id} back="/dashboard/account/reviews" />;
}

/** Write a new review for a recent visit: /dashboard/account/reviews/new */
export function ReviewNewRoute() {
  return <ReviewScreen studioId="zara-nails" back="/dashboard/account/reviews" />;
}
