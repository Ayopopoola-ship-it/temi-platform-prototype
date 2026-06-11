import {
  ArrowRight,
  Building2,
  ChevronLeft,
  GitBranch,
  MessagesSquare,
  ShieldAlert,
  Smile,
  Target,
  TrendingUp,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { getEntityById } from "@/data/entities"
import { getAnalyticsByEntity } from "@/data/analytics"
import { SECURITY_ITEMS } from "@/data/securityItems"
import { getOnboardingForEntity, stageLabel } from "@/data/onboarding"
import { formatNumber, formatPercent, monogram } from "@/lib/format"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatCard } from "@/components/group/StatCard"
import { TrendChart } from "@/components/group/TrendChart"
import { AccessLoggedBanner } from "@/components/group/AccessLoggedBanner"
import { ChannelBadges } from "@/components/group/ChannelBadges"
import { EntitySecurityChip } from "@/components/group/EntitySecurityChip"
import {
  EntityStatusBadge,
  SecuritySeverityBadge,
  SecurityStatusBadge,
} from "@/components/group/StatusBadge"

function SectionCard({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function EntityDetail() {
  const { entityId } = useParams<{ entityId: string }>()
  const entity = entityId ? getEntityById(entityId) : undefined

  if (!entity) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <PageHeader
          icon={Building2}
          title="Entity not found"
          description="No entity matches this URL. It may have been removed."
        />
        <Link
          to="/group/entities"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Back to all entities
        </Link>
      </div>
    )
  }

  const analytics = getAnalyticsByEntity(entity.id)
  const hasTraffic = entity.metrics.conversationVolume > 0
  const pipeline = getOnboardingForEntity(entity.id)
  const entitySecurity = SECURITY_ITEMS.filter((i) => i.scope === entity.id)
  const { csat, knowledgeGapCount } = entity.metrics

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <AccessLoggedBanner entityName={entity.name} />

      {/* Header */}
      <div className="mt-6">
        <Link
          to="/group/entities"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-4" /> Entities
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
              {monogram(entity.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                  {entity.name}
                </h1>
                <EntityStatusBadge status={entity.status} />
                {entity.isReferenceTenant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-fcmb-yellow/15 px-2 py-0.5 text-xs font-medium text-[#92700A] ring-1 ring-inset ring-fcmb-yellow/30">
                    Reference tenant
                  </span>
                )}
              </div>
              {entity.note && (
                <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">
                  {entity.note}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ChannelBadges channels={entity.channels} showInactive={false} />
            <EntitySecurityChip entity={entity} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Conversation volume"
          icon={MessagesSquare}
          value={
            hasTraffic ? (
              formatNumber(entity.metrics.conversationVolume)
            ) : (
              <span className="text-disabled">—</span>
            )
          }
          sub={hasTraffic ? "Last 12 weeks" : "No live traffic yet"}
        />
        <StatCard
          label="AI resolution"
          icon={Target}
          value={
            hasTraffic ? (
              formatPercent(entity.metrics.aiResolutionRate)
            ) : (
              <span className="text-disabled">—</span>
            )
          }
        />
        <StatCard
          label="Escalation rate"
          icon={TrendingUp}
          value={
            hasTraffic ? (
              formatPercent(entity.metrics.escalationRate)
            ) : (
              <span className="text-disabled">—</span>
            )
          }
        />
        <StatCard
          label={csat !== undefined ? "CSAT" : "Knowledge gaps"}
          icon={csat !== undefined ? Smile : ShieldAlert}
          value={
            csat !== undefined ? (
              formatPercent(csat)
            ) : knowledgeGapCount !== undefined ? (
              formatNumber(knowledgeGapCount)
            ) : (
              <span className="text-disabled">—</span>
            )
          }
          sub={
            csat !== undefined && knowledgeGapCount !== undefined
              ? `${knowledgeGapCount} knowledge gaps`
              : undefined
          }
        />
      </section>

      {/* Trends */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Conversation volume">
          {analytics ? (
            <TrendChart data={analytics.conversationVolume} kind="area" />
          ) : (
            <EmptyChart label={entity.name} />
          )}
        </SectionCard>
        <SectionCard title="AI resolution rate">
          {analytics ? (
            <TrendChart
              data={analytics.resolutionRate}
              kind="line"
              valueKind="percent"
              color="var(--status-green)"
            />
          ) : (
            <EmptyChart label={entity.name} />
          )}
        </SectionCard>
      </section>

      {/* Configuration (read-only) */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pipeline && (
          <SectionCard
            title="Onboarding"
            action={
              <Link
                to="/group/pipeline"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View pipeline <ArrowRight className="size-3" />
              </Link>
            }
          >
            <div className="flex items-center gap-3 rounded-lg bg-fcmb-offwhite px-3 py-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GitBranch className="size-4" />
              </span>
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  Currently at{" "}
                  {entity.onboardingStage
                    ? stageLabel(entity.onboardingStage)
                    : "Scoping"}
                </div>
                <div className="text-text-secondary">
                  {pipeline.filter((s) => s.status === "complete").length} of{" "}
                  {pipeline.length} steps complete · Security Gate{" "}
                  {pipeline.find((s) => s.key === "security")?.status ===
                  "blocked"
                    ? "blocked"
                    : "pending"}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Channels">
          <ChannelBadges channels={entity.channels} showInactive />
          <p className="mt-3 text-xs text-text-secondary">
            {entity.channels.length === 0
              ? "No delivery channels configured yet."
              : `${entity.channels.length} of 3 channels enabled. Dimmed channels are not configured.`}
          </p>
        </SectionCard>
      </section>

      {/* Entity-scoped security */}
      <section className="mt-4">
        <SectionCard
          title="Security items scoped to this entity"
          action={
            <Link
              to="/group/security"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Platform Security <ArrowRight className="size-3" />
            </Link>
          }
        >
          {entitySecurity.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No entity-scoped security items. Group-wide items are tracked on
              Platform Security.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {entitySecurity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <SecuritySeverityBadge severity={item.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-text-secondary">
                      {item.category} · {item.remediationState}
                    </div>
                  </div>
                  <SecurityStatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </section>
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-1 rounded-lg bg-fcmb-offwhite text-center">
      <TrendingUp className="size-5 text-disabled" />
      <p className="text-sm font-medium text-text-primary">No history yet</p>
      <p className="max-w-xs text-xs text-text-secondary">
        {label} has not started receiving live traffic.
      </p>
    </div>
  )
}
