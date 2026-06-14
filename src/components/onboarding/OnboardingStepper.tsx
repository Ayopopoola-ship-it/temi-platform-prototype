import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStepperProps {
  labels: string[]
  current: number
  completed: boolean[]
  onStepClick: (index: number) => void
}

/**
 * The six-step progress indicator at the top of the onboarding wizard. Shows
 * which steps are done (green check), which is active (purple), and which are
 * still ahead (muted). Steps are clickable so the admin can move freely.
 */
export function OnboardingStepper({
  labels,
  current,
  completed,
  onStepClick,
}: OnboardingStepperProps) {
  return (
    <ol className="flex items-start gap-1 overflow-x-auto pb-1">
      {labels.map((label, i) => {
        const isCurrent = i === current
        const isDone = completed[i]
        return (
          <li key={label} className="flex min-w-0 flex-1 items-start">
            <button
              type="button"
              onClick={() => onStepClick(i)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1.5 px-1"
            >
              <div className="flex w-full items-center">
                {/* left connector */}
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === 0
                      ? "bg-transparent"
                      : completed[i - 1] || isCurrent || isDone
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-status-green text-white"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                        : "bg-card text-text-secondary ring-1 ring-inset ring-border group-hover:ring-primary/40"
                  )}
                >
                  {isDone ? <Check className="size-4" /> : i + 1}
                </span>
                {/* right connector */}
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === labels.length - 1
                      ? "bg-transparent"
                      : completed[i]
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
              </div>
              <span
                className={cn(
                  "max-w-[7rem] truncate text-center text-[11px] font-medium",
                  isCurrent ? "text-primary" : "text-text-secondary"
                )}
              >
                {label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
