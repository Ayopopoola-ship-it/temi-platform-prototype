import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Trash2,
} from "lucide-react"
import type { FlowStep, FlowStepType } from "@/types"
import {
  STEP_META,
  TONE_TILE,
  isStepConfigured,
  stepSummary,
} from "@/lib/flowModel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModelModeBadge } from "./ModelModeBadge"
import { StepConfig } from "./StepConfig"
import { AddStepMenu } from "./AddStepMenu"

/**
 * Operations the editor exposes to the sequence. update/remove/move are
 * recursive by step id (they find the step wherever it lives, including inside
 * a decision branch); add targets either the top level or a specific branch.
 */
export interface StepOps {
  isOpen: (id: string) => boolean
  toggle: (id: string) => void
  update: (id: string, patch: Partial<FlowStep>) => void
  remove: (id: string) => void
  move: (id: string, dir: -1 | 1) => void
  addTopLevel: (type: FlowStepType) => void
  addToBranch: (
    decisionId: string,
    branchIndex: number,
    type: FlowStepType
  ) => void
  teamOptions: string[]
  /** Read-only flows (e.g. a Reviewed reference tenant flow) hide all editing. */
  readOnly?: boolean
}

/** A short vertical rail segment joining one step node to the next. */
function Connector({ nodeWidth }: { nodeWidth: string }) {
  return (
    <div className="flex" aria-hidden>
      <div className={cn("flex justify-center", nodeWidth)}>
        <span className="h-5 w-px bg-border" />
      </div>
    </div>
  )
}

function StepCard({
  step,
  position,
  isFirst,
  isLast,
  depth,
  ops,
}: {
  step: FlowStep
  position: number
  isFirst: boolean
  isLast: boolean
  depth: number
  ops: StepOps
}) {
  const meta = STEP_META[step.type]
  const Icon = meta.icon
  const open = ops.isOpen(step.id)
  const configured = isStepConfigured(step)
  const isAction = step.type === "action"
  const nodeWidth = depth === 0 ? "w-9" : "w-7"
  const readOnly = ops.readOnly

  return (
    <div className="flex gap-3">
      {/* Sequence node */}
      <div className={cn("shrink-0", nodeWidth)}>
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-card text-xs font-semibold tabular-nums ring-1 ring-inset ring-border",
            depth === 0 ? "size-9 text-text-secondary" : "size-7 text-text-secondary"
          )}
        >
          {position}
        </span>
      </div>

      {/* Step card */}
      <div
        className={cn(
          "min-w-0 flex-1 rounded-xl border bg-card shadow-xs transition-colors",
          isAction ? "border-primary/30" : "border-border"
        )}
      >
        <div className="flex items-start gap-3 p-3.5">
          <span
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
              TONE_TILE[meta.tone]
            )}
          >
            <Icon className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-text-primary">
                {meta.label}
              </span>
              {isAction && <ModelModeBadge />}
              {!configured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-status-amber/10 px-1.5 py-0.5 text-[11px] font-medium text-status-amber ring-1 ring-inset ring-status-amber/20">
                  <AlertCircle className="size-3" /> Needs setup
                </span>
              )}
            </div>
            <p
              className={cn(
                "mt-0.5 truncate text-sm",
                configured ? "text-text-secondary" : "text-disabled"
              )}
            >
              {stepSummary(step)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex shrink-0 items-center gap-0.5">
            {configured && (
              <span
                className="flex size-6 items-center justify-center rounded-md text-status-green"
                title="Configured"
              >
                <Check className="size-4" />
              </span>
            )}
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isFirst}
                  onClick={() => ops.move(step.id, -1)}
                  aria-label="Move step up"
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isLast}
                  onClick={() => ops.move(step.id, 1)}
                  aria-label="Move step down"
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => ops.remove(step.id)}
                  aria-label="Delete step"
                  className="text-text-secondary hover:text-status-red"
                >
                  <Trash2 />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => ops.toggle(step.id)}
              aria-label={open ? "Collapse step" : "Edit step"}
              aria-expanded={open}
            >
              <ChevronDown
                className={cn("transition-transform", open && "rotate-180")}
              />
            </Button>
          </div>
        </div>

        {/* Expanded config */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border p-3.5">
                {readOnly ? (
                  <p className="text-sm text-text-secondary">
                    This flow belongs to a live reference tenant and is shown
                    read-only.
                  </p>
                ) : (
                  <StepConfig
                    step={step}
                    onUpdate={(patch) => ops.update(step.id, patch)}
                    teamOptions={ops.teamOptions}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decision branches */}
        {step.type === "decision" && (
          <div className="border-t border-border bg-fcmb-offwhite/50 p-3.5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {step.branches.map((branch, bi) => (
                <div
                  key={bi}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {branch.label || `Branch ${bi + 1}`}
                  </div>
                  <StepList
                    steps={branch.steps}
                    depth={depth + 1}
                    ops={ops}
                    onAdd={(t) => ops.addToBranch(step.id, bi, t)}
                    excludeAdd={["decision"]}
                    addLabel="Add to branch"
                    emptyHint="No steps in this branch yet."
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** An ordered list of steps with connectors and a trailing add-step menu. */
function StepList({
  steps,
  depth,
  ops,
  onAdd,
  excludeAdd,
  addLabel,
  emptyHint,
}: {
  steps: FlowStep[]
  depth: number
  ops: StepOps
  onAdd: (type: FlowStepType) => void
  excludeAdd?: FlowStepType[]
  addLabel?: string
  emptyHint?: string
}) {
  const nodeWidth = depth === 0 ? "w-9" : "w-7"
  return (
    <div>
      {steps.length === 0 && emptyHint && (
        <p className="mb-2 text-xs text-text-secondary">{emptyHint}</p>
      )}
      {steps.map((step, i) => (
        <div key={step.id}>
          {i > 0 && <Connector nodeWidth={nodeWidth} />}
          <StepCard
            step={step}
            position={i + 1}
            isFirst={i === 0}
            isLast={i === steps.length - 1}
            depth={depth}
            ops={ops}
          />
        </div>
      ))}
      {!ops.readOnly && (
        <>
          {steps.length > 0 && <Connector nodeWidth={nodeWidth} />}
          <div className="flex gap-3">
            <div className={cn("shrink-0", nodeWidth)} />
            <AddStepMenu
              onAdd={onAdd}
              exclude={excludeAdd}
              label={addLabel ?? "Add step"}
            />
          </div>
        </>
      )}
    </div>
  )
}

/** The full vertical flow sequence - the signature Flow Builder surface. */
export function FlowSequence({
  steps,
  ops,
}: {
  steps: FlowStep[]
  ops: StepOps
}) {
  return (
    <StepList
      steps={steps}
      depth={0}
      ops={ops}
      onAdd={ops.addTopLevel}
      addLabel="Add step"
      emptyHint="This flow has no steps yet. Add the first step to begin."
    />
  )
}
