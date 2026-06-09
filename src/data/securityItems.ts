import type { SecurityItem } from "@/types"

/**
 * Mock P0/P1 security backlog (CLAUDE.md §7.5, §9.4). This is deliberately
 * prominent: the open count drives the red group-security indicator on the
 * Overview, and the product story depends on it being visible — do not soften.
 *
 * This is mock DISPLAY data depicting security status as content (CLAUDE.md
 * §12), not a real vulnerability in this prototype. Categories mirror the real
 * backlog: credential exposure, RBAC, session handling, token revocation,
 * PII logging.
 */
export const SECURITY_ITEMS: SecurityItem[] = [
  {
    id: "sec-001",
    severity: "P0",
    category: "Credential Exposure",
    title: "Hardcoded LLM API keys in application config",
    description:
      "Provider API keys are committed in plaintext in the service configuration rather than sourced from a secrets manager.",
    status: "Open",
    ownerRole: "Platform Security Lead",
    scope: "asset-management",
    remediationState: "Awaiting migration to AWS Secrets Manager",
    createdAt: "2026-05-12",
  },
  {
    id: "sec-002",
    severity: "P0",
    category: "PII Logging",
    title: "Customer PII written to logs in plaintext",
    description:
      "Account numbers and phone numbers appear unredacted in conversation logs, violating data-handling policy.",
    status: "In Progress",
    ownerRole: "Data Protection Officer",
    scope: "group",
    remediationState: "Log-redaction middleware in code review",
    createdAt: "2026-04-28",
  },
  {
    id: "sec-003",
    severity: "P0",
    category: "RBAC",
    title: "No role-based access control on admin console APIs",
    description:
      "Entity-admin and group-admin endpoints are not separated by role; any authenticated admin can call any endpoint.",
    status: "In Progress",
    ownerRole: "Backend Engineering Lead",
    scope: "group",
    remediationState: "RBAC policy layer being implemented behind a flag",
    createdAt: "2026-04-15",
  },
  {
    id: "sec-004",
    severity: "P1",
    category: "Session Handling",
    title: "Session state validated client-side only",
    description:
      "Session/role claims are trusted from the client without server-side verification, allowing tampering.",
    status: "Open",
    ownerRole: "Backend Engineering Lead",
    scope: "asset-management",
    remediationState: "Server-side session validation scheduled for next sprint",
    createdAt: "2026-05-20",
  },
  {
    id: "sec-005",
    severity: "P1",
    category: "Token Revocation",
    title: "No token revocation on logout or compromise",
    description:
      "Issued access tokens remain valid until expiry; there is no revocation path on logout or credential compromise.",
    status: "Open",
    ownerRole: "Platform Security Lead",
    scope: "fcmb-bank",
    remediationState: "Revocation list / short-lived tokens under design",
    createdAt: "2026-05-02",
  },
  {
    id: "sec-006",
    severity: "P1",
    category: "Credential Exposure",
    title: "Single LLM provider key shared across all entities",
    description:
      "One provider credential is reused for every tenant, preventing per-entity rotation and blast-radius isolation.",
    status: "In Progress",
    ownerRole: "Platform Security Lead",
    scope: "group",
    remediationState: "Per-tenant key issuance being rolled out",
    createdAt: "2026-05-09",
  },
  {
    id: "sec-007",
    severity: "P1",
    category: "RBAC",
    title: "Group drill-into-entity access not fully audited",
    description:
      "Cross-entity access from the Group Console is allowed but not consistently scoped or written to an audit trail.",
    status: "Open",
    ownerRole: "Platform Security Lead",
    scope: "group",
    remediationState: "Audit-log coverage being extended to all drill-ins",
    createdAt: "2026-05-26",
  },
  {
    id: "sec-008",
    severity: "P1",
    category: "Session Handling",
    title: "Legacy web session cookie missing Secure/HttpOnly flags",
    description:
      "An older web session cookie was set without the Secure and HttpOnly attributes.",
    status: "Resolved",
    ownerRole: "Backend Engineering Lead",
    scope: "fcmb-bank",
    remediationState: "Fix deployed and verified in production",
    createdAt: "2026-03-30",
  },
]

/** Items that are not yet Resolved (drive the prominent open count). */
export const OPEN_SECURITY_ITEMS = SECURITY_ITEMS.filter(
  (i) => i.status !== "Resolved"
)

/** Open P0/P1 counts surfaced on the Group Overview (CLAUDE.md §7.2, §9.4). */
export const OPEN_SECURITY_COUNTS = {
  p0: OPEN_SECURITY_ITEMS.filter((i) => i.severity === "P0").length,
  p1: OPEN_SECURITY_ITEMS.filter((i) => i.severity === "P1").length,
  get total() {
    return this.p0 + this.p1
  },
}
