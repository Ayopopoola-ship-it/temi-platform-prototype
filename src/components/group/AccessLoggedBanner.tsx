import { Eye, Lock } from "lucide-react"
import { usePersona } from "@/context/PersonaContext"

/**
 * The visible tenant-isolation signal shown when a Group admin drills into a
 * single entity (CLAUDE.md §3, §9.2): the view is read-only and the cross-entity
 * access is logged with the acting persona. Mock timestamp — no live clock.
 */
export function AccessLoggedBanner({ entityName }: { entityName: string }) {
  const { persona } = usePersona()

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Eye className="size-4" />
        </span>
        <div className="text-sm">
          <span className="font-medium text-text-primary">
            Read-only cross-entity view
          </span>
          <span className="text-text-secondary">
            {" "}
            — you are viewing {entityName} from the Group Console.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1 text-xs font-medium text-text-secondary ring-1 ring-inset ring-primary/15 sm:self-auto">
        <Lock className="size-3 text-primary" />
        Access logged · {persona.name} · 9 Jun 2026, 09:42 WAT
      </div>
    </div>
  )
}
