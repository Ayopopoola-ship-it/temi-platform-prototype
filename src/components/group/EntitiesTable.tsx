import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  type ColumnDef,
  type FilterFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react"
import type { Entity } from "@/types"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatCompact, formatPercent, monogram } from "@/lib/format"
import { EntityStatusBadge } from "./StatusBadge"
import { EntitySecurityChip } from "./EntitySecurityChip"
import { ChannelBadges } from "./ChannelBadges"

/** Match on entity name, short name, or status (search box, not dropdown). */
const fuzzy: FilterFn<Entity> = (row, _columnId, value) => {
  const q = String(value).trim().toLowerCase()
  if (!q) return true
  const e = row.original
  return (
    e.name.toLowerCase().includes(q) ||
    e.shortName.toLowerCase().includes(q) ||
    e.status.toLowerCase().includes(q)
  )
}

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc") return <ChevronUp className="size-3.5" />
  if (dir === "desc") return <ChevronDown className="size-3.5" />
  return <ChevronsUpDown className="size-3.5 text-disabled" />
}

export function EntitiesTable({ entities }: { entities: Entity[] }) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<Entity>[]>(
    () => [
      {
        id: "entity",
        accessorFn: (e) => e.name,
        header: "Entity",
        cell: ({ row }) => {
          const e = row.original
          return (
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                {monogram(e.name)}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium text-text-primary">
                  {e.name}
                </div>
                <div className="truncate text-xs text-text-secondary">
                  {e.isReferenceTenant ? "Reference tenant" : e.shortName}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "status",
        accessorFn: (e) => e.status,
        header: "Status",
        cell: ({ row }) => <EntityStatusBadge status={row.original.status} />,
      },
      {
        id: "volume",
        accessorFn: (e) => e.metrics.conversationVolume,
        header: "Volume",
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return (
            <span className="tabular-nums text-text-primary">
              {v > 0 ? formatCompact(v) : <span className="text-disabled">–</span>}
            </span>
          )
        },
      },
      {
        id: "resolution",
        accessorFn: (e) => e.metrics.aiResolutionRate,
        header: "Resolution",
        cell: ({ row }) => {
          const e = row.original
          return e.metrics.conversationVolume > 0 ? (
            <span className="tabular-nums text-text-primary">
              {formatPercent(e.metrics.aiResolutionRate)}
            </span>
          ) : (
            <span className="text-disabled">–</span>
          )
        },
      },
      {
        id: "escalation",
        accessorFn: (e) => e.metrics.escalationRate,
        header: "Escalation",
        cell: ({ row }) => {
          const e = row.original
          return e.metrics.conversationVolume > 0 ? (
            <span className="tabular-nums text-text-primary">
              {formatPercent(e.metrics.escalationRate)}
            </span>
          ) : (
            <span className="text-disabled">–</span>
          )
        },
      },
      {
        id: "security",
        accessorFn: (e) => e.openP0Count * 10 + e.openP1Count,
        header: "Security",
        enableSorting: true,
        cell: ({ row }) => <EntitySecurityChip entityId={row.original.id} />,
      },
      {
        id: "channels",
        header: "Channels",
        enableSorting: false,
        cell: ({ row }) => (
          <ChannelBadges channels={row.original.channels} showInactive={false} />
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: entities,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzy,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows
  const numeric = new Set(["volume", "resolution", "escalation"])

  return (
    <div>
      {/* Search + count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-disabled" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entities by name or status…"
            className="pl-9"
            aria-label="Search entities"
          />
        </div>
        <span className="text-xs text-text-secondary">
          {rows.length} of {entities.length} entities
        </span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-fcmb-offwhite/60">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const isNum = numeric.has(header.column.id)
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary",
                          isNum ? "text-right" : "text-left"
                        )}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "inline-flex items-center gap-1 transition-colors hover:text-text-primary",
                              isNum && "flex-row-reverse"
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <SortIcon dir={header.column.getIsSorted()} />
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </th>
                    )
                  })}
                  <th className="w-10 px-4 py-3" aria-label="Drill in" />
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-sm text-text-secondary"
                  >
                    No entities match “{globalFilter}”.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() =>
                      navigate(`/group/entities/${row.original.id}`)
                    }
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate(`/group/entities/${row.original.id}`)
                    }}
                    className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 align-middle",
                          numeric.has(cell.column.id) && "text-right"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="ml-auto size-4 text-disabled transition-colors group-hover:text-primary" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
