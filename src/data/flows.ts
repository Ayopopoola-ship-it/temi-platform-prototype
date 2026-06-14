import type { Flow } from "@/types"

/**
 * Model-mode flows (CLAUDE.md §8). Flows are designed, versioned and reviewed
 * by humans - they DO NOT execute. Every Action step is a non-executing
 * placeholder rendered with the "MODEL MODE - does not execute" badge.
 *
 * The three FCMB Asset Management flows below are the pre-built pilot flows
 * from §8.3. Their step content is SENSIBLE PLACEHOLDER logic for a Nigerian
 * asset manager, drafted pending FADE's input on the real fund processes
 * (open questions OQ-A, OQ-B). They are intentionally left in "Draft" status
 * and labelled as placeholders - not confirmed fund process detail.
 *
 * The FCMB Bank flows are reference examples for the already-live tenant,
 * shown for contrast (Reviewed status). Tenant isolation holds: each entity
 * only ever sees its own flows (CLAUDE.md §9.2).
 */

const ASSET = "asset-management"
const BANK = "fcmb-bank"

const ASSET_FLOWS: Flow[] = [
  {
    id: "flow-am-balance",
    entityId: ASSET,
    name: "Balance Enquiry",
    description:
      "Customer asks for their fund balance. Placeholder logic pending FADE's input (OQ-A).",
    reviewStatus: "Draft",
    executionCandidate: false,
    steps: [
      {
        id: "balance-identify",
        type: "collectInput",
        inputName: "Account identifier",
        inputType: "account",
        prompt:
          "Please share your account number or BVN so I can locate your holdings.",
      },
      {
        id: "balance-validate",
        type: "validate",
        rule: "Account identifier matches an active customer record",
        dataSource: "Customer registry (placeholder)",
      },
      {
        id: "balance-action",
        type: "action",
        description:
          "Retrieve the customer's current fund balance from the registry (placeholder: would read balance).",
        modelModeOnly: true,
      },
      {
        id: "balance-message",
        type: "message",
        text: "Here is your current balance across your funds: {balance_summary}.",
      },
      {
        id: "balance-escalate",
        type: "escalate",
        team: "Customer Support Team",
        reason: "Customer wants to speak to a person about their balance.",
      },
    ],
    versions: [
      {
        version: 1,
        reviewStatus: "Draft",
        savedAt: "2026-05-28T11:04:00",
        savedBy: "Temi Onboarding Team",
        note: "Initial placeholder draft for FADE to correct.",
      },
    ],
    auditLog: [
      {
        id: "flow-am-balance-a1",
        actor: "Temi Onboarding Team",
        action: "Created flow “Balance Enquiry” as a placeholder draft",
        timestamp: "2026-05-28T11:04:00",
      },
    ],
    updatedAt: "2026-05-28T11:04:00",
  },
  {
    id: "flow-am-subscription",
    entityId: ASSET,
    name: "Subscription (Top-up)",
    description:
      "Customer tops up an existing fund holding. Placeholder logic pending FADE's input on minimums and process (OQ-A, OQ-B).",
    reviewStatus: "Draft",
    executionCandidate: false,
    steps: [
      {
        id: "sub-identify",
        type: "collectInput",
        inputName: "Account identifier",
        inputType: "account",
        prompt: "Please share your account number or BVN to begin your top-up.",
      },
      {
        id: "sub-fund",
        type: "collectInput",
        inputName: "Fund",
        inputType: "selection",
        prompt: "Which fund would you like to top up?",
      },
      {
        id: "sub-amount",
        type: "collectInput",
        inputName: "Amount",
        inputType: "amount",
        prompt: "How much would you like to add (in Naira)?",
      },
      {
        id: "sub-validate",
        type: "validate",
        rule: "Amount ≥ the fund's minimum subscription (placeholder threshold)",
        dataSource: "Fund parameters (placeholder)",
      },
      {
        id: "sub-confirm",
        type: "confirm",
        prompt:
          "Please confirm: top up {fund} with ₦{amount}. Proceed? (Yes / No)",
      },
      {
        id: "sub-action",
        type: "action",
        description:
          "Submit the subscription order for {fund} of ₦{amount} (placeholder: would place order).",
        modelModeOnly: true,
      },
      {
        id: "sub-notify",
        type: "notify",
        message:
          "Your top-up of ₦{amount} into {fund} has been received. Reference: {ref}.",
        channel: "WhatsApp / email",
      },
      {
        id: "sub-escalate",
        type: "escalate",
        team: "Customer Support Team",
        reason: "Subscription could not be completed. Hand over on failure.",
      },
    ],
    versions: [
      {
        version: 1,
        reviewStatus: "Draft",
        savedAt: "2026-05-28T11:12:00",
        savedBy: "Temi Onboarding Team",
        note: "Initial placeholder draft for FADE to correct.",
      },
    ],
    auditLog: [
      {
        id: "flow-am-sub-a1",
        actor: "Temi Onboarding Team",
        action: "Created flow “Subscription (Top-up)” as a placeholder draft",
        timestamp: "2026-05-28T11:12:00",
      },
    ],
    updatedAt: "2026-05-28T11:12:00",
  },
  {
    id: "flow-am-redemption",
    entityId: ASSET,
    name: "Redemption",
    description:
      "Customer redeems units from a fund. Placeholder logic pending FADE's input on holding checks and timelines (OQ-A, OQ-B).",
    reviewStatus: "Draft",
    executionCandidate: false,
    steps: [
      {
        id: "red-identify",
        type: "collectInput",
        inputName: "Account identifier",
        inputType: "account",
        prompt: "Please share your account number or BVN to begin a redemption.",
      },
      {
        id: "red-fund-units",
        type: "collectInput",
        inputName: "Fund and units",
        inputType: "text",
        prompt: "Which fund, and how many units would you like to redeem?",
      },
      {
        id: "red-validate",
        type: "validate",
        rule: "Units requested ≤ the customer's current holding in that fund",
        dataSource: "Customer holdings (placeholder)",
      },
      {
        id: "red-confirm",
        type: "confirm",
        prompt:
          "Please confirm: redeem {units} units from {fund}. Proceed? (Yes / No)",
      },
      {
        id: "red-action",
        type: "action",
        description:
          "Submit the redemption order for {units} units of {fund} (placeholder: would place order).",
        modelModeOnly: true,
      },
      {
        id: "red-message",
        type: "message",
        text:
          "Your redemption has been submitted. Proceeds typically settle within {settlement_window} (placeholder timeline, pending FADE).",
      },
      {
        id: "red-notify",
        type: "notify",
        message:
          "Your redemption of {units} units from {fund} has been received. Reference: {ref}.",
        channel: "WhatsApp / email",
      },
      {
        id: "red-escalate",
        type: "escalate",
        team: "Customer Support Team",
        reason: "Redemption could not be completed. Hand over on failure.",
      },
    ],
    versions: [
      {
        version: 1,
        reviewStatus: "Draft",
        savedAt: "2026-05-28T11:20:00",
        savedBy: "Temi Onboarding Team",
        note: "Initial placeholder draft for FADE to correct.",
      },
    ],
    auditLog: [
      {
        id: "flow-am-red-a1",
        actor: "Temi Onboarding Team",
        action: "Created flow “Redemption” as a placeholder draft",
        timestamp: "2026-05-28T11:20:00",
      },
    ],
    updatedAt: "2026-05-28T11:20:00",
  },
]

/**
 * Reference flows for the already-live FCMB Bank tenant, shown for contrast
 * (Reviewed status, model mode still applies). These never appear in the Asset
 * Management console - tenant isolation (CLAUDE.md §9.2).
 */
const BANK_FLOWS: Flow[] = [
  {
    id: "flow-bank-card-block",
    entityId: BANK,
    name: "Card Block & Replacement",
    description:
      "Customer reports a lost or stolen card and requests a replacement.",
    reviewStatus: "Reviewed",
    executionCandidate: true,
    steps: [
      {
        id: "card-identify",
        type: "collectInput",
        inputName: "Account identifier",
        inputType: "account",
        prompt: "Please confirm your account number to continue.",
      },
      {
        id: "card-confirm",
        type: "confirm",
        prompt: "Confirm you want to block the card ending {last4}? (Yes / No)",
      },
      {
        id: "card-action",
        type: "action",
        description:
          "Block the affected card and raise a replacement request (placeholder: would block card).",
        modelModeOnly: true,
      },
      {
        id: "card-notify",
        type: "notify",
        message:
          "Your card ending {last4} is now blocked. A replacement is on its way.",
        channel: "SMS / app",
      },
      {
        id: "card-escalate",
        type: "escalate",
        team: "Bank Cards Operations",
        reason: "Customer needs further help with the card replacement.",
      },
    ],
    versions: [
      {
        version: 1,
        reviewStatus: "Draft",
        savedAt: "2025-11-02T09:00:00",
        savedBy: "Bank Ops Admin",
      },
      {
        version: 2,
        reviewStatus: "Reviewed",
        savedAt: "2025-12-15T14:30:00",
        savedBy: "Bank Ops Admin",
        note: "Reviewed and approved for the live reference tenant.",
      },
    ],
    auditLog: [
      {
        id: "flow-bank-card-a1",
        actor: "Bank Ops Admin",
        action: "Marked flow “Card Block & Replacement” as Reviewed",
        timestamp: "2025-12-15T14:30:00",
      },
    ],
    updatedAt: "2025-12-15T14:30:00",
  },
  {
    id: "flow-bank-airtime",
    entityId: BANK,
    name: "Airtime Top-up",
    description: "Customer buys airtime for their own or another number.",
    reviewStatus: "Reviewed",
    executionCandidate: true,
    steps: [
      {
        id: "air-number",
        type: "collectInput",
        inputName: "Phone number",
        inputType: "text",
        prompt: "Which number would you like to top up?",
      },
      {
        id: "air-amount",
        type: "collectInput",
        inputName: "Amount",
        inputType: "amount",
        prompt: "How much airtime (in Naira)?",
      },
      {
        id: "air-confirm",
        type: "confirm",
        prompt: "Confirm ₦{amount} airtime to {number}? (Yes / No)",
      },
      {
        id: "air-action",
        type: "action",
        description:
          "Debit the account and deliver airtime to {number} (placeholder: would purchase airtime).",
        modelModeOnly: true,
      },
      {
        id: "air-notify",
        type: "notify",
        message: "₦{amount} airtime delivered to {number}.",
        channel: "SMS / app",
      },
    ],
    versions: [
      {
        version: 1,
        reviewStatus: "Reviewed",
        savedAt: "2025-10-20T10:00:00",
        savedBy: "Bank Ops Admin",
        note: "Reviewed for the live reference tenant.",
      },
    ],
    auditLog: [
      {
        id: "flow-bank-air-a1",
        actor: "Bank Ops Admin",
        action: "Marked flow “Airtime Top-up” as Reviewed",
        timestamp: "2025-10-20T10:00:00",
      },
    ],
    updatedAt: "2025-10-20T10:00:00",
  },
]

export const FLOWS: Flow[] = [...ASSET_FLOWS, ...BANK_FLOWS]

export function getFlowsByEntity(entityId: string): Flow[] {
  return FLOWS.filter((f) => f.entityId === entityId)
}

export function getFlowById(id: string): Flow | undefined {
  return FLOWS.find((f) => f.id === id)
}
