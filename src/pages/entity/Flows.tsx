import { useNavigate } from "react-router-dom"
import {
  ChevronRight,
  FlaskConical,
  Layers,
  Plus,
  ShieldCheck,
  Workflow,
} from "lucide-react"
import type { Flow } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { useFlows } from "@/context/FlowsContext"
import { countSteps } from "@/lib/flowModel"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { ReviewStatusBadge } from "@/components/flow-builder/ReviewStatusBadge"

/** The model-mode notice shown on every Flow Builder surface (CLAUDE.md §8). */
function ModelModeBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FlaskConical className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">
          Model mode: flows are designed and reviewed, never executed
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">
          Flows are an explicit, versioned, reviewable specification of what the
          agent would do. Every Action step is a placeholder describing a
          transaction that would occur in production. Nothing here runs.
        </p>
      </div>
    </div>
  )
}

function FlowCard({ flow, onOpen }: { flow: Flow; onOpen: () => void }) {
  const steps = countSteps(flow.steps)
  const version = flow.versions.length
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Workflow className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {flow.name}
            </h3>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-text-secondary">
            {flow.description || "No description yet."}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ReviewStatusBadge status={flow.reviewStatus} />
        {flow.executionCandidate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-fcmb-offwhite px-2 py-0.5 text-xs font-medium text-text-secondary ring-1 ring-inset ring-border">
            <ShieldCheck className="size-3 text-primary" /> Execution candidate
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <Layers className="size-3.5" /> {steps} {steps === 1 ? "step" : "steps"}
        </span>
        <span>v{version}</span>
        <span className="ml-auto">Updated {formatDate(flow.updatedAt)}</span>
      </div>
    </button>
  )
}

function FlowsInner({
  entityId,
  entityName,
  actor,
}: {
  entityId: string
  entityName: string
  actor: string
}) {
  const navigate = useNavigate()
  const { flowsForEntity, createFlow } = useFlows()
  const flows = flowsForEntity(entityId)

  const handleNew = () => {
    const id = createFlow(entityId, actor)
    navigate(`/entity/flows/${id}`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={Workflow}
        title="Flows"
        eyebrow={entityName}
        description="Design the transactional flows the agent follows, as an explicit, ordered, reviewable sequence. Model mode only."
        actions={
          <Button onClick={handleNew}>
            <Plus /> New flow
          </Button>
        }
      />

      <div className="mt-6">
        <ModelModeBanner />
      </div>

      <section className="mt-4">
        {flows.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-fcmb-offwhite text-disabled">
              <Workflow className="size-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-text-primary">
              No flows yet
            </p>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Create your first flow to model how the agent should handle a
              transactional request.
            </p>
            <Button className="mt-4" onClick={handleNew}>
              <Plus /> New flow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {flows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onOpen={() => navigate(`/entity/flows/${flow.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function Flows() {
  const { persona } = usePersona()
  // key on entityId so switching persona fully remounts - one entity's flow
  // list state can never leak into another (tenant isolation, §9.2).
  return (
    <FlowsInner
      key={persona.entityId}
      entityId={persona.entityId}
      entityName={persona.entityName}
      actor={persona.name}
    />
  )
}
