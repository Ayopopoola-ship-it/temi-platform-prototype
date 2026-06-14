import type { KBDocument, KnowledgeGap } from "@/types"

/**
 * Mock knowledge base for FCMB Asset Management (CLAUDE.md §7.7). Demonstrates
 * the document lifecycle: every ingestion status (Uploaded → Indexed → Active,
 * plus Error) appears, history is never deleted, and one document keeps an
 * earlier version serving while a newer version indexes.
 *
 * All fund-specific detail (names, processes, figures) is PLACEHOLDER data
 * pending FADE's input (OQ-A, OQ-B) - not confirmed fund information.
 */
const ENTITY_ID = "asset-management"

export const KB_DOCUMENTS: KBDocument[] = [
  {
    id: "kb-mmf-factsheet",
    entityId: ENTITY_ID,
    name: "Money Market Fund Factsheet",
    fileType: "PDF",
    status: "Active",
    activeVersion: 2,
    versions: [
      {
        version: 1,
        uploadedAt: "2026-02-10",
        uploadedBy: "Temi Onboarding Team",
        active: false,
      },
      {
        version: 2,
        uploadedAt: "2026-04-22",
        uploadedBy: "FADE",
        active: true,
        note: "Q2 figures (placeholder).",
      },
    ],
    updatedAt: "2026-04-22",
  },
  {
    id: "kb-equity-factsheet",
    entityId: ENTITY_ID,
    name: "Equity Fund Factsheet",
    fileType: "PDF",
    status: "Active",
    activeVersion: 3,
    versions: [
      {
        version: 1,
        uploadedAt: "2026-02-10",
        uploadedBy: "Temi Onboarding Team",
        active: false,
      },
      {
        version: 2,
        uploadedAt: "2026-03-18",
        uploadedBy: "FADE",
        active: false,
      },
      {
        version: 3,
        uploadedAt: "2026-05-06",
        uploadedBy: "FADE",
        active: true,
      },
    ],
    updatedAt: "2026-05-06",
  },
  {
    id: "kb-nav-pricing-faq",
    entityId: ENTITY_ID,
    name: "NAV & Pricing FAQ",
    fileType: "PDF",
    status: "Active",
    activeVersion: 2,
    versions: [
      {
        version: 1,
        uploadedAt: "2026-03-02",
        uploadedBy: "Temi Onboarding Team",
        active: false,
      },
      {
        version: 2,
        uploadedAt: "2026-05-14",
        uploadedBy: "FADE",
        active: true,
      },
    ],
    updatedAt: "2026-05-14",
  },
  {
    id: "kb-subscription-process",
    entityId: ENTITY_ID,
    name: "Subscription (Top-up) Process Guide",
    fileType: "DOCX",
    // New v2 is indexing while v1 keeps serving: demonstrates activating a new
    // version without losing the active one (CLAUDE.md §7.7).
    status: "Indexed",
    activeVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: "2026-03-09",
        uploadedBy: "Temi Onboarding Team",
        active: true,
      },
      {
        version: 2,
        uploadedAt: "2026-06-03",
        uploadedBy: "FADE",
        active: false,
        note: "Awaiting FADE review before activation (placeholder steps).",
      },
    ],
    updatedAt: "2026-06-03",
  },
  {
    id: "kb-redemption-process",
    entityId: ENTITY_ID,
    name: "Redemption Process Guide",
    fileType: "DOCX",
    status: "Active",
    activeVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: "2026-03-09",
        uploadedBy: "Temi Onboarding Team",
        active: true,
        note: "Settlement timeline is placeholder pending FADE.",
      },
    ],
    updatedAt: "2026-03-09",
  },
  {
    id: "kb-fixed-income-factsheet",
    entityId: ENTITY_ID,
    name: "Fixed Income Fund Factsheet",
    fileType: "PDF",
    status: "Error",
    versions: [
      {
        version: 1,
        uploadedAt: "2026-05-30",
        uploadedBy: "FADE",
        active: false,
        note: "Ingestion failed: scanned PDF with no extractable text.",
      },
    ],
    updatedAt: "2026-05-30",
  },
  {
    id: "kb-kyc-account-opening",
    entityId: ENTITY_ID,
    name: "KYC & Account Opening FAQ",
    fileType: "PDF",
    status: "Uploaded",
    versions: [
      {
        version: 1,
        uploadedAt: "2026-06-05",
        uploadedBy: "FADE",
        active: false,
        note: "Queued for indexing.",
      },
    ],
    updatedAt: "2026-06-05",
  },
]

/**
 * Questions received that no active document answered (CLAUDE.md §7.7). These
 * fund-specific questions are PLACEHOLDER and several map directly to the open
 * questions FADE still needs to resolve.
 */
export const KNOWLEDGE_GAPS: KnowledgeGap[] = [
  {
    id: "gap-001",
    entityId: ENTITY_ID,
    question: "What is the minimum top-up amount for the Money Market Fund?",
    occurrences: 47,
    lastAsked: "2026-06-06",
  },
  {
    id: "gap-002",
    entityId: ENTITY_ID,
    question: "How long does a redemption take to settle?",
    occurrences: 39,
    lastAsked: "2026-06-07",
  },
  {
    id: "gap-003",
    entityId: ENTITY_ID,
    question: "Can I switch between funds without redeeming first?",
    occurrences: 28,
    lastAsked: "2026-06-05",
  },
  {
    id: "gap-004",
    entityId: ENTITY_ID,
    question: "Are there exit fees for early redemption?",
    occurrences: 22,
    lastAsked: "2026-06-04",
  },
  {
    id: "gap-005",
    entityId: ENTITY_ID,
    question: "How is withholding tax applied to my returns?",
    occurrences: 18,
    lastAsked: "2026-06-06",
  },
  {
    id: "gap-006",
    entityId: ENTITY_ID,
    question: "What is the current yield on the Fixed Income Fund?",
    occurrences: 15,
    lastAsked: "2026-06-03",
  },
]
