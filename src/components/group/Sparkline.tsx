import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import type { TimeSeriesPoint } from "@/types"

interface SparklineProps {
  data: TimeSeriesPoint[]
  /** Stroke/fill colour. Pass a CSS var or hex. */
  color?: string
  height?: number
}

/**
 * A tiny axis-less area chart for inline trends on cards and tables
 * (CLAUDE.md: "Use Recharts for any inline metrics"). Animation is off so it
 * stays crisp inside dense grids.
 */
export function Sparkline({
  data,
  color = "var(--fcmb-purple)",
  height = 38,
}: SparklineProps) {
  const rawId = useId()
  const gradId = `spark-${rawId.replace(/[:]/g, "")}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
