/**
 * Foundation placeholder. Confirms the FCMB design system, Tailwind v4 tokens,
 * the "@/" alias, and the cn() utility are all wired correctly. This screen is
 * replaced by the app shell + persona switcher in the next phase.
 */
import { cn } from "@/lib/utils"

const STATUS_SWATCHES = [
  { label: "Live", className: "bg-status-green" },
  { label: "Onboarding", className: "bg-status-amber" },
  { label: "Security P0/P1", className: "bg-status-red" },
] as const

function App() {
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/fcmb-logo.svg" alt="FCMB Temi AI" className="h-8" />
        </div>

        <h1 className="mt-6 text-xl font-semibold text-text-primary">
          Temi AI — Group Platform
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Prototype foundation is ready. Design tokens, Tailwind v4, the{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">@/</code> alias,
          and shadcn utilities are wired.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Primary action
          </button>
          <span className="inline-flex items-center rounded-md bg-fcmb-yellow px-3 py-2 text-sm font-medium text-text-primary">
            Accent
          </span>
        </div>

        <div className="mt-6 space-y-2">
          {STATUS_SWATCHES.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className={cn("size-3 rounded-full", s.className)} />
              <span className="text-text-secondary">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
