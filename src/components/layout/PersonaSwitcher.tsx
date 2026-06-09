import { Check, ChevronsUpDown } from "lucide-react"
import type { ExperienceKind } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const EXPERIENCE_LABEL: Record<ExperienceKind, string> = {
  group: "Group Console",
  entity: "Entity Console",
  customer: "Customer Chat",
}

function Initials({ value, active }: { value: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary"
      )}
    >
      {value}
    </span>
  )
}

/**
 * The persona switcher (CLAUDE.md §4). Deliberately marked "PROTOTYPE MODE" and
 * given an amber accent so it reads as a demo meta-control, not product chrome.
 * Selecting a persona updates context; the app shell re-syncs the route.
 */
export function PersonaSwitcher() {
  const { persona, personas, setPersonaId } = usePersona()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch persona (prototype mode)"
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-fcmb-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2.5"
        >
          <Initials value={persona.avatarInitial} active />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] text-status-amber">
              <span className="size-1.5 rounded-full bg-status-amber" />
              Prototype Mode
            </span>
            <span className="whitespace-nowrap text-[13px] font-medium text-text-primary">
              {persona.name}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-disabled" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-1.5">
        <DropdownMenuLabel className="px-2 pt-1.5 pb-1">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-status-amber">
            <span className="size-1.5 rounded-full bg-status-amber" />
            Prototype Mode
          </span>
          <p className="mt-1 text-xs font-normal text-text-secondary">
            Switch the experience you're viewing. The whole console adapts.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {personas.map((p) => {
          const active = p.id === persona.id
          return (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => setPersonaId(p.id)}
              className="items-start gap-3 rounded-md px-2 py-2.5"
            >
              <Initials value={p.avatarInitial} active={active} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {p.name}
                  </span>
                  {active && <Check className="size-4 shrink-0 text-primary" />}
                </div>
                <p className="truncate text-xs text-text-secondary">
                  {p.role}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {EXPERIENCE_LABEL[p.experience]}
                  </span>
                  <span className="truncate text-[10px] text-disabled">
                    {p.entityName}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
