import { ArrowUpRight, ShieldAlert, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSecurity } from "@/context/SecurityContext"

/**
 * The open P0/P1 security count for the Group Overview. Per the locked decision
 * (CLAUDE.md §9.4) this is prominent and RED whenever the open count is above
 * zero - never softened. Reads live state so resolutions on the Platform
 * Security screen flow straight through here. Links to that screen.
 */
export function SecurityStatCard({ className }: { className?: string }) {
  const { openP0: p0, openP1: p1, openCount: total } = useSecurity()
  const hasOpen = total > 0

  return (
    <Link
      to="/group/security"
      className={cn(
        "group flex flex-col rounded-xl border p-5 shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2",
        hasOpen
          ? "border-status-red/30 bg-status-red/[0.04] hover:border-status-red/50 hover:bg-status-red/[0.07] focus-visible:ring-status-red/40"
          : "border-status-green/30 bg-status-green/[0.05] hover:border-status-green/50 focus-visible:ring-status-green/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            hasOpen ? "text-status-red" : "text-status-green"
          )}
        >
          Open P0 / P1 Security
        </span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            hasOpen
              ? "bg-status-red/15 text-status-red"
              : "bg-status-green/15 text-status-green"
          )}
        >
          {hasOpen ? (
            <ShieldAlert className="size-4" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
        </span>
      </div>

      {hasOpen ? (
        <>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight tabular-nums text-status-red">
              {total}
            </span>
            <span className="text-sm font-medium text-status-red/80">
              open items
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-status-red/10 px-1.5 py-0.5 text-xs font-semibold text-status-red ring-1 ring-inset ring-status-red/25 tabular-nums">
              P0 {p0}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-status-amber/10 px-1.5 py-0.5 text-xs font-semibold text-[#B45309] ring-1 ring-inset ring-status-amber/25 tabular-nums">
              P1 {p1}
            </span>
            <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-status-red opacity-0 transition-opacity group-hover:opacity-100">
              Remediation <ArrowUpRight className="size-3" />
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-status-green">
            0
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            No open P0 / P1 items
          </div>
        </>
      )}
    </Link>
  )
}
