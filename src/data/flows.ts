import type { Flow } from "@/types"

/**
 * Model-mode flows (CLAUDE.md §8). Intentionally empty for now — the three
 * pilot flows for FCMB Asset Management (Balance Enquiry, Subscription,
 * Redemption) are built in Phase 8 as clearly-labelled draft placeholders
 * pending FADE's input (OQ-A, OQ-B).
 *
 * Reminder for Phase 8: flows are MODEL MODE ONLY. Every Action step is a
 * non-executing placeholder rendered with the "MODEL MODE — does not execute"
 * badge (CLAUDE.md §9.1).
 */
export const FLOWS: Flow[] = []

export function getFlowsByEntity(entityId: string): Flow[] {
  return FLOWS.filter((f) => f.entityId === entityId)
}
