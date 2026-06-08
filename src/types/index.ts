/**
 * Core domain types for the Temi Platform prototype.
 *
 * Derived from CLAUDE.md §3 (the three experiences), §7 (V1 scope per
 * screen), and §8 (Flow Builder spec). These are intentionally allowed to
 * evolve as screens are built out — keep them honest to the spec, not frozen.
 */

/* =================================================================
   Shared
   ================================================================= */

/** ISO-8601 timestamp string (mock data uses fixed strings, no live clock). */
export type ISODateString = string

/**
 * An audit trail entry. Tenant access and admin edits are "shown as logged"
 * throughout the product (CLAUDE.md §3, §7, §9.2) — this is the shape of
 * that displayed log line.
 */
export interface AuditEntry {
  id: string
  actor: string
  action: string
  timestamp: ISODateString
}

/* =================================================================
   Personas & Experiences (CLAUDE.md §3, §4)
   ================================================================= */

/** The three distinct experiences the shell switches between. */
export type ExperienceKind = "group" | "entity" | "customer"

/** A prototype-mode persona from the §4 switcher table. */
export interface Persona {
  id: string
  /** Display name, e.g. "Temi Platform Admin", "FADE". */
  name: string
  /** Human role label, e.g. "Group Platform Administrator". */
  role: string
  /** Which of the three experiences this persona drops into. */
  experience: ExperienceKind
  /** Entity this persona is scoped to. Group personas use the group/bank id. */
  entityId: string
  /** Why this persona exists in the prototype (from the §4 table). */
  purpose: string
}

/* =================================================================
   Entities & Onboarding (CLAUDE.md §2, §3, §7)
   ================================================================= */

export type EntityStatus = "Live" | "Onboarding" | "Pending"

/** Per-entity performance metrics shown on cards and dashboards. */
export interface EntityMetrics {
  /** Conversations in the reporting window. */
  conversationVolume: number
  /** AI resolution rate, 0–1. */
  aiResolutionRate: number
  /** Escalation rate, 0–1. */
  escalationRate: number
  /** Customer satisfaction, 0–1 (optional — not every entity reports it). */
  csat?: number
  /** Count of unanswered-question knowledge gaps. */
  knowledgeGapCount?: number
}

/** An FCMB Group entity tenant (CLAUDE.md §2 lists the eight). */
export interface Entity {
  id: string
  name: string
  /** Short label, e.g. "Asset Management". */
  shortName: string
  status: EntityStatus
  /** Is this the group/bank reference tenant (already live)? */
  isReferenceTenant?: boolean
  metrics: EntityMetrics
  /** Open security items scoped to this entity. */
  openP0Count: number
  openP1Count: number
  /** Current onboarding stage id, if status is "Onboarding". */
  onboardingStageId?: string
  brandColor?: string
}

/** The seven playbook stages plus two gates (CLAUDE.md §7.4). */
export type PlaybookStageKey =
  | "scoping"
  | "kb-prep"
  | "flow-design"
  | "configuration"
  | "testing"
  | "soft-launch"
  | "live"

export type GateKey = "security" | "compliance"

export type StageStatus = "complete" | "in-progress" | "pending" | "blocked"

/** A single stage (or gate) in an entity's onboarding pipeline. */
export interface OnboardingStage {
  key: PlaybookStageKey | GateKey
  label: string
  /** True for the two gates (Security, Compliance) vs the seven stages. */
  isGate: boolean
  status: StageStatus
  /** What is outstanding at this stage (CLAUDE.md §7.4). */
  outstanding?: string
}

/* =================================================================
   Knowledge Base (CLAUDE.md §7.7)
   ================================================================= */

export type KBDocumentStatus = "Uploaded" | "Indexed" | "Active" | "Error"

/** A version of a knowledge-base document (history is never deleted). */
export interface KBDocumentVersion {
  version: number
  uploadedAt: ISODateString
  uploadedBy: string
  /** Whether this version is the currently active one. */
  active: boolean
  note?: string
}

export interface KBDocument {
  id: string
  entityId: string
  name: string
  fileType: string
  status: KBDocumentStatus
  /** Currently active version number, if any. */
  activeVersion?: number
  versions: KBDocumentVersion[]
  updatedAt: ISODateString
}

/** A question received that no active document answered (gap report). */
export interface KnowledgeGap {
  id: string
  entityId: string
  question: string
  /** How many times it has been asked. */
  occurrences: number
  lastAsked: ISODateString
}

/* =================================================================
   Flow Builder (CLAUDE.md §8 — model mode only, never executes)
   ================================================================= */

export type FlowReviewStatus = "Draft" | "In Review" | "Reviewed"

/** The eight supported step types in V1 model mode (CLAUDE.md §8). */
export type FlowStepType =
  | "message"
  | "collectInput"
  | "validate"
  | "decision"
  | "action"
  | "confirm"
  | "notify"
  | "escalate"

export type CollectInputType =
  | "text"
  | "number"
  | "amount"
  | "account"
  | "selection"

interface FlowStepBase {
  id: string
  type: FlowStepType
}

/** Agent says something. */
export interface MessageStep extends FlowStepBase {
  type: "message"
  text: string
}

/** Agent requests a typed input. */
export interface CollectInputStep extends FlowStepBase {
  type: "collectInput"
  inputName: string
  inputType: CollectInputType
  prompt: string
}

/** A check against a rule or placeholder data source. */
export interface ValidateStep extends FlowStepBase {
  type: "validate"
  rule: string
  dataSource?: string
}

/** A labelled branch within a decision. */
export interface DecisionBranch {
  label: string
  steps: FlowStep[]
}

/** Branch on a condition (yes/no paths). */
export interface DecisionStep extends FlowStepBase {
  type: "decision"
  condition: string
  branches: DecisionBranch[]
}

/**
 * Describes a transaction that WOULD occur. ALWAYS non-executing and rendered
 * with the "MODEL MODE — does not execute" badge (CLAUDE.md §8, §9.1).
 */
export interface ActionStep extends FlowStepBase {
  type: "action"
  description: string
  /** Locked true in V1. Present to make the non-execution explicit in data. */
  modelModeOnly: true
}

/** Customer confirmation step. */
export interface ConfirmStep extends FlowStepBase {
  type: "confirm"
  prompt: string
}

/** A notification that would be sent. */
export interface NotifyStep extends FlowStepBase {
  type: "notify"
  message: string
  channel?: string
}

/** Handover to a named human team. */
export interface EscalateStep extends FlowStepBase {
  type: "escalate"
  team: string
  reason?: string
}

/** Discriminated union of all flow step kinds. */
export type FlowStep =
  | MessageStep
  | CollectInputStep
  | ValidateStep
  | DecisionStep
  | ActionStep
  | ConfirmStep
  | NotifyStep
  | EscalateStep

/** A flow version snapshot for history. */
export interface FlowVersion {
  version: number
  reviewStatus: FlowReviewStatus
  savedAt: ISODateString
  savedBy: string
  note?: string
}

/** A transactional flow designed in model mode (CLAUDE.md §8). */
export interface Flow {
  id: string
  entityId: string
  name: string
  description: string
  reviewStatus: FlowReviewStatus
  steps: FlowStep[]
  versions: FlowVersion[]
  /**
   * Marked as a candidate for (future) execution. For Asset Management this
   * surfaces a "requires compliance review" flag — a v2.0 transition that is
   * shown but not actioned (CLAUDE.md §8).
   */
  executionCandidate?: boolean
  /** Edit log shown with timestamp + actor (CLAUDE.md §8). */
  auditLog: AuditEntry[]
  updatedAt: ISODateString
}

/* =================================================================
   Escalation Routing (CLAUDE.md §7.10)
   ================================================================= */

/** Maps an intent category to a human team/queue. */
export interface EscalationRule {
  id: string
  entityId: string
  /** Intent category, e.g. "Account balance", "Complaints". */
  intentCategory: string
  /** Human team or queue the intent routes to. */
  team: string
  /** True for the single default fallback route. */
  isDefault: boolean
}

/* =================================================================
   Capabilities (CLAUDE.md §7.11, §9.3)
   ================================================================= */

export type CapabilityAvailability = "available" | "coming-soon"

/** A platform capability an entity can enable/disable (CLAUDE.md §7.11). */
export interface Capability {
  id: string
  name: string
  description: string
  category: string
  availability: CapabilityAvailability
  /** Whether the capability is currently enabled for the entity. */
  enabled: boolean
  /**
   * Locked off and not toggleable. Used for advice-type capabilities at Asset
   * Management, which are shown but cannot be enabled (CLAUDE.md §9.3).
   */
  locked?: boolean
  /** Compliance note explaining a lock or a coming-soon state. */
  complianceNote?: string
  /** Label for not-yet-available capabilities, e.g. "v2.0". */
  versionLabel?: string
}

/* =================================================================
   Security (CLAUDE.md §7.5, §9.4)
   ================================================================= */

export type SecuritySeverity = "P0" | "P1"

export type SecurityStatus = "Open" | "In Progress" | "Resolved"

/** Real backlog categories from CLAUDE.md §7.5. */
export type SecurityCategory =
  | "Credential Exposure"
  | "RBAC"
  | "Session Handling"
  | "Token Revocation"
  | "PII Logging"

/** A group-level security backlog item (mock display data, CLAUDE.md §12). */
export interface SecurityItem {
  id: string
  severity: SecuritySeverity
  category: SecurityCategory
  title: string
  description: string
  status: SecurityStatus
  /** Entity this item is scoped to, or "group" for platform-wide. */
  scope: string
  remediationState: string
  createdAt: ISODateString
}

/* =================================================================
   Analytics (CLAUDE.md §7.6, §7.12)
   ================================================================= */

/** A single point in a time-series (volume, resolution, etc.). */
export interface TimeSeriesPoint {
  date: ISODateString
  value: number
}

/** A labelled breakdown slice (by channel, by intent, CSAT distribution). */
export interface BreakdownSlice {
  label: string
  value: number
}
