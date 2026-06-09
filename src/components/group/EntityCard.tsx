import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import type { Entity } from "@/types"
import { getAnalyticsByEntity } from "@/data/analytics"
import { formatCompact, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityStatusBadge } from "./StatusBadge"
import { ChannelBadges } from "./ChannelBadges"
import { EntitySecurityChip } from "./EntitySecurityChip"
import { Sparkline } from "./Sparkline"

/** Two-letter monogram from the entity name (e.g. "FCMB Bank" → "FB"). */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-text-primary">
        {value}
      </div>
    </div>
  )
}

/**
 * Entity card for the Group Overview grid (CLAUDE.md §7.2): name, status badge,
 * volume / resolution / escalation, channels and a per-entity security signal.
 * The whole card drills into the entity detail (that access is logged).
 */
export function EntityCard({ entity }: { entity: Entity }) {
  const hasTraffic = entity.metrics.conversationVolume > 0
  const volumeSeries = getAnalyticsByEntity(entity.id)?.conversationVolume

  return (
    <Link
      to={`/group/entities/${entity.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
          {monogram(entity.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-text-primary">
              {entity.name}
            </h3>
            <ArrowUpRight className="size-3.5 shrink-0 text-disabled opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {entity.isReferenceTenant ? (
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
              <span className="size-1 rounded-full bg-fcmb-yellow" />
              Reference tenant
            </span>
          ) : (
            <span className="mt-0.5 block truncate text-xs text-text-secondary">
              {entity.shortName}
            </span>
          )}
        </div>
        <EntityStatusBadge status={entity.status} />
      </div>

      {/* Metrics */}
      <div className="mt-5 flex-1">
        {hasTraffic ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Metric
                label="Volume"
                value={formatCompact(entity.metrics.conversationVolume)}
              />
              <Metric
                label="Resolution"
                value={formatPercent(entity.metrics.aiResolutionRate)}
              />
              <Metric
                label="Escalation"
                value={formatPercent(entity.metrics.escalationRate)}
              />
            </div>
            {volumeSeries && (
              <div className="mt-3">
                <Sparkline data={volumeSeries} height={32} />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[3.5rem] items-center rounded-lg bg-fcmb-offwhite px-3 py-2.5">
            <p className="line-clamp-2 text-xs text-text-secondary">
              {entity.note ??
                (entity.status === "Onboarding"
                  ? "Onboarding in progress — no live traffic yet."
                  : "Queued for onboarding — not yet live.")}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "mt-5 flex items-center justify-between border-t border-border pt-3.5"
        )}
      >
        <ChannelBadges channels={entity.channels} showInactive={false} />
        <EntitySecurityChip entity={entity} />
      </div>
    </Link>
  )
}
