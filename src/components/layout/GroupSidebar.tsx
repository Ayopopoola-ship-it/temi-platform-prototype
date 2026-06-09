import {
  Boxes,
  Building2,
  GitBranch,
  LayoutDashboard,
  Settings,
  ShieldAlert,
} from "lucide-react"
import { Layers } from "lucide-react"
import { SidebarNav, type SidebarNavItem } from "./SidebarNav"

/** Group Platform Console navigation (CLAUDE.md §6). */
const GROUP_NAV: SidebarNavItem[] = [
  { to: "/group/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/group/entities", label: "Entities", icon: Building2 },
  { to: "/group/pipeline", label: "Onboarding Pipeline", icon: GitBranch },
  { to: "/group/security", label: "Platform Security", icon: ShieldAlert },
  { to: "/group/capabilities", label: "Capabilities", icon: Boxes },
  { to: "/group/settings", label: "Settings", icon: Settings },
]

interface GroupSidebarProps {
  onNavigate?: () => void
}

export function GroupSidebar({ onNavigate }: GroupSidebarProps) {
  return (
    <SidebarNav
      consoleLabel="Group Console"
      scopeLabel="All entities"
      scopeIcon={Layers}
      items={GROUP_NAV}
      onNavigate={onNavigate}
    />
  )
}
