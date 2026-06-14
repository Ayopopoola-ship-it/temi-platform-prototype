import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type {
  EntityStatus,
  SecuritySeverity,
  SecurityStatus,
  StageStatus,
} from "@/types"

type Tone = "green" | "amber" | "red" | "neutral" | "purple"

const TONE_CLASSES: Record<Tone, { wrap: string; dot: string }> = {
  green: {
    wrap: "bg-status-green/10 text-status-green ring-status-green/20",
    dot: "bg-status-green",
  },
  amber: {
    wrap: "bg-status-amber/10 text-[#B45309] ring-status-amber/25",
    dot: "bg-status-amber",
  },
  red: {
    wrap: "bg-status-red/10 text-status-red ring-status-red/20",
    dot: "bg-status-red",
  },
  purple: {
    wrap: "bg-primary/10 text-primary ring-primary/20",
    dot: "bg-primary",
  },
  neutral: {
    wrap: "bg-fcmb-offwhite text-text-secondary ring-border",
    dot: "bg-disabled",
  },
}

interface StatusPillProps {
  tone: Tone
  children: ReactNode
  /** Show the leading status dot (default true). */
  dot?: boolean
  /** Subtly pulse the dot - used for live/critical signals. */
  pulse?: boolean
  className?: string
}

/** Base pill: soft tinted background, ring, and a status dot. */
export function StatusPill({
  tone,
  children,
  dot = true,
  pulse = false,
  className,
}: StatusPillProps) {
  const t = TONE_CLASSES[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        t.wrap,
        className
      )}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                t.dot
              )}
            />
          )}
          <span className={cn("relative inline-flex size-1.5 rounded-full", t.dot)} />
        </span>
      )}
      {children}
    </span>
  )
}

const ENTITY_TONE: Record<EntityStatus, Tone> = {
  Live: "green",
  Onboarding: "amber",
  Pending: "neutral",
}

export function EntityStatusBadge({
  status,
  className,
}: {
  status: EntityStatus
  className?: string
}) {
  return (
    <StatusPill
      tone={ENTITY_TONE[status]}
      pulse={status === "Live"}
      className={className}
    >
      {status}
    </StatusPill>
  )
}

export function SecuritySeverityBadge({
  severity,
}: {
  severity: SecuritySeverity
}) {
  // P0 is the hard red; P1 is amber. Both read as urgent against neutral rows.
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset",
        severity === "P0"
          ? "bg-status-red/10 text-status-red ring-status-red/30"
          : "bg-status-amber/10 text-[#B45309] ring-status-amber/30"
      )}
    >
      {severity}
    </span>
  )
}

const SEC_STATUS_TONE: Record<SecurityStatus, Tone> = {
  Open: "red",
  "In Progress": "amber",
  Resolved: "green",
}

export function SecurityStatusBadge({ status }: { status: SecurityStatus }) {
  return <StatusPill tone={SEC_STATUS_TONE[status]}>{status}</StatusPill>
}

const STAGE_TONE: Record<StageStatus, Tone> = {
  complete: "green",
  "in-progress": "purple",
  pending: "neutral",
  blocked: "red",
}

const STAGE_LABEL: Record<StageStatus, string> = {
  complete: "Complete",
  "in-progress": "In progress",
  pending: "Pending",
  blocked: "Blocked",
}

export function StageStatusBadge({ status }: { status: StageStatus }) {
  return (
    <StatusPill tone={STAGE_TONE[status]} pulse={status === "in-progress"}>
      {STAGE_LABEL[status]}
    </StatusPill>
  )
}
