import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { FlowStepType } from "@/types"
import { STEP_META, STEP_TYPE_ORDER, TONE_TILE } from "@/lib/flowModel"
import { cn } from "@/lib/utils"

interface AddStepMenuProps {
  onAdd: (type: FlowStepType) => void
  /** Step types to omit (e.g. "decision" inside a branch — no deep nesting). */
  exclude?: FlowStepType[]
  /** "rail" = subtle inline affordance on the sequence spine; "button" = solid. */
  variant?: "rail" | "button"
  label?: string
}

/**
 * Add-step affordance. Opens a typed picker showing each model-mode step type
 * with its icon and a one-line description (CLAUDE.md §8 step types).
 */
export function AddStepMenu({
  onAdd,
  exclude = [],
  variant = "rail",
  label = "Add step",
}: AddStepMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const types = STEP_TYPE_ORDER.filter((t) => !exclude.includes(t))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
          variant === "rail"
            ? "rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-text-secondary hover:border-primary/40 hover:text-primary"
            : "rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Plus className="size-4" />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border border-border bg-card p-1.5 shadow-lg"
          >
            <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Add a step
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {types.map((t) => {
                const meta = STEP_META[t]
                const Icon = meta.icon
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onAdd(t)
                      setOpen(false)
                    }}
                    className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-fcmb-offwhite"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                        TONE_TILE[meta.tone]
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text-primary">
                        {meta.label}
                      </span>
                      <span className="block text-xs text-text-secondary">
                        {meta.blurb}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
