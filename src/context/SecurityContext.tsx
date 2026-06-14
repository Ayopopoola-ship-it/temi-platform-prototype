import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { SecurityItem } from "@/types"
import { SECURITY_ITEMS } from "@/data/securityItems"

/**
 * Shared, mutable security-gate state (CLAUDE.md §7.5, §9.4). The platform
 * team resolves P0/P1 items on the Platform Security screen; that resolution
 * flows through to the Group Overview headline, the entity security chips, the
 * onboarding pipeline gate, and FADE's entity dashboard. One source of truth so
 * "who owns what, who resolves what" stays consistent across every surface.
 */
interface SecurityContextValue {
  items: SecurityItem[]
  /** Mark a P0/P1 item resolved (platform team action). */
  markResolved: (id: string) => void
  /** P0/P1 items not yet resolved. */
  openItems: SecurityItem[]
  openCount: number
  openP0: number
  openP1: number
  /** True when no open P0/P1 items remain anywhere. */
  allResolved: boolean
  /** Open P0/P1 counts scoped to a single entity (for the entity chips). */
  openCountForEntity: (entityId: string) => { p0: number; p1: number }
  /**
   * Whether the platform admin has cleared the security gate for FCMB Asset
   * Management. Flows to the pipeline (advances the stage) and to FADE's
   * dashboard (status changes to "Security cleared").
   */
  securityGateCleared: boolean
  /** Clear the gate. Only takes effect once every item is resolved. */
  clearSecurityGate: () => void
}

const SecurityContext = createContext<SecurityContextValue | null>(null)

function seedItems(): SecurityItem[] {
  return JSON.parse(JSON.stringify(SECURITY_ITEMS)) as SecurityItem[]
}

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SecurityItem[]>(seedItems)
  const [securityGateCleared, setCleared] = useState(false)

  const markResolved = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "Resolved",
              remediationState: "Marked resolved by the platform security team",
            }
          : i
      )
    )
  }, [])

  const openItems = useMemo(
    () => items.filter((i) => i.status !== "Resolved"),
    [items]
  )
  const openP0 = openItems.filter((i) => i.severity === "P0").length
  const openP1 = openItems.filter((i) => i.severity === "P1").length
  const allResolved = openItems.length === 0

  const openCountForEntity = useCallback(
    (entityId: string) => {
      const scoped = items.filter(
        (i) => i.scope === entityId && i.status !== "Resolved"
      )
      return {
        p0: scoped.filter((i) => i.severity === "P0").length,
        p1: scoped.filter((i) => i.severity === "P1").length,
      }
    },
    [items]
  )

  const clearSecurityGate = useCallback(() => {
    setCleared((prev) => (allResolved ? true : prev))
  }, [allResolved])

  const value = useMemo<SecurityContextValue>(
    () => ({
      items,
      markResolved,
      openItems,
      openCount: openItems.length,
      openP0,
      openP1,
      allResolved,
      openCountForEntity,
      securityGateCleared,
      clearSecurityGate,
    }),
    [
      items,
      markResolved,
      openItems,
      openP0,
      openP1,
      allResolved,
      openCountForEntity,
      securityGateCleared,
      clearSecurityGate,
    ]
  )

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurity(): SecurityContextValue {
  const ctx = useContext(SecurityContext)
  if (!ctx)
    throw new Error("useSecurity must be used within a SecurityProvider")
  return ctx
}
