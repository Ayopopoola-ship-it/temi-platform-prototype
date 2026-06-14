import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Flow } from "@/types"
import { FLOWS } from "@/data/flows"
import { makeAuditEntry } from "@/lib/audit"

/**
 * Mutable prototype state for the Flow Builder, shared between the flow list
 * and the full-page editor so edits persist across navigation within a session
 * (CLAUDE.md §10 - React Context for prototype state). Tenant isolation is
 * enforced by callers, which only ever request flows for the active entity
 * (CLAUDE.md §9.2).
 */
interface FlowsContextValue {
  /** All flows for one entity tenant. */
  flowsForEntity: (entityId: string) => Flow[]
  /** A single flow by id (caller checks it belongs to the active entity). */
  flowById: (flowId: string) => Flow | undefined
  /** Create a new draft flow for an entity; returns its id. */
  createFlow: (entityId: string, actor: string) => string
  /** Replace a flow via an updater function. */
  updateFlow: (flowId: string, updater: (flow: Flow) => Flow) => void
  /** Delete a flow. */
  deleteFlow: (flowId: string) => void
}

const FlowsContext = createContext<FlowsContextValue | null>(null)

/** Deep clone the seed so in-session edits never mutate the source data. */
function seedFlows(): Flow[] {
  return JSON.parse(JSON.stringify(FLOWS)) as Flow[]
}

export function FlowsProvider({ children }: { children: ReactNode }) {
  const [flows, setFlows] = useState<Flow[]>(seedFlows)

  const flowsForEntity = useCallback(
    (entityId: string) => flows.filter((f) => f.entityId === entityId),
    [flows]
  )

  const flowById = useCallback(
    (flowId: string) => flows.find((f) => f.id === flowId),
    [flows]
  )

  const createFlow = useCallback((entityId: string, actor: string) => {
    const id = `flow-new-${Date.now()}`
    const now = new Date().toISOString()
    const flow: Flow = {
      id,
      entityId,
      name: "Untitled flow",
      description: "",
      reviewStatus: "Draft",
      executionCandidate: false,
      steps: [],
      versions: [
        {
          version: 1,
          reviewStatus: "Draft",
          savedAt: now,
          savedBy: actor,
          note: "New flow created.",
        },
      ],
      auditLog: [makeAuditEntry(actor, "Created a new flow")],
      updatedAt: now,
    }
    setFlows((prev) => [flow, ...prev])
    return id
  }, [])

  const updateFlow = useCallback(
    (flowId: string, updater: (flow: Flow) => Flow) => {
      setFlows((prev) =>
        prev.map((f) => (f.id === flowId ? updater(f) : f))
      )
    },
    []
  )

  const deleteFlow = useCallback((flowId: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== flowId))
  }, [])

  const value = useMemo(
    () => ({ flowsForEntity, flowById, createFlow, updateFlow, deleteFlow }),
    [flowsForEntity, flowById, createFlow, updateFlow, deleteFlow]
  )

  return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>
}

export function useFlows(): FlowsContextValue {
  const ctx = useContext(FlowsContext)
  if (!ctx) throw new Error("useFlows must be used within a FlowsProvider")
  return ctx
}
