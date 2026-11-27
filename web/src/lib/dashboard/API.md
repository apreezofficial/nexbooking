# Customer dashboard: requests

Every action the customer mobile app can make is one function in `src/lib/dashboard/api.ts`. Today each one
reads and writes browser storage so the dashboard works as a demo. To connect a backend, replace the body of the
function with a request to the endpoint below. Arguments and return types stay the same, so no screen changes.

| Area | Function | Request | Details |
|---|---|---|---|
| auth | `auth.logout` | `POST /auth/logout` |  |
| auth | `auth.forgotPassword` | `POST /auth/password/forgot` | { email } |
| profile | `profile.get` | `GET /me` |  |
| profile | `profile.update` | `PATCH /me` | { name, email, phone, location, interests } |
| profile | `profile.changePhoto` | `POST /me/photo` | (multipart) |
| profile | `profile.detectLocation` | `POST /me/location/detect` | { latitude, longitude } |
| discovery | `discovery.search` | `GET /studios?query=&category=&maxKm=&minRating=&verified=` |  |
| discovery | `discovery.popular` | `GET /studios/popular?near=` |  |
| discovery | `discovery.topRated` | `GET /studios/top-rated` |  |
| studio | `studio.get` | `GET /studios/:id` |  |
| studio | `studio.services` | `GET /studios/:id/services` |  |
| studio | `studio.toggleSaved` | `PUT/DELETE /me/saved/:id` |  |
| studio | `studio.toggleFollow` | `PUT/DELETE /me/following/:id` |  |
| booking | `booking.quote` | `POST /bookings/quote` | { studioId, serviceId, promo } |
| booking | `booking.holdSlot` | `POST /bookings/hold` | { studioId, serviceId, date, time }   (holds the slot for 10 minutes) |
| booking | `booking.create` | `POST /bookings` | { ...BookingFlow, payment }  → creates the booking, charges, issues the receipt |
| bookings | `bookings.list` | `GET /bookings?status=upcoming|past|cancelled` |  |
| bookings | `bookings.get` | `GET /bookings/:code` |  |
| bookings | `bookings.reschedule` | `POST /bookings/:code/reschedule` | { date, time, reason } |
| bookings | `bookings.cancel` | `POST /bookings/:code/cancel` | { reason, note }  → refund details |
| bookings | `bookings.joinConsultation` | `POST /consultations/:code/join` | → { roomUrl, token } |
| reviews | `reviews.list` | `GET /me/reviews` |  |
| reviews | `reviews.create` | `POST /reviews` | { studioId, rating, tags, text } |
| reviews | `reviews.update` | `PATCH /reviews/:id` |  |
| reviews | `reviews.remove` | `DELETE /reviews/:id` |  |
| billing | `billing.receipts` | `GET /me/receipts` |  |
| billing | `billing.receipt` | `GET /me/receipts/:ref` |  |
| billing | `billing.proformas` | `GET /me/proformas` |  |
| billing | `billing.downloadReceipt` | `GET /me/receipts/:ref/pdf` | → file |
| billing | `billing.downloadAll` | `GET /me/receipts/export` | → one PDF of every receipt |
| billing | `billing.paymentMethods` | `GET /me/payment-methods` |  |
| billing | `billing.addPaymentMethod` | `POST /me/payment-methods` | (tokenised by the payment provider, never raw card data) |
| messages | `messages.threads` | `GET /messages/threads` |  |
| messages | `messages.thread` | `GET /messages/threads/:id` |  |
| messages | `messages.send` | `POST /messages/threads/:id` | { text } |
| messages | `messages.attach` | `POST /messages/threads/:id/attachments` | (multipart) |
| notes | `notes.list` | `GET /me/notes` |  |
| notes | `notes.create` | `POST /me/notes` |  |
| notes | `notes.toggle` | `PATCH /me/notes/:id` |  |
| notes | `notes.remove` | `DELETE /me/notes/:id` |  |
| notes | `notes.fromVoice` | `POST /me/notes/voice` | (audio) → tasks found in the recording |
| notifications | `notifications.list` | `GET /me/notifications` |  |
| notifications | `notifications.markRead` | `POST /me/notifications/:id/read` |  |
| settings | `settings.get` | `GET /me/settings` |  |
| settings | `settings.update` | `PATCH /me/settings` |  |
| settings | `settings.changePassword` | `POST /me/password` | { current, next } |
| settings | `settings.sessions` | `GET /me/sessions` |  |
| settings | `settings.exportData` | `POST /me/data-export` |  |
| settings | `settings.deleteAccount` | `DELETE /me` | (asks for a second confirmation first) |
| support | `support.faqs` | `GET /help/faqs` |  |

Also: `bootstrap()` fills a first-time dashboard with the app's sample content. A real account does not need it.
All screens call these through `api` and never touch storage directly. Pages are under `src/app/dashboard`, screens under
`src/components/dashboard/screens`, and the shared building blocks in `src/components/dashboard/ui.tsx`.
