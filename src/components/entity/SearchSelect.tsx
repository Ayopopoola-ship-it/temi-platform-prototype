import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  /** Allow committing a typed value that isn't in the option list. */
  allowCustom?: boolean
  ariaLabel?: string
  className?: string
}

/**
 * A search-with-autocomplete combobox (CLAUDE.md §9.7 - search boxes, not
 * dropdowns, where a list could be long). Type to filter, click or Enter to
 * select; with allowCustom, a typed value can be committed as a new option.
 */
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Search…",
  allowCustom = false,
  ariaLabel,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  const q = query.trim().toLowerCase()
  const filtered = options.filter((o) => o.toLowerCase().includes(q))
  const showCustom =
    allowCustom &&
    query.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === q)

  const commit = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery("")
  }

  const items = showCustom ? [...filtered, `__custom__:${query.trim()}`] : filtered

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-disabled" />
        <input
          aria-label={ariaLabel}
          value={open ? query : value}
          placeholder={value ? value : placeholder}
          onFocus={() => {
            setOpen(true)
            setQuery("")
            setHighlight(0)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setHighlight((h) => Math.min(h + 1, items.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setHighlight((h) => Math.max(h - 1, 0))
            } else if (e.key === "Enter") {
              e.preventDefault()
              const sel = items[highlight]
              if (sel?.startsWith("__custom__:")) commit(sel.slice(11))
              else if (sel) commit(sel)
              else if (allowCustom && query.trim()) commit(query.trim())
            } else if (e.key === "Escape") {
              setOpen(false)
              setQuery("")
            }
          }}
          className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-8 text-sm outline-none transition-[box-shadow] placeholder:text-text-secondary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-disabled transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {items.length === 0 ? (
            <div className="px-2.5 py-2 text-sm text-text-secondary">
              No matches.
            </div>
          ) : (
            items.map((item, i) => {
              const isCustom = item.startsWith("__custom__:")
              const label = isCustom ? item.slice(11) : item
              return (
                <button
                  key={item}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(label)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    highlight === i
                      ? "bg-accent text-accent-foreground"
                      : "text-text-primary"
                  )}
                >
                  {isCustom ? (
                    <>
                      <Plus className="size-3.5 text-primary" />
                      <span>
                        Add “<span className="font-medium">{label}</span>”
                      </span>
                    </>
                  ) : (
                    <>
                      <Check
                        className={cn(
                          "size-3.5",
                          value === label ? "text-primary" : "text-transparent"
                        )}
                      />
                      {label}
                    </>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
