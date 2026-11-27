# Chat Widget Platform: API Schemas, Enums, Events and Errors

Companion to [chat-widget-api.md](chat-widget-api.md) (endpoint list) and [chat-widget-platform.md](chat-widget-platform.md) (system briefs). The endpoint list says what exists; this file defines what goes in and out.

Notation: `?` = optional, `|` = one of, `[]` = array, `null` allowed where marked. All timestamps are ISO 8601 UTC. All ids are prefixed strings. Fields marked **(server)** are read-only.

---

## 1. Enums

| Enum | Values |
|---|---|
| `channel` | `web`, `mobile`, `whatsapp`, `telegram`, `messenger`, `instagram`, `sms`, `email`, `slack`, `api` |
| `conversation.status` | `open`, `pending`, `resolved`, `closed`, `snoozed` |
| `conversation.mode` | `ai`, `human`, `copilot` |
| `message.sender_type` | `visitor`, `ai`, `human`, `system` |
| `message.content_type` | `text`, `image`, `file`, `audio`, `video`, `card`, `buttons`, `location`, `system_event`, `note` |
| `message.status` | `pending`, `sent`, `delivered`, `read`, `failed` |
| `message.source` | `cloud`, `on_device`, `channel`, `email` |
| `ticket.status` | `open`, `pending`, `on_hold`, `resolved`, `closed` |
| `ticket.priority` | `low`, `normal`, `high`, `urgent` |
| `ticket.created_by` | `ai`, `human`, `rule`, `form`, `email`, `api` |
| `agent.type` | `triage`, `support`, `payment`, `sales`, `onboarding`, `custom` |
| `agent.status` | `draft`, `active`, `disabled` |
| `role` | `owner`, `admin`, `agent`, `viewer` |
| `mfa.type` | `totp`, `passkey`, `email`, `sms`, `backup_code` |
| `oauth.provider` | `google`, `microsoft`, `apple`, `github` |
| `channel_connection.status` | `connecting`, `active`, `error`, `disconnected`, `pending_approval` |
| `webhook.delivery.status` | `pending`, `succeeded`, `failed`, `retrying`, `dead` |
| `knowledge.source.type` | `url`, `file`, `faq`, `tickets` |
| `knowledge.source.status` | `queued`, `crawling`, `indexing`, `ready`, `failed` |
| `tone` | `friendly`, `formal`, `concise`, `playful`, `empathetic`, `custom` |
| `delay.mode` | `instant`, `fixed`, `human_like` |
| `job.status` | `queued`, `running`, `succeeded`, `failed` |
| `email.status` | `queued`, `sent`, `delivered`, `bounced`, `complained`, `failed` |
| `handoff.reason` | `user_request`, `low_confidence`, `negative_sentiment`, `keyword`, `repeated_failure`, `max_messages`, `rule`, `out_of_hours` |

---

## 2. Core object schemas

### 2.1 Tenant
```json
{
  "id": "ten_1",
  "name": "Acme Ltd",
  "slug": "acme",
  "plan": "growth",
  "timezone": "Africa/Lagos",
  "locale": "en",
  "branding": { "logo_url": "https://...", "primary_color": "#4F46E5" },
  "retention_days": 365,
  "security": { "mfa_required": true, "session_max_hours": 720, "ip_allow_list": [] },
  "created_at": "2026-11-27T10:00:00Z"
}
```

### 2.2 User and membership
```json
{
  "id": "usr_1",
  "email": "ada@acme.com",
  "name": "Ada Obi",
  "avatar_url": null,
  "email_verified": true,
  "mfa_enabled": true,
  "locale": "en",
  "memberships": [
    { "tenant_id": "ten_1", "role": "admin", "status": "active", "skills": ["billing"] }
  ],
  "created_at": "2026-11-27T10:00:00Z"
}
```

### 2.3 Contact
```json
{
  "id": "con_1",
  "external_id": "u_42",
  "name": "Ada Obi",
  "email": "ada@acme.com",
  "phone": "+2348012345678",
  "verified_identity": true,
  "attributes": { "plan": "pro", "country": "NG" },
  "identities": [
    { "id": "idn_1", "channel": "telegram", "external_id": "5551234" },
    { "id": "idn_2", "channel": "whatsapp", "external_id": "+2348012345678" }
  ],
  "tags": ["vip"],
  "first_seen_at": "...", "last_seen_at": "...",
  "location": { "country": "NG", "city": "Lagos" },
  "device": { "platform": "ios", "app_version": "3.2.0", "os_version": "18.1" }
}
```

### 2.4 Conversation
```json
{
  "id": "cnv_9",
  "channel": "telegram",
  "status": "open",
  "mode": "ai",
  "contact_id": "con_1",
  "current_agent_id": "agt_support",
  "assigned_user_id": null,
  "ticket_id": null,
  "priority": "normal",
  "tags": [],
  "unread_count": 2,
  "last_message": { "id": "msg_77", "preview": "Where is my refund?", "at": "..." },
  "last_inbound_at": "...",
  "reply_window_expires_at": "...",
  "csat": { "rating": null, "comment": null },
  "summary": null,
  "created_at": "...", "updated_at": "..."
}
```
`reply_window_expires_at` is set only on channels with reply windows (WhatsApp, Messenger, Instagram). Outside it, only templates can be sent.

### 2.5 Message
```json
{
  "id": "msg_77",
  "conversation_id": "cnv_9",
  "client_msg_id": "c-8f2a",
  "external_message_id": null,
  "seq": 31,
  "sender_type": "visitor",
  "sender_id": "con_1",
  "content_type": "text",
  "text": "Where is my refund?",
  "attachments": [
    { "id": "att_1", "name": "receipt.pdf", "mime": "application/pdf", "size": 120394, "url": "signed-url", "scan_status": "clean" }
  ],
  "buttons": [ { "id": "b1", "label": "Track order", "payload": "track" } ],
  "card": null,
  "reply_to": null,
  "status": "sent",
  "source": "cloud",
  "ai": { "agent_id": "agt_support", "agent_version": 4, "confidence": 0.82, "sources": [ { "chunk_id": "chk_1", "title": "Refund policy" } ], "tool_calls": [] },
  "created_at": "..."
}
```
`ai` is present only on AI messages; `tool_calls` and `sources` are visible in the dashboard, not to visitors.

### 2.6 Ticket
```json
{
  "id": "tkt_9",
  "number": 1042,
  "subject": "Refund request",
  "description": "Customer reports double charge on order 8812",
  "status": "open",
  "priority": "high",
  "category_id": "cat_payments",
  "contact_id": "con_1",
  "conversation_id": "cnv_9",
  "assignee_id": "usr_2",
  "tags": ["refund"],
  "extracted": { "order_id": "8812", "amount": 4500, "currency": "NGN" },
  "sla": { "policy_id": "sla_1", "first_response_due_at": "...", "resolution_due_at": "...", "breached": false },
  "created_by": "ai",
  "created_at": "...", "updated_at": "...", "resolved_at": null
}
```

### 2.7 Agent (AI)
```json
{
  "id": "agt_payments",
  "name": "Payment Support",
  "type": "payment",
  "avatar_url": "https://...",
  "role_description": "Handles billing, refunds and failed payments",
  "status": "active",
  "version": 4,
  "draft_version": 5,
  "prompt": { "system": "You are ...", "instructions": ["Never share full card numbers"] },
  "tone": { "preset": "empathetic", "custom_instructions": null },
  "response_time": { "mode": "human_like", "min_ms": 800, "max_ms": 4000, "typing_ms_per_char": 25 },
  "languages": { "mode": "auto", "allowed": ["en", "fr"] },
  "model": { "id": "default-large", "temperature": 0.3, "max_tokens": 600 },
  "knowledge_base_ids": ["kb_billing"],
  "tools": [ { "name": "create_ticket", "enabled": true }, { "name": "get_order_status", "enabled": true, "requires_confirmation": false } ],
  "schedule": { "timezone": "Africa/Lagos", "hours": [ { "days": ["mon","tue","wed","thu","fri"], "start": "09:00", "end": "18:00" } ], "out_of_hours": "ai_and_ticket" },
  "handoff_rules": [
    { "when": "keyword", "keywords": ["chargeback", "fraud"], "action": "handoff", "queue": "payments" },
    { "when": "low_confidence", "threshold": 0.4, "action": "handoff" },
    { "when": "max_messages", "count": 8, "action": "ticket" }
  ],
  "guardrails": { "forbidden_topics": ["legal advice"], "never_reveal": ["internal pricing"], "max_tool_iterations": 5 },
  "channel_overrides": { "sms": { "max_chars": 300, "markdown": false }, "whatsapp": { "markdown": "basic" } },
  "fallback_agent_id": "agt_support"
}
```

### 2.8 Channel connection
```json
{
  "id": "chn_1",
  "type": "telegram",
  "name": "Acme Support Bot",
  "status": "active",
  "default_agent_id": "agt_support",
  "settings": { "bot_username": "acme_support_bot", "greeting": "Hi! How can we help?" },
  "health": { "last_event_at": "...", "last_error": null },
  "created_at": "..."
}
```
Credentials are never returned. WhatsApp adds `phone_number`, `waba_id`, `quality_rating`, `messaging_limit`.

### 2.9 Webhook endpoint and delivery
```json
{
  "id": "whk_1",
  "url": "https://acme.com/hooks/chat",
  "events": ["ticket.created", "conversation.closed"],
  "active": true,
  "secret_last4": "a9f2",
  "created_at": "..."
}
```
```json
{
  "id": "dlv_1",
  "webhook_id": "whk_1",
  "event_id": "evt_123",
  "status": "retrying",
  "attempts": 3,
  "next_attempt_at": "...",
  "last_response": { "status": 500, "body_excerpt": "...", "duration_ms": 842 }
}
```

### 2.10 Knowledge source
```json
{
  "id": "src_1",
  "knowledge_base_id": "kb_billing",
  "type": "url",
  "name": "Help centre",
  "url": "https://acme.com/help",
  "status": "ready",
  "chunk_count": 412,
  "offline_safe": true,
  "last_indexed_at": "...",
  "crawl": { "depth": 2, "include": ["/help/*"], "exclude": ["/help/internal/*"], "schedule": "weekly" }
}
```

### 2.11 Custom tool
```json
{
  "id": "tol_1",
  "name": "get_order_status",
  "description": "Look up an order by id",
  "url": "https://acme.com/api/orders/status",
  "method": "POST",
  "auth": { "type": "bearer", "secret_ref": "sec_1" },
  "input_schema": { "type": "object", "properties": { "order_id": { "type": "string" } }, "required": ["order_id"] },
  "timeout_ms": 10000,
  "agent_ids": ["agt_payments"],
  "requires_confirmation": false
}
```

### 2.12 Widget config (returned to clients)
```json
{
  "theme": { "primary": "#4F46E5", "radius": 16, "font": "Inter", "logo_url": "...", "launcher": { "position": "bottom-right", "label": "Chat with us" }, "dark_mode": "auto" },
  "greeting": "Hi there! How can we help?",
  "languages": ["en", "fr"],
  "agents": [ { "id": "agt_support", "name": "Support", "avatar_url": "...", "topic": "General help" } ],
  "pre_chat_form": { "enabled": true, "fields": [ { "key": "email", "type": "email", "required": true } ] },
  "business_hours": { "open_now": true, "timezone": "Africa/Lagos", "next_open_at": null },
  "features": { "attachments": true, "voice_notes": true, "csat": true, "articles": true, "human_handoff": true },
  "offline": { "enabled": true, "pack_version": 7, "pack_size_bytes": 2400000, "wifi_only": true, "max_storage_mb": 50 },
  "privacy": { "require_consent": true, "policy_url": "https://acme.com/privacy" },
  "sdk": { "min_version": "1.4.0", "latest_version": "1.7.2", "force_upgrade": false }
}
```

### 2.13 Email
```json
{
  "id": "eml_1",
  "direction": "outbound",
  "status": "delivered",
  "from": "support@acme.com",
  "to": ["ada@acme.com"],
  "subject": "Your invoice",
  "template_id": "tpl_invoice",
  "attachments": [ { "id": "fil_1", "name": "invoice-1042.pdf" } ],
  "conversation_id": "cnv_9",
  "ticket_id": null,
  "sent_by": { "type": "human", "id": "usr_2" },
  "created_at": "..."
}
```

### 2.15 Job
```json
{ "id": "job_1", "type": "knowledge.crawl", "status": "running", "progress": 0.42, "result": null, "error": null, "created_at": "..." }
```

---

## 3. Key request bodies

### 3.1 `POST /auth/signup`
```json
{ "email": "ada@acme.com", "password": "********", "name": "Ada Obi", "tenant_name": "Acme Ltd", "accept_terms": true, "locale": "en" }
```
Response `201`: `{ "user": {...}, "tenant": {...}, "verification_sent": true }`. Password rules: min 12 chars, checked against breached-password list.

### 3.2 `POST /auth/login`
Request: `{ "email": "...", "password": "...", "device": { "platform": "ios", "name": "iPhone 16", "app_version": "1.0.0" } }`
Response: either tokens or `{ "mfa_required": true, "challenge_token": "...", "methods": ["totp","passkey"], "expires_in": 300 }`.

### 3.3 `POST /auth/oauth/{provider}/callback`
`{ "code": "...", "state": "...", "code_verifier": "...", "redirect_uri": "...", "tenant_invite_token": null }`
Response: tokens plus `{ "is_new_user": true, "linked": false }`.

### 3.4 `POST /widget/session`
```json
{
  "origin": "https://acme.com",
  "platform": "web",
  "sdk": { "name": "@chat/web", "version": "1.7.2" },
  "anonymous_id": "anon_abc",
  "identity": { "user_id": "u_42", "name": "Ada", "email": "ada@acme.com", "signature": "hmac..." },
  "locale": "en",
  "page": { "url": "https://acme.com/billing", "title": "Billing", "referrer": null },
  "consent": { "analytics": true }
}
```

### 3.5 `POST /widget/conversations/{id}/messages`
```json
{ "client_msg_id": "c-8f2a", "text": "Where is my refund?", "attachments": [ { "upload_id": "upl_1" } ], "reply_to": null, "payload": null }
```
`payload` is used when the visitor taps a button.

### 3.6 `POST /sync`
```json
{
  "cursor": "cur_120",
  "device_id": "dev_1",
  "outbox": [
    { "client_msg_id": "c-1", "conversation_id": "cnv_9", "text": "Hi", "created_at": "...", "source": "visitor" }
  ],
  "on_device_replies": [
    { "client_msg_id": "c-2", "in_reply_to": "c-1", "text": "Our refunds take 3 to 5 days", "confidence": 0.71, "model": "zeroth-small", "pack_version": 7 }
  ],
  "ticket_requests": [ { "client_request_id": "t-1", "conversation_id": "cnv_9", "subject": "Follow up needed" } ]
}
```
Response:
```json
{
  "cursor": "cur_131",
  "accepted": [ { "client_msg_id": "c-1", "id": "msg_80", "seq": 32 } ],
  "rejected": [ { "client_msg_id": "c-3", "code": "validation_error" } ],
  "messages": [],
  "conversations": [],
  "tickets": [ { "client_request_id": "t-1", "id": "tkt_12" } ],
  "pack": { "latest_version": 8, "update_required": false },
  "has_more": false
}
```

### 3.7 `POST /conversations/{id}/messages` (human reply)
`{ "type": "reply", "text": "We have processed your refund.", "attachments": [ { "upload_id": "upl_2" } ], "via": "same_channel" }`
Use `"type": "note"` for internal notes. For WhatsApp outside the 24h window, send `"template": { "name": "refund_update", "language": "en", "variables": ["Ada", "8812"] }` or the API returns `409 reply_window_closed`.

### 3.8 `POST /tickets`
`{ "conversation_id": "cnv_9", "subject": "Refund request", "description": "...", "priority": "high", "category_id": "cat_payments", "assignee_id": null, "tags": ["refund"], "notify_contact": true }`

### 3.9 `POST /agents`
Accepts the agent object in 2.7 without server fields. Required: `name`, `type`, `prompt.system`. Created as `draft`; publish with `POST /agents/{id}/publish`.

### 3.10 `POST /agents/{id}/playground/sessions/{sid}/messages`
Request `{ "text": "I was charged twice" }`. Response includes the reply and a trace:
```json
{
  "reply": { "text": "I'm sorry about that. Let me check your order." },
  "trace": {
    "retrieved_chunks": [ { "id": "chk_1", "score": 0.83, "title": "Refund policy" } ],
    "tool_calls": [ { "name": "get_order_status", "input": { "order_id": "8812" }, "output": { "status": "paid" }, "duration_ms": 420, "simulated": true } ],
    "handoff_evaluated": { "triggered": false },
    "tokens": { "prompt": 1840, "completion": 96 }
  }
}
```

### 3.11 `POST /webhooks`
`{ "url": "https://acme.com/hooks/chat", "events": ["ticket.created"], "description": "CRM sync" }` returns the secret once.

### 3.12 `POST /channels/telegram/connect`
`{ "bot_token": "123:ABC...", "default_agent_id": "agt_support" }`. Response returns the connection plus `webhook_registered: true`.

### 3.13 `POST /channels/whatsapp/connect`
`{ "code": "meta_oauth_code", "waba_id": "...", "phone_number_id": "...", "default_agent_id": "agt_support" }`.

### 3.14 `POST /emails`
```json
{ "to": ["ada@acme.com"], "cc": [], "subject": "Your invoice", "template_id": "tpl_invoice", "variables": { "name": "Ada", "amount": "NGN 4,500" },
  "attachments": [ { "file_id": "fil_1" } ], "conversation_id": "cnv_9", "from_address_id": "adr_1" }
```
Either `template_id` and `variables`, or `html` and `text`.

### 3.15 `POST /conversations/{id}/send-document`
`{ "file_id": "fil_1", "to": "contact_email", "message": "Here is your invoice.", "also_send_in_chat": true }`. Optional `generate: { "type": "receipt", "data": {...} }` instead of `file_id`.

### 3.16 `POST /tools`
See 2.11. The tool test endpoint takes `{ "input": { "order_id": "8812" } }` and returns `{ "status": 200, "output": {...}, "duration_ms": 311, "schema_valid": true }`.

### 3.17 `POST /knowledge-bases/{id}/sources/url`
`{ "url": "https://acme.com/help", "crawl": { "depth": 2, "include": [], "exclude": [] }, "offline_safe": false, "schedule": "weekly" }`. Response `202` with a job.

---

## 4. Event catalog (webhooks and realtime)

Envelope (all events):
```json
{ "event_id": "evt_123", "type": "message.created", "api_version": "2026-11-01", "created_at": "...", "tenant_id": "ten_1", "channel": "telegram", "data": { } }
```

| Event | `data` contains | Fired when |
|---|---|---|
| `contact.created` | contact | New contact |
| `contact.updated` | contact, changed fields | Attributes or identity change |
| `contact.merged` | surviving_id, merged_id | Contacts merged |
| `conversation.created` | conversation, contact | New conversation |
| `conversation.assigned` | conversation, assignee | Assigned or unassigned |
| `conversation.routed` | conversation, from_agent, to_agent, reason | Agent changed |
| `conversation.resolved` | conversation, resolution (by, at) | Resolved |
| `conversation.reopened` | conversation | Reopened |
| `conversation.closed` | conversation | Closed |
| `message.created` | message | Any new message |
| `message.updated` | message, changes | Edited, status change |
| `agent.replied` | message, agent, ai trace summary | AI sent a reply |
| `agent.failed` | conversation, error | AI could not reply (fallback triggered) |
| `handoff.requested` | conversation, reason | Handoff triggered |
| `handoff.accepted` | conversation, user | Human accepted |
| `handoff.timeout` | conversation | No one accepted |
| `ticket.created` | ticket, created_by | New ticket |
| `ticket.updated` | ticket, changes | Field change |
| `ticket.assigned` | ticket, assignee | Assignment |
| `ticket.resolved` | ticket | Resolved |
| `ticket.sla_breached` | ticket, sla | SLA missed |
| `csat.submitted` | conversation, rating, comment | CSAT received |
| `email.sent` | email | Email accepted by provider |
| `email.delivered` | email | Delivery confirmed |
| `email.bounced` | email, reason | Bounce |
| `email.received` | email, conversation | Inbound email |
| `channel.connected` | channel | Connection established |
| `channel.error` | channel, error | Token expired or webhook failing |
| `knowledge.source.ready` | source | Indexing completed |
| `knowledge.source.failed` | source, error | Indexing failed |
| `member.invited` / `member.joined` / `member.removed` | member | Team changes |
| `usage.limit_reached` | meter, limit | Quota threshold (80%, 100%) |

### Realtime-only events
`typing` `{ conversation_id, actor, state }`, `presence` `{ user_id, status }`, `agent.thinking` `{ conversation_id }`, `agent.stream` `{ conversation_id, message_id, delta, done }`, `unread.count` `{ total, by_conversation }`, `sync.required` `{ reason }`.

### Webhook signature verification
Header: `X-Signature: t=1732701600,v1=<hex>`. Compute `HMAC_SHA256(secret, "<t>.<raw_body>")`, compare in constant time, reject if `t` is older than 5 minutes. Return `2xx` within 10 seconds, otherwise retried (1m, 5m, 30m, 2h, 12h, then `dead`).

---

## 5. Error codes

Format: `{ "error": { "code": "reply_window_closed", "message": "...", "details": {}, "request_id": "req_1" } }`

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `bad_request` | Malformed request |
| 401 | `unauthenticated` | Missing or invalid token |
| 401 | `token_expired` | Access or session token expired; refresh |
| 401 | `mfa_required` | MFA challenge needed |
| 401 | `step_up_required` | Re-verification needed for this action |
| 403 | `forbidden` | Role or scope lacks permission |
| 403 | `origin_not_allowed` | Widget origin not on allow-list |
| 403 | `tenant_suspended` | Tenant suspended |
| 404 | `not_found` | Resource missing or not in tenant |
| 409 | `conflict` | State conflict (for example already resolved) |
| 409 | `reply_window_closed` | Channel window expired; use template |
| 409 | `duplicate_request` | Idempotency key reused with different body |
| 410 | `session_revoked` | Session was revoked |
| 413 | `payload_too_large` | Body or file too large |
| 415 | `unsupported_media_type` | File type blocked |
| 422 | `validation_error` | Field errors in `details.fields` |
| 422 | `weak_password` | Password rules or breach check failed |
| 423 | `account_locked` | Too many failed logins |
| 429 | `rate_limited` | Slow down; see `Retry-After` |
| 429 | `quota_exceeded` | Plan limit reached (messages, tokens, agents) |
| 451 | `consent_required` | Visitor consent needed |
| 500 | `internal_error` | Unexpected; contact support with `request_id` |
| 502 | `channel_error` | Upstream platform failed (details include platform error) |
| 503 | `ai_unavailable` | AI provider down; conversation falls back to human or ticket |
| 504 | `tool_timeout` | Custom tool timed out |

Validation errors:
```json
{ "error": { "code": "validation_error", "message": "Invalid input", "details": { "fields": [ { "field": "email", "code": "invalid_format" } ] }, "request_id": "req_1" } }
```

---

## 6. Limits and defaults

| Item | Default limit |
|---|---|
| Message text length | 4,000 characters |
| Attachment size | 25 MB each, 10 per message |
| Allowed attachment types | images, PDF, office docs, audio, video, zip (scanned) |
| Page size | default 50, max 200 |
| Webhook endpoints per tenant | 20 |
| Custom tools per tenant | 50 |
| AI tool iterations per reply | 5 |
| Custom tool timeout | 10 s |
| Knowledge source size | 100 MB per file, 50,000 chunks per knowledge base |
| Offline pack size | 50 MB (tenant configurable) |
| Idempotency key retention | 24 hours |
| Event log retention (replay) | 30 days |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 30 days (rotating) |
| Widget session token | 1 hour |
| Signed upload URL | 15 minutes |
| Signed download URL | 5 minutes |
