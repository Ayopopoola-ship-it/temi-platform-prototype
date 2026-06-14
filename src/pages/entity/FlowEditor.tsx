import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  History,
  Save,
  Send,
  ShieldAlert,
  Trash2,
  Undo2,
  Workflow,
} from "lucide-react"
import type { Flow, FlowStep, FlowStepType } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { useFlows } from "@/context/FlowsContext"
import { ESCALATION_RULES } from "@/data/escalation"
import { createStep, isFlowComplete } from "@/lib/flowModel"
import { makeAuditEntry } from "@/lib/audit"
import { Button } from "@/components/ui/button"
import { ActivityLog } from "@/components/entity/ActivityLog"
import {
  FlowSequence,
  type StepOps,
} from "@/components/flow-builder/FlowSequence"
import { ReviewStatusBadge } from "@/components/flow-builder/ReviewStatusBadge"

/* ---- recursive, pure tree mutations (handle decision-branch nesting) ---- */

function updateStepInTree(
  steps: FlowStep[],
  id: string,
  patch: Partial<FlowStep>
): FlowStep[] {
  return steps.map((s) => {
    if (s.id === id) return { ...s, ...patch } as FlowStep
    if (s.type === "decision") {
      return {
        ...s,
        branches: s.branches.map((b) => ({
          ...b,
          steps: updateStepInTree(b.steps, id, patch),
        })),
      }
    }
    return s
  })
}

function removeStepFromTree(steps: FlowStep[], id: string): FlowStep[] {
  return steps
    .filter((s) => s.id !== id)
    .map((s) =>
      s.type === "decision"
        ? {
            ...s,
            branches: s.branches.map((b) => ({
              ...b,
              steps: removeStepFromTree(b.steps, id),
            })),
          }
        : s
    )
}

function moveStepInTree(
  steps: FlowStep[],
  id: string,
  dir: -1 | 1
): FlowStep[] {
  const idx = steps.findIndex((s) => s.id === id)
  if (idx !== -1) {
    const j = idx + dir
    if (j < 0 || j >= steps.length) return steps
    const next = [...steps]
    const [moved] = next.splice(idx, 1)
    next.splice(j, 0, moved)
    return next
  }
  return steps.map((s) =>
    s.type === "decision"
      ? {
          ...s,
          branches: s.branches.map((b) => ({
            ...b,
            steps: moveStepInTree(b.steps, id, dir),
          })),
        }
      : s
  )
}

function addToBranchTree(
  steps: FlowStep[],
  decisionId: string,
  branchIndex: number,
  newStep: FlowStep
): FlowStep[] {
  return steps.map((s) => {
    if (s.type === "decision") {
      if (s.id === decisionId) {
        return {
          ...s,
          branches: s.branches.map((b, i) =>
            i === branchIndex ? { ...b, steps: [...b.steps, newStep] } : b
          ),
        }
      }
      return {
        ...s,
        branches: s.branches.map((b) => ({
          ...b,
          steps: addToBranchTree(b.steps, decisionId, branchIndex, newStep),
        })),
      }
    }
    return s
  })
}

/* --------------------------------- editor -------------------------------- */

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-fcmb-offwhite text-disabled">
        <Workflow className="size-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-text-primary">
        Flow not available
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        This flow doesn't exist, or it belongs to another entity. You can only
        view flows for your own entity.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link to="/entity/flows">
          <ArrowLeft /> Back to Flows
        </Link>
      </Button>
    </div>
  )
}

function FlowEditorInner({ flow, actor }: { flow: Flow; actor: string }) {
  const navigate = useNavigate()
  const { updateFlow, deleteFlow } = useFlows()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const teamOptions = Array.from(
    new Set(
      ESCALATION_RULES.filter((r) => r.entityId === flow.entityId).map(
        (r) => r.team
      )
    )
  )

  const now = () => new Date().toISOString()
  const openStep = (id: string) =>
    setOpenIds((prev) => new Set(prev).add(id))

  /* edits commit live so they persist across navigation */
  const patchFlow = (updater: (f: Flow) => Flow) => updateFlow(flow.id, updater)

  const ops: StepOps = {
    isOpen: (id) => openIds.has(id),
    toggle: (id) =>
      setOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      }),
    update: (id, patch) =>
      patchFlow((f) => ({
        ...f,
        steps: updateStepInTree(f.steps, id, patch),
        updatedAt: now(),
      })),
    remove: (id) =>
      patchFlow((f) => ({
        ...f,
        steps: removeStepFromTree(f.steps, id),
        updatedAt: now(),
      })),
    move: (id, dir) =>
      patchFlow((f) => ({
        ...f,
        steps: moveStepInTree(f.steps, id, dir),
        updatedAt: now(),
      })),
    addTopLevel: (type: FlowStepType) => {
      const s = createStep(type)
      patchFlow((f) => ({ ...f, steps: [...f.steps, s], updatedAt: now() }))
      openStep(s.id)
    },
    addToBranch: (decisionId, branchIndex, type) => {
      const s = createStep(type)
      patchFlow((f) => ({
        ...f,
        steps: addToBranchTree(f.steps, decisionId, branchIndex, s),
        updatedAt: now(),
      }))
      openStep(s.id)
    },
    teamOptions,
  }

  const complete = isFlowComplete(flow.steps)

  /* ---- deliberate actions: versioned + audit-logged ---- */

  const saveVersion = () =>
    patchFlow((f) => {
      const version = f.versions.length + 1
      const t = now()
      return {
        ...f,
        updatedAt: t,
        versions: [
          ...f.versions,
          {
            version,
            reviewStatus: f.reviewStatus,
            savedAt: t,
            savedBy: actor,
            note: "Saved a new version.",
          },
        ],
        auditLog: [
          makeAuditEntry(actor, `Saved version v${version}`),
          ...f.auditLog,
        ],
      }
    })

  const setStatus = (status: Flow["reviewStatus"], label: string) =>
    patchFlow((f) => {
      const version = f.versions.length + 1
      const t = now()
      return {
        ...f,
        reviewStatus: status,
        updatedAt: t,
        versions: [
          ...f.versions,
          { version, reviewStatus: status, savedAt: t, savedBy: actor },
        ],
        auditLog: [makeAuditEntry(actor, label), ...f.auditLog],
      }
    })

  const toggleExecutionCandidate = () =>
    patchFlow((f) => {
      const next = !f.executionCandidate
      return {
        ...f,
        executionCandidate: next,
        updatedAt: now(),
        auditLog: [
          makeAuditEntry(
            actor,
            next
              ? "Flagged flow as an execution candidate (requires compliance review)"
              : "Removed the execution-candidate flag"
          ),
          ...f.auditLog,
        ],
      }
    })

  const handleDelete = () => {
    deleteFlow(flow.id)
    navigate("/entity/flows")
  }

  const setName = (name: string) =>
    patchFlow((f) => ({ ...f, name, updatedAt: now() }))
  const setDescription = (description: string) =>
    patchFlow((f) => ({ ...f, description, updatedAt: now() }))

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      {/* Back + status */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/entity/flows"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Flows
        </Link>
        <ReviewStatusBadge status={flow.reviewStatus} />
      </div>

      {/* Title card */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Workflow className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <input
              value={flow.name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Flow name"
              placeholder="Flow name"
              className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-xl font-semibold tracking-tight text-text-primary outline-none transition-colors hover:border-border focus:border-ring focus:ring-[3px] focus:ring-ring/50"
            />
            <input
              value={flow.description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Flow description"
              placeholder="Describe what this flow does"
              className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm text-text-secondary outline-none transition-colors hover:border-border focus:border-ring focus:ring-[3px] focus:ring-ring/50"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sequence canvas */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Sequence
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <FlaskConical className="size-3.5 text-primary" />
                Model mode: does not execute
              </span>
            </div>
            <FlowSequence steps={flow.steps} ops={ops} />
          </div>
        </section>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Review panel */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-text-primary">Review</h3>
            <p className="mt-0.5 text-sm text-text-secondary">
              Move this flow through review. Status changes are versioned and
              logged.
            </p>

            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={saveVersion}
              >
                <Save /> Save version
              </Button>

              {flow.reviewStatus === "Draft" && (
                <Button
                  className="w-full justify-start"
                  onClick={() =>
                    setStatus("In Review", "Submitted flow for review")
                  }
                >
                  <Send /> Submit for review
                </Button>
              )}

              {flow.reviewStatus === "In Review" && (
                <>
                  <Button
                    className="w-full justify-start"
                    disabled={!complete}
                    title={
                      complete
                        ? undefined
                        : "All steps must be configured before this flow can be marked Reviewed"
                    }
                    onClick={() => setStatus("Reviewed", "Marked flow as Reviewed")}
                  >
                    <CheckCircle2 /> Mark as Reviewed
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setStatus("Draft", "Returned flow to Draft")}
                  >
                    <Undo2 /> Return to draft
                  </Button>
                </>
              )}

              {flow.reviewStatus === "Reviewed" && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setStatus("Draft", "Returned flow to Draft")}
                >
                  <Undo2 /> Return to draft
                </Button>
              )}
            </div>

            {!complete && (
              <p className="mt-3 inline-flex items-start gap-1.5 rounded-md bg-status-amber/10 px-2.5 py-1.5 text-xs text-status-amber">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                Some steps still need setup before this flow can be marked
                Reviewed.
              </p>
            )}

            {/* Execution candidate (v2.0 - shown, not actioned) */}
            <div className="mt-4 border-t border-border pt-4">
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={!!flow.executionCandidate}
                  onChange={toggleExecutionCandidate}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--fcmb-purple)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">
                    Flag as execution candidate
                  </span>
                  <span className="block text-xs text-text-secondary">
                    A v2.0 transition. Recorded here but not actioned; flows
                    never execute in this prototype.
                  </span>
                </span>
              </label>

              {flow.executionCandidate && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-status-amber/30 bg-status-amber/10 p-3">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-status-amber" />
                  <div>
                    <p className="text-xs font-semibold text-status-amber">
                      Requires compliance review
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Before any flow could execute for FCMB Asset Management it
                      must pass compliance review. This is a v2.0 capability;
                      the flag is shown but not actioned.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-status-red"
                onClick={handleDelete}
              >
                <Trash2 /> Delete flow
              </Button>
            </div>
          </div>

          {/* Version history */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="size-4" />
              </span>
              <h3 className="text-sm font-semibold text-text-primary">
                Version history
              </h3>
            </div>
            <ul className="mt-4 space-y-2">
              {[...flow.versions]
                .sort((a, b) => b.version - a.version)
                .map((v) => (
                  <li
                    key={v.version}
                    className="flex items-center gap-3 rounded-md bg-fcmb-offwhite/60 px-3 py-2 ring-1 ring-inset ring-border"
                  >
                    <span className="text-sm font-semibold tabular-nums text-text-primary">
                      v{v.version}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-text-secondary">
                        {v.savedBy}
                        {v.note ? ` · ${v.note}` : ""}
                      </div>
                    </div>
                    <ReviewStatusBadge status={v.reviewStatus} />
                  </li>
                ))}
            </ul>
          </div>

          <ActivityLog entries={flow.auditLog} title="Flow activity" />
        </aside>
      </div>
    </div>
  )
}

export default function FlowEditor() {
  const { flowId } = useParams<{ flowId: string }>()
  const { persona } = usePersona()
  const { flowById } = useFlows()
  const flow = flowId ? flowById(flowId) : undefined

  // Tenant isolation (§9.2): only the flow's own entity admin may open it.
  if (!flow || flow.entityId !== persona.entityId) return <NotFound />

  return <FlowEditorInner key={flow.id} flow={flow} actor={persona.name} />
}
