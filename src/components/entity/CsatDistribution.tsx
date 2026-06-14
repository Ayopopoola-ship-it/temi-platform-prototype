import type { BreakdownSlice } from "@/types"
import { formatNumber, formatPercent } from "@/lib/format"

/** Sentiment colours for the five CSAT buckets, best → worst. */
const BUCKET_COLORS: Record<string, string> = {
  "Very satisfied": "var(--status-green)",
  Satisfied: "#4ade80",
  Neutral: "var(--status-amber)",
  Dissatisfied: "#F97316",
  "Very dissatisfied": "var(--status-red)",
}

function colorFor(label: string, i: number): string {
  return (
    BUCKET_COLORS[label] ??
    ["var(--status-green)", "#4ade80", "var(--status-amber)", "#F97316", "var(--status-red)"][i] ??
    "var(--fcmb-purple)"
  )
}

/**
 * CSAT rating distribution: a headline satisfied-share, a single stacked bar
 * coloured best→worst, and a per-bucket legend (CLAUDE.md §7.12).
 */
export function CsatDistribution({ data }: { data: BreakdownSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const satisfied = data
    .filter((d) => d.label === "Very satisfied" || d.label === "Satisfied")
    .reduce((s, d) => s + d.value, 0)
  const satisfiedPct = total > 0 ? satisfied / total : 0

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
          {formatPercent(satisfiedPct)}
        </span>
        <span className="text-sm text-text-secondary">
          satisfied or very satisfied · {formatNumber(total)} rated conversations
        </span>
      </div>

      {/* Stacked bar */}
      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full">
        {data.map((d, i) => {
          const w = total > 0 ? (d.value / total) * 100 : 0
          if (w === 0) return null
          return (
            <div
              key={d.label}
              style={{ width: `${w}%`, backgroundColor: colorFor(d.label, i) }}
              title={`${d.label}: ${formatPercent(d.value / total)}`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colorFor(d.label, i) }}
            />
            <span className="text-text-primary">{d.label}</span>
            <span className="ml-auto tabular-nums text-text-secondary">
              {formatNumber(d.value)}
              <span className="ml-1.5 text-text-primary">
                {total > 0 ? formatPercent(d.value / total) : "–"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
