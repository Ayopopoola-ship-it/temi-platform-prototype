import type { EntityAnalytics, TimeSeriesPoint } from "@/types"

/**
 * Mock analytics for the dashboards (CLAUDE.md §7.6, §7.12). Twelve weekly
 * points ending early June 2026. FCMB Bank is a stable live tenant; FCMB Asset
 * Management is a soft-launch pilot whose resolution and CSAT ramp as its
 * knowledge base matures.
 *
 * The Asset Management intent breakdown is PLACEHOLDER data pending FADE's
 * input (OQ-A, OQ-B) — do not treat the fund intents as confirmed.
 */
const WEEKS = [
  "2026-03-16",
  "2026-03-23",
  "2026-03-30",
  "2026-04-06",
  "2026-04-13",
  "2026-04-20",
  "2026-04-27",
  "2026-05-04",
  "2026-05-11",
  "2026-05-18",
  "2026-05-25",
  "2026-06-01",
]

/** Zip a value array against the shared weekly dates. */
function series(values: number[]): TimeSeriesPoint[] {
  return values.map((value, i) => ({ date: WEEKS[i], value }))
}

const BANK_ANALYTICS: EntityAnalytics = {
  entityId: "fcmb-bank",
  conversationVolume: series([
    11200, 10980, 11540, 11890, 12030, 11760, 12210, 12480, 12090, 12650,
    12380, 12740,
  ]),
  resolutionRate: series([
    0.8, 0.81, 0.81, 0.82, 0.82, 0.83, 0.83, 0.82, 0.84, 0.83, 0.84, 0.83,
  ]),
  csat: series([
    0.84, 0.85, 0.85, 0.86, 0.86, 0.87, 0.86, 0.87, 0.88, 0.87, 0.88, 0.87,
  ]),
  escalationByIntent: [
    { label: "Card & transaction disputes", value: 5200 },
    { label: "Account balance & statements", value: 3100 },
    { label: "Transfers & payments", value: 2600 },
    { label: "Loan & card applications", value: 1900 },
    { label: "Complaints", value: 1400 },
    { label: "Other", value: 1100 },
  ],
}

const ASSET_MANAGEMENT_ANALYTICS: EntityAnalytics = {
  entityId: "asset-management",
  conversationVolume: series([
    60, 95, 130, 180, 210, 260, 300, 340, 390, 430, 470, 520,
  ]),
  resolutionRate: series([
    0.55, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.69, 0.7, 0.72, 0.73, 0.74,
  ]),
  csat: series([
    0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.78, 0.79, 0.8,
  ]),
  // Placeholder fund intents pending FADE's input (OQ-A, OQ-B).
  escalationByIntent: [
    { label: "Subscription (top-up)", value: 210 },
    { label: "Redemption", value: 180 },
    { label: "Account balance & holdings", value: 150 },
    { label: "Statement request", value: 90 },
    { label: "Fund information", value: 70 },
    { label: "Complaints", value: 40 },
    { label: "Other", value: 35 },
  ],
}

export const ANALYTICS: EntityAnalytics[] = [
  BANK_ANALYTICS,
  ASSET_MANAGEMENT_ANALYTICS,
]

export function getAnalyticsByEntity(
  entityId: string
): EntityAnalytics | undefined {
  return ANALYTICS.find((a) => a.entityId === entityId)
}
