import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Headset,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"
import type { AuditEntry, EscalationRule } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { ESCALATION_RULES } from "@/data/escalation"
import { makeAuditEntry } from "@/lib/audit"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { ActivityLog } from "@/components/entity/ActivityLog"
import { SearchSelect } from "@/components/entity/SearchSelect"

/** Intent catalogue for the search-select (longer than the live rules). */
const INTENT_OPTIONS = [
  "Subscription (top-up)",
  "Redemption",
  "Account balance & holdings",
  "Statement request",
  "Fund information",
  "Complaints",
  "KYC & account opening",
  "Switching funds",
  "Fees & charges",
  "Tax & withholding",
  "Dividend & distributions",
  "Profile & contact update",
  "Transaction status",
  "Password & access",
]

const TEAM_OPTIONS = [
  "Investment Operations",
  "Client Services",
  "Complaints & Resolution",
  "Onboarding & KYC",
  "Asset Management Support Desk",
  "Compliance",
  "Finance & Settlements",
]

function EscalationInner({
  entityId,
  entityName,
  actor,
}: {
  entityId: string
  entityName: string
  actor: string
}) {
  const [rules, setRules] = useState<EscalationRule[]>(() =>
    ESCALATION_RULES.filter((r) => r.entityId === entityId).map((r) => ({ ...r }))
  )
  const [log, setLog] = useState<AuditEntry[]>([])
  const [adding, setAdding] = useState(false)
  const [newIntent, setNewIntent] = useState("")
  const [newTeam, setNewTeam] = useState("")

  const mappable = rules.filter((r) => !r.isDefault)
  const fallback = rules.find((r) => r.isDefault)

  const addLog = (action: string) =>
    setLog((prev) => [makeAuditEntry(actor, action), ...prev])

  const setTeam = (rule: EscalationRule, team: string) => {
    if (!team || team === rule.team) return
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, team } : r))
    )
    addLog(
      rule.isDefault
        ? `Changed default fallback → ${team}`
        : `Re-routed “${rule.intentCategory}” → ${team}`
    )
  }

  const removeRule = (rule: EscalationRule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id))
    addLog(`Removed route: “${rule.intentCategory}”`)
  }

  const addRule = () => {
    if (!newIntent.trim() || !newTeam.trim()) return
    const rule: EscalationRule = {
      id: `esc-${Date.now()}`,
      entityId,
      intentCategory: newIntent.trim(),
      team: newTeam.trim(),
      isDefault: false,
    }
    setRules((prev) => {
      // Insert before the default fallback so it stays last.
      const idx = prev.findIndex((r) => r.isDefault)
      if (idx === -1) return [...prev, rule]
      return [...prev.slice(0, idx), rule, ...prev.slice(idx)]
    })
    addLog(`Added route: “${rule.intentCategory}” → ${rule.team}`)
    setNewIntent("")
    setNewTeam("")
    setAdding(false)
  }

  // Intents already mapped are filtered out of the add picker.
  const availableIntents = INTENT_OPTIONS.filter(
    (i) => !mappable.some((r) => r.intentCategory === i)
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={Headset}
        title="Escalation Routing"
        eyebrow={entityName}
        description="Map each intent category to the human team that handles it. Anything that doesn't match a rule falls back to the default route."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Changes are audit-logged
          </span>
        }
      />

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-visible rounded-xl border border-border bg-card shadow-xs">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="text-sm font-semibold text-text-primary">
                Routing matrix
                <span className="ml-2 font-normal text-text-secondary">
                  {mappable.length} rule{mappable.length === 1 ? "" : "s"} +
                  default
                </span>
              </div>
              {!adding && (
                <Button size="sm" onClick={() => setAdding(true)}>
                  <Plus /> Add routing rule
                </Button>
              )}
            </div>

            {/* Add form */}
            <AnimatePresence initial={false}>
              {adding && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-visible border-b border-border bg-fcmb-offwhite/50"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-text-secondary">
                        Intent category
                      </label>
                      <SearchSelect
                        value={newIntent}
                        onChange={setNewIntent}
                        options={availableIntents}
                        allowCustom
                        placeholder="Search intents…"
                        ariaLabel="Intent category"
                      />
                    </div>
                    <ArrowRight className="hidden size-4 shrink-0 text-disabled sm:mb-2.5 sm:block" />
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-text-secondary">
                        Routes to
                      </label>
                      <SearchSelect
                        value={newTeam}
                        onChange={setNewTeam}
                        options={TEAM_OPTIONS}
                        allowCustom
                        placeholder="Search teams…"
                        ariaLabel="Team"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={addRule}
                        disabled={!newIntent.trim() || !newTeam.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAdding(false)
                          setNewIntent("")
                          setNewTeam("")
                        }}
                      >
                        <X /> Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Column header */}
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <span>Intent category</span>
              <span>Routes to</span>
              <span className="w-8" />
            </div>

            {/* Rows */}
            <ul>
              <AnimatePresence initial={false}>
                {mappable.map((rule) => (
                  <motion.li
                    key={rule.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-t border-border px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {rule.intentCategory}
                    </span>
                    <SearchSelect
                      value={rule.team}
                      onChange={(t) => setTeam(rule, t)}
                      options={TEAM_OPTIONS}
                      allowCustom
                      ariaLabel={`Team for ${rule.intentCategory}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${rule.intentCategory}`}
                      onClick={() => removeRule(rule)}
                      className="text-text-secondary hover:text-status-red"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>

              {mappable.length === 0 && (
                <li className="border-t border-border px-4 py-8 text-center text-sm text-text-secondary">
                  No routing rules. Add one above — until then everything uses the
                  default route.
                </li>
              )}
            </ul>

            {/* Default fallback (pinned, not removable) */}
            {fallback && (
              <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-t-2 border-border bg-fcmb-offwhite/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary ring-1 ring-inset ring-primary/20">
                    Default
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    Unmatched intents
                  </span>
                </div>
                <SearchSelect
                  value={fallback.team}
                  onChange={(t) => setTeam(fallback, t)}
                  options={TEAM_OPTIONS}
                  allowCustom
                  ariaLabel="Default fallback team"
                />
                <span className="w-8" />
              </div>
            )}
          </div>

          <p className="mt-2 px-1 text-xs text-text-secondary">
            The default fallback always exists and can't be removed — it catches any
            intent without a specific rule.
          </p>
        </div>

        <div className="lg:col-span-1">
          <ActivityLog
            entries={log}
            emptyHint="Add, re-route or remove a rule and the change will be logged here with your name and a timestamp."
          />
        </div>
      </div>
    </div>
  )
}

export default function Escalation() {
  const { persona } = usePersona()
  return (
    <EscalationInner
      key={persona.entityId}
      entityId={persona.entityId}
      entityName={persona.entityName}
      actor={persona.name}
    />
  )
}
