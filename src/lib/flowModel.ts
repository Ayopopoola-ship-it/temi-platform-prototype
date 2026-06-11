/**
 * Flow Builder model helpers (CLAUDE.md §8 — MODEL MODE ONLY).
 *
 * Flows are designed, versioned and reviewed by humans. They DO NOT execute.
 * Every Action step is a non-executing placeholder rendered with the
 * "MODEL MODE — does not execute" badge. This module centralises the step-type
 * metadata, factory and summaries so that constraint is expressed in one place
 * and cannot drift across the UI (CLAUDE.md §9.1, compliance-critical).
 */
import {
  ArrowLeftRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Headset,
  MessageSquare,
  Split,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react"
import type {
  FlowReviewStatus,
  FlowStep,
  FlowStepType,
} from "@/types"

/** Semantic tint for a step tile. Colour carries meaning, not decoration. */
export type StepTone = "agent" | "guard" | "handover" | "action"

export interface StepMeta {
  type: FlowStepType
  label: string
  icon: LucideIcon
  tone: StepTone
  /** One-line description shown in the add-step menu. */
  blurb: string
}

/**
 * Step-type catalogue, in the order they appear in the add-step menu. Tones:
 * - agent    → the bot speaks / collects / branches / notifies (purple)
 * - guard    → a check or confirmation gate (green)
 * - handover → leaves the bot for a human (amber)
 * - action   → a transaction that WOULD occur — never executes (purple + badge)
 */
export const STEP_META: Record<FlowStepType, StepMeta> = {
  message: {
    type: "message",
    label: "Message",
    icon: MessageSquare,
    tone: "agent",
    blurb: "The agent says something to the customer.",
  },
  collectInput: {
    type: "collectInput",
    label: "Collect Input",
    icon: TextCursorInput,
    tone: "agent",
    blurb: "Ask the customer for a typed value (e.g. an amount).",
  },
  validate: {
    type: "validate",
    label: "Validate",
    icon: BadgeCheck,
    tone: "guard",
    blurb: "Check a rule or placeholder data source before continuing.",
  },
  decision: {
    type: "decision",
    label: "Decision",
    icon: Split,
    tone: "agent",
    blurb: "Branch the flow on a condition (yes / no paths).",
  },
  action: {
    type: "action",
    label: "Action",
    icon: ArrowLeftRight,
    tone: "action",
    blurb: "Describe a transaction that would occur — never executes.",
  },
  confirm: {
    type: "confirm",
    label: "Confirm",
    icon: CheckCircle2,
    tone: "guard",
    blurb: "Ask the customer to confirm before proceeding.",
  },
  notify: {
    type: "notify",
    label: "Notify",
    icon: Bell,
    tone: "agent",
    blurb: "A notification that would be sent to the customer.",
  },
  escalate: {
    type: "escalate",
    label: "Escalate",
    icon: Headset,
    tone: "handover",
    blurb: "Hand the conversation over to a named human team.",
  },
}

/** Add-step menu order (CLAUDE.md §8 step-type list). */
export const STEP_TYPE_ORDER: FlowStepType[] = [
  "message",
  "collectInput",
  "validate",
  "decision",
  "confirm",
  "action",
  "notify",
  "escalate",
]

/** Tailwind classes per tone for the step icon tile. */
export const TONE_TILE: Record<StepTone, string> = {
  agent: "bg-primary/10 text-primary",
  guard: "bg-status-green/10 text-status-green",
  handover: "bg-status-amber/10 text-status-amber",
  action: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/30",
}

let stepSeq = 0
function nextStepId(type: FlowStepType): string {
  stepSeq += 1
  return `step-${type}-${Date.now()}-${stepSeq}`
}

/**
 * Build a fresh step of the given type with empty (but valid) defaults. Action
 * steps are created with `modelModeOnly: true` locked on — there is no code
 * path that produces an executing action (CLAUDE.md §9.1).
 */
export function createStep(type: FlowStepType): FlowStep {
  const id = nextStepId(type)
  switch (type) {
    case "message":
      return { id, type, text: "" }
    case "collectInput":
      return { id, type, inputName: "", inputType: "text", prompt: "" }
    case "validate":
      return { id, type, rule: "" }
    case "decision":
      return {
        id,
        type,
        condition: "",
        branches: [
          { label: "If yes", steps: [] },
          { label: "If no", steps: [] },
        ],
      }
    case "action":
      return { id, type, description: "", modelModeOnly: true }
    case "confirm":
      return { id, type, prompt: "" }
    case "notify":
      return { id, type, message: "" }
    case "escalate":
      return { id, type, team: "" }
  }
}

/** A short human summary of a step's configured content, for the card subtitle. */
export function stepSummary(step: FlowStep): string {
  switch (step.type) {
    case "message":
      return step.text || "No message set"
    case "collectInput":
      return step.inputName
        ? `Collect “${step.inputName}” (${step.inputType})`
        : "No input configured"
    case "validate":
      return step.rule || "No rule set"
    case "decision":
      return step.condition || "No condition set"
    case "action":
      return step.description || "No transaction described"
    case "confirm":
      return step.prompt || "No confirmation prompt set"
    case "notify":
      return step.message || "No notification set"
    case "escalate":
      return step.team ? `Hand over to ${step.team}` : "No team set"
  }
}

/** Whether a single step has its required fields filled in. */
export function isStepConfigured(step: FlowStep): boolean {
  switch (step.type) {
    case "message":
      return step.text.trim().length > 0
    case "collectInput":
      return step.inputName.trim().length > 0 && step.prompt.trim().length > 0
    case "validate":
      return step.rule.trim().length > 0
    case "decision":
      return step.condition.trim().length > 0
    case "action":
      return step.description.trim().length > 0
    case "confirm":
      return step.prompt.trim().length > 0
    case "notify":
      return step.message.trim().length > 0
    case "escalate":
      return step.team.trim().length > 0
  }
}

/** Count steps including those nested inside decision branches. */
export function countSteps(steps: FlowStep[]): number {
  return steps.reduce((total, s) => {
    if (s.type === "decision") {
      return (
        total + 1 + s.branches.reduce((b, br) => b + countSteps(br.steps), 0)
      )
    }
    return total + 1
  }, 0)
}

/**
 * A flow is "complete" (eligible to be marked Reviewed) when it has at least
 * one step and every step — including those inside decision branches — is
 * configured (CLAUDE.md §8: cannot be marked Reviewed without all steps set).
 */
export function isFlowComplete(steps: FlowStep[]): boolean {
  if (steps.length === 0) return false
  return steps.every((s) => {
    if (!isStepConfigured(s)) return false
    if (s.type === "decision") {
      return s.branches.every((br) => br.steps.every(isStepConfigured))
    }
    return true
  })
}

/** Visual + label treatment for a flow's review status. */
export const REVIEW_STATUS_META: Record<
  FlowReviewStatus,
  { label: string; className: string; dot: string }
> = {
  Draft: {
    label: "Draft",
    className:
      "bg-fcmb-offwhite text-text-secondary ring-1 ring-inset ring-border",
    dot: "bg-disabled",
  },
  "In Review": {
    label: "In Review",
    className:
      "bg-status-amber/10 text-status-amber ring-1 ring-inset ring-status-amber/20",
    dot: "bg-status-amber",
  },
  Reviewed: {
    label: "Reviewed",
    className:
      "bg-status-green/10 text-status-green ring-1 ring-inset ring-status-green/20",
    dot: "bg-status-green",
  },
}
