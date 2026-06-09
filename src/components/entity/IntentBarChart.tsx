import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { BreakdownSlice } from "@/types"
import { formatNumber } from "@/lib/format"

interface TooltipItem {
  value: number
  payload: BreakdownSlice
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipItem[]
}) {
  if (!active || !payload?.length) return null
  const slice = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <div className="text-xs text-text-secondary">{slice.label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
        {formatNumber(slice.value)} escalations
      </div>
    </div>
  )
}

/**
 * Horizontal bar breakdown of escalations by intent category (CLAUDE.md §7.6).
 * The leading intent is emphasised in brand purple; the rest are muted.
 */
export function IntentBarChart({ data }: { data: BreakdownSlice[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const max = Math.max(...sorted.map((d) => d.value))

  return (
    <ResponsiveContainer width="100%" height={sorted.length * 38 + 16}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
        barCategoryGap={8}
      >
        <XAxis type="number" hide domain={[0, max]} />
        <YAxis
          type="category"
          dataKey="label"
          width={160}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
        />
        <Tooltip cursor={{ fill: "var(--accent)" }} content={<BarTooltip />} />
        <Bar
          dataKey="value"
          radius={[0, 5, 5, 0]}
          barSize={18}
          isAnimationActive={false}
        >
          {sorted.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "var(--fcmb-purple)" : "color-mix(in oklab, var(--fcmb-purple) 35%, white)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
