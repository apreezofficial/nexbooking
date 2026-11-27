# Chat Widget Platform: API Reference (Recommended Design)

Companion to [chat-widget-platform.md](chat-widget-platform.md) (backend, frontend and SDK briefs).

Audience: backend developer (to build), frontend and SDK engineers (to consume). This is the recommended endpoint inventory for the whole system, from login to webhooks. Names, paths and fields are a recommended starting contract; the OpenAPI spec generated from it becomes the source of truth for the SDKs.

## A1. Conventions

**Base URLs**
- REST: `https://api.ourdomain.com/v1`
- Realtime: `wss://rt.ourdomain.com/v1`
- Inbound channel webhooks: `https://hooks.ourdomain.com/v1/...`

**Authentication types**

| Type | Header | Used by |
|---|---|---|
| User access token (JWT) | `Authorization: Bearer <token>` | Dashboard, agent mobile app |
| Secret API key | `Authorization: Bearer sk_live_...` | Tenant servers, server SDKs |
| Widget session token | `Authorization: Bearer <session_jwt>` | Web widget, mobile SDK |
| Public key | `X-Public-Key: pk_live_...` | Only `POST /widget/session` |
| Platform signature | provider-specific header | Inbound channel and email webhooks |

**General rules**
- JSON everywhere; `snake_case` fields; ids are prefixed strings (`cnv_`, `msg_`, `tkt_`, `agt_`, `con_`); timestamps are ISO 8601 UTC.
- Tenant is derived from the token or key, never from a path or body field the client controls.
- **Pagination**: cursor based. `?limit=50&cursor=...` returns `{ data: [], next_cursor, has_more }`.
- **Filtering and sorting**: `?status=open&channel=telegram&sort=-created_at`.
- **Idempotency**: `Idempotency-Key` header on every POST that creates something; `client_msg_id` for messages.
- **Errors**: `{ error: { code, message, details, request_id } }` with correct HTTP status (400, 401, 403, 404, 409, 422, 429, 5xx). Every response carries `X-Request-Id`.
- **Rate limits**: `X-RateLimit-Limit`, `-Remaining`, `-Reset`; `429` with `Retry-After`.
- **Versioning**: path version (`/v1`) plus optional `API-Version` date header for minor changes.
- **Expansion**: `?expand=contact,agent` to embed related objects.
- **Bulk and async**: long jobs (crawling, exports) return `202` with a job id from `/jobs/{id}`.
- **Permissions**: each endpoint lists the minimum role (O owner, A admin, G agent, V viewer) or scope.

## A2. Auth and identity (platform users)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Create user (and tenant if `tenant_name` given) | none |
| POST | `/auth/email/verify` | Verify email with token | none |
| POST | `/auth/email/resend` | Resend verification email | none |
| POST | `/auth/login` | Email and password login; returns tokens or `mfa_required` challenge | none |
| POST | `/auth/mfa/verify` | Submit TOTP, email code, backup code or passkey assertion for a challenge | challenge token |
| POST | `/auth/token/refresh` | Rotate refresh token, get new access token | refresh token |
| POST | `/auth/logout` | Revoke current session | user |
| POST | `/auth/logout-all` | Revoke all sessions | user |
| POST | `/auth/password/forgot` | Send reset email (generic response) | none |
| POST | `/auth/password/reset` | Set new password with token; revokes sessions | none |
| POST | `/auth/password/change` | Change password (requires current) | user |
| GET | `/auth/oauth/{provider}/authorize` | Get provider authorization URL with state and PKCE | none |
| POST | `/auth/oauth/{provider}/callback` | Exchange code; login, signup or link | none |
| POST | `/auth/oauth/{provider}/native` | Exchange native SDK id token (Apple, Google) | none |
| GET | `/auth/passkeys/options` | WebAuthn request options (login) | none |
| POST | `/auth/passkeys/login` | Verify passkey assertion | none |
| POST | `/auth/step-up` | Re-verify (MFA or password) for sensitive actions; returns short-lived step-up token | user |
| POST | `/auth/invitations/accept` | Accept team invitation | token |

### Account, MFA, sessions

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/me` | Current user, memberships, permissions | user |
| PATCH | `/me` | Update name, avatar, locale, notification prefs | user |
| DELETE | `/me` | Delete account (step-up) | user |
| GET | `/me/sessions` | List sessions and devices | user |
| DELETE | `/me/sessions/{id}` | Revoke a session | user |
| GET | `/me/mfa/factors` | List MFA factors | user |
| POST | `/me/mfa/totp/setup` | Start TOTP setup (secret and QR URI) | user |
| POST | `/me/mfa/totp/confirm` | Confirm TOTP, returns backup codes | user |
| POST | `/me/mfa/passkeys` | Register passkey (options then verify) | user |
| POST | `/me/mfa/backup-codes/regenerate` | New backup codes (step-up) | user |
| DELETE | `/me/mfa/factors/{id}` | Remove factor (step-up) | user |
| GET | `/me/oauth-accounts` | Linked social accounts | user |
| DELETE | `/me/oauth-accounts/{id}` | Unlink (not the last login method) | user |
| POST | `/me/devices` | Register push token (ios, android, web) | user |
| DELETE | `/me/devices/{id}` | Remove push token | user |
| POST | `/me/data-export` | Request personal data export (job) | user |

## A3. Tenant, team and security

| Method | Path | Purpose | Role |
|---|---|---|---|
| POST | `/tenants` | Create another tenant | user |
| GET | `/tenant` | Current tenant profile and settings | V |
| PATCH | `/tenant` | Update name, timezone, locale, retention, branding | A |
| DELETE | `/tenant` | Delete tenant (step-up) | O |
| POST | `/tenant/switch` | Switch active tenant, returns new access token | user |
| GET | `/tenant/security` | Security policy (MFA required, SSO, session length, IP allow-list) | A |
| PATCH | `/tenant/security` | Update security policy | A |
| GET | `/members` | List team members | A |
| PATCH | `/members/{id}` | Change role, skills, status | A |
| DELETE | `/members/{id}` | Remove member | A |
| GET | `/invitations` | Pending invitations | A |
| POST | `/invitations` | Invite by email and role | A |
| DELETE | `/invitations/{id}` | Revoke invitation | A |
| GET | `/roles` | Roles and permissions | A |
| GET | `/api-keys` | List keys (prefix only) | A |
| POST | `/api-keys` | Create key (secret shown once; step-up) | A |
| POST | `/api-keys/{id}/rotate` | Rotate key | A |
| DELETE | `/api-keys/{id}` | Revoke key | A |
| GET | `/allowed-domains` | Widget origin allow-list | A |
| PUT | `/allowed-domains` | Replace allow-list | A |
| GET | `/audit-logs` | Audit log with filters | A |
| GET | `/sso/config` | SSO config (SAML or OIDC) | A |
| PUT | `/sso/config` | Set SSO config, domain verification | O |
| GET | `/usage` | Usage and quota meters | A |
| GET | `/billing` | Plan, payment method, invoices | O |
| POST | `/billing/checkout` | Start plan change checkout | O |
| POST | `/billing/portal` | Open billing portal | O |

## A4. Widget and SDK session (visitor side)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/widget/session` | Create or resume session: public key, origin, optional identity and signature. Returns session JWT, widget config, active conversation | public key |
| POST | `/widget/session/refresh` | Refresh session token | session |
| POST | `/widget/identify` | Attach or verify identity, merge anonymous contact | session |
| POST | `/widget/attributes` | Set custom attributes | session |
| POST | `/widget/reset` | Return to anonymous | session |
| GET | `/widget/config` | Theme, greeting, agents, business hours, languages, pre-chat form, offline settings | session |
| POST | `/widget/consent` | Record consent | session |
| POST | `/widget/devices` | Register mobile push token | session |
| GET | `/widget/articles` | Search help articles from the knowledge base | session |
| GET | `/widget/offline-pack` | Download offline knowledge pack manifest and chunks (mobile) | session |
| POST | `/widget/events` | Page and behavior events for proactive rules | session |

### Visitor conversations (same data via session token)

| Method | Path | Purpose |
|---|---|---|
| GET | `/widget/conversations` | List this contact's conversations |
| POST | `/widget/conversations` | Start conversation (`agent_id`, `topic`, `prefill`) |
| GET | `/widget/conversations/{id}/messages` | Message history (cursor) |
| POST | `/widget/conversations/{id}/messages` | Send message (`client_msg_id`, text, attachments) |
| POST | `/widget/conversations/{id}/read` | Mark read |
| POST | `/widget/conversations/{id}/typing` | Typing start or stop |
| POST | `/widget/conversations/{id}/handoff` | Request human |
| POST | `/widget/messages/{id}/feedback` | Thumbs up or down |
| POST | `/widget/conversations/{id}/csat` | Submit CSAT rating and comment |
| POST | `/widget/offline-messages` | Leave a message when nobody is online (creates ticket) |
| GET | `/widget/tickets` | Contact's tickets |
| POST | `/widget/uploads` | Get signed upload URL for an attachment |
| POST | `/sync` | Offline sync: cursor plus outbox batch; returns new messages and id mappings |

## A5. Conversations and messages (dashboard and server)

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/conversations` | List with filters (status, channel, agent, assignee, tag, contact, date, unread) | G |
| POST | `/conversations` | Start outbound conversation on a channel | G |
| GET | `/conversations/{id}` | Detail (expand contact, agent, ticket) | G |
| PATCH | `/conversations/{id}` | Status, tags, priority | G |
| POST | `/conversations/{id}/assign` | Assign to user or unassign | G |
| POST | `/conversations/{id}/takeover` | Human takes over from AI | G |
| POST | `/conversations/{id}/handback` | Return to AI | G |
| POST | `/conversations/{id}/route` | Route to a different agent | G |
| POST | `/conversations/{id}/resolve` | Resolve (optional CSAT and transcript email) | G |
| POST | `/conversations/{id}/reopen` | Reopen | G |
| POST | `/conversations/{id}/summary` | Generate AI summary | G |
| POST | `/conversations/{id}/transcript/email` | Email transcript to an address | G |
| GET | `/conversations/{id}/messages` | Message history (cursor) | G |
| POST | `/conversations/{id}/messages` | Send message as human or system (`type`: reply, note) | G |
| PATCH | `/messages/{id}` | Edit (where channel supports) | G |
| DELETE | `/messages/{id}` | Delete or redact | A |
| POST | `/conversations/{id}/suggestions` | AI suggested replies (copilot) | G |
| POST | `/conversations/{id}/typing` | Agent typing indicator | G |
| POST | `/conversations/{id}/read` | Mark read | G |
| POST | `/conversations/bulk` | Bulk assign, tag, resolve | G |
| GET | `/conversations/search` | Full-text search across messages | G |
| POST | `/uploads` | Signed upload URL for attachments | G |
| GET | `/attachments/{id}` | Signed download URL | G |

## A6. Contacts

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/contacts` | List and search | G |
| POST | `/contacts` | Create or upsert by external id, email or phone | G |
| GET | `/contacts/{id}` | Detail with identities, attributes | G |
| PATCH | `/contacts/{id}` | Update | G |
| DELETE | `/contacts/{id}` | Delete (GDPR, job) | A |
| POST | `/contacts/{id}/merge` | Merge duplicates | A |
| GET | `/contacts/{id}/identities` | Channel identities | G |
| GET | `/contacts/{id}/conversations` | Conversation history | G |
| GET | `/contacts/{id}/tickets` | Tickets | G |
| POST | `/contacts/{id}/export` | Export contact data (job) | A |
| GET | `/contact-attributes` | Attribute definitions | A |
| POST | `/contact-attributes` | Define custom attribute | A |
| POST | `/contacts/import` | Import CSV (job) | A |
| GET | `/segments` | Saved filters or segments | G |

## A7. Agents (AI) and routing

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/agents` | List agents | G |
| POST | `/agents` | Create agent (type, prompt, tone, delay, tools, knowledge) | A |
| GET | `/agents/{id}` | Detail (draft and published versions) | G |
| PATCH | `/agents/{id}` | Update draft | A |
| DELETE | `/agents/{id}` | Delete | A |
| POST | `/agents/{id}/publish` | Publish draft as a new version | A |
| GET | `/agents/{id}/versions` | Version history | A |
| POST | `/agents/{id}/versions/{v}/rollback` | Roll back | A |
| POST | `/agents/{id}/duplicate` | Clone | A |
| POST | `/agents/{id}/enable` | Turn on | A |
| POST | `/agents/{id}/disable` | Turn off (traffic falls back) | A |
| PUT | `/agents/{id}/knowledge` | Set accessible knowledge bases | A |
| PUT | `/agents/{id}/tools` | Set enabled tools and permissions | A |
| PUT | `/agents/{id}/handoff-rules` | Handoff rules | A |
| PUT | `/agents/{id}/guardrails` | Guardrails and forbidden topics | A |
| PUT | `/agents/{id}/schedule` | Working hours and out-of-hours behavior | A |
| PUT | `/agents/{id}/channel-overrides` | Per-channel tone and length | A |
| POST | `/agents/{id}/playground/sessions` | Start sandbox chat (no side effects) | A |
| POST | `/agents/{id}/playground/sessions/{sid}/messages` | Send test message; response includes retrieved chunks and tool calls | A |
| GET | `/routing/rules` | Routing rules (intent, page context, priority) | A |
| PUT | `/routing/rules` | Replace routing rules | A |
| GET | `/routing/triage` | Triage agent settings | A |
| PUT | `/routing/triage` | Update triage | A |
| GET | `/models` | Available AI models for agents | A |

## A8. Tickets

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/tickets` | List with filters (status, priority, assignee, category, SLA state) | G |
| POST | `/tickets` | Create (from conversation or manually) | G |
| GET | `/tickets/{id}` | Detail with timeline | G |
| PATCH | `/tickets/{id}` | Status, priority, category, tags, subject | G |
| POST | `/tickets/{id}/assign` | Assign | G |
| POST | `/tickets/{id}/comments` | Internal note or public reply | G |
| GET | `/tickets/{id}/timeline` | Events and messages | G |
| POST | `/tickets/{id}/merge` | Merge tickets | G |
| POST | `/tickets/{id}/reopen` | Reopen | G |
| POST | `/tickets/bulk` | Bulk update | G |
| GET | `/ticket-categories` | Categories | G |
| POST | `/ticket-categories` | Create category | A |
| GET | `/sla-policies` | SLA policies | A |
| PUT | `/sla-policies` | Set SLA policies | A |
| GET | `/ticket-rules` | Auto-creation and assignment rules | A |
| PUT | `/ticket-rules` | Update rules | A |

## A9. Knowledge base

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/knowledge-bases` | List knowledge bases | G |
| POST | `/knowledge-bases` | Create | A |
| GET | `/knowledge-bases/{id}/sources` | Sources and indexing status | G |
| POST | `/knowledge-bases/{id}/sources/url` | Add URL (crawl job) | A |
| POST | `/knowledge-bases/{id}/sources/file` | Upload file (via signed URL, then register) | A |
| POST | `/knowledge-bases/{id}/sources/faq` | Add FAQ entries | A |
| DELETE | `/sources/{id}` | Remove source | A |
| POST | `/sources/{id}/reindex` | Re-index | A |
| PATCH | `/sources/{id}` | Toggle `offline_safe`, visibility | A |
| GET | `/sources/{id}/chunks` | Preview chunks | A |
| POST | `/knowledge-bases/{id}/search` | Test retrieval | G |
| GET | `/knowledge/gaps` | Questions the AI could not answer | A |
| POST | `/offline-packs/build` | Build offline pack for mobile (job) | A |
| GET | `/offline-packs` | Pack versions and sizes | A |

## A10. Channels

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/channels` | List connections and health | A |
| GET | `/channels/{id}` | Detail | A |
| PATCH | `/channels/{id}` | Settings (default agent, hours, tone override) | A |
| DELETE | `/channels/{id}` | Disconnect | A |
| POST | `/channels/{id}/test` | Send test message or health check | A |
| POST | `/channels/telegram/connect` | Provide bot token; sets webhook | A |
| POST | `/channels/whatsapp/connect` | Complete Meta embedded signup (code exchange) | A |
| GET | `/channels/whatsapp/{id}/templates` | List templates and approval state | A |
| POST | `/channels/whatsapp/{id}/templates` | Submit template | A |
| POST | `/channels/messenger/connect` | OAuth page connection | A |
| POST | `/channels/instagram/connect` | OAuth connection | A |
| POST | `/channels/sms/connect` | Provider credentials and number | A |
| POST | `/channels/slack/connect` | OAuth install (notifications) | A |
| POST | `/channels/email/connect` | Mailbox forwarding or inbound address setup | A |

### Inbound channel webhooks (platform to us)

| Method | Path | Source |
|---|---|---|
| GET and POST | `/hooks/whatsapp/{connection_id}` | Meta verification handshake and events |
| POST | `/hooks/telegram/{connection_id}` | Telegram updates (secret token header) |
| GET and POST | `/hooks/messenger/{connection_id}` | Messenger events |
| GET and POST | `/hooks/instagram/{connection_id}` | Instagram events |
| POST | `/hooks/sms/{connection_id}` | SMS provider events and delivery status |
| POST | `/hooks/email/inbound` | Parsed inbound email |
| POST | `/hooks/email/events` | Bounces, complaints, deliveries |
| POST | `/hooks/billing` | Payment provider events |

Each handler verifies the platform signature, dedupes on `external_message_id`, normalizes into a `Message`, enqueues, and returns `200` fast.

## A11. Email and documents

| Method | Path | Purpose | Role |
|---|---|---|---|
| POST | `/emails` | Send email (to, subject, body or template, attachments, conversation link) | G |
| GET | `/emails` | Sent and received log | G |
| GET | `/emails/{id}` | Detail with delivery status | G |
| GET | `/email/domains` | Sender domains and DNS record state | A |
| POST | `/email/domains` | Add domain (returns DNS records) | A |
| POST | `/email/domains/{id}/verify` | Check DNS | A |
| GET | `/email/addresses` | Inbound addresses | A |
| POST | `/email/addresses` | Create inbound address, map to agent | A |
| GET | `/email/templates` | Templates | G |
| POST | `/email/templates` | Create template with variables | A |
| PATCH | `/email/templates/{id}` | Update | A |
| POST | `/email/templates/{id}/preview` | Render with sample data | A |
| GET | `/files` | File library (documents tenants send) | G |
| POST | `/files` | Upload (signed URL then register) | A |
| DELETE | `/files/{id}` | Remove | A |
| POST | `/conversations/{id}/send-document` | Email a library file or generated document to the contact | G |
| GET | `/email/suppressions` | Bounce and unsubscribe list | A |

## A12. Webhooks (outbound) and custom tools

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/webhooks` | List endpoints | A |
| POST | `/webhooks` | Create (url, events, secret returned once) | A |
| GET | `/webhooks/{id}` | Detail | A |
| PATCH | `/webhooks/{id}` | Update url, events, active | A |
| DELETE | `/webhooks/{id}` | Delete | A |
| POST | `/webhooks/{id}/rotate-secret` | Rotate secret (step-up) | A |
| POST | `/webhooks/{id}/test` | Send a sample event | A |
| GET | `/webhooks/{id}/deliveries` | Delivery log (status, attempts, response) | A |
| POST | `/webhook-deliveries/{id}/resend` | Resend | A |
| GET | `/webhook-events` | Catalog of event types and sample payloads | V |
| GET | `/events` | Event log (replay source, 30 days) | A |
| POST | `/events/{id}/replay` | Replay an event to endpoints | A |
| GET | `/tools` | Custom tools | A |
| POST | `/tools` | Register tool (name, description, url, auth, JSON schema) | A |
| PATCH | `/tools/{id}` | Update | A |
| DELETE | `/tools/{id}` | Delete | A |
| POST | `/tools/{id}/test` | Test call with sample input | A |
| GET | `/tools/{id}/calls` | Call log | A |

**Outbound event payload**
```json
{
  "event_id": "evt_123",
  "type": "ticket.created",
  "created_at": "2026-11-27T10:00:00Z",
  "tenant_id": "ten_1",
  "channel": "telegram",
  "data": { "ticket": { "id": "tkt_9", "subject": "Refund request" } }
}
```
Headers: `X-Signature: t=<timestamp>,v1=<hmac_sha256>`, `X-Event-Id`, `X-Event-Type`.

## A13. Widget customization and settings

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/widget-settings` | Theme, greeting, launcher, languages, pre-chat form, business hours | G |
| PUT | `/widget-settings` | Update (draft) | A |
| POST | `/widget-settings/publish` | Publish | A |
| GET | `/widget-settings/install` | Install snippets and detection status | A |
| GET | `/business-hours` | Schedules and holidays | A |
| PUT | `/business-hours` | Update | A |
| GET | `/canned-responses` | Canned replies | G |
| POST | `/canned-responses` | Create | G |
| GET | `/tags` | Tags | G |
| POST | `/tags` | Create | G |
| GET | `/proactive-rules` | Proactive message rules | A |
| PUT | `/proactive-rules` | Update | A |
| GET | `/csat-settings` | Survey config | A |
| PUT | `/csat-settings` | Update | A |
| GET | `/mobile-settings` | Offline mode, storage caps, biometric lock, push config | A |
| PUT | `/mobile-settings` | Update | A |
| POST | `/mobile-settings/push-credentials` | Upload FCM or APNs credentials | A |

## A14. Analytics and reporting

| Method | Path | Purpose | Role |
|---|---|---|---|
| GET | `/analytics/overview` | Volume, first response time, resolution time, CSAT | V |
| GET | `/analytics/agents` | Per-AI-agent performance | V |
| GET | `/analytics/humans` | Per-human performance | A |
| GET | `/analytics/channels` | Per-channel breakdown | V |
| GET | `/analytics/ai` | AI resolution rate, handoff rate, confidence, thumbs | V |
| GET | `/analytics/tickets` | Ticket volume, SLA compliance | V |
| GET | `/analytics/usage` | Token usage and cost | A |
| POST | `/exports` | Export report or data (job) | A |
| GET | `/exports/{id}` | Download | A |

## A15. Realtime events (WebSocket)

**Connect**: `wss://rt.ourdomain.com/v1?token=<access or session token>`; client sends `hello` with `last_seq` to resume.

**Server to client events**
`message.created`, `message.updated`, `message.status`, `typing`, `presence`, `conversation.updated`, `conversation.assigned`, `handoff.requested`, `agent.thinking` (typing indicator for AI), `agent.stream` (token stream chunks), `ticket.updated`, `unread.count`, `sync.required`, `connection.ack`.

**Client to server events**
`message.send`, `typing.start`, `typing.stop`, `read`, `subscribe` (conversation), `presence.set`, `ping`.

Guarantees: per-conversation ordering via `seq`, ack for every send, resume from `last_seq`, SSE fallback at `/v1/stream`.

## A16. Platform and operations

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | Liveness | none |
| GET | `/ready` | Readiness | none |
| GET | `/jobs/{id}` | Async job status | any |
| GET | `/status` | Public status summary | none |
| GET | `/openapi.json` | OpenAPI spec | none |
| GET | `/limits` | Current rate limits and quotas | any |
| GET | `/countries`, `/locales`, `/timezones` | Reference data | any |

### Internal and admin (platform operators only)

This is only a short summary. The complete Platform Admin API (announcements, providers, incidents, policies, tenants, billing, flags and more) is in [chat-widget-extras.md](chat-widget-extras.md).

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/tenants` | Search and manage tenants |
| POST | `/admin/tenants/{id}/suspend` | Suspend or unsuspend |
| GET | `/admin/usage` | Platform-wide usage and cost |
| GET | `/admin/queues` | Queue and webhook delivery health |
| POST | `/admin/impersonate` | Support impersonation (audited, time-limited, tenant-consented) |
| GET | `/admin/feature-flags` | Flags and per-tenant overrides |

## A17. Key request and response examples

**Login with MFA**
```http
POST /v1/auth/login
{ "email": "ada@acme.com", "password": "..." }

200 { "mfa_required": true, "challenge_token": "chl_...", "methods": ["totp", "passkey"] }

POST /v1/auth/mfa/verify
{ "challenge_token": "chl_...", "method": "totp", "code": "123456" }

200 { "access_token": "...", "expires_in": 900, "refresh_token": "...", "user": { ... } }
```

**Widget session**
```http
POST /v1/widget/session
X-Public-Key: pk_live_...
{ "origin": "https://acme.com", "identity": { "user_id": "u_42", "email": "ada@acme.com", "signature": "..." } }

200 { "session_token": "...", "expires_in": 3600,
      "contact": { "id": "con_1" },
      "config": { "theme": { ... }, "agents": [ ... ], "offline": { "enabled": true, "pack_version": 7 } },
      "conversation": { "id": "cnv_9" } }
```

**Send message**
```http
POST /v1/widget/conversations/cnv_9/messages
{ "client_msg_id": "c-8f2...", "text": "Where is my refund?", "attachments": [] }

201 { "id": "msg_77", "client_msg_id": "c-8f2...", "status": "sent", "seq": 31 }
```
Then over the socket: `agent.thinking`, several `agent.stream` chunks, and a final `message.created` for the AI reply.

**Offline sync**
```http
POST /v1/sync
{ "cursor": "cur_120", "outbox": [ { "client_msg_id": "c-1", "conversation_id": "cnv_9", "text": "Hi", "created_at": "..." } ] }

200 { "cursor": "cur_131", "accepted": [ { "client_msg_id": "c-1", "id": "msg_80" } ],
      "messages": [ ... ], "conversations": [ ... ] }
```

**Create custom tool**
```http
POST /v1/tools
{ "name": "get_order_status", "description": "Look up an order by id",
  "url": "https://acme.com/api/orders/status", "auth": { "type": "bearer", "secret_ref": "sec_1" },
  "input_schema": { "type": "object", "properties": { "order_id": { "type": "string" } }, "required": ["order_id"] },
  "agent_ids": ["agt_payments"] }
```

## A18. Cross-cutting API requirements

- **Security**: every endpoint enforces tenant scoping and role checks server-side; step-up required on key, secret, deletion and billing endpoints; origin allow-list for widget endpoints; signed inbound webhooks verified before processing.
- **Idempotency and ordering**: POST create endpoints accept `Idempotency-Key`; messages are idempotent on `client_msg_id`; per-conversation `seq`.
- **Observability**: request ids on all responses, structured logs, per-endpoint latency and error metrics, webhook delivery metrics.
- **Rate limits (Defaults)**: auth endpoints 10 per minute per IP; widget session 30 per minute per IP; message send 30 per minute per contact; dashboard API 600 per minute per tenant; secret-key API by plan.
- **Backwards compatibility**: additive changes only inside `/v1`; deprecations announced through headers and changelog; breaking changes go to `/v2`.
- **Contract workflow**: write the OpenAPI spec first, generate mocks, clients and server SDKs from it, and run contract tests in CI so backend, web, mobile and SDKs cannot drift.
- **Delivery order**: A2 and A3 (auth and tenant) with Phase 0; A4, A5, A7 with the MVP; A8, A11, A12 with tickets, email and webhooks; A10 per channel as it ships; A9, A13, A14 alongside the dashboard; A15 from the MVP.
