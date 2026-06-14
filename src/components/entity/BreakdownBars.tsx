import type { BreakdownSlice } from "@/types"
import { formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * A labelled horizontal-bar breakdown with per-row percentages. Pure CSS (no
 * chart lib) so it handles zero-value rows gracefully - used for the channel
 * split, where only some channels are live.
 */
export function BreakdownBars({
  data,
  emptyLabel = "Not live",
}: {
  data: BreakdownSlice[]
  emptyLabel?: string
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = total > 0 ? d.value / total : 0
        const width = d.value > 0 ? Math.max((d.value / max) * 100, 2) : 0
        return (
          <li key={d.label}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-text-primary">{d.label}</span>
              {d.value > 0 ? (
                <span className="tabular-nums text-text-secondary">
                  {formatNumber(d.value)}
                  <span className="ml-1.5 text-text-primary">
                    {formatPercent(pct)}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-disabled">{emptyLabel}</span>
              )}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fcmb-offwhite">
              <div
                className={cn(
                  "h-full rounded-full",
                  d.value > 0 ? "bg-primary" : "bg-transparent"
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
