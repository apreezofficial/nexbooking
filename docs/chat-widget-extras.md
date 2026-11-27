# Chat Widget Platform: Extras (Announcement Bar, Provider Status and Platform Admin APIs)

Companion to [chat-widget-platform.md](chat-widget-platform.md), [chat-widget-api.md](chat-widget-api.md) and [chat-widget-api-schemas.md](chat-widget-api-schemas.md).

**Answer to "does the API doc have admin APIs?"** Only partly. The main API doc has a short operator-only section (`/admin/tenants`, `/admin/usage`, and a few more), but no full admin surface. This file adds the complete **Platform Admin API** (section 6), plus the announcement bar and third-party provider management that the admin console controls.

Two kinds of admin exist and must not be mixed up:

| Kind | Who | Scope |
|---|---|---|
| **Tenant admin** | A customer's owner or admin | Their own tenant only (already covered in the main API doc, `/v1/...`) |
| **Platform admin** | Our own staff | The whole platform: all tenants, providers, announcements, billing, flags (`/v1/admin/...`, this file) |

---

## 1. Announcement bar: what it is

A slim bar at the very top of the page, above the navbar, that shows platform news and rotates through active items automatically every 10 seconds. Each item has a message and an optional link.

Item types:
- **Announcement**: new feature, event, maintenance window.
- **Policy update**: terms, privacy, acceptable use, data processing changes.
- **Provider update**: a third-party provider is degraded, down, changing, or restored (WhatsApp, Telegram, email provider, LLM provider, SMS, payments, push services).
- **Incident**: urgent, outage-level notice.
- **Promotion / tip**: optional marketing or product tips.

Where it appears:
- Tenant dashboard (web) and agent mobile app (banner at the top of the main screens).
- Marketing site and docs (public items only).
- Status page.
- Optionally inside the widget settings page, but **never** inside the end-visitor chat widget (that belongs to the tenant's brand, not ours).

---

## 2. Announcement bar: behavior and logic

### 2.1 Display rules
1. Client fetches active items for the current audience on load, then refreshes every 60 seconds (or receives updates through the realtime channel `announcement.updated`).
2. Items are sorted by **severity**, then **priority**, then newest first.
3. The bar shows **one item at a time** and advances to the next every **10 seconds** (configurable per item and globally, with a 5 to 30 second range).
4. Rotation **pauses** while the user hovers or focuses the bar, and when the tab is hidden. Reduced-motion users get no sliding animation, only a crossfade (or manual next and previous).
5. With a single item, no rotation happens.
6. Controls: previous and next arrows, pause or play, a dot indicator, and a close button where the item is dismissible.
7. **Critical items** (outage, security, forced policy acceptance) are pinned: they show first, are not dismissible, and do not rotate away until resolved or expired.
8. Dismissals are remembered per user (stored server-side so they follow the user across devices) with an optional "show again after N days".
9. Items outside their `starts_at` to `ends_at` window are never shown.
10. If the API fails, the bar shows the last cached items for up to 24 hours, then hides silently. It never blocks the page.

### 2.2 Severity and styling
| Severity | Look | Dismissible | Pinned |
|---|---|---|---|
| `info` | Neutral or brand color | Yes | No |
| `success` | Green | Yes | No |
| `warning` | Amber | Yes | Optional |
| `critical` | Red | No | Yes |

Each item may have an icon, a label tag (such as "Policy" or "Provider"), the message (max 160 characters), and one link with a label and a `target` (`_self` or `_blank`).

### 2.3 Targeting
An item can target by:
- **Audience**: `all`, `tenant_users`, `public_site`, `mobile_app`, `admins_only`.
- **Plan**: free, growth, enterprise.
- **Specific tenants** or a list of tenant ids.
- **Role**: owners and admins only, for example for billing or policy notices.
- **Channel or provider usage**: show a WhatsApp provider notice only to tenants who have WhatsApp connected; show an email provider notice only to tenants sending email. This avoids noise.
- **Platform**: web, ios, android.
- **Locale**: one message per language, with a fallback to the default language.
- **Region**.

### 2.4 Scheduling and lifecycle
`draft` then `scheduled` then `active` then `expired`, plus `archived`. Admins can publish now, schedule for a window, pause, expire early, or duplicate. Recurring items (for example, weekly maintenance windows) are supported through an optional recurrence rule.

### 2.5 Policy updates (special handling)
Policy items can be linked to a **policy document version** (terms, privacy, DPA). If the policy requires acceptance, the platform:
1. Shows a pinned bar item with "Review and accept".
2. After a grace period, blocks sensitive actions (or shows a blocking modal) until an owner or admin accepts.
3. Records acceptance with user, tenant, version, timestamp and IP in the audit log.

### 2.6 Provider updates (automatic)
The platform monitors third-party providers (section 3). When a provider's state changes, an **automatic announcement** can be created from a template, linked to an incident, and removed when the incident resolves. Admins can edit the wording before or after, or turn automation off per provider.

### 2.7 Analytics
Per item: impressions, unique viewers, clicks, dismissals, and acceptance count (for policies). Shown in the admin console to judge whether an announcement worked.

---

## 3. Third-party providers: registry, health and incidents

The platform depends on many external services. Treat each one as a managed **provider** so admins can see health, change configuration and communicate changes.

### 3.1 Provider categories (examples)
| Category | Examples |
|---|---|
| AI / LLM | Primary LLM, backup LLM, embeddings, speech-to-text, text-to-speech |
| On-device AI | Zeroth AI SDK (version and model pack compatibility) |
| Messaging channels | WhatsApp Cloud API, Telegram Bot API, Messenger, Instagram, SMS provider |
| Email | Outbound email provider, inbound email parsing provider |
| Push | FCM, APNs |
| Auth | Google, Microsoft, Apple sign-in |
| Payments | Billing provider |
| Infrastructure | Object storage, vector database, search, CDN, captcha, virus scanning |

### 3.2 What the admin can do per provider
- View status (`operational`, `degraded`, `partial_outage`, `major_outage`, `maintenance`), latency, error rate, last check, and usage and cost.
- Enable or disable the provider platform-wide.
- Set **failover order** (for example LLM A, then LLM B), health thresholds, and automatic failover rules.
- Manage credentials (stored encrypted, shown masked, rotated with step-up verification).
- Edit provider **configuration** (model names, regions, rate limits, timeouts, retry policy).
- Run a **test call** and view recent errors.
- Subscribe to the provider's status feed (where available) and link it to incidents.
- Record planned changes: API version deprecations, pricing changes, policy changes, migration deadlines.
- Control **tenant impact**: which tenants use this provider, so notices can be targeted.

### 3.3 Health monitoring logic
1. Synthetic checks run every minute per provider (for example a cheap test call), plus real traffic metrics (error rate, latency, timeouts).
2. A state machine moves the provider between statuses when thresholds are crossed for a sustained period (avoids flapping).
3. On a state change, the platform:
   - opens or updates an **incident**,
   - triggers **failover** if configured,
   - creates or updates an automatic announcement (if enabled),
   - notifies platform admins (email, Slack, push),
   - emits `provider.status_changed` to internal consumers and, where relevant, tenant webhooks (`channel.error`).
4. When healthy again for a sustained period, the incident resolves and the announcement expires, with an optional "resolved" notice.

### 3.4 Incidents
An incident has a title, affected providers and components, severity, status (`investigating`, `identified`, `monitoring`, `resolved`), timeline updates, and an optional public visibility flag shown on the status page. Updates posted to an incident can optionally update its linked announcement.

---

## 4. Data model

| Entity | Key fields |
|---|---|
| Announcement | id, type, severity, status, title (internal), messages (per locale), link_url, link_label, link_target, icon, label, dismissible, pinned, priority, rotation_seconds, starts_at, ends_at, recurrence, audience, targeting, source (manual, provider_auto, policy), provider_id, incident_id, policy_version_id, created_by, created_at |
| AnnouncementDismissal | announcement_id, user_id, dismissed_at, show_again_at |
| AnnouncementStat | announcement_id, date, impressions, clicks, dismissals |
| Provider | id, key, name, category, status, enabled, priority, config (json), credentials_ref, health thresholds, failover_to, status_feed_url, docs_url, last_checked_at |
| ProviderHealthCheck | provider_id, at, ok, latency_ms, error |
| ProviderChange | id, provider_id, type (deprecation, pricing, version, migration), description, effective_at, announcement_id |
| Incident | id, title, severity, status, provider_ids, public, started_at, resolved_at |
| IncidentUpdate | incident_id, status, message, created_by, created_at |
| PolicyDocument | id, type (terms, privacy, dpa, aup), version, content_url, effective_at, requires_acceptance, grace_days |
| PolicyAcceptance | policy_version_id, tenant_id, user_id, accepted_at, ip |
| PlatformAdmin | id, email, role, mfa_required (always true), status |

---

## 5. Client-facing APIs (for the bar itself)

Base: `/v1`. Auth: user access token (dashboard and agent app) or none for public items.

| Method | Path | Purpose |
|---|---|---|
| GET | `/announcements/active` | Active items for the current user and audience (sorted, locale resolved). Query: `platform`, `locale`. Supports `ETag` / `If-None-Match` for cheap polling |
| POST | `/announcements/{id}/impression` | Record that an item was viewed (batched by the client) |
| POST | `/announcements/{id}/click` | Record a click |
| POST | `/announcements/{id}/dismiss` | Dismiss for this user |
| GET | `/public/announcements` | Public items for the marketing site and docs (cached, no auth) |
| GET | `/policies/pending` | Policies the current user or tenant still has to accept |
| POST | `/policies/{version_id}/accept` | Accept a policy version (owner or admin; records audit entry) |
| GET | `/public/status` | Public provider and incident status for the status page |
| GET | `/public/status/incidents` | Recent public incidents |

Realtime event (dashboard socket): `announcement.updated` `{ id, action: created|updated|removed }`, so the bar updates without waiting for polling.

Sample response:
```json
{
  "rotation_seconds": 10,
  "etag": "a1b2c3",
  "items": [
    {
      "id": "ann_1",
      "type": "provider_update",
      "severity": "warning",
      "label": "Provider",
      "icon": "alert",
      "message": "WhatsApp messages may be delayed. We are monitoring.",
      "link": { "url": "https://status.ourdomain.com/inc_9", "label": "View status", "target": "_blank" },
      "dismissible": true,
      "pinned": false,
      "ends_at": "2026-11-27T18:00:00Z"
    },
    {
      "id": "ann_2",
      "type": "policy_update",
      "severity": "info",
      "label": "Policy",
      "message": "Our Privacy Policy changes on 1 December.",
      "link": { "url": "/legal/privacy", "label": "Read changes", "target": "_self" },
      "requires_action": { "type": "accept_policy", "policy_version_id": "pol_ver_5" },
      "dismissible": false,
      "pinned": true
    }
  ]
}
```

---

## 6. Platform Admin API (full surface)

Base: `https://api.ourdomain.com/v1/admin`

### 6.1 Rules for the admin surface
- **Separate authentication**: platform admin accounts are separate from tenant users. **MFA is mandatory**; sessions are short (for example 8 hours max), optionally restricted by IP or VPN.
- **Roles**: `super_admin` (everything), `ops` (providers, incidents, queues), `support` (tenants, users, impersonation), `finance` (billing, plans), `content` (announcements, policies, docs), `security` (audit, keys, abuse), `readonly`.
- **Step-up verification** for secrets, impersonation, deletions, plan overrides and force actions.
- **Every admin write is audit logged** with actor, reason (required free-text on sensitive actions), before and after values, IP and request id. Admin audit logs are immutable.
- **Tenant data access is minimized**: admins see metadata by default; message content access requires a logged reason and the tenant's consent or a break-glass procedure.
- Same conventions as the main API (pagination, idempotency, errors).

### 6.2 Admin authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/auth/login` | Admin login (email, password, then MFA required) |
| POST | `/admin/auth/mfa/verify` | Verify MFA |
| POST | `/admin/auth/token/refresh` | Refresh |
| POST | `/admin/auth/logout` | Logout |
| POST | `/admin/auth/step-up` | Step-up for sensitive actions |
| GET | `/admin/me` | Current admin and permissions |
| GET | `/admin/admins` | List admin accounts (super_admin) |
| POST | `/admin/admins` | Invite admin with role |
| PATCH | `/admin/admins/{id}` | Change role or status |
| DELETE | `/admin/admins/{id}` | Remove admin |

### 6.3 Announcements (content role)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/announcements` | List and filter (status, type, severity, audience, date) |
| POST | `/admin/announcements` | Create (draft, scheduled or publish now) |
| GET | `/admin/announcements/{id}` | Detail with stats |
| PATCH | `/admin/announcements/{id}` | Edit messages, link, targeting, schedule, severity |
| DELETE | `/admin/announcements/{id}` | Delete (or archive) |
| POST | `/admin/announcements/{id}/publish` | Publish now |
| POST | `/admin/announcements/{id}/pause` | Pause (stop showing) |
| POST | `/admin/announcements/{id}/resume` | Resume |
| POST | `/admin/announcements/{id}/expire` | End now |
| POST | `/admin/announcements/{id}/duplicate` | Clone |
| POST | `/admin/announcements/preview` | Preview how the bar renders for a given audience, locale and platform |
| GET | `/admin/announcements/{id}/stats` | Impressions, clicks, dismissals, acceptances over time |
| POST | `/admin/announcements/reorder` | Set priority order |
| GET | `/admin/announcement-settings` | Global settings (default rotation seconds, max concurrent items, cache TTL) |
| PUT | `/admin/announcement-settings` | Update global settings |
| GET | `/admin/announcement-templates` | Templates (provider degraded, provider restored, maintenance, new feature, policy change) |
| POST | `/admin/announcement-templates` | Create template |
| PATCH | `/admin/announcement-templates/{id}` | Edit template |

Create body:
```json
{
  "type": "announcement",
  "severity": "info",
  "label": "New",
  "messages": { "en": "Telegram support is now live. Connect your bot today.", "fr": "..." },
  "link": { "url": "https://docs.ourdomain.com/telegram", "label": "Learn more", "target": "_blank" },
  "dismissible": true,
  "pinned": false,
  "priority": 50,
  "rotation_seconds": 10,
  "starts_at": "2026-12-01T09:00:00Z",
  "ends_at": "2026-12-15T09:00:00Z",
  "audience": ["tenant_users"],
  "targeting": { "plans": ["growth", "enterprise"], "roles": ["owner", "admin"], "platforms": ["web", "ios", "android"], "tenant_ids": [], "uses_channels": [], "regions": [] }
}
```

### 6.4 Policies (content role, with legal review)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/policies` | List policy documents and versions |
| POST | `/admin/policies` | Create new policy type |
| POST | `/admin/policies/{id}/versions` | Draft a new version |
| PATCH | `/admin/policies/{id}/versions/{v}` | Edit draft |
| POST | `/admin/policies/{id}/versions/{v}/publish` | Publish with effective date, acceptance rules and grace period; optionally auto-create the announcement |
| GET | `/admin/policies/{id}/versions/{v}/acceptances` | Who accepted and who has not (by tenant) |
| POST | `/admin/policies/{id}/versions/{v}/remind` | Send reminder email or notification to non-accepting tenants |
| GET | `/admin/policies/{id}/versions/{v}/diff` | Diff against the previous version |

### 6.5 Providers (ops role)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/providers` | List providers with status, latency, error rate, usage |
| POST | `/admin/providers` | Register provider |
| GET | `/admin/providers/{id}` | Detail, config, recent checks, tenant impact |
| PATCH | `/admin/providers/{id}` | Edit name, config, thresholds, priority, status feed, docs link |
| POST | `/admin/providers/{id}/enable` | Enable |
| POST | `/admin/providers/{id}/disable` | Disable (with confirmation and impact preview) |
| PUT | `/admin/providers/{id}/credentials` | Set or rotate credentials (step-up; masked on read) |
| POST | `/admin/providers/{id}/test` | Run a test call and return result and latency |
| GET | `/admin/providers/{id}/health` | Health history (time series) |
| GET | `/admin/providers/{id}/metrics` | Usage, errors, latency, cost |
| GET | `/admin/providers/{id}/tenants` | Tenants affected or using this provider |
| PUT | `/admin/providers/{id}/failover` | Set failover order and automatic rules |
| POST | `/admin/providers/{id}/failover/trigger` | Manual failover (step-up) |
| POST | `/admin/providers/{id}/status` | Manually set status (override automation) with reason |
| GET | `/admin/providers/{id}/changes` | Planned changes (deprecations, pricing, versions) |
| POST | `/admin/providers/{id}/changes` | Record a planned change; optional auto-announcement |
| PATCH | `/admin/provider-automation` | Global automation rules (auto-announce, auto-failover, notify channels) |
| GET | `/admin/provider-categories` | Categories |

Provider config sample:
```json
{
  "key": "llm_primary",
  "name": "Primary LLM",
  "category": "ai",
  "enabled": true,
  "priority": 1,
  "config": { "model": "default-large", "region": "eu", "timeout_ms": 30000, "retries": 2, "rate_limit_per_min": 3000 },
  "thresholds": { "error_rate_degraded": 0.05, "error_rate_outage": 0.25, "p95_latency_ms_degraded": 8000, "sustain_seconds": 120 },
  "failover_to": "llm_backup",
  "auto_announce": true,
  "status_feed_url": "https://status.provider.example/api"
}
```

### 6.6 Incidents and status page (ops role)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/incidents` | List incidents |
| POST | `/admin/incidents` | Open incident (title, severity, providers, public flag) |
| GET | `/admin/incidents/{id}` | Detail and timeline |
| PATCH | `/admin/incidents/{id}` | Edit |
| POST | `/admin/incidents/{id}/updates` | Post update (status and message; optional sync to announcement) |
| POST | `/admin/incidents/{id}/resolve` | Resolve and expire linked announcement |
| GET | `/admin/maintenance` | Scheduled maintenance windows |
| POST | `/admin/maintenance` | Schedule maintenance (auto-announce before, during and after) |
| PATCH | `/admin/maintenance/{id}` | Edit or cancel |
| GET | `/admin/status-page/settings` | Status page components and visibility |
| PUT | `/admin/status-page/settings` | Update |

### 6.7 Tenants (support and finance roles)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/tenants` | Search and filter (plan, status, usage, provider, channel) |
| GET | `/admin/tenants/{id}` | Overview: plan, members, usage, channels, health |
| PATCH | `/admin/tenants/{id}` | Update limited fields (plan override, limits, notes, flags) |
| POST | `/admin/tenants/{id}/suspend` | Suspend with reason |
| POST | `/admin/tenants/{id}/unsuspend` | Unsuspend |
| DELETE | `/admin/tenants/{id}` | Delete (step-up, retention rules) |
| GET | `/admin/tenants/{id}/members` | Members |
| GET | `/admin/tenants/{id}/channels` | Connected channels and health |
| GET | `/admin/tenants/{id}/usage` | Usage and cost breakdown |
| GET | `/admin/tenants/{id}/audit-logs` | Tenant audit log |
| POST | `/admin/tenants/{id}/limits` | Override quotas (messages, tokens, agents, seats) |
| POST | `/admin/tenants/{id}/credits` | Add credits or free usage |
| POST | `/admin/tenants/{id}/impersonate` | Time-limited support session (reason required, tenant visibly notified, fully audited) |
| POST | `/admin/tenants/{id}/notify` | Send direct notice to the tenant's admins (email and in-app) |
| GET | `/admin/tenants/{id}/policy-status` | Accepted and pending policies |

### 6.8 Users and abuse (support and security roles)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/users` | Search users across tenants |
| GET | `/admin/users/{id}` | Detail, sessions, MFA state |
| POST | `/admin/users/{id}/lock` | Lock account |
| POST | `/admin/users/{id}/unlock` | Unlock |
| POST | `/admin/users/{id}/reset-mfa` | Reset MFA (step-up, identity verified, notifies user) |
| POST | `/admin/users/{id}/revoke-sessions` | Revoke all sessions |
| GET | `/admin/abuse/reports` | Abuse and spam reports |
| POST | `/admin/abuse/reports/{id}/action` | Warn, throttle, suspend |
| GET | `/admin/blocklist` | Blocked IPs, domains, numbers, emails |
| POST | `/admin/blocklist` | Add entry |
| DELETE | `/admin/blocklist/{id}` | Remove entry |

### 6.8b Billing and plans (finance role)

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/plans` | Plans and limits |
| POST | `/admin/plans` | Create plan |
| PATCH | `/admin/plans/{id}` | Edit plan, prices and limits |
| GET | `/admin/billing/invoices` | Invoices across tenants |
| POST | `/admin/billing/invoices/{id}/refund` | Refund (step-up) |
| GET | `/admin/billing/revenue` | Revenue and churn metrics |
| GET | `/admin/billing/costs` | Provider cost per tenant and per plan (margin view) |
| GET | `/admin/coupons` | Coupons |
| POST | `/admin/coupons` | Create coupon |

### 6.9 Platform configuration, flags and content

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/feature-flags` | Flags and rollout state |
| POST | `/admin/feature-flags` | Create flag |
| PATCH | `/admin/feature-flags/{key}` | Percentage rollout, per-plan or per-tenant overrides |
| GET | `/admin/config` | Platform settings (default limits, rate limits, retention defaults) |
| PUT | `/admin/config` | Update settings |
| GET | `/admin/sdk-versions` | SDK versions, minimum supported, force-upgrade flags |
| PUT | `/admin/sdk-versions` | Set minimum and latest versions per SDK, trigger upgrade prompts |
| GET | `/admin/models` | AI models available to agents and their costs |
| PUT | `/admin/models/{id}` | Enable or disable a model, set default |
| GET | `/admin/offline-packs` | Offline pack versions and compatibility with the on-device SDK |
| GET | `/admin/email-templates` | System email templates (verification, reset, invitations) |
| PATCH | `/admin/email-templates/{key}` | Edit |
| GET | `/admin/legal-pages` | Legal and help pages shown in apps |
| GET | `/admin/notification-rules` | Who on our team gets alerted for what (Slack, email, push) |
| PUT | `/admin/notification-rules` | Update |

### 6.10 Operations and observability

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/queues` | Queue depth, lag and failure counts (messages, webhooks, emails, indexing) |
| POST | `/admin/queues/{name}/retry-failed` | Retry failed jobs |
| GET | `/admin/webhook-deliveries` | Cross-tenant delivery health |
| GET | `/admin/ai/usage` | Token usage and cost by tenant, agent and model |
| GET | `/admin/ai/quality` | Handoff rate, thumbs down and low-confidence trends |
| GET | `/admin/channels/health` | WhatsApp, Telegram and other connection health across tenants |
| GET | `/admin/metrics/overview` | Platform KPIs (active tenants, messages, resolution rate, uptime) |
| GET | `/admin/audit-logs` | Platform-wide admin audit log (immutable) |
| GET | `/admin/jobs` | Background jobs |
| POST | `/admin/data-requests/{id}/fulfill` | Process GDPR export or delete requests |

---

## 7. Frontend and admin console

### 7.1 Announcement bar component
- A single shared component used by the web dashboard, marketing site and (as a banner variant) the mobile app.
- Props: `items`, `rotationSeconds`, `onDismiss`, `onClick`, `onImpression`. It owns rotation, pausing and accessibility.
- Accessibility: `role="region"` with `aria-label="Announcements"`, `aria-live="polite"` (assertive only for critical items), keyboard operable controls, pause on focus, respects reduced motion, sufficient contrast for each severity.
- Responsive: single line with truncation on desktop; two-line wrap or tap-to-expand on mobile.
- Impressions are counted once per item per page view after the item has been visible for at least 1 second.

### 7.2 Admin console screens
1. **Announcements**: list with status chips, create and edit form (per-locale messages, link, severity, targeting builder, schedule), live preview of the bar for each audience and platform, stats tab.
2. **Policies**: version history, diff viewer, publish dialog (effective date, acceptance and grace period), acceptance tracker by tenant, reminders.
3. **Providers**: grid with status lights, latency and error sparklines, detail page (config editor, credentials, failover order, test call, health history, tenants affected, planned changes).
4. **Incidents and maintenance**: create and update incidents, timeline composer, public status toggle, maintenance scheduler.
5. **Tenants and users**: search, tenant overview, limits and credits, suspend, impersonate (with reason prompt and banner during impersonation).
6. **Billing**, **feature flags**, **SDK versions**, **models**, **queues**, **audit log**.
7. **Admin team**: roles and MFA status.

---

## 8. Events and notifications

Internal events (not tenant-facing unless noted): `provider.status_changed`, `provider.failover_triggered`, `provider.change_recorded`, `incident.opened`, `incident.updated`, `incident.resolved`, `announcement.published`, `announcement.expired`, `policy.published`, `policy.acceptance_overdue`, `admin.sensitive_action`.

Tenant-facing (webhooks): `channel.error` when a provider outage affects their connection, `usage.limit_reached`, and (optional) `platform.announcement` for tenants who want announcements pushed to their own systems.

Alerts to our team go through the notification rules (Slack, email, push) so the right role is paged for the right event.

---

## 9. Build order

1. Data model and the admin authentication (separate admin identity, mandatory MFA, audit logging).
2. Announcement APIs (admin CRUD and client `GET /announcements/active`), the shared bar component, impressions, dismissals.
3. Provider registry with manual status, plus incident and status page APIs.
4. Health checks, automatic status changes, auto-announcements and failover rules.
5. Policy versions with acceptance tracking and blocking modal.
6. Tenant admin tools (search, limits, suspend, impersonation), billing and flags.
7. Ops dashboards (queues, AI usage and quality, channel health), SDK version controls, notification rules.
