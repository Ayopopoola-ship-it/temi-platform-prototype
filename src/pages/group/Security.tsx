import { useMemo, useState } from "react"
import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react"
import type { SecurityItem, SecurityStatus } from "@/types"
import { useSecurity } from "@/context/SecurityContext"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { SecurityTable } from "@/components/group/SecurityTable"

const SEVERITY_ORDER: Record<string, number> = { P0: 0, P1: 1 }
const STATUS_ORDER: Record<SecurityStatus, number> = {
  Open: 0,
  "In Progress": 1,
  Resolved: 2,
}

type StatusFilter = "all" | SecurityStatus

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Open", label: "Open" },
  { key: "In Progress", label: "In Progress" },
  { key: "Resolved", label: "Resolved" },
]

/** Open items first, P0 before P1, then most-recently logged. */
function sortItems(items: SecurityItem[]): SecurityItem[] {
  return [...items].sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (sev !== 0) return sev
    const st = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (st !== 0) return st
    return b.createdAt.localeCompare(a.createdAt)
  })
}

function HeadlineTile({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: "red" | "amber" | "green"
}) {
  const toneClass = {
    red: "text-status-red",
    amber: "text-[#B45309]",
    green: "text-status-green",
  }[tone]
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
      <div className={cn("text-2xl font-semibold tabular-nums", toneClass)}>
        {count}
      </div>
      <div className="mt-0.5 text-xs font-medium text-text-secondary">
        {label}
      </div>
    </div>
  )
}

export default function Security() {
  const { items, markResolved, openCount, openP0, openP1, allResolved } =
    useSecurity()
  const [filter, setFilter] = useState<StatusFilter>("all")

  const counts = useMemo(() => {
    const c = { all: items.length } as Record<StatusFilter, number>
    for (const f of FILTERS) {
      if (f.key === "all") continue
      c[f.key] = items.filter((i) => i.status === f.key).length
    }
    return c
  }, [items])

  const resolvedCount = items.length - openCount
  const hasOpen = openCount > 0

  const visible = useMemo(() => {
    const sorted = sortItems(items)
    return filter === "all"
      ? sorted
      : sorted.filter((i) => i.status === filter)
  }, [items, filter])

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={ShieldAlert}
        title="Platform Security"
        description="Open P0 / P1 security items and their remediation state across FCMB Group. The Temi platform team owns resolving these. This is the security gate; items here block onboarding and go-live until cleared."
      />

      {/* All-resolved banner: the gate can now be cleared (per onboarding entity) */}
      {allResolved && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-status-green/30 bg-status-green/[0.06] p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-status-green/15 text-status-green">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-status-green">
              All security items resolved
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              You can now clear the security gate for onboarding entities from
              the Onboarding Pipeline.
            </p>
          </div>
        </div>
      )}

      {/* Headline - prominent and red when items are open (CLAUDE.md §9.4) */}
      <section
        className={cn(
          "mt-7 grid grid-cols-1 gap-5 rounded-xl border p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-6",
          hasOpen
            ? "border-status-red/30 bg-status-red/[0.05]"
            : "border-status-green/30 bg-status-green/[0.05]"
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              hasOpen
                ? "bg-status-red/15 text-status-red"
                : "bg-status-green/15 text-status-green"
            )}
          >
            {hasOpen ? (
              <ShieldAlert className="size-6" />
            ) : (
              <ShieldCheck className="size-6" />
            )}
          </span>
          <div>
            <div
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                hasOpen ? "text-status-red" : "text-status-green"
              )}
            >
              {hasOpen ? "Security gate: not clear" : "Security gate: clear"}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-4xl font-semibold tracking-tight tabular-nums",
                  hasOpen ? "text-status-red" : "text-status-green"
                )}
              >
                {openCount}
              </span>
              <span className="text-base font-medium text-text-primary">
                open P0 / P1 item
                {openCount === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              {hasOpen
                ? "These are gating onboarding and platform go-live. Resolved items remain logged for audit."
                : "No open P0 or P1 items. Resolved items remain logged for audit."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:w-72">
          <HeadlineTile label="Open P0" count={openP0} tone="red" />
          <HeadlineTile label="Open P1" count={openP1} tone="amber" />
          <HeadlineTile label="Resolved" count={resolvedCount} tone="green" />
        </div>
      </section>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-text-secondary hover:text-text-primary"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-fcmb-offwhite text-text-secondary"
                )}
              >
                {counts[f.key]}
              </span>
            </button>
          )
        })}
      </div>

      <section className="mt-4">
        <SecurityTable items={visible} onResolve={markResolved} />
      </section>
    </div>
  )
}
