import { format, parseISO } from "date-fns"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TimeSeriesPoint } from "@/types"
import { formatNumber, formatPercent } from "@/lib/format"

type ValueKind = "number" | "percent"

interface TrendChartProps {
  data: TimeSeriesPoint[]
  kind?: "area" | "line"
  valueKind?: ValueKind
  color?: string
  height?: number
}

function fmt(value: number, kind: ValueKind): string {
  return kind === "percent" ? formatPercent(value) : formatNumber(value)
}

interface TooltipPayloadItem {
  value: number
  payload: TimeSeriesPoint
}

function ChartTooltip({
  active,
  payload,
  valueKind,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  valueKind: ValueKind
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <div className="text-xs text-text-secondary">
        {format(parseISO(point.date), "d MMM yyyy")}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
        {fmt(point.value, valueKind)}
      </div>
    </div>
  )
}

/**
 * A labelled trend chart (volume, resolution, etc.) with light gridlines and a
 * branded tooltip. Used on the entity detail drill-in and dashboards.
 */
export function TrendChart({
  data,
  kind = "area",
  valueKind = "number",
  color = "var(--fcmb-purple)",
  height = 200,
}: TrendChartProps) {
  const yDomain: [number, number] | undefined =
    valueKind === "percent" ? [0, 1] : undefined

  const axisProps = {
    stroke: "var(--text-secondary)",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  } as const

  return (
    <ResponsiveContainer width="100%" height={height}>
      {kind === "area" ? (
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d as string), "d MMM")}
            interval="preserveStartEnd"
            minTickGap={28}
            {...axisProps}
          />
          <YAxis
            width={42}
            domain={yDomain}
            tickFormatter={(v) => fmt(v as number, valueKind)}
            {...axisProps}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltip valueKind={valueKind} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#trend-fill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d as string), "d MMM")}
            interval="preserveStartEnd"
            minTickGap={28}
            {...axisProps}
          />
          <YAxis
            width={42}
            domain={yDomain}
            tickFormatter={(v) => fmt(v as number, valueKind)}
            {...axisProps}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltip valueKind={valueKind} />}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  )
}
