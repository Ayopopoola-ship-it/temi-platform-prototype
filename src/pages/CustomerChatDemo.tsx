import { MessagesSquare } from "lucide-react"

/**
 * Placeholder for the End Customer Conversation demonstration (CLAUDE.md §3,
 * §7.13). This is a demonstration only and intentionally not over-built; the
 * scripted investor conversation is added in a later phase. Rendered without a
 * sidebar, since the customer experience is not an admin console.
 */
export default function CustomerChatDemo() {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessagesSquare className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
          Investor Conversation
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          A scripted demonstration of the FCMB Asset Management investor support
          experience — an accurate knowledge-base answer, a walked-through
          modelled flow, and a clean human handover.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-fcmb-offwhite px-3 py-1 text-xs font-medium text-text-secondary">
          <span className="size-1.5 rounded-full bg-status-amber" />
          Demonstration — built in a later phase
        </span>
      </div>
    </div>
  )
}
