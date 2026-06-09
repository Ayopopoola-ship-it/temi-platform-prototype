import { ShieldAlert, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Entity } from "@/types"

/**
 * Per-entity security signal derived from its open P0/P1 counts. Reinforces the
 * security story at the entity level (CLAUDE.md §9.4) — red for any open P0,
 * amber for P1-only, green when clear.
 */
export function EntitySecurityChip({
  entity,
  className,
}: {
  entity: Pick<Entity, "openP0Count" | "openP1Count">
  className?: string
}) {
  const { openP0Count: p0, openP1Count: p1 } = entity

  if (p0 === 0 && p1 === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-status-green ring-1 ring-inset ring-status-green/20 bg-status-green/10",
          className
        )}
      >
        <ShieldCheck className="size-3" />
        Secure
      </span>
    )
  }

  const critical = p0 > 0
  const parts = [p0 > 0 ? `${p0} P0` : null, p1 > 0 ? `${p1} P1` : null].filter(
    Boolean
  )

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums",
        critical
          ? "text-status-red ring-status-red/25 bg-status-red/10"
          : "text-[#B45309] ring-status-amber/30 bg-status-amber/10",
        className
      )}
    >
      <ShieldAlert className="size-3" />
      {parts.join(" · ")} open
    </span>
  )
}
