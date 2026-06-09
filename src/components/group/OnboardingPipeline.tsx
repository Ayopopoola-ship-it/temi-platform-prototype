import {
  Check,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import type { OnboardingStage, StageStatus } from "@/types"
import { cn } from "@/lib/utils"
import { StageStatusBadge } from "./StatusBadge"

/* ---------------------------------------------------------------- node ---- */

function gateIcon(stage: OnboardingStage): LucideIcon {
  if (stage.key === "compliance") return Scale
  if (stage.status === "blocked") return ShieldAlert
  if (stage.status === "complete") return ShieldCheck
  return Shield
}

const GATE_TONE: Record<StageStatus, string> = {
  complete: "bg-status-green text-white ring-status-green/30",
  blocked: "bg-status-red text-white ring-status-red/40",
  // Gates keep a red identity even when pending/in-progress (CLAUDE.md §7.4).
  "in-progress": "bg-status-red/10 text-status-red ring-status-red/40",
  pending: "bg-card text-status-red ring-status-red/40",
}

const STAGE_TONE: Record<StageStatus, string> = {
  complete: "bg-status-green text-white ring-status-green/30",
  "in-progress": "bg-primary text-white ring-primary/30",
  pending: "bg-card text-disabled ring-border",
  blocked: "bg-status-red text-white ring-status-red/30",
}

/** Circle (stage) or red-accented diamond (gate) status marker. */
function NodeMarker({
  stage,
  index,
  size = "md",
}: {
  stage: OnboardingStage
  index: number
  size?: "sm" | "md"
}) {
  const dim = size === "md" ? "size-9" : "size-8"
  const iconSize = size === "md" ? "size-4" : "size-3.5"

  if (stage.isGate) {
    const Icon = gateIcon(stage)
    return (
      <span
        className={cn(
          "relative grid shrink-0 rotate-45 place-items-center rounded-md ring-2",
          dim,
          GATE_TONE[stage.status]
        )}
      >
        <Icon className={cn("-rotate-45", iconSize)} />
        {stage.status === "blocked" && (
          <span className="absolute inset-0 -rotate-0 animate-ping rounded-md bg-status-red/30" />
        )}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full text-xs font-semibold ring-2",
        dim,
        STAGE_TONE[stage.status]
      )}
    >
      {stage.status === "complete" ? (
        <Check className={iconSize} />
      ) : stage.status === "in-progress" ? (
        <>
          <span className="size-2 rounded-full bg-white" />
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        </>
      ) : (
        index + 1
      )}
    </span>
  )
}

/* -------------------------------------------------------------- track ---- */

/** Horizontal progress track — the hero pipeline visual. Scrolls on mobile. */
export function OnboardingTrack({ stages }: { stages: OnboardingStage[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex min-w-[760px] items-start">
        {stages.map((stage, i) => {
          const prevComplete = i > 0 && stages[i - 1].status === "complete"
          return (
            <li
              key={stage.key}
              className="flex flex-1 flex-col items-center"
            >
              {/* node + connectors */}
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === 0
                      ? "bg-transparent"
                      : prevComplete
                        ? "bg-status-green"
                        : "bg-border"
                  )}
                />
                <NodeMarker stage={stage} index={i} />
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === stages.length - 1
                      ? "bg-transparent"
                      : stage.status === "complete"
                        ? "bg-status-green"
                        : "bg-border"
                  )}
                />
              </div>
              {/* label */}
              <div className="mt-2 px-1 text-center">
                <div
                  className={cn(
                    "text-xs font-medium",
                    stage.isGate ? "text-status-red" : "text-text-primary"
                  )}
                >
                  {stage.label}
                </div>
                <div className="mt-0.5 text-[11px] capitalize text-text-secondary">
                  {stage.status.replace("-", " ")}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ----------------------------------------------------------- timeline ---- */

/** Vertical detail timeline — each stage with its status and what's outstanding. */
export function OnboardingTimeline({ stages }: { stages: OnboardingStage[] }) {
  return (
    <ol className="relative">
      {stages.map((stage, i) => {
        const isLast = i === stages.length - 1
        return (
          <li key={stage.key} className="relative flex gap-4 pb-4 last:pb-0">
            {/* rail */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[17px] top-9 -bottom-0 w-0.5",
                  stage.status === "complete" ? "bg-status-green/40" : "bg-border"
                )}
              />
            )}
            <NodeMarker stage={stage} index={i} size="sm" />

            <div
              className={cn(
                "flex-1 rounded-lg border p-3.5 shadow-xs",
                stage.isGate
                  ? "border-status-red/30 bg-status-red/[0.035]"
                  : "border-border bg-card"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-text-primary">
                  {stage.label}
                </h4>
                {stage.isGate && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-status-red/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-status-red ring-1 ring-inset ring-status-red/25">
                    Gate
                  </span>
                )}
                <StageStatusBadge status={stage.status} />
              </div>
              {stage.outstanding && (
                <p className="mt-1.5 text-sm text-text-secondary">
                  {stage.outstanding}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
