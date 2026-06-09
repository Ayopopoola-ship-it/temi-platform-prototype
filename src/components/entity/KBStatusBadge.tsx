import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KBDocumentStatus } from "@/types"

const META: Record<
  KBDocumentStatus,
  { icon: LucideIcon; classes: string; spin?: boolean }
> = {
  Uploaded: {
    icon: CircleDashed,
    classes: "bg-fcmb-offwhite text-text-secondary ring-border",
  },
  Indexed: {
    icon: Loader2,
    classes: "bg-primary/10 text-primary ring-primary/20",
  },
  Active: {
    icon: CheckCircle2,
    classes: "bg-status-green/10 text-status-green ring-status-green/20",
  },
  Error: {
    icon: TriangleAlert,
    classes: "bg-status-red/10 text-status-red ring-status-red/25",
  },
}

/** Ingestion-status badge for a KB document (CLAUDE.md §7.7). */
export function KBStatusBadge({ status }: { status: KBDocumentStatus }) {
  const meta = META[status]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.classes
      )}
    >
      <Icon className={cn("size-3", status === "Indexed" && "animate-spin")} />
      {status}
    </span>
  )
}
