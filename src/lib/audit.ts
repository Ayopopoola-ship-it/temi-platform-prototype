import type { AuditEntry } from "@/types"

/**
 * Build an audit-log entry for an action the admin just took. Edits and config
 * changes are "shown as logged" throughout the consoles (CLAUDE.md §7.7, §9.2),
 * stamped with the acting persona and the time of the action.
 */
let seq = 0
export function makeAuditEntry(actor: string, action: string): AuditEntry {
  seq += 1
  return {
    id: `audit-${Date.now()}-${seq}`,
    actor,
    action,
    timestamp: new Date().toISOString(),
  }
}
