import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A titled white content card used across the entity console screens. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn((title || action) && "mt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
