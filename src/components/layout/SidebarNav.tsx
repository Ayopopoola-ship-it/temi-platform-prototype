import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarNavItem {
  to: string
  label: string
  icon: LucideIcon
}

interface SidebarNavProps {
  /** e.g. "Group Console" / "Entity Console". */
  consoleLabel: string
  /** The active scope, e.g. "All entities" or "FCMB Asset Management". */
  scopeLabel: string
  scopeIcon: LucideIcon
  items: SidebarNavItem[]
  /** Called after a nav item is clicked (used to close the mobile drawer). */
  onNavigate?: () => void
}

/**
 * Presentational sidebar shared by both consoles. The active item is backed by
 * a single Framer Motion pill (shared `layoutId`) so it glides between items -
 * the small moment of polish that lifts this above a stock admin nav.
 */
export function SidebarNav({
  consoleLabel,
  scopeLabel,
  scopeIcon: ScopeIcon,
  items,
  onNavigate,
}: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Active-context indicator - which experience + which entity (CLAUDE.md §3) */}
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-fcmb-offwhite/70 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ScopeIcon className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              {consoleLabel}
            </p>
            <p className="text-sm leading-tight font-semibold text-text-primary">
              {scopeLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} end className="block">
            {({ isActive }) => (
              <span
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                  isActive
                    ? "font-medium text-sidebar-accent-foreground"
                    : "text-text-secondary hover:bg-sidebar-accent/60 hover:text-text-primary"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-md bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 520, damping: 40 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 size-[18px] shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-disabled"
                  )}
                />
                <span className="relative z-10 truncate">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 py-4">
        <p className="flex items-center gap-1.5 text-[11px] text-disabled">
          <ShieldCheck className="size-3.5 shrink-0" />
          Activity is audit-logged
        </p>
      </div>
    </div>
  )
}
