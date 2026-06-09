import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional small label above the title (e.g. a breadcrumb / context). */
  eyebrow?: ReactNode
  /** Right-aligned actions (buttons, search, etc.). */
  actions?: ReactNode
  className?: string
}

/**
 * Standard console page header — icon tile, title, supporting copy, and an
 * optional actions slot. Mirrors the PlaceholderPage header so real and stubbed
 * screens stay visually consistent (CLAUDE.md §5).
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-xs font-medium text-text-secondary">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
