import { FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The mandatory "MODEL MODE - does not execute" badge on every Action step
 * (CLAUDE.md §8, §9.1). This is compliance-critical and must be unmissable:
 * Action steps describe a transaction that WOULD occur but never do. Never
 * render an Action step without it.
 */
export function ModelModeBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-status-amber/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-status-amber ring-1 ring-inset ring-status-amber/30",
        className
      )}
    >
      <FlaskConical className="size-3.5" />
      Model mode: does not execute
    </span>
  )
}
