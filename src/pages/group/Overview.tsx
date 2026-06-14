import { LayoutDashboard, ShieldCheck } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import type { Entity, EntityStatus } from "@/types"
import { ENTITIES } from "@/data/entities"
import { PageHeader } from "@/components/layout/PageHeader"
import { GroupSummaryBar } from "@/components/group/GroupSummaryBar"
import { EntityCard } from "@/components/group/EntityCard"

const STATUS_ORDER: Record<EntityStatus, number> = {
  Live: 0,
  Onboarding: 1,
  Pending: 2,
}

/** Live first, then onboarding, then pending; volume desc within a status. */
function orderEntities(entities: Entity[]): Entity[] {
  return [...entities].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (s !== 0) return s
    return b.metrics.conversationVolume - a.metrics.conversationVolume
  })
}

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
}

export default function Overview() {
  const entities = orderEntities(ENTITIES)

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Group Overview"
        description="Every FCMB Group entity at a glance: status, conversation volume, AI resolution and escalation, with group-level security front and centre."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Cross-entity access is audit-logged
          </span>
        }
      />

      <section className="mt-7">
        <GroupSummaryBar />
      </section>

      <section className="mt-9">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Entities
            <span className="ml-2 font-normal normal-case text-disabled">
              {entities.length} tenants · select any to drill in
            </span>
          </h2>
        </div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {entities.map((entity) => (
            <motion.div key={entity.id} variants={cardVariants}>
              <EntityCard entity={entity} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
