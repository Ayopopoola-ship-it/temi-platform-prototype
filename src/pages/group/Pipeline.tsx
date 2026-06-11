import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, GitBranch, ShieldAlert } from "lucide-react"
import { getEntityById } from "@/data/entities"
import {
  ONBOARDING_ENTITY_IDS,
  getOnboardingForEntity,
} from "@/data/onboarding"
import { formatPercent, monogram } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { EntityStatusBadge } from "@/components/group/StatusBadge"
import {
  OnboardingTimeline,
  OnboardingTrack,
} from "@/components/group/OnboardingPipeline"

export default function Pipeline() {
  const [activeId, setActiveId] = useState(ONBOARDING_ENTITY_IDS[0])
  const entity = getEntityById(activeId)
  const stages = getOnboardingForEntity(activeId) ?? []

  const completeCount = stages.filter((s) => s.status === "complete").length
  const progress = stages.length ? completeCount / stages.length : 0
  const blockedGate = stages.find((s) => s.isGate && s.status === "blocked")

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={GitBranch}
        title="Onboarding Pipeline"
        description="The repeatable playbook every entity follows — seven stages with two gates (Security and Compliance) between Configuration and Testing. Each entity onboards the same way."
      />

      {/* Entity selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {ONBOARDING_ENTITY_IDS.map((id) => {
          const e = getEntityById(id)
          if (!e) return null
          const active = id === activeId
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-text-secondary hover:border-primary/20 hover:text-text-primary"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md text-[11px] font-semibold",
                  active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                )}
              >
                {monogram(e.name)}
              </span>
              {e.name}
            </button>
          )
        })}
      </div>

      {/* Hero: track + progress */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
              {entity ? monogram(entity.name) : "?"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-text-primary">
                  {entity?.name ?? "Unknown entity"}
                </h2>
                {entity && <EntityStatusBadge status={entity.status} />}
              </div>
              <p className="text-sm text-text-secondary">
                {completeCount} of {stages.length} steps complete
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
              <span>Progress</span>
              <span className="tabular-nums text-text-primary">
                {formatPercent(progress)}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fcmb-offwhite">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(progress * 100, 3)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <OnboardingTrack stages={stages} />
        </div>
      </section>

      {/* Blocked-gate callout — makes the gate real (CLAUDE.md §7.4, §9.4) */}
      {blockedGate && (
        <Link
          to="/group/security"
          className="group mt-4 flex items-start gap-3 rounded-xl border border-status-red/30 bg-status-red/[0.05] p-4 transition-colors hover:bg-status-red/[0.08]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-status-red/15 text-status-red">
            <ShieldAlert className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-status-red">
              {blockedGate.label} blocked
              <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              {blockedGate.outstanding} This entity cannot advance to Testing
              until the gate passes.
            </p>
          </div>
        </Link>
      )}

      {/* Detailed timeline */}
      <section className="mt-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Stage detail
        </h3>
        <OnboardingTimeline stages={stages} />
      </section>
    </div>
  )
}
