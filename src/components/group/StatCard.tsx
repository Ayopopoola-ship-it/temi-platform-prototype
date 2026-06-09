import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: LucideIcon
  /** Optional inline chart rendered under the value. */
  sparkline?: ReactNode
  /** If set, the whole card is a link. */
  to?: string
  className?: string
}

/**
 * A single group-summary metric (CLAUDE.md §7.2). Neutral white card; the
 * prominent red security treatment lives in SecurityStatCard, not here.
 */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  sparkline,
  to,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {label}
        </span>
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
        {value}
      </div>
      {sub && <div className="mt-1 text-sm text-text-secondary">{sub}</div>}
      {sparkline && <div className="mt-3 -mb-1">{sparkline}</div>}
    </>
  )

  const base =
    "flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs"

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          base,
          "transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          className
        )}
      >
        {body}
      </Link>
    )
  }

  return <div className={cn(base, className)}>{body}</div>
}
