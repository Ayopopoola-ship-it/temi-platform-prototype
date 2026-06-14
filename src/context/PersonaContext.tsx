import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { ExperienceKind, Persona } from "@/types"
import { DEFAULT_PERSONA_ID, getPersonaById, PERSONAS } from "@/data/personas"

/**
 * Where each experience lands when its persona becomes active, and the base
 * path that experience "owns". The app shell uses these to keep the route in
 * sync with the active persona (CLAUDE.md §3, §5 - three experiences, one
 * shell). Group and Entity consoles are namespaced so their shared screen
 * names (Capabilities, Settings) never collide.
 */
export const EXPERIENCE_LANDING: Record<ExperienceKind, string> = {
  group: "/group/overview",
  entity: "/entity/dashboard",
  customer: "/chat",
}

export const EXPERIENCE_BASE: Record<ExperienceKind, string> = {
  group: "/group",
  entity: "/entity",
  customer: "/chat",
}

interface PersonaContextValue {
  /** The currently active persona. */
  persona: Persona
  /** All available personas (for the switcher). */
  personas: Persona[]
  /** Switch the active persona by id. */
  setPersonaId: (id: string) => void
}

const PersonaContext = createContext<PersonaContextValue | null>(null)

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaId] = useState<string>(DEFAULT_PERSONA_ID)

  const handleSetPersonaId = useCallback((id: string) => {
    if (getPersonaById(id)) setPersonaId(id)
  }, [])

  const value = useMemo<PersonaContextValue>(() => {
    // Fall back to the default if an unknown id ever sneaks in.
    const persona = getPersonaById(personaId) ?? PERSONAS[0]
    return { persona, personas: PERSONAS, setPersonaId: handleSetPersonaId }
  }, [personaId, handleSetPersonaId])

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  )
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext)
  if (!ctx) {
    throw new Error("usePersona must be used within a PersonaProvider")
  }
  return ctx
}
