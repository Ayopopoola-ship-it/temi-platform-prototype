import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  FilePlus2,
  FileText,
  Power,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type { AuditEntry, KBDocument } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { KB_DOCUMENTS, KNOWLEDGE_GAPS } from "@/data/knowledgeBase"
import { makeAuditEntry } from "@/lib/audit"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { Panel } from "@/components/entity/Panel"
import { KBStatusBadge } from "@/components/entity/KBStatusBadge"
import { UploadZone, type UploadedFile } from "@/components/entity/UploadZone"
import { ActivityLog } from "@/components/entity/ActivityLog"

const TODAY = format(new Date(), "yyyy-MM-dd")

/** Seed audit entries (fixed timestamps) for the Asset Management pilot. */
function seedLog(entityId: string): AuditEntry[] {
  if (entityId !== "asset-management") return []
  return [
    {
      id: "seed-kb-1",
      actor: "FADE",
      action: 'Uploaded "KYC & Account Opening FAQ" (v1), queued for indexing',
      timestamp: "2026-06-05T09:30:00",
    },
    {
      id: "seed-kb-2",
      actor: "FADE",
      action: 'Activated v2 of "NAV & Pricing FAQ", now serving',
      timestamp: "2026-05-14T10:12:00",
    },
    {
      id: "seed-kb-3",
      actor: "Temi Onboarding Team",
      action: 'Indexed "Equity Fund Factsheet" (v3), ready to activate',
      timestamp: "2026-05-06T14:03:00",
    },
  ]
}

function StatChip({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: "green" | "purple" | "red" | "neutral"
}) {
  const dot = {
    green: "bg-status-green",
    purple: "bg-primary",
    red: "bg-status-red",
    neutral: "bg-disabled",
  }[tone]
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <span className={cn("size-2 rounded-full", dot)} />
      <span className="text-lg font-semibold tabular-nums text-text-primary">
        {count}
      </span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}

function KnowledgeBaseInner({
  entityId,
  entityName,
  actor,
}: {
  entityId: string
  entityName: string
  actor: string
}) {
  const mounted = useRef(true)
  const [documents, setDocuments] = useState<KBDocument[]>(() =>
    KB_DOCUMENTS.filter((d) => d.entityId === entityId).map((d) => ({
      ...d,
      versions: d.versions.map((v) => ({ ...v })),
    }))
  )
  const [log, setLog] = useState<AuditEntry[]>(() => seedLog(entityId))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const gaps = KNOWLEDGE_GAPS.filter((g) => g.entityId === entityId).sort(
    (a, b) => b.occurrences - a.occurrences
  )

  const addLog = (action: string) =>
    setLog((prev) => [makeAuditEntry(actor, action), ...prev])

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleUpload = (files: UploadedFile[]) => {
    files.forEach((f, i) => {
      const id = `kb-new-${Date.now()}-${i}`
      const doc: KBDocument = {
        id,
        entityId,
        name: f.name,
        fileType: f.fileType,
        status: "Uploaded",
        versions: [
          {
            version: 1,
            uploadedAt: TODAY,
            uploadedBy: actor,
            active: false,
            note: "Just uploaded, queued for indexing.",
          },
        ],
        updatedAt: TODAY,
      }
      setDocuments((prev) => [doc, ...prev])
      addLog(`Uploaded "${f.name}" (v1), queued for indexing`)
      // Simulate ingestion completing.
      window.setTimeout(() => {
        if (!mounted.current) return
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: "Indexed" } : d))
        )
        addLog(`Indexed "${f.name}" (v1), ready to activate`)
      }, 1600)
    })
  }

  const activateVersion = (doc: KBDocument, version: number) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              status: "Active",
              activeVersion: version,
              updatedAt: TODAY,
              versions: d.versions.map((v) => ({
                ...v,
                active: v.version === version,
              })),
            }
          : d
      )
    )
    addLog(`Activated v${version} of "${doc.name}", now serving`)
  }

  const deactivateVersion = (doc: KBDocument, version: number) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              status: "Indexed",
              activeVersion: undefined,
              updatedAt: TODAY,
              versions: d.versions.map((v) =>
                v.version === version ? { ...v, active: false } : v
              ),
            }
          : d
      )
    )
    addLog(`Deactivated v${version} of "${doc.name}"; no version now serving`)
  }

  const addVersion = (doc: KBDocument) => {
    const next = Math.max(...doc.versions.map((v) => v.version)) + 1
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              status: "Indexed",
              updatedAt: TODAY,
              versions: [
                ...d.versions,
                {
                  version: next,
                  uploadedAt: TODAY,
                  uploadedBy: actor,
                  active: false,
                  note: "New version, awaiting review before activation.",
                },
              ],
            }
          : d
      )
    )
    setExpanded((prev) => new Set(prev).add(doc.id))
    addLog(`Uploaded v${next} of "${doc.name}"; indexing, current version still serving`)
  }

  const counts = {
    active: documents.filter((d) => d.status === "Active").length,
    processing: documents.filter(
      (d) => d.status === "Uploaded" || d.status === "Indexed"
    ).length,
    errors: documents.filter((d) => d.status === "Error").length,
    gaps: gaps.length,
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={BookOpen}
        title="Knowledge Base"
        eyebrow={entityName}
        description="Upload, version and activate the documents the agent answers from. History is never deleted, and every change is logged."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Changes are audit-logged
          </span>
        }
      />

      {/* Summary chips */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        <StatChip label="Active" count={counts.active} tone="green" />
        <StatChip label="Indexing / queued" count={counts.processing} tone="purple" />
        <StatChip label="Errors" count={counts.errors} tone="red" />
        <StatChip label="Knowledge gaps" count={counts.gaps} tone="neutral" />
      </div>

      {/* Upload */}
      <section className="mt-4">
        <UploadZone onFiles={handleUpload} />
      </section>

      {/* Documents */}
      <section className="mt-4">
        <Panel
          title={`Documents (${documents.length})`}
          description="Expand a document to view its version history and activate a version."
        >
          {documents.length === 0 ? (
            <div className="rounded-lg bg-fcmb-offwhite px-4 py-10 text-center text-sm text-text-secondary">
              No documents yet. Drag a file into the upload zone above to begin.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((doc) => {
                const isOpen = expanded.has(doc.id)
                const canActivate =
                  doc.status === "Indexed" || doc.status === "Active"
                return (
                  <li key={doc.id} className="py-1">
                    {/* Row */}
                    <button
                      type="button"
                      onClick={() => toggle(doc.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-fcmb-offwhite"
                      aria-expanded={isOpen}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-text-primary">
                          {doc.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                          <span className="rounded bg-fcmb-offwhite px-1.5 py-0.5 font-medium ring-1 ring-inset ring-border">
                            {doc.fileType}
                          </span>
                          <span>
                            {doc.activeVersion
                              ? `v${doc.activeVersion} serving`
                              : "No active version"}
                          </span>
                          <span className="hidden sm:inline">
                            · updated {formatDate(doc.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <KBStatusBadge status={doc.status} />
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-text-secondary transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Version history */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-12 mr-2 mb-2 rounded-lg border border-border bg-fcmb-offwhite/60 p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                Version history
                              </h4>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => addVersion(doc)}
                              >
                                <FilePlus2 /> Upload new version
                              </Button>
                            </div>
                            <ul className="mt-2 space-y-1.5">
                              {[...doc.versions]
                                .sort((a, b) => b.version - a.version)
                                .map((v) => (
                                  <li
                                    key={v.version}
                                    className="flex items-center gap-3 rounded-md bg-card px-3 py-2 ring-1 ring-inset ring-border"
                                  >
                                    <span className="text-sm font-semibold tabular-nums text-text-primary">
                                      v{v.version}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs text-text-secondary">
                                        {formatDate(v.uploadedAt)} · {v.uploadedBy}
                                      </div>
                                      {v.note && (
                                        <div className="truncate text-xs text-text-secondary">
                                          {v.note}
                                        </div>
                                      )}
                                    </div>
                                    {v.active ? (
                                      <>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-status-green/10 px-1.5 py-0.5 text-xs font-medium text-status-green ring-1 ring-inset ring-status-green/20">
                                          <ShieldCheck className="size-3" /> Serving
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          onClick={() =>
                                            deactivateVersion(doc, v.version)
                                          }
                                        >
                                          <Power /> Deactivate
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        disabled={!canActivate}
                                        title={
                                          canActivate
                                            ? undefined
                                            : "Document must finish indexing before a version can be activated"
                                        }
                                        onClick={() =>
                                          activateVersion(doc, v.version)
                                        }
                                      >
                                        Activate
                                      </Button>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </section>

      {/* Gaps + Activity log */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Knowledge gap report"
          description="Questions customers asked that no active document answered."
        >
          {gaps.length === 0 ? (
            <div className="rounded-lg bg-fcmb-offwhite px-4 py-8 text-center text-sm text-text-secondary">
              No knowledge gaps recorded.
            </div>
          ) : (
            <ul className="space-y-2">
              {gaps.map((g) => (
                <li
                  key={g.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-status-amber/10 text-status-amber">
                    <CircleHelp className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{g.question}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Asked {g.occurrences}× · last {formatDate(g.lastAsked)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      // Placeholder: authoring a doc from a gap is a later phase.
                      console.log("[prototype] address gap:", g.id)
                    }
                  >
                    <Sparkles /> Address
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <ActivityLog entries={log} />
      </section>
    </div>
  )
}

export default function KnowledgeBase() {
  const { persona } = usePersona()
  // key on entityId: switching persona fully remounts, so no entity's KB state
  // or documents can leak into another (tenant isolation, §9.2).
  return (
    <KnowledgeBaseInner
      key={persona.entityId}
      entityId={persona.entityId}
      entityName={persona.entityName}
      actor={persona.name}
    />
  )
}
