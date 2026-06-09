import { Building2, MessagesSquare, Target } from "lucide-react"
import type { TimeSeriesPoint } from "@/types"
import { GROUP_SUMMARY } from "@/data/entities"
import { ANALYTICS } from "@/data/analytics"
import { formatNumber, formatPercent } from "@/lib/format"
import { StatCard } from "./StatCard"
import { SecurityStatCard } from "./SecurityStatCard"
import { Sparkline } from "./Sparkline"

/** Aggregate weekly conversation volume across all reporting entities. */
function combinedVolumeSeries(): TimeSeriesPoint[] {
  const [first, ...rest] = ANALYTICS
  if (!first) return []
  return first.conversationVolume.map((point, i) => ({
    date: point.date,
    value:
      point.value +
      rest.reduce((sum, a) => sum + (a.conversationVolume[i]?.value ?? 0), 0),
  }))
}

/**
 * The group summary row on the Overview (CLAUDE.md §7.2): total entities, total
 * conversations, average resolution rate, and the prominent open P0/P1 count.
 */
export function GroupSummaryBar() {
  const volumeSeries = combinedVolumeSeries()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total entities"
        value={GROUP_SUMMARY.totalEntities}
        icon={Building2}
        sub={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-status-green" />
              {GROUP_SUMMARY.liveEntities} live
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-status-amber" />
              {GROUP_SUMMARY.onboardingEntities} onboarding
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-disabled" />
              {GROUP_SUMMARY.totalEntities -
                GROUP_SUMMARY.liveEntities -
                GROUP_SUMMARY.onboardingEntities}{" "}
              pending
            </span>
          </span>
        }
      />

      <StatCard
        label="Total conversations"
        value={formatNumber(GROUP_SUMMARY.totalConversations)}
        icon={MessagesSquare}
        sub="Across all entities, last 12 weeks"
        sparkline={<Sparkline data={volumeSeries} height={34} />}
      />

      <StatCard
        label="Avg resolution rate"
        value={formatPercent(GROUP_SUMMARY.avgResolutionRate)}
        icon={Target}
        sub={`Mean AI resolution across ${ANALYTICS.length} reporting entit${
          ANALYTICS.length === 1 ? "y" : "ies"
        }`}
      />

      <SecurityStatCard />
    </div>
  )
}
