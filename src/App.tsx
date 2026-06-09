import { BrowserRouter, Route, Routes } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  GitBranch,
  Headset,
  LayoutDashboard,
  Radio,
  Settings,
  ShieldAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { PersonaProvider } from "@/context/PersonaContext"
import { AppShell } from "@/components/layout/AppShell"
import { PlaceholderPage } from "@/components/layout/PlaceholderPage"
import CustomerChatDemo from "@/pages/CustomerChatDemo"
import GroupOverview from "@/pages/group/Overview"
import GroupEntities from "@/pages/group/Entities"
import GroupEntityDetail from "@/pages/group/EntityDetail"

interface RouteDef {
  path: string
  title: string
  description: string
  icon: LucideIcon
}

/** Group Platform Console routes (CLAUDE.md §6). */
const GROUP_ROUTES: RouteDef[] = [
  {
    path: "overview",
    title: "Overview",
    description:
      "All entities at a glance — status, conversation volume, AI resolution and escalation per entity, plus group-level security.",
    icon: LayoutDashboard,
  },
  {
    path: "entities",
    title: "Entities",
    description:
      "Every FCMB Group entity tenant with status and key metrics. Drill into any entity — that access is logged.",
    icon: Building2,
  },
  {
    path: "pipeline",
    title: "Onboarding Pipeline",
    description:
      "The repeatable playbook — seven stages and two gates — tracking each onboarding entity. FCMB Asset Management is the active pilot.",
    icon: GitBranch,
  },
  {
    path: "security",
    title: "Platform Security",
    description:
      "Open P0 / P1 security items and their remediation state across the platform. The security gate, made real and visible.",
    icon: ShieldAlert,
  },
  {
    path: "capabilities",
    title: "Capabilities",
    description: "The shared capability catalogue that entities can enable.",
    icon: Boxes,
  },
  {
    path: "settings",
    title: "Settings",
    description: "Group platform settings.",
    icon: Settings,
  },
]

/** Entity Admin Console routes (CLAUDE.md §6). */
const ENTITY_ROUTES: RouteDef[] = [
  {
    path: "dashboard",
    title: "Dashboard",
    description:
      "This entity's performance at a glance — conversation volume, AI resolution, escalation by intent, CSAT and knowledge gaps.",
    icon: LayoutDashboard,
  },
  {
    path: "knowledge-base",
    title: "Knowledge Base",
    description:
      "Upload, version and activate documents, and review the knowledge-gap report. Every change is logged.",
    icon: BookOpen,
  },
  {
    path: "flows",
    title: "Flows",
    description:
      "Design transactional flows as explicit, reviewable sequences — the Flow Builder, in model mode only.",
    icon: Workflow,
  },
  {
    path: "channels",
    title: "Channels",
    description:
      "Configure WhatsApp, web widget and mobile per entity, and retrieve the embed code.",
    icon: Radio,
  },
  {
    path: "escalation",
    title: "Escalation",
    description:
      "Map intent categories to the human teams and queues that handle them, with a default fallback route.",
    icon: Headset,
  },
  {
    path: "capabilities",
    title: "Capabilities",
    description:
      "Enable or disable what the agent can do for this entity. Advice-type capabilities are locked off for Asset Management.",
    icon: Boxes,
  },
  {
    path: "analytics",
    title: "Analytics",
    description:
      "Trends and breakdowns by channel and intent, CSAT distribution, and knowledge gaps — the fuller analytics view.",
    icon: BarChart3,
  },
  {
    path: "settings",
    title: "Settings",
    description: "Bot identity and tone for this entity.",
    icon: Settings,
  },
]

/**
 * Real page components keyed by their group route path. Paths absent here fall
 * back to the PlaceholderPage scaffold until their screen is built.
 */
const GROUP_PAGES: Record<string, ReactNode> = {
  overview: <GroupOverview />,
  entities: <GroupEntities />,
}

function App() {
  return (
    <BrowserRouter>
      <PersonaProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
            {/* "/" and unknown paths are redirected to the active persona's
                landing page by the shell's route guard. */}
            <Route index element={null} />

            {GROUP_ROUTES.map((r) => (
              <Route
                key={`group-${r.path}`}
                path={`group/${r.path}`}
                element={
                  GROUP_PAGES[r.path] ?? (
                    <PlaceholderPage
                      icon={r.icon}
                      title={r.title}
                      description={r.description}
                    />
                  )
                }
              />
            ))}

            {/* Group → entity drill-in (access is logged) */}
            <Route
              path="group/entities/:entityId"
              element={<GroupEntityDetail />}
            />

            {ENTITY_ROUTES.map((r) => (
              <Route
                key={`entity-${r.path}`}
                path={`entity/${r.path}`}
                element={
                  <PlaceholderPage
                    icon={r.icon}
                    title={r.title}
                    description={r.description}
                  />
                }
              />
            ))}

            <Route path="chat" element={<CustomerChatDemo />} />
            <Route path="*" element={null} />
          </Route>
        </Routes>
      </PersonaProvider>
    </BrowserRouter>
  )
}

export default App
