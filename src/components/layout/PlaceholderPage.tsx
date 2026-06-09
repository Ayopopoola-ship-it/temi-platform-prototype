import type { LucideIcon } from "lucide-react"

interface PlaceholderPageProps {
  icon: LucideIcon
  title: string
  description?: string
}

/**
 * Temporary page scaffold used while screens are stubbed. Shows a real page
 * header plus an intentional empty state, so the shell demo reads as designed
 * rather than unfinished. Replaced by each screen's real page in later phases.
 */
export function PlaceholderPage({
  icon: Icon,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
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

      <div className="mt-8 grid place-items-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-fcmb-offwhite text-disabled">
          <Icon className="size-6" />
        </span>
        <p className="mt-4 text-sm font-medium text-text-primary">
          This screen is coming in a later build phase
        </p>
        <p className="mt-1 max-w-md text-sm text-text-secondary">
          The persona switcher, adaptive shell and navigation are live. {title}{" "}
          will be built out next.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-fcmb-offwhite px-3 py-1 text-xs font-medium text-text-secondary">
          <span className="size-1.5 rounded-full bg-status-amber" />
          Placeholder
        </span>
      </div>
    </div>
  )
}
