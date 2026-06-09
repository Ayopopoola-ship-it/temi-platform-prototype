import { format, isToday, parseISO } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { History, ShieldCheck } from "lucide-react"
import type { AuditEntry } from "@/types"

function stamp(iso: string): string {
  const d = parseISO(iso)
  return isToday(d)
    ? `Today, ${format(d, "HH:mm")}`
    : format(d, "d MMM yyyy, HH:mm")
}

/**
 * Audit trail panel — every change shown as logged with actor and timestamp
 * (CLAUDE.md §7.7, §9.2). Newest first; freshly logged actions animate in.
 */
export function ActivityLog({
  entries,
  title = "Activity log",
  emptyHint = "Changes you make here will be logged with your name and a timestamp.",
}: {
  entries: AuditEntry[]
  title?: string
  emptyHint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <History className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
          <ShieldCheck className="size-3.5 text-primary" />
          Audit-logged
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">{emptyHint}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="flex gap-3"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary">{e.action}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {e.actor} · {stamp(e.timestamp)}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}
