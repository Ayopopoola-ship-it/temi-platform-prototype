import type {
  GateKey,
  OnboardingStage,
  PlaybookStageKey,
} from "@/types"

/**
 * The onboarding playbook (CLAUDE.md §7.4): seven stages with two gates
 * positioned between Configuration and Testing. This is the repeatable path
 * every entity follows. FCMB Asset Management is the active pilot, shown
 * mid-pipeline at Configuration with its Security Gate blocked by an open P0.
 */

/** The seven playbook stages, in order. */
export const STAGE_SEQUENCE: PlaybookStageKey[] = [
  "scoping",
  "kb-prep",
  "flow-design",
  "configuration",
  "testing",
  "soft-launch",
  "live",
]

export const STAGE_LABELS: Record<PlaybookStageKey, string> = {
  scoping: "Scoping",
  "kb-prep": "KB Prep",
  "flow-design": "Flow Design",
  configuration: "Configuration",
  testing: "Testing",
  "soft-launch": "Soft Launch",
  live: "Live",
}

export const GATE_LABELS: Record<GateKey, string> = {
  security: "Security Gate",
  compliance: "Compliance Gate",
}

export function stageLabel(key: PlaybookStageKey | GateKey): string {
  return (
    STAGE_LABELS[key as PlaybookStageKey] ?? GATE_LABELS[key as GateKey] ?? key
  )
}

/** FCMB Asset Management - the pilot, mid-pipeline at Configuration. */
const ASSET_MANAGEMENT_PIPELINE: OnboardingStage[] = [
  {
    key: "scoping",
    label: STAGE_LABELS.scoping,
    isGate: false,
    status: "complete",
    outstanding: "Scope, intents and success metrics agreed with FADE.",
  },
  {
    key: "kb-prep",
    label: STAGE_LABELS["kb-prep"],
    isGate: false,
    status: "complete",
    outstanding:
      "7 fund documents ingested; 9 knowledge gaps flagged for follow-up.",
  },
  {
    key: "flow-design",
    label: STAGE_LABELS["flow-design"],
    isGate: false,
    status: "complete",
    outstanding:
      "3 pilot flows drafted in model mode; fund specifics pending FADE (OQ-A, OQ-B).",
  },
  {
    key: "configuration",
    label: STAGE_LABELS.configuration,
    isGate: false,
    status: "in-progress",
    outstanding:
      "Escalation routing being finalised; web widget live, WhatsApp number pending central provisioning.",
  },
  {
    key: "security",
    label: GATE_LABELS.security,
    isGate: true,
    status: "blocked",
    outstanding:
      "1 open P0 (hardcoded API keys) and 1 P1 (client-side session) must be remediated before testing.",
  },
  {
    key: "compliance",
    label: GATE_LABELS.compliance,
    isGate: true,
    status: "pending",
    outstanding:
      "No-advice constraint review and compliance sign-off outstanding.",
  },
  {
    key: "testing",
    label: STAGE_LABELS.testing,
    isGate: false,
    status: "pending",
    outstanding: "Begins once both gates pass.",
  },
  {
    key: "soft-launch",
    label: STAGE_LABELS["soft-launch"],
    isGate: false,
    status: "pending",
    outstanding: "Limited customer cohort; entry criteria not yet met.",
  },
  {
    key: "live",
    label: STAGE_LABELS.live,
    isGate: false,
    status: "pending",
    outstanding: "Full rollout across all enabled channels.",
  },
]

/** CSL Stockbrokers - second entity in the playbook, currently scoping. */
const CSL_PIPELINE: OnboardingStage[] = [
  {
    key: "scoping",
    label: STAGE_LABELS.scoping,
    isGate: false,
    status: "in-progress",
    outstanding: "Entity scope and intent catalogue being defined with CSL.",
  },
  {
    key: "kb-prep",
    label: STAGE_LABELS["kb-prep"],
    isGate: false,
    status: "pending",
    outstanding: "Awaiting source documents from CSL.",
  },
  {
    key: "flow-design",
    label: STAGE_LABELS["flow-design"],
    isGate: false,
    status: "pending",
    outstanding: "Not started.",
  },
  {
    key: "configuration",
    label: STAGE_LABELS.configuration,
    isGate: false,
    status: "pending",
    outstanding: "Not started.",
  },
  {
    key: "security",
    label: GATE_LABELS.security,
    isGate: true,
    status: "pending",
    outstanding: "Security review scheduled after configuration.",
  },
  {
    key: "compliance",
    label: GATE_LABELS.compliance,
    isGate: true,
    status: "pending",
    outstanding: "Compliance review scheduled after configuration.",
  },
  {
    key: "testing",
    label: STAGE_LABELS.testing,
    isGate: false,
    status: "pending",
    outstanding: "Not started.",
  },
  {
    key: "soft-launch",
    label: STAGE_LABELS["soft-launch"],
    isGate: false,
    status: "pending",
    outstanding: "Not started.",
  },
  {
    key: "live",
    label: STAGE_LABELS.live,
    isGate: false,
    status: "pending",
    outstanding: "Not started.",
  },
]

const ENTITY_PIPELINES: Record<string, OnboardingStage[]> = {
  "asset-management": ASSET_MANAGEMENT_PIPELINE,
  "csl-stockbrokers": CSL_PIPELINE,
}

export function getOnboardingForEntity(
  entityId: string
): OnboardingStage[] | undefined {
  return ENTITY_PIPELINES[entityId]
}

/** Entities actively in the playbook, in display order (pilot first). */
export const ONBOARDING_ENTITY_IDS = ["asset-management", "csl-stockbrokers"]
