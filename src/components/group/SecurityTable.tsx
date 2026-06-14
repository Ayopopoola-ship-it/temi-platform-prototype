import { format, parseISO } from "date-fns"
import { Check } from "lucide-react"
import type { SecurityItem } from "@/types"
import { getEntityById } from "@/data/entities"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  SecuritySeverityBadge,
  SecurityStatusBadge,
} from "./StatusBadge"

function scopeLabel(scope: string): string {
  if (scope === "group") return "Group-wide"
  return getEntityById(scope)?.name ?? scope
}

export function SecurityTable({
  items,
  onResolve,
}: {
  items: SecurityItem[]
  /** Marks an item resolved (platform team action). */
  onResolve: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-fcmb-offwhite/60 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3 whitespace-nowrap">Logged</th>
              <th className="px-4 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-text-secondary"
                >
                  No items match this filter.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const open = item.status !== "Resolved"
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border last:border-0 align-top",
                      // Subtle red wash on open P0 rows - never softened.
                      item.severity === "P0" && open && "bg-status-red/[0.03]"
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <SecuritySeverityBadge severity={item.severity} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-text-primary">
                        {item.title}
                      </div>
                      <div className="mt-0.5 max-w-xl text-xs text-text-secondary">
                        {item.description}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-fcmb-offwhite px-1.5 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-inset ring-border">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          {item.remediationState}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <SecurityStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                      {item.ownerRole}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
                          item.scope === "group"
                            ? "bg-primary/10 text-primary ring-primary/15"
                            : "bg-fcmb-offwhite text-text-secondary ring-border"
                        )}
                      >
                        {scopeLabel(item.scope)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap tabular-nums">
                      {format(parseISO(item.createdAt), "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {open ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResolve(item.id)}
                        >
                          Mark as resolved
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-fcmb-offwhite px-2.5 py-1.5 text-xs font-medium text-disabled ring-1 ring-inset ring-border">
                          <Check className="size-3.5" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
