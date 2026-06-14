import { useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  GitBranch,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { getEntityById } from "@/data/entities"
import {
  ONBOARDING_ENTITY_IDS,
  applySecurityClearance,
  getOnboardingForEntity,
} from "@/data/onboarding"
import { useSecurity } from "@/context/SecurityContext"
import { formatPercent, monogram } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { EntityStatusBadge } from "@/components/group/StatusBadge"
import {
  OnboardingTimeline,
  OnboardingTrack,
} from "@/components/group/OnboardingPipeline"

export default function Pipeline() {
  const [activeId, setActiveId] = useState(ONBOARDING_ENTITY_IDS[0])
  const { openCount, allResolved, securityGateCleared, clearSecurityGate } =
    useSecurity()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const entity = getEntityById(activeId)
  const baseStages = getOnboardingForEntity(activeId) ?? []
  // The clearance only applies to the entity currently held at the gate.
  const cleared = securityGateCleared && activeId === "asset-management"
  const stages = applySecurityClearance(baseStages, cleared)

  const completeCount = stages.filter((s) => s.status === "complete").length
  const progress = stages.length ? completeCount / stages.length : 0
  const securityGate = stages.find((s) => s.key === "security")
  const securityBlocked = securityGate?.status === "blocked"

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={GitBranch}
        title="Onboarding Pipeline"
        description="The repeatable playbook every entity follows: seven stages with two gates (Security and Compliance) between Configuration and Testing. Each entity onboards the same way."
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

      {/* Security gate: owner, what needs to happen, and the action (CLAUDE.md §9.4) */}
      {securityBlocked && (
        <div className="mt-4 rounded-xl border border-status-red/30 bg-status-red/[0.05] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-status-red/15 text-status-red">
              <ShieldAlert className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-status-red">
                Security Gate not cleared
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">
                {openCount} security item{openCount === 1 ? "" : "s"} require
                resolution before this gate can be cleared. The Temi platform
                team owns resolving these.{" "}
                <Link
                  to="/group/security"
                  className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                >
                  Open Platform Security
                  <ArrowRight className="size-3" />
                </Link>
              </p>
              <div className="mt-3">
                <Button
                  disabled={!allResolved}
                  onClick={() => setConfirmOpen(true)}
                  title={
                    allResolved
                      ? undefined
                      : "Resolve all P0 / P1 items on Platform Security to enable this"
                  }
                >
                  {allResolved ? (
                    <ShieldCheck />
                  ) : (
                    <Lock />
                  )}
                  Clear security gate
                </Button>
                {!allResolved && (
                  <p className="mt-1.5 text-xs text-text-secondary">
                    Available once every item on Platform Security is marked
                    resolved.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {cleared && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-status-green/30 bg-status-green/[0.06] p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-status-green/15 text-status-green">
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-status-green">
              Security gate cleared
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              {entity?.name} has advanced to the Compliance Gate, and FADE has
              been notified that testing can begin.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Clear security gate"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-text-primary">
                    Clear the security gate?
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Clearing this gate will notify FADE at FCMB Asset Management
                    that testing can begin. Confirm?
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    clearSecurityGate()
                    setConfirmOpen(false)
                  }}
                >
                  <ShieldCheck /> Clear security gate
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
