import type { Persona } from "@/types"

/**
 * The four prototype-mode personas (CLAUDE.md §4). The persona switcher cycles
 * between these so stakeholders can experience each of the three §3 views.
 * Order matters: the first entry is the default (Temi Platform Admin).
 */
export const PERSONAS: Persona[] = [
  {
    id: "temi-platform-admin",
    name: "Temi Platform Admin",
    role: "Group Platform Administrator",
    experience: "group",
    entityId: "group",
    entityName: "FCMB Group",
    avatarInitial: "TP",
    purpose:
      "The executive anchor: the whole-platform view across every entity.",
  },
  {
    id: "fade",
    name: "FADE",
    role: "Entity Admin · Product Manager",
    experience: "entity",
    entityId: "asset-management",
    entityName: "FCMB Asset Management",
    avatarInitial: "FA",
    purpose:
      "The pilot entity. Most of the prototype's value lives in her console and Flow Builder.",
  },
  {
    id: "bank-ops-admin",
    name: "Bank Ops Admin",
    role: "Entity Admin",
    experience: "entity",
    entityId: "fcmb-bank",
    entityName: "FCMB Bank",
    avatarInitial: "BO",
    purpose: "The reference tenant, already live, shown for contrast.",
  },
  {
    id: "customer-demo",
    name: "Customer (Demo)",
    role: "End Customer",
    experience: "customer",
    entityId: "asset-management",
    entityName: "FCMB Asset Management",
    avatarInitial: "CU",
    purpose: "Demonstrates the customer support conversation experience.",
  },
]

/** The default persona on first load (CLAUDE.md §4 - Temi Platform Admin). */
export const DEFAULT_PERSONA_ID = PERSONAS[0].id

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id)
}
