import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  MessagesSquare,
  Smile,
  Target,
  TrendingUp,
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePersona } from "@/context/PersonaContext"
import { useSecurity } from "@/context/SecurityContext"
import { getEntityById } from "@/data/entities"
import { getAnalyticsByEntity } from "@/data/analytics"
import { applySecurityClearance, getOnboardingForEntity } from "@/data/onboarding"
import { formatNumber, formatPercent } from "@/lib/format"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatCard } from "@/components/group/StatCard"
import { TrendChart } from "@/components/group/TrendChart"
import { Panel } from "@/components/entity/Panel"
import { OnboardingStatusCard } from "@/components/entity/OnboardingStatusCard"
import { IntentBarChart } from "@/components/entity/IntentBarChart"

export default function Dashboard() {
  const { persona } = usePersona()
  const { securityGateCleared } = useSecurity()
  // Strictly scoped to the active persona's entity - tenant isolation (§9.2).
  const entityId = persona.entityId
  const entity = getEntityById(entityId)
  const analytics = getAnalyticsByEntity(entityId)
  // The platform team's gate clearance flows straight through to this dashboard.
  const cleared = securityGateCleared && entityId === "asset-management"
  const baseStages = getOnboardingForEntity(entityId)
  const stages = baseStages
    ? applySecurityClearance(baseStages, cleared)
    : undefined

  if (!entity) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <PageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description="No data is available for this entity."
        />
      </div>
    )
  }

  const m = entity.metrics
  const hasTraffic = m.conversationVolume > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        eyebrow={entity.name}
        description={`How ${entity.name}'s Temi agent is performing: volume, resolution, escalation, CSAT and knowledge gaps.`}
      />

      {/* Onboarding status indicator */}
      <section className="mt-7">
        <OnboardingStatusCard entity={entity} stages={stages} />
      </section>

      {/* KPI row */}
      <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Conversations"
          icon={MessagesSquare}
          value={hasTraffic ? formatNumber(m.conversationVolume) : "–"}
          sub="Last 12 weeks"
        />
        <StatCard
          label="AI resolution"
          icon={Target}
          value={hasTraffic ? formatPercent(m.aiResolutionRate) : "–"}
          sub="Resolved without a human"
        />
        <StatCard
          label="Escalation rate"
          icon={TrendingUp}
          value={hasTraffic ? formatPercent(m.escalationRate) : "–"}
          sub="Handed to a human team"
        />
        <StatCard
          label="CSAT"
          icon={Smile}
          value={m.csat !== undefined ? formatPercent(m.csat) : "–"}
          sub="Customer satisfaction"
        />
        <StatCard
          label="Knowledge gaps"
          icon={BookOpen}
          value={m.knowledgeGapCount ?? "–"}
          sub="Unanswered questions"
          to="/entity/knowledge-base"
        />
      </section>

      {/* Trends */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Conversation volume">
          {analytics ? (
            <TrendChart data={analytics.conversationVolume} kind="area" />
          ) : (
            <EmptyState />
          )}
        </Panel>
        <Panel title="AI resolution rate">
          {analytics ? (
            <TrendChart
              data={analytics.resolutionRate}
              kind="line"
              valueKind="percent"
              color="var(--status-green)"
            />
          ) : (
            <EmptyState />
          )}
        </Panel>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Escalations by intent"
          description="Where the agent hands conversations to a human team."
        >
          {analytics ? (
            <IntentBarChart data={analytics.escalationByIntent} />
          ) : (
            <EmptyState />
          )}
        </Panel>
        <Panel
          title="CSAT trend"
          description="Customer satisfaction over the reporting window."
          action={
            <Link
              to="/entity/analytics"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Full analytics <ArrowRight className="size-3" />
            </Link>
          }
        >
          {analytics ? (
            <TrendChart
              data={analytics.csat}
              kind="line"
              valueKind="percent"
              color="var(--fcmb-yellow)"
            />
          ) : (
            <EmptyState />
          )}
        </Panel>
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg bg-fcmb-offwhite text-sm text-text-secondary">
      No conversation history yet.
    </div>
  )
}
