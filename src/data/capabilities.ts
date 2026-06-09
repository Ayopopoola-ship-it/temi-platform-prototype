import type { Capability } from "@/types"

/**
 * The platform capability catalogue (CLAUDE.md §7.11). The `enabled` state
 * reflects FCMB Asset Management's configuration (FADE's console).
 *
 * Advice-type capabilities are shown but locked OFF and not toggleable for
 * Asset Management — the agent explains and informs, it never recommends,
 * projects returns, or assesses suitability (CLAUDE.md §9.3). Capabilities not
 * yet available are marked "v2.0".
 */
export const CAPABILITIES: Capability[] = [
  {
    id: "cap-kb-answers",
    name: "Knowledge base answers",
    description:
      "Answer customer questions from the entity's active knowledge base with grounded, retrieved responses.",
    category: "Knowledge",
    availability: "available",
    enabled: true,
    adviceType: false,
  },
  {
    id: "cap-account-balance",
    name: "Account balance enquiry",
    description:
      "Retrieve and present a customer's balance or holdings (model-mode flow in V1).",
    category: "Account servicing",
    availability: "available",
    enabled: true,
    adviceType: false,
  },
  {
    id: "cap-statement",
    name: "Statement & transaction history",
    description:
      "Provide statements and recent transaction history on request.",
    category: "Account servicing",
    availability: "available",
    enabled: false,
    adviceType: false,
  },
  {
    id: "cap-human-handover",
    name: "Human handover",
    description:
      "Escalate a conversation to a named human team with full context.",
    category: "Conversation",
    availability: "available",
    enabled: true,
    adviceType: false,
  },
  {
    id: "cap-csat",
    name: "CSAT collection",
    description:
      "Collect a customer satisfaction rating at the end of a conversation.",
    category: "Conversation",
    availability: "available",
    enabled: true,
    adviceType: false,
  },
  {
    id: "cap-flow-builder",
    name: "Flow Builder (model mode)",
    description:
      "Design transactional flows as explicit, reviewable sequences. Model mode only — flows do not execute (CLAUDE.md §9.1).",
    category: "Workflow",
    availability: "available",
    enabled: true,
    adviceType: false,
  },
  {
    id: "cap-live-transactions",
    name: "Live transaction execution",
    description:
      "Execute real transactions (subscriptions, redemptions) from a flow. Not available in V1 — flows are model mode only.",
    category: "Transactions",
    availability: "v2.0",
    enabled: false,
    adviceType: false,
    complianceNote:
      "Requires the model-mode → execution compliance transition. Shown but not enabled.",
  },
  {
    id: "cap-investment-advice",
    name: "Investment advice & recommendations",
    description:
      "Recommend funds or products to a customer based on their profile.",
    category: "Advisory (restricted)",
    availability: "available",
    enabled: false,
    adviceType: true,
    locked: true,
    complianceNote:
      "Not available to FCMB Asset Management. The agent informs but never advises (CLAUDE.md §9.3).",
  },
  {
    id: "cap-returns-projection",
    name: "Returns projection & forecasting",
    description:
      "Project or forecast investment returns for a customer.",
    category: "Advisory (restricted)",
    availability: "available",
    enabled: false,
    adviceType: true,
    locked: true,
    complianceNote:
      "Not available to FCMB Asset Management — the agent does not project returns (CLAUDE.md §9.3).",
  },
  {
    id: "cap-suitability",
    name: "Suitability assessment",
    description:
      "Assess whether a product is suitable for a specific customer.",
    category: "Advisory (restricted)",
    availability: "available",
    enabled: false,
    adviceType: true,
    locked: true,
    complianceNote:
      "Not available to FCMB Asset Management — the agent does not assess suitability (CLAUDE.md §9.3).",
  },
]
