import type { FlowReviewStatus } from "@/types"
import { REVIEW_STATUS_META } from "@/lib/flowModel"
import { cn } from "@/lib/utils"

/** Draft / In Review / Reviewed pill for a flow (CLAUDE.md §8). */
export function ReviewStatusBadge({
  status,
  className,
}: {
  status: FlowReviewStatus
  className?: string
}) {
  const meta = REVIEW_STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}
