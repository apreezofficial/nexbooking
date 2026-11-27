# Live Chat Widget Platform: Logic and Flow (Backend Brief)

Audience: backend developer. This document describes what we are building, how the pieces connect, and how data moves through the system. It is a logic and flow document; endpoint-level specs follow from it.

Where a decision was needed, a default is stated (marked **Default**). The backend developer may refine defaults without changing the overall flow.

---

## 1. Product summary

A multi-tenant live chat platform. A business (**tenant**) embeds our widget in their website or mobile app. Visitors chat with configurable **AI agents** (customer support, payment support, sales, etc.) and with **human agents** when needed.

Capabilities:

- Embeddable web widget and mobile SDK (iOS, Android, React Native).
- Multiple AI agents per tenant, each with its own tone, response time, knowledge and permissions.
- Automatic ticket creation and human handoff.
- Webhooks (outbound events and custom tools the AI can call).
- Messaging channels: WhatsApp, Telegram, Messenger, Instagram, SMS, email, and more through adapters.
- Email in both directions, including sending documents to recipients.
- Offline mode for mobile apps using the on-device AI SDK, with sync on reconnect.
- Dashboard for tenants and human agents, plus analytics.

### Core concepts

| Concept | Meaning |
|---|---|
| Tenant | A business using the platform. All data is scoped by `tenant_id`. |
| Agent | A configurable AI persona (name, tone, delay, knowledge, tools). |
| Contact | The end user chatting. Can have multiple channel identities. |
| Conversation | A thread between a contact and agents or humans, on one channel. |
| Message | One item in a conversation. Carries `client_msg_id` for dedupe and offline sync. |
| Ticket | A trackable support case created from a conversation. |
| Channel | Where the conversation happens (web, mobile, WhatsApp, Telegram, email, ...). |

---

## 2. Architecture

```
Web widget ──┐
Mobile SDK ──┤
WhatsApp ────┤
Telegram ────┼─► API Gateway ─► Chat Service ─► Agent Router ─► AI Engine (LLM + KB + tools)
Messenger ───┤        │               │                │
Instagram ───┤        │               │                ├─► Human inbox (dashboard)
SMS / Email ─┘        │               │                └─► Ticket Service
                      │               ▼
                      │         Message Store ─► Event Bus ─► Webhook Dispatcher
                      │                                   ├─► Email Service
                      │                                   └─► Analytics
                      ▼
               Auth / Tenant config / Billing
```

Services (a modular monolith is acceptable at the start; split along these lines later):

1. **Gateway and auth**: API keys, widget session tokens, origin checks, rate limits.
2. **Chat service**: WebSocket and REST, conversations, messages, presence, typing, receipts.
3. **Agent router**: decides which agent or human handles each message.
4. **AI engine**: prompt building, LLM calls, tool execution, retrieval.
5. **Ticket service**: tickets, assignment, SLA timers.
6. **Channel adapters**: one module per messaging platform, all implementing the same interface.
7. **Webhook dispatcher**: signed outbound events with retries.
8. **Email service**: outbound and inbound email.
9. **Sync service**: offline sync for mobile.
10. **Dashboard API**: tenant admin and human agent console.

**Default stack**: Postgres (with pgvector), Redis (pub/sub, queues, rate limiting), object storage (S3-compatible) for attachments, a job queue (BullMQ or SQS), WebSocket servers behind a load balancer.

---

## 3. Data model

| Entity | Key fields |
|---|---|
| Tenant | id, name, plan, api keys (public and secret), allowed_domains, settings, usage counters |
| User (team member) | id, tenant_id, role (owner, admin, agent, viewer), status, skills |
| Agent | id, tenant_id, name, avatar, type (support, payment, sales, triage, custom), system_prompt, tone, languages, response_delay_config, typing_simulation, working_hours, out_of_hours_behavior, handoff_rules, guardrails, enabled_tools, knowledge_base_ids, fallback_agent_id, model, version, status |
| Contact | id, tenant_id, name, email, phone, external_id, custom_attributes, first_seen, last_seen |
| ContactIdentity | id, contact_id, channel, external_id (Telegram chat id, WhatsApp phone, Instagram user id, email, device id) |
| Conversation | id, tenant_id, contact_id, channel, status (open, pending, resolved, closed), current_agent_id, assigned_user_id, ticket_id, mode (ai, human, copilot), last_inbound_at, created_at |
| Message | id, conversation_id, sender_type (visitor, ai, human, system), sender_id, content, content_type, attachments, status (pending, sent, delivered, read, failed), client_msg_id, external_message_id, source (cloud, on_device), metadata, created_at |
| Attachment | id, message_id, storage_key, mime, size, scan_status |
| Ticket | id, tenant_id, conversation_id, contact_id, subject, description, category, priority, status, assignee_id, sla_due_at, tags, created_by (ai, human, rule, form) |
| Webhook | id, tenant_id, url, secret, events[], active |
| WebhookDelivery | id, webhook_id, event_id, status, attempts, next_attempt_at, last_response |
| CustomTool | id, tenant_id, name, description, url, auth, input_schema, agent_ids |
| KnowledgeSource | id, tenant_id, type (url, file, faq, tickets), status, last_indexed_at |
| KnowledgeChunk | id, source_id, text, embedding, metadata |
| ChannelConnection | id, tenant_id, type, credentials (encrypted), status, settings |
| EmailTemplate / EmailAddress | tenant-level templates, inbound addresses, sender domains |
| AuditLog | id, tenant_id, actor, action, target, timestamp |

Rules:
- Every table that holds tenant data has `tenant_id` and every query filters on it (consider Postgres row-level security).
- `client_msg_id` is generated by the client and is unique per conversation. It makes writes idempotent.
- `external_message_id` is the platform's id (Telegram message id, WhatsApp wamid). Used to dedupe webhook retries.

---

## 3b. Foundation backend: auth, OAuth, MFA and account security

This is built first (Phase 0). Everything else depends on it. There are two separate identity worlds:

1. **Platform users**: tenant owners, admins and human agents who log into the dashboard or the agent mobile app.
2. **End visitors (contacts)**: people chatting through the widget. They use the widget session flow (section 4), not these logins.

### Entities

| Entity | Key fields |
|---|---|
| User | id, email, password_hash (nullable for social-only), name, avatar, email_verified_at, mfa_enabled, status, last_login_at |
| Membership | user_id, tenant_id, role (owner, admin, agent, viewer), custom permissions, status |
| Session | id, user_id, device info, ip, refresh_token_hash, created_at, last_used_at, revoked_at |
| OAuthAccount | user_id, provider (google, microsoft, apple, github), provider_user_id, tokens (encrypted) |
| MfaFactor | user_id, type (totp, sms, email, passkey, backup_codes), secret (encrypted), verified_at |
| Invitation | tenant_id, email, role, token_hash, expires_at |
| ApiKey | tenant_id, type (public, secret), prefix, hash, scopes, last_used_at, revoked_at |
| PasswordReset / EmailVerification | user_id, token_hash, expires_at, used_at |
| DeviceToken | user_id, platform (ios, android, web), push token |

### Flows

**Sign up and email verification**
1. `POST /auth/signup` with email, password, name, optional tenant name.
2. Create user and, if a tenant name is given, the tenant with the user as `owner`.
3. Send a verification email with a single-use, expiring token. Unverified users have limited access.

**Login (email and password)**
1. `POST /auth/login`. Passwords are hashed with Argon2id. Rate limit by IP and account; lock temporarily after repeated failures.
2. If MFA is enabled, return `mfa_required` with a short-lived challenge token (no session yet).
3. Client submits the MFA code to `POST /auth/mfa/verify`; on success the backend issues tokens.

**Tokens**
- **Access token**: JWT, **Default** 15 minutes, carries `user_id`, `tenant_id`, `role`.
- **Refresh token**: opaque, stored hashed in the Session table, **Default** 30 days, rotated on every use; reuse of an old refresh token revokes the whole session family (theft detection).
- Web dashboard: refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie plus CSRF protection. Mobile: refresh token in the Keychain or Keystore.
- Users can list and revoke sessions and devices; "log out everywhere" is supported.

**OAuth / social login (OIDC)**
- Providers: Google, Microsoft, Apple (required on iOS if other social logins exist), GitHub optional.
- Web: Authorization Code flow with PKCE. Mobile: native SDK or system browser with PKCE, then exchange the code on our backend.
- Link to an existing user by verified email; otherwise create a new user. Users can link and unlink providers (cannot unlink the last login method).

**MFA**
- TOTP authenticator apps (primary), plus backup codes (generated once, stored hashed).
- Email or SMS one-time codes as fallback, **Default** off for SMS (SIM-swap risk) unless a tenant enables it.
- **Passkeys (WebAuthn)** as a phishing-resistant option and passwordless login.
- Tenant admins can **require MFA** for all members.
- Step-up verification for sensitive actions: changing email, viewing or rotating API keys, connecting channels, changing billing, deleting data.

**Password reset**: request by email, always return a generic response (no account enumeration), single-use expiring token, revoke all sessions after reset.

**Team invitations**: admin invites by email with a role; invitee accepts via a signed link, creating an account or joining with an existing one. A user can belong to multiple tenants and switch between them.

**SSO / SAML (enterprise, later)**: per-tenant SAML or OIDC, domain verification, SCIM provisioning, enforced SSO.

### Authorization
- **RBAC**: owner (billing and deletion), admin (everything except billing), agent (inbox and tickets), viewer (read only). Permissions are checked server-side on every request, and always filtered by `tenant_id`.
- **API keys**: public key (widget, restricted by allowed origins) and secret key (server-to-server, scoped, shown once, stored hashed, rotatable, revocable).
- Machine access: scoped tokens for integrations, per-key rate limits and audit logs.

### Security controls
- Argon2id hashing, breached-password check, password strength rules.
- Rate limiting and bot protection (CAPTCHA after repeated failures).
- New device and new location login alerts by email.
- Audit log for login, MFA changes, key creation, role changes, channel connections.
- Secrets and OAuth tokens encrypted at rest with a managed key.
- Strict CORS, security headers, input validation.
- Account deletion and data export (GDPR).

### Foundation services built in this phase
Besides auth: tenant creation and settings, roles and permissions, API key management, email sending (verification, reset, invitations), push token registration, audit log, rate limiting, job queue, configuration and secrets management, logging and monitoring, CI/CD and environments (dev, staging, production), database migrations.

---

## 4. Widget session and connection flow

1. Tenant embeds the script (or initializes the mobile SDK) with a **public key** (`pk_live_...`).
2. Widget calls `POST /widget/session` with the public key, the page origin, and optional identity (user id, email, name, plus an HMAC signature if the tenant verifies identity).
3. Backend validates the key and checks the origin against `allowed_domains`.
4. Backend returns:
   - A short-lived **session JWT** (**Default**: 1 hour, refreshable).
   - Widget config (colors, greeting, enabled agents, business hours, languages).
   - The active conversation and recent messages, if any.
5. Widget opens a WebSocket with the JWT. Fallback order: WebSocket, then SSE, then long polling.
6. Anonymous visitors receive a generated contact id stored locally. When they identify themselves later, the backend **merges** the anonymous contact into the known one and keeps history.
7. Identity verification: the tenant's server signs `user_id` with their secret key (HMAC SHA-256) and passes it to the widget. The backend verifies it, so visitors cannot impersonate others. Secret keys (`sk_...`) never appear in client code.

Rate limiting: per IP, per session, and per tenant plan.

---

## 5. Message flow (main loop)

1. Visitor sends a message. The client generates `client_msg_id` and sends it over the socket.
2. Chat service validates, stores the message, acknowledges (`sent`), and publishes `message.created`.
3. **Agent router** chooses the handler (section 6).
4. **If the handler is an AI agent**:
   1. Wait for the agent's configured response delay while showing the typing indicator.
   2. AI engine builds context: system prompt, tone rules, recent history, contact data, retrieved knowledge chunks, available tools.
   3. The LLM returns a reply or a tool call (create ticket, look up order, check payment, send email, hand off).
   4. Tools run server-side after permission validation; results return to the LLM. Loop until a final reply (**Default**: max 5 tool iterations).
   5. Reply is stored and streamed token by token to the client.
5. **If the handler is a human**: message appears in their live inbox; push or email notification if they are offline.
6. Receipts (`delivered`, `read`) update the message status.
7. Every step emits events (`message.created`, `agent.replied`, `ticket.created`, ...) consumed by webhooks, analytics, and notifications.

Ordering: messages are ordered per conversation by server sequence number. Writes are idempotent on `(conversation_id, client_msg_id)`.

---

## 6. Agents

Each tenant can create many agents (Customer Support, Payment Support, Sales, Onboarding, custom).

### Per-agent configuration

- **Identity**: name, avatar, role description.
- **Tone**: friendly, formal, concise, playful, or custom instructions.
- **Response time**: instant, fixed delay, or human-like delay scaled to reply length; typing indicator duration.
- **Languages**: fixed list or auto-detect.
- **Knowledge**: which knowledge bases the agent may read (the payment agent sees billing docs only).
- **Tools**: which actions it may perform (create ticket, look up transaction, send email, custom tools).
- **Working hours** and out-of-hours behavior (AI only, collect message, create ticket).
- **Handoff rules**: low confidence, user asks for a human, negative sentiment, keywords (refund, chargeback), repeated failure, message count threshold.
- **Guardrails**: forbidden topics, data it must never reveal, max messages before escalation.
- **Model** and per-agent token limits.
- **Fallback agent**.

Configurations are **versioned**. Tenants test changes in a **playground** (a sandbox conversation that does not create real tickets or events) before publishing.

### Routing logic

1. If the widget was opened in a mapped context (for example, the billing page), use the agent mapped to that context.
2. Otherwise a **triage agent** classifies intent (support, payment, sales, other) from the first message(s).
3. The router hands over to the matching agent. The conversation can be re-routed mid-chat (support to payment); the new agent receives the full history and a generated summary.
4. Tenant-defined rules override: for example, intent = refund routes to the payment agent with priority high.
5. If no agent matches, use the tenant's default agent.

Per-channel overrides: tenants may adjust tone and length per channel (short replies on SMS, no markdown on WhatsApp).

---

## 7. Automatic ticket creation

### Triggers

- AI calls the `create_ticket` tool.
- Handoff requested but no human is available.
- Visitor submits the offline or contact form.
- Rules match (keywords, negative sentiment, unresolved after N messages, long wait).
- Inbound email or channel message arrives with no open conversation.
- Offline mobile message queued for follow-up.

### Flow

1. AI summarizes the conversation: subject, description, category, priority, and extracted fields (order id, amount, email).
2. Ticket service creates the ticket linked to the conversation and contact, and starts the SLA timer from the tenant's policy.
3. Auto-assignment (round robin, skill-based, or by agent type), or the ticket stays in a queue.
4. The visitor receives a confirmation in chat and on their channel, with the ticket number; email if available.
5. Status changes (open, pending, resolved, closed) notify the visitor on the original channel and emit `ticket.updated`.
6. A reply from the visitor on a resolved ticket reopens it automatically.
7. SLA breach warnings notify assignees and tenant admins.

---

## 8. Human handoff

1. Trigger fires (user request or agent rule).
2. System message to the visitor: "Connecting you to a team member."
3. The conversation enters the human queue with an AI-written summary and extracted context.
4. A human accepts; the AI is muted for that conversation. **Copilot mode** is optional: the AI drafts suggested replies that the human edits and sends.
5. The human can hand back to the AI, or resolve the conversation.
6. If nobody accepts within the timeout (**Default**: 2 minutes in working hours), create a ticket and tell the visitor when to expect a reply.

---

## 9. Channel adapters (WhatsApp, Telegram, and others)

Every messaging platform is a **channel adapter** plugged into the same message flow. Adding a channel never changes chat, agent, ticket, or webhook logic.

### Adapter interface

- `connect(credentials)`: register our webhook with the platform; store credentials encrypted.
- `inbound(payload)`: verify the signature, then normalize to our `Message` format (text, attachments, sender id, channel, `external_message_id`).
- `send(message)`: translate our message to the platform format and send it.
- `capabilities`: buttons, media, voice, typing indicator, message editing, reply windows.

After normalization, a Telegram message follows exactly the same path as a web message: contact lookup, conversation, router, AI or human, ticket, events.

### Cross-channel identity

A contact can have many `ContactIdentity` rows. When the same person is identified on two channels (same phone or email), identities merge into one contact with one history. Tenant setting decides whether to continue the conversation on the channel the visitor used last.

### Channel details

| Channel | Connection | Key rules |
|---|---|---|
| **Web widget** | Public key and script | Origin allow-list, identity verification |
| **Mobile SDK** | Public key, native or RN SDK | Offline mode (section 11), push notifications |
| **WhatsApp** | Meta Cloud API, embedded signup. Store phone number id, WABA id, token (encrypted). | 24-hour window: free-form replies only within 24h of the user's last message; after that only approved template messages. Track the window per conversation. Handle media, status callbacks, rate limits, STOP opt-out. |
| **Telegram** | Tenant creates a bot with BotFather and pastes the token. We call `setWebhook` with a secret token header. | No templates and no 24h window, but the user must start the bot first. Supports inline keyboards, media, voice, typing action, message edits. Rate limits about 30 msgs/sec overall and 1/sec per chat. |
| **Messenger / Instagram** | Meta app with OAuth page connection | 24h standard window with limited human-agent tag beyond it. Webhook verification handshake. |
| **SMS** | Twilio or equivalent | Per-message cost, 160-char segments, opt-out compliance |
| **Email** | See section 10 | Thread matching by headers |
| **Slack / Discord / Teams** | OAuth app install | Mainly team notifications and alerts, optionally customer-facing |
| **LINE, Viber, WeChat, others** | Official account and webhook | Added on demand, one adapter each |

### Formatting and delivery

- The AI outputs a neutral format. Each adapter converts it (Telegram HTML or MarkdownV2, WhatsApp limited formatting, plain text for SMS).
- Buttons and quick replies fall back to numbered text options where unsupported.
- **Outbound queue per channel** with rate limiting and retries, so one platform's limits never block another.
- Typing indicators and response delay map to each platform's equivalent where it exists.
- Duplicate webhooks from platforms are dropped by `external_message_id`.
- Connection health is monitored. On token expiry or revocation, the connection is marked `error` and the tenant is notified.

---

## 10. Email

### Outbound

- Conversation transcripts after resolution.
- Ticket confirmations and status updates.
- **Documents**: an agent or human can attach files (invoice, receipt, contract) from the tenant's file library, or a tool can generate them, and send them to the recipient from the tenant's domain. Sent documents are logged on the conversation.
- Offline messages when nobody is online.
- Templates with variables, per-agent reply-to addresses.
- **Custom sender domain**: tenant adds DNS records (SPF, DKIM, DMARC); the dashboard shows verification status. **Default provider**: SES, Postmark or SendGrid behind a provider abstraction.
- Bounce, complaint, and unsubscribe handling.

### Inbound

- Each tenant (and optionally each agent) gets an address like `support@<tenant>.ourdomain.com`, or forwards their own mailbox.
- Provider inbound webhook delivers the parsed email. Match to an existing conversation via `In-Reply-To` and `References` headers or a plus-address token; otherwise create a new conversation and ticket.
- Attachments are virus-scanned and stored in object storage; size limits apply.
- Quoted reply text and signatures are stripped.
- Human replies from the dashboard go out as threaded emails.
- The AI can read an email, answer it, and attach documents, subject to the agent's tools and handoff rules.

---

## 11. Mobile SDK and offline mode

Mobile apps using our widget get an **offline mode** powered by the on-device AI SDK (the "Zeroth AI" SDK), combined with a local database and a sync protocol.

### On the device

- Local encrypted SQLite storing conversations, messages, and an **outbox queue** of unsent messages.
- Every message gets `client_msg_id` and a local timestamp.
- A downloaded **offline knowledge pack** (FAQs, key articles, with embeddings), refreshed whenever the app is online.
- Cached widget config, agent profiles, and recent history.

### Offline behavior

1. User sends a message with no network. It is saved locally as `pending` and the UI shows a clock icon.
2. The on-device AI answers from the offline knowledge pack. The reply is marked as an offline answer.
3. If the on-device AI is not confident, it replies "We'll follow up when you're back online", and the message (and a ticket request if needed) stays in the outbox.
4. When connectivity returns, the SDK syncs automatically.

### Sync protocol

- Client calls `POST /sync` with its last server cursor and an outbox batch.
- Server dedupes by `client_msg_id`, stores messages, returns all new server-side messages since the cursor plus id mappings.
- Server timestamp wins for ordering.
- On-device replies carry `source = on_device`. The server may follow up with a corrected cloud-AI answer if it disagrees, shown as a follow-up message.
- Retry with exponential backoff; background sync where the OS allows.
- Push notifications (FCM and APNs) deliver new human or AI replies when the app is closed.
- Offline ticket requests are created on the server after sync.

### Privacy and security

- Encrypt the local database; wipe it on logout.
- The tenant dashboard shows exactly what is cached on device.
- Knowledge packs contain only content the tenant marked as offline-safe.

---

## 12. Webhooks

### Outbound events

`conversation.created`, `conversation.closed`, `message.created`, `agent.replied`, `handoff.requested`, `ticket.created`, `ticket.updated`, `contact.created`, `contact.merged`, `channel.connected`, `channel.error`, `email.sent`, `email.received`.

Every event includes a `channel` field so tenants can filter.

### Rules

- Payload: `event_id`, `type`, `created_at`, `tenant_id`, `data`.
- Signed with HMAC SHA-256 in `X-Signature` using the webhook secret, plus a timestamp header to prevent replay.
- Sent from a queue, never inline in the request path.
- Retries with exponential backoff (**Default**: 1m, 5m, 30m, 2h, 12h), then marked failed and the tenant is alerted.
- Delivery is **at-least-once**; consumers dedupe by `event_id`.
- Dashboard shows the delivery log (request, response, status, attempts) with manual **resend**.
- Tenants can subscribe per event type and send a test event.

### Custom tools (inbound direction)

Tenants register their own endpoints (check order status, verify payment, look up account) with URL, auth, and a JSON schema for inputs. The AI engine exposes these as tools to the agents they are assigned to. Calls are validated against the schema, signed, timed out (**Default**: 10 seconds), and logged.

---

## 13. Knowledge base and AI quality

- **Sources**: website URLs (crawl), PDFs and documents, FAQs, past resolved tickets.
- **Pipeline**: ingest, chunk, embed, store in the vector DB; re-index on change or schedule.
- **Retrieval**: at answer time, retrieve top chunks only from the agent's allowed knowledge bases. Cite sources. If nothing relevant is found, escalate or ask a clarifying question instead of guessing.
- **Feedback**: thumbs up or down on replies, CSAT after resolution; surface "knowledge gaps" (questions the AI could not answer) to the tenant.
- **Safety**:
  - Treat visitor text and retrieved content strictly as data, never as instructions (prompt-injection defense).
  - Validate every tool call server-side against the agent's permissions.
  - Redact PII in logs.
  - Enforce guardrails and topic restrictions.
- **Cost control**: per-tenant token budgets and per-agent model choice, caching of common answers, usage metering for billing.
- **Evaluation**: store conversation transcripts with outcomes so tenants and we can review AI quality.

---

## 14. Dashboard (tenant and human agents)

- **Inbox**: live conversations with filters (channel, agent, status, assignee), typing and presence, internal notes, canned replies, @mentions, channel badges.
- **Agent builder**: prompt, tone, response delay, tools, knowledge, versions, playground.
- **Tickets**: board and list with SLA indicators, assignment, tags, bulk actions.
- **Channels**: connect and monitor WhatsApp, Telegram, Messenger, Instagram, SMS, email; health and error status.
- **Webhooks and API**: endpoints, secrets, delivery logs, API keys, custom tools.
- **Widget settings**: colors, logo, greeting, launcher position, languages, pre-chat form, with live preview and install snippet.
- **Knowledge base**: sources, indexing status, gaps.
- **Email**: sender domain setup, templates, inbound addresses, file library.
- **Analytics**: volume, first response time, resolution time, AI resolution rate, handoff rate, CSAT, per-agent and per-channel performance, token usage.
- **Team**: members, roles, skills, working hours, audit log.
- **Billing**: plan, usage, limits.

---

## 15. Additional features

Pre-chat forms; file and image uploads; voice notes; CSAT surveys; proactive messages triggered by page or behavior; auto-translate; business hours and holiday schedules; visitor context (page, device, location); canned responses; conversation tags; SLA alerts; GDPR export and delete; Slack and Telegram notifications for team alerts; public REST API and client libraries; data retention settings per tenant.

---

## 16. Non-functional requirements

- **Multi-tenancy**: `tenant_id` on every query, row-level security recommended.
- **Realtime**: WebSocket cluster with Redis pub/sub so any node can deliver to any client; sticky sessions not required.
- **Reliability**: idempotent writes, durable queues, at-least-once events, ordered messages per conversation.
- **Security**: encrypted secrets and channel credentials, signed tokens, origin allow-lists, rate limiting, file scanning, audit logs, least-privilege roles.
- **Scale**: stateless services, horizontal scaling, read replicas, object storage for attachments, per-channel outbound queues.
- **Observability**: tracing per message, LLM latency and cost metrics, webhook failure alerts, channel health checks.
- **Compliance**: GDPR, retention policies, WhatsApp and Meta platform policies, opt-in and opt-out handling for SMS and WhatsApp.
- **Availability**: graceful degradation. If the LLM is down, route to a human or create a ticket; if a channel is down, queue and retry.

---

## 17. Build order

0. **Phase 0, foundation backend** (section 3b): users, tenants, memberships and roles, signup and email verification, login with access and refresh tokens, session management, OAuth/social login (Google, Microsoft, Apple), MFA (TOTP, backup codes, passkeys), password reset, team invitations, API keys, audit log, rate limiting, email sending, push token registration, environments and CI/CD.
1. **MVP**: widget session, WebSocket chat, message storage, one AI agent with a knowledge base, human inbox, basic dashboard.
2. **Agents and handoff**: multiple agents, tone and delay settings, routing, handoff, playground.
3. **Tickets, email, webhooks**: ticketing, outbound and inbound email, webhook delivery with retries.
4. **Telegram**: first external channel; validates the adapter pattern (no approval process or reply windows).
5. **WhatsApp**: Meta approval, templates, 24-hour window handling.
6. **Mobile SDK**: local storage, outbox, sync, on-device AI, push notifications.
7. **More channels**: Messenger, Instagram, SMS, and others, one adapter each.
8. **Advanced**: custom tools, copilot mode, analytics, proactive messages, billing and usage limits.

---
---

# Part 2: Frontend Brief

Audience: frontend and mobile developers. Part 1 defines the backend; this part defines every client surface and how it talks to it.

## F1. Client surfaces

There are five clients. They share one API, one design system and one set of types.

| # | Surface | Users | Tech (Default) |
|---|---|---|---|
| 1 | **Embeddable web widget** | Visitors on a tenant's website | Lightweight JS bundle (Preact or vanilla), rendered in a Shadow DOM or iframe |
| 2 | **Mobile chat SDK** | Visitors inside a tenant's mobile app | React Native module (bare RN, matching this repo) with native iOS and Android wrappers |
| 3 | **Tenant dashboard (web)** | Owners, admins, agents | React with Next.js, TypeScript |
| 4 | **Agent / tenant mobile app** | Owners and human agents on the go | Bare React Native app for iOS and Android (this repo's stack) |
| 5 | **Public pages** | Marketing site, docs, status, sign up | Next.js |

Shared packages (monorepo recommended): `design-tokens`, `api-client` (typed SDK generated from the backend OpenAPI spec), `realtime-client` (WebSocket with reconnect), `types`, `i18n`, `chat-core` (conversation state, outbox, sync logic reused by widget and SDK).

## F2. Shared foundations

**Design system**: tokens for color, type, spacing, radius, shadows, light and dark modes. Shared components: buttons, inputs, avatars, badges, message bubble, typing indicator, attachment chip, empty states, skeleton loaders, toasts. The widget and SDK are **themeable per tenant** (brand color, logo, font, launcher position, corner radius) through the widget config returned by the session call.

**API client**: typed, generated from OpenAPI; handles auth headers, token refresh (single in-flight refresh), retry with backoff, error normalization, request ids.

**Realtime client**: WebSocket with automatic reconnect and jittered backoff, heartbeat, resume from last sequence number, fallback to SSE or polling, event typing (`message.created`, `typing`, `presence`, `ticket.updated`).

**State management**: server state with TanStack Query (cache, pagination, optimistic updates), local UI state with a small store (Zustand). The chat core keeps a normalized store of conversations and messages keyed by id and `client_msg_id`.

**Optimistic messaging**: message appears immediately as `pending`, gets a `client_msg_id`, transitions to `sent`, `delivered`, `read` or `failed` with a retry action. Dedupe on the id returned by the server.

**Internationalization**: all strings externalized, RTL support, locale-aware dates and numbers, widget language auto-detected from the page or device.

**Accessibility**: WCAG AA, keyboard navigation, screen reader labels, focus management in the widget, reduced motion, dynamic type on mobile.

**Quality**: TypeScript strict, unit tests (Vitest, Jest), component tests, end-to-end (Playwright for web, Detox or Maestro for mobile), visual regression for the design system, error and performance monitoring (Sentry), analytics events.

## F3. Web widget (embeddable)

**Install**: one script tag with the public key, or an npm package for SPAs.
```html
<script src="https://cdn.ourdomain.com/widget.js" data-key="pk_live_xxx" async></script>
```
Programmatic API on `window.ChatWidget`: `init`, `identify(user)`, `open`, `close`, `toggle`, `show`, `hide`, `sendMessage`, `setAttributes`, `on(event, cb)`, `shutdown`. Events: `ready`, `open`, `close`, `message`, `unread`, `ticket_created`.

**Constraints**
- Small bundle (**Default** target under 50 KB gzipped for the launcher, rest lazy-loaded when opened).
- Isolated styles: Shadow DOM or iframe so tenant CSS cannot break it and it cannot break the tenant site.
- No impact on the host page's performance or Core Web Vitals; load async, defer rendering.
- Works on all modern browsers, responsive: floating panel on desktop, full-screen on mobile web.
- Respects consent: no cookies or storage before consent when the tenant enables it.
- Security: origin checks, no secrets in the client, content sanitized (messages render markdown safely, links sanitized).

**Screens and states**
1. **Launcher**: floating button with unread badge, optional greeting bubble, proactive message prompts.
2. **Home**: greeting, agent selector or topic cards (Support, Payments, Sales), recent conversations, help articles search from the knowledge base.
3. **Pre-chat form** (optional): name, email, topic, custom fields.
4. **Conversation**: message list with grouping, timestamps, avatars, typing indicator, delivery and read receipts, markdown and rich cards, quick-reply buttons, file and image attachments with previews, voice notes, emoji, "AI" badge on AI replies, thumbs up or down feedback, "talk to a human" action, system messages (handoff, ticket created, agent changed).
5. **Offline / away**: business-hours banner, form to leave a message and email.
6. **Ticket view**: ticket number, status, updates.
7. **CSAT survey** after resolution.
8. **Connection states**: connecting, reconnecting, offline with clear indicators.

**Flow on the client**
1. Load script, call `POST /widget/session`, apply theme and config.
2. Open WebSocket, load active conversation and recent messages.
3. Send and receive messages through `chat-core` (section F2).
4. On `identify()`, send the signed identity payload so the backend can merge contacts.
5. Persist the anonymous contact id locally; clear on `shutdown()` (logout).

## F4. Mobile chat SDK (inside tenants' apps)

A React Native library with native iOS (Swift) and Android (Kotlin) wrappers so non-RN apps can embed it too. It exposes the same capabilities as the web widget.

**Install and API**: `Chat.init({ publicKey })`, `Chat.identify(user)`, `Chat.open()`, `Chat.close()`, `Chat.setAttributes()`, `Chat.registerPushToken()`, `Chat.logout()`, event listeners, and a drop-in `<ChatView />` or modal for RN plus native view controllers and fragments.

**Features**
- Same UI as the web widget, using native feel (safe areas, keyboard avoidance, haptics, dynamic type, dark mode, tablets).
- **Push notifications** (FCM and APNs) for replies, deep-linking into the conversation.
- Attachments: camera, photo library, document picker, voice recording, with permission prompts and a Settings fallback.
- **Offline mode** with the on-device AI SDK (Part 1, section 11):
  - Local encrypted SQLite for conversations, messages and the outbox.
  - Offline knowledge pack downloaded and refreshed in the background.
  - UI states: "Offline" banner, pending clock icon, "Answered offline" label on on-device replies, "We'll follow up when you're back online" prompt.
  - Automatic sync on reconnect with the cursor-based protocol, visible sync status, conflict handling (server order wins, cloud follow-up message when it corrects an offline answer).
  - Background sync where the OS allows.
- Biometric lock option for chat history (Face ID, fingerprint), configurable by the tenant.
- Tenant theming through the same config as web.
- Small binary size, no heavy dependencies; works with the New Architecture.

## F5. Tenant dashboard (web)

Responsive web app for owners, admins and agents.

### Navigation and layout
Left sidebar (Inbox, Tickets, Contacts, Agents, Knowledge, Channels, Email, Webhooks and API, Analytics, Widget, Team, Billing, Settings), top bar with tenant switcher, search, notifications, presence status, profile menu.

### Screens

**Auth and account**
- Sign up, login, email verification, forgot and reset password.
- Social login buttons (Google, Microsoft, Apple).
- MFA: setup (QR code for TOTP, backup codes download, passkey enrollment), challenge screen at login, manage factors.
- Accept invitation, choose or switch tenant.
- Profile: name, avatar, password change, linked accounts, active sessions and devices (revoke), notification preferences.
- Step-up verification modal for sensitive actions.

**Onboarding wizard**: create tenant, add website domain, customize widget, create first agent, add knowledge source, install snippet with a live "widget detected" check, invite team.

**Inbox** (the main screen, three panes)
1. Conversation list: filters (status, channel, agent, assignee, tags), search, unread counts, SLA timers, channel badges (web, mobile, WhatsApp, Telegram, email, ...).
2. Conversation view: full thread, AI vs human labels, typing and presence, composer with canned replies, attachments, send-document-by-email, internal notes, @mentions, AI suggested replies (copilot mode), take over from AI, hand back to AI, resolve, create or link ticket, reassign.
3. Context panel: contact profile, identities across channels, custom attributes, page and device info, past conversations, tickets, AI summary.
- Real-time updates, desktop notifications, sound, keyboard shortcuts.

**Tickets**: board (kanban) and table views, filters, bulk actions, SLA indicators, ticket detail with timeline (messages, status changes, notes), assignment, priority, tags, linked conversation.

**Contacts**: list, search, merge duplicates, profile with timeline, export and delete (GDPR).

**Agents** (AI agent builder)
- List with status.
- Editor tabs: Identity, Tone and style, **Response time** (instant, fixed, human-like delay, typing duration), Languages, Knowledge access, Tools and permissions, Working hours, Handoff rules, Guardrails, Model, Channel overrides.
- **Playground**: test chat showing which knowledge and tools were used, with no real side effects.
- Version history with compare and rollback, publish button.
- Routing rules editor: intent to agent mapping, page-context mapping, priority rules.

**Knowledge base**: add URL, upload file, write FAQ, indexing status, preview chunks, test retrieval, knowledge-gap suggestions, assign sources to agents, mark sources offline-safe for mobile packs.

**Channels**: cards for Web, Mobile, WhatsApp, Telegram, Messenger, Instagram, SMS, Email, Slack. Each has a connect wizard (Meta embedded signup, BotFather token paste, DNS records for email), health status, error banners, reconnect, per-channel settings.

**Email**: sender domain setup with DNS record checker, templates editor with variables, inbound addresses, file library for documents, sent log.

**Webhooks and API**: endpoint list, event subscriptions, secret reveal (step-up), test event, delivery log with request and response and resend, custom tools editor with JSON schema form, API keys (create, copy once, revoke), usage.

**Analytics**: volume, first response time, resolution time, AI resolution rate, handoff rate, CSAT, per-agent and per-channel, token usage, knowledge gaps, date range and export.

**Widget**: appearance editor (colors, logo, greeting, launcher, position, languages, pre-chat form, business hours) with live preview for web and mobile, install snippets, mobile SDK instructions, domain allow-list.

**Team**: members, roles, invitations, skills, working hours, MFA enforcement toggle, audit log.

**Billing and settings**: plan, usage meters, invoices, payment method, data retention, notification rules, danger zone.

## F6. Agent and tenant mobile app (React Native)

A bare React Native app (iOS and Android, matching the checked-in `ios/` and `android/` projects) so teams can handle chats away from the desk. Focus on the high-frequency tasks; deep configuration stays on web.

**Auth**: email and password, social login (Google, Apple, Microsoft), MFA challenge (TOTP code entry, passkeys, backup code), biometric unlock (Face ID, fingerprint) with the refresh token in Keychain or Keystore, session list, remote logout.

**Tabs**
1. **Inbox**: conversation list with filters and unread badges, swipe actions (assign, resolve), pull to refresh, real-time updates.
2. **Conversation**: thread, composer, attachments (camera, photos, files, voice notes), canned replies, AI suggested replies, take over from AI or hand back, internal notes, send document by email, resolve, create ticket.
3. **Tickets**: list, detail, status and priority changes, assignment, comments.
4. **Notifications**: push notification center, per-channel and per-event preferences, quiet hours.
5. **Settings and profile**: availability status (online, away, offline), notification preferences, MFA and security, sessions, switch tenant.
- Light analytics summary (today's volume, response time, open tickets) and an AI agent on or off toggle per agent for quick control.

**Mobile-specific behavior**
- Push notifications via FCM and APNs, deep links into a conversation or ticket, badge counts, actionable notifications (quick reply).
- Background reconnect, local cache of recent conversations for fast open and limited offline read access.
- Offline composer queue with retry, same outbox pattern as the SDK.
- Permission prompts for notifications, camera, photos, microphone and Face ID with a Settings fallback.
- Tablet layouts (split inbox and conversation).
- Deep-link and universal-link handling for invitations and password reset.
- Release channels (staging and production), crash reporting, over-the-air configuration through remote flags (not native code changes).

## F7. Key client flows

**Visitor chat (web or SDK)**
1. Widget loads, creates a session, shows home or conversation.
2. Visitor types; the message appears instantly as pending.
3. Backend acks; AI typing indicator shows after the agent's configured delay; reply streams in.
4. Optional actions: attach file, rate reply, request human.
5. If handoff occurs, a system message appears and the header changes to the human's name and avatar.
6. If no human is available, the ticket confirmation card appears and an email field is requested if unknown.
7. After resolution, CSAT appears.

**Agent handles chat (dashboard or mobile)**
1. Push or desktop notification, open the conversation.
2. Read AI summary, take over, reply (optionally using AI suggestions).
3. Send a document by email if needed, add notes.
4. Resolve; the visitor gets CSAT and the transcript email if configured.

**Tenant setup**
1. Sign up, verify email, enable MFA.
2. Onboarding wizard: domain, widget look, first agent, knowledge.
3. Install snippet; widget detected.
4. Connect channels (Telegram first, then WhatsApp).
5. Invite team, set roles and MFA enforcement.

**Mobile offline (SDK)**
1. Network lost: banner shows Offline.
2. User sends a message; it is stored as pending.
3. On-device AI answers from the knowledge pack and labels the reply.
4. Network returns: sync runs, pending messages upload, server replies arrive, any corrected cloud answer appears as a follow-up.

## F8. Frontend build order

1. **Foundation**: monorepo, design tokens, shared components, API client, realtime client, auth screens (signup, login, MFA, social login) on web and mobile.
2. **Web widget MVP** plus the dashboard inbox so chats work end to end.
3. **Dashboard core**: onboarding wizard, agent builder with playground, knowledge base, widget customization.
4. **Tickets, email and webhooks screens**.
5. **Channels UI**: Telegram connect wizard first, then WhatsApp, then others.
6. **Agent mobile app**: inbox, conversation, push notifications, tickets.
7. **Mobile SDK**: UI, push, attachments, then offline mode and sync.
8. **Analytics, billing, team, audit log**, accessibility and performance hardening, enterprise SSO screens.

Each phase should ship behind the backend phase of the same number, so the frontend never waits on missing APIs: agree on the OpenAPI contract at the start of each phase and use generated mocks until the endpoints land.

---
---

# Part 3: SDK Brief

Audience: SDK engineers (frontend, mobile and backend) and developer-relations. Tenants adopt the platform through SDKs, so these are a product in their own right: they need stable public APIs, great docs and strict versioning.

## S1. SDK family

| SDK | Used by | Purpose | Default tech |
|---|---|---|---|
| **Web SDK** (`@chat/web`) | Tenant websites and SPAs | Embeds the widget, programmatic control | TypeScript, ESM plus UMD CDN build |
| **React / Next wrappers** (`@chat/react`) | React sites | `<ChatProvider>`, hooks, components | TypeScript |
| **React Native SDK** (`@chat/react-native`) | RN apps | Drop-in chat UI, offline mode, push | TypeScript plus native modules |
| **iOS SDK** | Native iOS apps | Same features | Swift, distributed by Swift Package Manager and CocoaPods |
| **Android SDK** | Native Android apps | Same features | Kotlin, distributed by Maven Central |
| **Flutter SDK** (later) | Flutter apps | Same features | Dart wrapper over the native SDKs |
| **Server SDKs** | Tenant backends | Manage resources, verify identity, receive webhooks | Node, Python, PHP, Go, Ruby, Java (generated from OpenAPI) |
| **Headless / Core SDK** (`@chat/core`) | Tenants building a custom UI | Conversations, messages, realtime and sync with no UI | TypeScript |

Layering: `core` sits at the bottom (state, networking, realtime, outbox, sync). The UI SDKs (web, RN, iOS, Android) sit on top of it. Server SDKs are separate and generated from the same OpenAPI contract.

## S2. Client SDK architecture

```
┌──────────────── UI layer (optional) ─────────────────┐
│ Chat view, launcher, theming, push UI, deep links     │
├───────────────────────────────────────────────────────┤
│ Public API (stable): init, identify, open, events ...  │
├───────────────────────────────────────────────────────┤
│ Chat core: conversations, messages, typing, receipts   │
│ Session manager · Realtime client · Outbox · Sync      │
│ Offline engine: local DB · knowledge pack · on-device AI│
├───────────────────────────────────────────────────────┤
│ Platform adapters: storage, network, push, files, clock│
└───────────────────────────────────────────────────────┘
```

- **Session manager**: calls `POST /widget/session`, stores and refreshes the session token, handles identity verification, merges anonymous and known contacts.
- **Realtime client**: WebSocket with reconnect, jittered backoff, heartbeat, resume from the last sequence number, SSE or polling fallback.
- **Outbox**: durable queue of unsent messages, each with `client_msg_id`, retried with backoff.
- **Sync engine**: cursor-based `POST /sync` (Part 1, section 11), dedupes and orders messages.
- **Offline engine** (mobile): encrypted SQLite, offline knowledge pack, on-device AI via the Zeroth AI SDK behind an `OfflineAIProvider` interface. The SDK works without the on-device model; offline AI is a pluggable module, so apps that do not want the extra size can leave it out.
- **Platform adapters**: abstract storage (IndexedDB, SQLite, Keychain), network status, push, file picking and clock so `core` stays identical across platforms.
- **Modularity**: features are optional packages so apps ship only what they use (core, UI, offline, voice, push).

## S3. Public API surface (client SDKs)

Same names on every platform, idiomatic casing per language.

**Lifecycle**
- `init({ publicKey, environment, locale, theme, offline, logLevel })`
- `shutdown()`: end the session and clear local data when the user logs out.

**Identity**
- `identify({ userId, name, email, phone, attributes, signature })`: signature is the HMAC from the tenant's server. Merges anonymous history on success.
- `setAttributes({ ... })`: custom contact attributes (plan, country, order id).
- `reset()`: return to an anonymous visitor.

**UI control**
- `open()`, `close()`, `toggle()`, `show()`, `hide()` for the launcher.
- `openConversation(id)`, `startConversation({ agentId, topic, prefill })`: open with a specific agent, for example the Payment agent from a billing screen.
- `setTheme({ ... })`, `setLanguage(code)`.

**Messaging (headless and custom UI)**
- `conversations.list()`, `conversations.get(id)`, `conversations.create()`
- `messages.list(conversationId, { cursor })`, `messages.send(conversationId, { text, attachments })`
- `typing.start(conversationId)`, `typing.stop(conversationId)`
- `conversations.markRead(id)`, `messages.rate(id, up | down)`
- `tickets.list()`, `tickets.get(id)`, `tickets.create({ subject, description })`
- `handoff.request(conversationId)`

**Events**
`ready`, `open`, `close`, `message`, `message_status`, `typing`, `unread_count`, `agent_changed`, `handoff`, `ticket_created`, `connection_state` (connecting, connected, reconnecting, offline), `sync_state` (idle, syncing, failed), `error`.

**Mobile only**
- `registerPushToken({ token, platform })`, `handlePushNotification(payload)` for deep linking.
- `setOfflineMode({ enabled, knowledgePack })`, `syncNow()`, `getSyncStatus()`, `onDeviceModel.status()`.
- `setBiometricLock(enabled)`.
- `clearLocalData()`.

**React and RN extras**: `<ChatProvider>`, `<ChatLauncher />`, `<ChatWindow />`, hooks `useChat()`, `useConversations()`, `useMessages(id)`, `useUnreadCount()`, `useConnectionState()`.

Contract rules:
- Every async method returns a promise (or the native equivalent) and fails with typed errors (`AuthError`, `NetworkError`, `RateLimitError`, `ValidationError`, `OfflineError`).
- No method throws synchronously after `init`.
- Public types are generated from the shared schema so web, RN, iOS and Android never drift.

## S4. Offline mode inside the SDK

Details live in Part 1 (section 11) and the mobile section of Part 2; the SDK-level responsibilities are:

1. **Storage**: encrypted SQLite using a key held in Keychain or Keystore; schema migrations versioned with the SDK.
2. **Knowledge pack**: download and refresh in the background only on Wi-Fi by default, with checksums and size limits; the tenant marks sources as offline-safe.
3. **On-device AI**: loaded lazily through the `OfflineAIProvider` interface, default implementation backed by the Zeroth AI SDK. Responses carry `source = on_device` and a confidence score; below the threshold the SDK queues the message instead of guessing.
4. **Outbox and sync**: retry, backoff, idempotency, cursor handling, conflict rules (server order wins; cloud follow-up when it corrects an offline answer).
5. **Observability hooks**: `sync_state` events and a diagnostics call that returns queue length, last sync time and storage size.
6. **Controls**: tenants can disable offline mode, cap storage, set retention and wipe on logout.
7. **Graceful degradation**: if the device cannot run the on-device model (low memory, unsupported OS), the SDK falls back to queue-only offline mode.

## S5. Server SDKs and webhooks helper

Generated from the OpenAPI spec so every language stays in sync.

**Resource clients**: contacts, conversations, messages, tickets, agents, knowledge sources, webhooks, custom tools, email send.

**Helpers**
- `generateIdentitySignature(userId)`: HMAC for widget identity verification.
- `verifyWebhook(rawBody, headers, secret)`: validates the signature and timestamp window, returns a typed event.
- Typed webhook events and handlers.
- Automatic retries with idempotency keys, pagination iterators, typed errors and rate limit handling.
- Authentication with secret keys (`sk_...`), never used in client SDKs.

Example (Node):
```ts
const client = new Chat({ secretKey: process.env.CHAT_SECRET });
const signature = client.identity.sign(user.id);          // pass to the widget
app.post('/webhooks/chat', (req, res) => {
  const event = client.webhooks.verify(req.rawBody, req.headers, secret);
  if (event.type === 'ticket.created') { /* ... */ }
  res.sendStatus(200);
});
```

## S6. Versioning, compatibility and releases

- **Semantic versioning** for every SDK; the public API above is the contract.
- **API versioning**: SDKs send an API version header; the backend supports at least the last two API versions, with deprecation notices through headers and SDK warnings.
- **Minimum supported versions** published per SDK (iOS 15+, Android API 24+, React Native 0.73+, modern evergreen browsers). Update these in docs when they change.
- **Changelogs** with migration notes for every release; breaking changes only in major versions.
- **Kill switch and remote config**: the session response can tell old SDK versions to degrade or prompt an upgrade.
- **Release pipeline**: CI builds, tests, signs and publishes to npm, Maven Central, SPM and CocoaPods; release candidates and a beta channel for early adopters; automated size and performance budgets that fail the build on regressions.
- **Supply chain**: pinned and audited dependencies, SBOM, signed releases.

## S7. Security and privacy requirements

- Public key only in client SDKs; secrets never shipped.
- TLS only, with certificate pinning as an opt-in for tenants who need it.
- Identity verification required when tenants enable it; unverified identities are labeled.
- Local data encrypted at rest; wiped on `shutdown()` and on tenant request.
- Respect user consent: no tracking or storage until consent when configured (`init({ requireConsent: true })`, `grantConsent()`).
- No collection beyond what the tenant configures; a data-disclosure page per SDK for the App Store privacy label and Google Play data safety form.
- Input sanitization for rendered markdown and links; attachments validated by type and size before upload.
- Rate limiting and abuse protection on session creation and message sending.

## S8. Performance and quality targets (Defaults)

| Area | Target |
|---|---|
| Web launcher size | under 50 KB gzipped, rest lazy-loaded |
| Time to open chat (warm) | under 300 ms |
| RN SDK binary impact | under 5 MB without the on-device model |
| Message send to server ack | under 500 ms on a good connection |
| Reconnect after network return | under 3 seconds |
| Battery | no background wake-ups except push and scheduled sync |
| Crash-free sessions | 99.9% or better |

Testing: unit tests for core, contract tests against a mock server generated from OpenAPI, end-to-end tests on a device farm, network-condition tests (offline, flaky, slow), long-run tests for the outbox and sync, memory and battery profiling, and an accessibility audit of the UI components.

## S9. Developer experience

- **Docs site**: quickstarts for each platform (under 10 minutes to first message), full API reference generated from types, guides (identity verification, push setup, offline mode, theming, webhooks, custom tools), migration guides and FAQs.
- **Sample apps**: web (plain JS, React, Next), React Native, iOS, Android, and a server example; each runnable with a test key.
- **Playground and sandbox**: test tenant and test keys (`pk_test_`, `sk_test_`) with no real channel traffic or billing.
- **Debug tooling**: verbose log level, in-app debug overlay (connection state, queue length, last sync), request ids shown in errors for support.
- **CLI** (later): `chat init`, `chat test-webhook`, `chat tail-events` for local development.
- **Support**: public issue tracker, status page, and a changelog feed.

## S10. SDK build order

1. **Contract first**: OpenAPI spec, event schemas and shared types; generate the typed API client and mock server.
2. **Core SDK** (`@chat/core`): session, realtime, messaging, outbox, typing, receipts.
3. **Web SDK and widget**, plus React wrappers; CDN script and npm package.
4. **Server SDKs**: Node first, then Python and PHP; identity signing and webhook verification.
5. **React Native SDK**: UI, attachments, push, deep links, theming.
6. **Offline engine**: encrypted storage, outbox sync, knowledge pack, Zeroth AI provider, diagnostics.
7. **Native iOS and Android SDKs** (shared core logic through the RN module where possible, otherwise native ports).
8. **Docs, samples, sandbox and release pipeline**, then Flutter, additional server languages and the CLI.

Each SDK ships only when its backend phase is live in staging and its sample app passes the end-to-end suite.

---
---

# Part 4: API Reference

The full API reference is in a separate file: [chat-widget-api.md](chat-widget-api.md).
