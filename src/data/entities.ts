import type { Entity } from "@/types"

/**
 * The FCMB Group entity tenants (CLAUDE.md §2). All metrics are mock display
 * data — no backend. FCMB Bank is the live reference tenant; FCMB Asset
 * Management is the pilot, shown mid-pipeline; ROVA is Pending and called out
 * as the platform failure made concrete (it is building its own divergent
 * agent, Ruby, rather than onboarding).
 *
 * Rates are 0–1. Pending entities have no live traffic yet (zeroed metrics).
 */
export const ENTITIES: Entity[] = [
  {
    id: "fcmb-bank",
    name: "FCMB Bank",
    shortName: "Bank",
    status: "Live",
    isReferenceTenant: true,
    metrics: {
      conversationVolume: 48230,
      aiResolutionRate: 0.83,
      escalationRate: 0.13,
      csat: 0.87,
      knowledgeGapCount: 12,
    },
    openP0Count: 0,
    openP1Count: 1,
    channels: ["whatsapp", "web", "mobile"],
  },
  {
    id: "asset-management",
    name: "FCMB Asset Management",
    shortName: "Asset Management",
    status: "Onboarding",
    metrics: {
      conversationVolume: 1840,
      aiResolutionRate: 0.71,
      escalationRate: 0.22,
      csat: 0.79,
      knowledgeGapCount: 9,
    },
    openP0Count: 1,
    openP1Count: 1,
    channels: ["web"],
    onboardingStage: "configuration",
    note: "Pilot entity. Volume is soft-launch test traffic; fund-specific behaviour is pending FADE's input (OQ-A, OQ-B).",
  },
  {
    id: "csl-stockbrokers",
    name: "CSL Stockbrokers",
    shortName: "CSL",
    status: "Onboarding",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
    onboardingStage: "scoping",
    note: "Second entity to enter the playbook, currently scoping.",
  },
  {
    id: "fcmb-pensions",
    name: "FCMB Pensions",
    shortName: "Pensions",
    status: "Pending",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
    note: "Queued for onboarding after the Asset Management pilot.",
  },
  {
    id: "credit-direct",
    name: "Credit Direct Limited",
    shortName: "Credit Direct",
    status: "Pending",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
  },
  {
    id: "fcmb-mfb",
    name: "FCMB MFB",
    shortName: "MFB",
    status: "Pending",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
  },
  {
    id: "fcmb-trustees",
    name: "FCMB Trustees",
    shortName: "Trustees",
    status: "Pending",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
  },
  {
    id: "rova",
    name: "ROVA",
    shortName: "ROVA",
    status: "Pending",
    metrics: {
      conversationVolume: 0,
      aiResolutionRate: 0,
      escalationRate: 0,
    },
    openP0Count: 0,
    openP1Count: 0,
    channels: [],
    note: "Building its own divergent agent (Ruby) rather than onboarding onto Temi — the platform-failure case the shared model is meant to prevent.",
  },
]

export function getEntityById(id: string): Entity | undefined {
  return ENTITIES.find((e) => e.id === id)
}

/** Group-level rollup for the Overview summary stats (CLAUDE.md §7.2). */
export const GROUP_SUMMARY = {
  totalEntities: ENTITIES.length,
  liveEntities: ENTITIES.filter((e) => e.status === "Live").length,
  onboardingEntities: ENTITIES.filter((e) => e.status === "Onboarding").length,
  totalConversations: ENTITIES.reduce(
    (sum, e) => sum + e.metrics.conversationVolume,
    0
  ),
  /** Average resolution rate across entities with live traffic. */
  avgResolutionRate: (() => {
    const live = ENTITIES.filter((e) => e.metrics.conversationVolume > 0)
    if (live.length === 0) return 0
    return (
      live.reduce((sum, e) => sum + e.metrics.aiResolutionRate, 0) / live.length
    )
  })(),
}
