import {
  Bell,
  Building2,
  Layers,
  LogOut,
  Menu,
  MessagesSquare,
  Rocket,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import type { ExperienceKind } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { useOnboarding } from "@/context/OnboardingContext"
import { cn } from "@/lib/utils"
import { PersonaSwitcher } from "./PersonaSwitcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CONTEXT: Record<
  ExperienceKind,
  { label: string; icon: LucideIcon }
> = {
  group: { label: "Group Console", icon: Layers },
  entity: { label: "Entity Console", icon: Building2 },
  customer: { label: "Customer Chat", icon: MessagesSquare },
}

interface TopHeaderProps {
  /** Whether a sidebar exists for the active experience (false for customer). */
  hasSidebar: boolean
  /** Opens the mobile sidebar drawer. */
  onMenuClick: () => void
}

export function TopHeader({ hasSidebar, onMenuClick }: TopHeaderProps) {
  const { persona } = usePersona()
  const context = CONTEXT[persona.experience]
  const scope =
    persona.experience === "group" ? "All entities" : persona.entityName

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="flex h-full items-center">
        {/* Brand block - aligns with the sidebar column on desktop */}
        <div
          className={cn(
            "flex h-full items-center gap-2 px-4",
            hasSidebar &&
              "lg:w-64 lg:border-r lg:border-border lg:px-5"
          )}
        >
          {hasSidebar && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation"
              className="-ml-1 flex size-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-fcmb-offwhite hover:text-text-primary lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          )}
          <img src="/fcmb-logo.svg" alt="FCMB Temi AI" className="h-7 w-auto" />
        </div>

        {/* Main header row */}
        <div className="flex h-full flex-1 items-center justify-between gap-3 px-4 sm:px-6">
          {/* Active-context indicator (CLAUDE.md §6) */}
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border bg-fcmb-offwhite/70 py-1 pr-3 pl-1.5 md:flex">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <context.icon className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-text-primary">
              {context.label}
            </span>
            <span className="size-1 rounded-full bg-disabled" />
            <span className="max-w-[14rem] truncate text-xs text-text-secondary">
              {scope}
            </span>
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            <HeaderSearch />

            <NotificationBell />

            <PersonaSwitcher />

            <div className="hidden h-8 w-px bg-border sm:block" />

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

function NotificationBell() {
  const { persona } = usePersona()
  const { notifications, markNotificationsRead } = useOnboarding()

  // Platform notifications are addressed to the Temi platform team and are
  // surfaced in the Group Console only (CLAUDE.md §3, tenant separation).
  const visible = persona.experience === "group" ? notifications : []
  const unread = visible.filter((n) => !n.read).length

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) markNotificationsRead()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className="relative flex size-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-fcmb-offwhite hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-status-red px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-card">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold text-text-primary">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-fcmb-offwhite text-disabled">
              <Bell className="size-4" />
            </span>
            <p className="mt-2 text-sm font-medium text-text-primary">
              You're all caught up
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              New platform activity will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-80 overflow-auto py-1">
            {visible.map((n) => (
              <li key={n.id} className="flex gap-2.5 px-4 py-2.5">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Rocket className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {n.title}
                  </p>
                  <p className="text-xs text-text-secondary">{n.body}</p>
                  <p className="mt-0.5 text-[11px] text-disabled">
                    {format(parseISO(n.timestamp), "d MMM yyyy, HH:mm")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function HeaderSearch() {
  return (
    <button
      type="button"
      aria-label="Search"
      className="hidden items-center gap-2 rounded-md border border-border bg-fcmb-offwhite/60 py-2 pr-2 pl-2.5 text-sm text-text-secondary transition-colors hover:bg-fcmb-offwhite lg:flex"
    >
      <Search className="size-4" />
      <span className="w-28 text-left lg:w-40">Search…</span>
      <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-disabled">
        ⌘K
      </kbd>
    </button>
  )
}

function UserMenu() {
  const { persona } = usePersona()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2.5 rounded-md py-1 pr-1 pl-1 transition-colors hover:bg-fcmb-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:pr-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {persona.avatarInitial}
          </span>
          <span className="hidden flex-col leading-tight lg:flex">
            <span className="text-[13px] font-medium text-text-primary">
              {persona.name}
            </span>
            <span className="max-w-[12rem] truncate text-[11px] text-text-secondary">
              {persona.role} · {persona.entityName}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-text-primary">
            {persona.name}
          </span>
          <span className="text-xs font-normal text-text-secondary">
            {persona.role}
          </span>
          <span className="text-xs font-normal text-disabled">
            {persona.entityName}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[11px] text-disabled">
          Prototype: no real account or authentication.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
