import { useState } from "react"
import {
  BarChart3,
  Download,
  MessagesSquare,
  Radio,
  Smile,
  Target,
  TrendingUp,
} from "lucide-react"
import { usePersona } from "@/context/PersonaContext"
import { getEntityById } from "@/data/entities"
import { getAnalyticsByEntity } from "@/data/analytics"
import { formatNumber, formatPercent } from "@/lib/format"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/group/StatCard"
import { TrendChart } from "@/components/group/TrendChart"
import { Panel } from "@/components/entity/Panel"
import { IntentBarChart } from "@/components/entity/IntentBarChart"
import { BreakdownBars } from "@/components/entity/BreakdownBars"
import { CsatDistribution } from "@/components/entity/CsatDistribution"

function EmptyState() {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-lg bg-fcmb-offwhite text-sm text-text-secondary">
      No analytics for this entity yet.
    </div>
  )
}

export default function Analytics() {
  const { persona } = usePersona()
  const entityId = persona.entityId
  const entity = getEntityById(entityId)
  const analytics = getAnalyticsByEntity(entityId)
  const [exportedNote, setExportedNote] = useState(false)

  const handleExport = () => {
    // Placeholder — export is not wired in V1 (CLAUDE.md §14).
    console.log("[prototype] export analytics for", entityId)
    setExportedNote(true)
    window.setTimeout(() => setExportedNote(false), 2600)
  }

  if (!entity) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <PageHeader icon={BarChart3} title="Analytics" />
      </div>
    )
  }

  const m = entity.metrics
  const hasTraffic = m.conversationVolume > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        eyebrow={entity.name}
        description="Trends over time, breakdowns by channel and intent, and CSAT distribution for this entity."
        actions={
          <div className="flex flex-col items-end gap-1">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download /> Export
            </Button>
            {exportedNote && (
              <span className="text-[11px] text-text-secondary">
                Export is a prototype placeholder
              </span>
            )}
          </div>
        }
      />

      {/* KPI summary */}
      <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Conversations"
          icon={MessagesSquare}
          value={hasTraffic ? formatNumber(m.conversationVolume) : "—"}
          sub="Last 12 weeks"
        />
        <StatCard
          label="AI resolution"
          icon={Target}
          value={hasTraffic ? formatPercent(m.aiResolutionRate) : "—"}
        />
        <StatCard
          label="Escalation rate"
          icon={TrendingUp}
          value={hasTraffic ? formatPercent(m.escalationRate) : "—"}
        />
        <StatCard
          label="CSAT"
          icon={Smile}
          value={m.csat !== undefined ? formatPercent(m.csat) : "—"}
        />
      </section>

      {/* Volume trend (full width) */}
      <section className="mt-4">
        <Panel
          title="Conversation volume"
          description="Weekly conversations over the reporting window."
        >
          {analytics ? (
            <TrendChart data={analytics.conversationVolume} kind="area" height={240} />
          ) : (
            <EmptyState />
          )}
        </Panel>
      </section>

      {/* Resolution + CSAT trends */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
        <Panel title="CSAT over time">
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

      {/* Breakdowns */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Conversations by channel"
          description="Where customers reach the agent."
          action={<Radio className="size-4 text-disabled" />}
        >
          {analytics ? (
            <BreakdownBars data={analytics.byChannel} />
          ) : (
            <EmptyState />
          )}
        </Panel>
        <Panel
          title="Escalations by intent"
          description="Which intents most often need a human."
        >
          {analytics ? (
            <IntentBarChart data={analytics.escalationByIntent} />
          ) : (
            <EmptyState />
          )}
        </Panel>
      </section>

      {/* CSAT distribution (full width) */}
      <section className="mt-4">
        <Panel
          title="CSAT distribution"
          description="How customers rated their conversations."
        >
          {analytics ? (
            <CsatDistribution data={analytics.csatDistribution} />
          ) : (
            <EmptyState />
          )}
        </Panel>
      </section>
    </div>
  )
}
