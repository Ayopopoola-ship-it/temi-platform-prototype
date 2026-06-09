import type { EscalationRule } from "@/types"

/**
 * Mock escalation routing matrix for FCMB Asset Management (CLAUDE.md §7.10):
 * intent category → human team, with a single default fallback route. Intent
 * categories are PLACEHOLDER pending FADE's input (OQ-A, OQ-B).
 */
const ENTITY_ID = "asset-management"

export const ESCALATION_RULES: EscalationRule[] = [
  {
    id: "esc-subscription",
    entityId: ENTITY_ID,
    intentCategory: "Subscription (top-up)",
    team: "Investment Operations",
    isDefault: false,
  },
  {
    id: "esc-redemption",
    entityId: ENTITY_ID,
    intentCategory: "Redemption",
    team: "Investment Operations",
    isDefault: false,
  },
  {
    id: "esc-balance",
    entityId: ENTITY_ID,
    intentCategory: "Account balance & holdings",
    team: "Client Services",
    isDefault: false,
  },
  {
    id: "esc-statement",
    entityId: ENTITY_ID,
    intentCategory: "Statement request",
    team: "Client Services",
    isDefault: false,
  },
  {
    id: "esc-fund-info",
    entityId: ENTITY_ID,
    intentCategory: "Fund information",
    team: "Client Services",
    isDefault: false,
  },
  {
    id: "esc-complaints",
    entityId: ENTITY_ID,
    intentCategory: "Complaints",
    team: "Complaints & Resolution",
    isDefault: false,
  },
  {
    id: "esc-kyc",
    entityId: ENTITY_ID,
    intentCategory: "KYC & account opening",
    team: "Onboarding & KYC",
    isDefault: false,
  },
  {
    id: "esc-default",
    entityId: ENTITY_ID,
    intentCategory: "Default (unmatched intents)",
    team: "Asset Management Support Desk",
    isDefault: true,
  },
]
