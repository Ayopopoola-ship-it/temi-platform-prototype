import { CheckCircle2, GitBranch, Rocket, ShieldAlert } from "lucide-react"
import type { Entity, OnboardingStage } from "@/types"
import { stageLabel } from "@/data/onboarding"
import { formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Compact onboarding-status indicator for the entity Dashboard (CLAUDE.md §7.6):
 * where this entity sits in the playbook, its progress, and any blocking gate.
 * Entity-scoped — no link into the Group Console.
 */
export function OnboardingStatusCard({
  entity,
  stages,
}: {
  entity: Entity
  stages?: OnboardingStage[]
}) {
  // Live reference tenant — no active onboarding.
  if (entity.status === "Live") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-status-green/30 bg-status-green/[0.05] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-green/15 text-status-green">
          <Rocket className="size-5" />
        </span>
        <div>
          <div className="text-sm font-semibold text-status-green">
            Live in production
          </div>
          <p className="text-sm text-text-secondary">
            {entity.name} has completed onboarding and is serving customers across
            all enabled channels.
          </p>
        </div>
      </div>
    )
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fcmb-offwhite text-text-secondary">
          <GitBranch className="size-5" />
        </span>
        <div>
          <div className="text-sm font-semibold text-text-primary">
            Onboarding not yet started
          </div>
          <p className="text-sm text-text-secondary">
            {entity.name} is queued to enter the onboarding playbook.
          </p>
        </div>
      </div>
    )
  }

  const completeCount = stages.filter((s) => s.status === "complete").length
  const progress = completeCount / stages.length
  const current =
    stages.find((s) => s.status === "in-progress") ??
    stages.find((s) => s.status === "blocked")
  const blockedGate = stages.find((s) => s.isGate && s.status === "blocked")

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-amber/15 text-status-amber">
            <GitBranch className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                Onboarding in progress
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-status-amber/10 px-2 py-0.5 text-xs font-medium text-[#B45309] ring-1 ring-inset ring-status-amber/25">
                {current ? stageLabel(current.key) : "In progress"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              {completeCount} of {stages.length} playbook steps complete · managed
              with the Temi onboarding team.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-52">
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

      {blockedGate && (
        <div
          className={cn(
            "mt-4 flex items-start gap-2.5 rounded-lg border border-status-red/30 bg-status-red/[0.05] px-3 py-2.5"
          )}
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-status-red" />
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-status-red">
              {blockedGate.label} blocked.
            </span>{" "}
            {blockedGate.outstanding} Testing cannot begin until it passes.
          </p>
        </div>
      )}

      {!blockedGate && progress === 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-status-green">
          <CheckCircle2 className="size-4" /> All playbook steps complete.
        </div>
      )}
    </div>
  )
}
