import { Building2, ShieldCheck } from "lucide-react"
import { ENTITIES } from "@/data/entities"
import { PageHeader } from "@/components/layout/PageHeader"
import { EntitiesTable } from "@/components/group/EntitiesTable"

export default function Entities() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={Building2}
        title="Entities"
        description="Every FCMB Group entity tenant with status and key metrics. Select any entity to drill into its detail; that access is logged."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Drill-in access is audit-logged
          </span>
        }
      />

      <section className="mt-7">
        <EntitiesTable entities={ENTITIES} />
      </section>
    </div>
  )
}
