import {
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Headset,
  LayoutDashboard,
  Radio,
  Settings,
  Workflow,
} from "lucide-react"
import { usePersona } from "@/context/PersonaContext"
import { SidebarNav, type SidebarNavItem } from "./SidebarNav"

/** Entity Admin Console navigation (CLAUDE.md §6). */
const ENTITY_NAV: SidebarNavItem[] = [
  { to: "/entity/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/entity/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/entity/flows", label: "Flows", icon: Workflow },
  { to: "/entity/channels", label: "Channels", icon: Radio },
  { to: "/entity/escalation", label: "Escalation", icon: Headset },
  { to: "/entity/capabilities", label: "Capabilities", icon: Boxes },
  { to: "/entity/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/entity/settings", label: "Settings", icon: Settings },
]

interface EntitySidebarProps {
  onNavigate?: () => void
}

export function EntitySidebar({ onNavigate }: EntitySidebarProps) {
  const { persona } = usePersona()
  return (
    <SidebarNav
      consoleLabel="Entity Console"
      scopeLabel={persona.entityName}
      scopeIcon={Building2}
      items={ENTITY_NAV}
      onNavigate={onNavigate}
    />
  )
}
