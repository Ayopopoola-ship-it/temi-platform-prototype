import { useMemo, useState } from "react"
import { Boxes, Lock, Scale, ShieldCheck } from "lucide-react"
import type { AuditEntry, Capability } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { CAPABILITIES } from "@/data/capabilities"
import { makeAuditEntry } from "@/lib/audit"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/layout/PageHeader"
import { Panel } from "@/components/entity/Panel"
import { ActivityLog } from "@/components/entity/ActivityLog"

const RESTRICTED_CATEGORY = "Advisory (restricted)"

/** Stable category order from first appearance in the catalogue. */
function orderedCategories(caps: Capability[]): string[] {
  const seen: string[] = []
  for (const c of caps) if (!seen.includes(c.category)) seen.push(c.category)
  return seen
}

function CapabilityRow({
  cap,
  onToggle,
}: {
  cap: Capability
  onToggle: (next: boolean) => void
}) {
  const isV2 = cap.availability === "v2.0"
  const isLocked = cap.locked === true || cap.adviceType
  const toggleable = !isV2 && !isLocked

  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary">{cap.name}</h4>
          {isV2 && (
            <span className="inline-flex items-center rounded-md bg-fcmb-offwhite px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary ring-1 ring-inset ring-border">
              v2.0
            </span>
          )}
          {isLocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-status-amber/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#B45309] ring-1 ring-inset ring-status-amber/25">
              <Lock className="size-2.5" /> Locked
            </span>
          )}
        </div>
        <p className="mt-0.5 max-w-xl text-sm text-text-secondary">
          {cap.description}
        </p>
        {cap.complianceNote && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              isLocked ? "text-[#B45309]" : "text-text-secondary"
            )}
          >
            {cap.complianceNote}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Switch
          checked={toggleable ? cap.enabled : false}
          disabled={!toggleable}
          onCheckedChange={toggleable ? onToggle : undefined}
          aria-label={`Toggle ${cap.name}`}
        />
        <span className="text-[11px] font-medium text-text-secondary">
          {isV2
            ? "Not in V1"
            : isLocked
              ? "Locked off"
              : cap.enabled
                ? "Enabled"
                : "Disabled"}
        </span>
      </div>
    </div>
  )
}

function CapabilitiesInner({
  entityName,
  actor,
}: {
  entityName: string
  actor: string
}) {
  const [caps, setCaps] = useState<Capability[]>(() =>
    CAPABILITIES.map((c) => ({ ...c }))
  )
  const [log, setLog] = useState<AuditEntry[]>([])

  const toggle = (cap: Capability, next: boolean) => {
    setCaps((prev) =>
      prev.map((c) => (c.id === cap.id ? { ...c, enabled: next } : c))
    )
    setLog((prev) => [
      makeAuditEntry(actor, `${next ? "Enabled" : "Disabled"} capability: ${cap.name}`),
      ...prev,
    ])
  }

  const categories = useMemo(() => orderedCategories(caps), [caps])
  const counts = {
    enabled: caps.filter((c) => c.enabled).length,
    available: caps.filter(
      (c) => c.availability === "available" && !c.locked && !c.adviceType
    ).length,
    restricted: caps.filter((c) => c.locked || c.adviceType).length,
    v2: caps.filter((c) => c.availability === "v2.0").length,
  }

  const hasRestricted = counts.restricted > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={Boxes}
        title="Capabilities"
        eyebrow={entityName}
        description="Enable or disable what this entity's Temi agent can do. Some capabilities arrive in a later version, and advice-type capabilities are restricted by compliance."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Changes are audit-logged
          </span>
        }
      />

      {/* No-advice compliance banner (CLAUDE.md §9.3) */}
      {hasRestricted && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-status-amber/30 bg-status-amber/[0.06] p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-status-amber/15 text-[#B45309]">
            <Scale className="size-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-[#B45309]">
              Advice is off for {entityName}
            </div>
            <p className="mt-0.5 max-w-3xl text-sm text-text-secondary">
              Under the no-advice rule, the agent explains and informs but never
              recommends a product, projects returns, or assesses suitability.
              Advice-type capabilities are shown for transparency but are locked
              off and can't be enabled.
            </p>
          </div>
        </div>
      )}

      {/* Summary chips */}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Chip label="Enabled" count={counts.enabled} tone="green" />
        <Chip label="Available to enable" count={counts.available} tone="purple" />
        <Chip label="Restricted" count={counts.restricted} tone="amber" />
        <Chip label="Coming in v2.0" count={counts.v2} tone="neutral" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {categories.map((category) => {
            const items = caps.filter((c) => c.category === category)
            const restricted = category === RESTRICTED_CATEGORY
            return (
              <Panel
                key={category}
                title={
                  <span className="flex items-center gap-2">
                    {category}
                    {restricted && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-status-amber/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#B45309] ring-1 ring-inset ring-status-amber/25">
                        <Lock className="size-2.5" /> No advice
                      </span>
                    )}
                  </span>
                }
                className={cn(
                  restricted && "border-status-amber/30 bg-status-amber/[0.03]"
                )}
                bodyClassName="divide-y divide-border"
              >
                {items.map((cap) => (
                  <CapabilityRow
                    key={cap.id}
                    cap={cap}
                    onToggle={(next) => toggle(cap, next)}
                  />
                ))}
              </Panel>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <ActivityLog
            entries={log}
            emptyHint="Toggle a capability and the change will be logged here with your name and a timestamp."
          />
        </div>
      </div>
    </div>
  )
}

function Chip({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: "green" | "purple" | "amber" | "neutral"
}) {
  const dot = {
    green: "bg-status-green",
    purple: "bg-primary",
    amber: "bg-status-amber",
    neutral: "bg-disabled",
  }[tone]
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <span className={cn("size-2 rounded-full", dot)} />
      <span className="text-lg font-semibold tabular-nums text-text-primary">
        {count}
      </span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}

export default function Capabilities() {
  const { persona } = usePersona()
  return (
    <CapabilitiesInner
      key={persona.entityId}
      entityName={persona.entityName}
      actor={persona.name}
    />
  )
}
