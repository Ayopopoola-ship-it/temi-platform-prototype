import { useState } from "react"
import {
  Check,
  Copy,
  Globe,
  Info,
  MessageCircle,
  Radio,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react"
import type { AuditEntry, ChannelKey } from "@/types"
import { usePersona } from "@/context/PersonaContext"
import { getEntityById } from "@/data/entities"
import { makeAuditEntry } from "@/lib/audit"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/layout/PageHeader"
import { ActivityLog } from "@/components/entity/ActivityLog"

interface ChannelMeta {
  key: ChannelKey
  name: string
  description: string
  icon: LucideIcon
  /** Self-serve channels go live immediately; others await central provisioning. */
  selfServe: boolean
  /** What central provisioning is required (for non-self-serve channels). */
  provisioning?: string
}

const CHANNELS: ChannelMeta[] = [
  {
    key: "whatsapp",
    name: "WhatsApp",
    description:
      "Conversational support on WhatsApp Business, the channel most customers reach for first.",
    icon: MessageCircle,
    selfServe: false,
    provisioning: "WhatsApp Business number provisioning by the Temi platform team",
  },
  {
    key: "web",
    name: "Web widget",
    description:
      "An embeddable chat widget for your website. Copy the snippet and drop it into your site.",
    icon: Globe,
    selfServe: true,
  },
  {
    key: "mobile",
    name: "Mobile in-app",
    description:
      "In-app support inside the entity's mobile app, via the Temi mobile SDK.",
    icon: Smartphone,
    selfServe: false,
    provisioning: "Mobile SDK integration by the Temi platform team",
  },
]

function seedLog(entityId: string, enabled: Record<ChannelKey, boolean>): AuditEntry[] {
  if (entityId !== "asset-management") return []
  const seeds: AuditEntry[] = []
  if (enabled.web)
    seeds.push({
      id: "seed-ch-web",
      actor: "FADE",
      action: "Enabled Web widget; live on the FCMB Asset Management site",
      timestamp: "2026-05-20T11:00:00",
    })
  return seeds
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(code)
    } catch {
      /* clipboard may be blocked in some embeds - show optimistic feedback */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-[#f4f1f8]">
      <button
        type="button"
        onClick={copy}
        className={cn(
          "absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
          copied
            ? "border-status-green/30 bg-status-green/10 text-status-green"
            : "border-border bg-card text-text-secondary hover:text-text-primary"
        )}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto px-4 py-3.5 pr-20 text-xs leading-relaxed text-text-primary">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}

function ChannelCard({
  meta,
  enabled,
  onToggle,
  embedCode,
}: {
  meta: ChannelMeta
  enabled: boolean
  onToggle: (next: boolean) => void
  embedCode: string
}) {
  const Icon = meta.icon
  const showEmbed = meta.key === "web" && enabled

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            enabled ? "bg-primary/10 text-primary" : "bg-fcmb-offwhite text-disabled"
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary">{meta.name}</h3>
            {meta.selfServe && (
              <span className="rounded bg-fcmb-offwhite px-1.5 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-inset ring-border">
                Self-serve
              </span>
            )}
          </div>
          <p className="mt-0.5 max-w-xl text-sm text-text-secondary">
            {meta.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">
            {enabled ? "On" : "Off"}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${meta.name}`}
          />
        </div>
      </div>

      {/* Status row */}
      <div className="mt-4">
        {enabled ? (
          meta.selfServe ? (
            <StatusFlag tone="green" icon={ShieldCheck}>
              Live: active on your website now.
            </StatusFlag>
          ) : (
            <StatusFlag tone="amber" icon={Info}>
              Pending: {meta.provisioning}. The channel goes live once the central
              team completes provisioning.
            </StatusFlag>
          )
        ) : (
          <StatusFlag tone="neutral">Not enabled.</StatusFlag>
        )}
      </div>

      {/* Web widget embed */}
      {showEmbed && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Embed code
          </div>
          <CopyableCode code={embedCode} />
          <p className="mt-2 text-xs text-text-secondary">
            Paste this before the closing <code className="font-mono">&lt;/body&gt;</code>{" "}
            tag on every page where the widget should appear.
          </p>
        </div>
      )}
    </div>
  )
}

function StatusFlag({
  tone,
  icon: Icon,
  children,
}: {
  tone: "green" | "amber" | "neutral"
  icon?: LucideIcon
  children: React.ReactNode
}) {
  const cls = {
    green: "border-status-green/25 bg-status-green/[0.06] text-status-green",
    amber: "border-status-amber/30 bg-status-amber/[0.07] text-[#B45309]",
    neutral: "border-border bg-fcmb-offwhite text-text-secondary",
  }[tone]
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        cls
      )}
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
      <span>{children}</span>
    </div>
  )
}

function ChannelsInner({
  entityId,
  entityName,
  actor,
}: {
  entityId: string
  entityName: string
  actor: string
}) {
  const entity = getEntityById(entityId)
  const initial: Record<ChannelKey, boolean> = {
    whatsapp: entity?.channels.includes("whatsapp") ?? false,
    web: entity?.channels.includes("web") ?? false,
    mobile: entity?.channels.includes("mobile") ?? false,
  }
  const [enabled, setEnabled] = useState<Record<ChannelKey, boolean>>(initial)
  const [log, setLog] = useState<AuditEntry[]>(() => seedLog(entityId, initial))

  const embedCode = `<!-- Temi support widget for ${entityName} -->
<script>
  (function () {
    var s = document.createElement('script');
    s.src = 'https://cdn.temi.fcmb.com/widget.js';
    s.async = true;
    s.setAttribute('data-entity', '${entityId}');
    s.setAttribute('data-temi-key', 'tmi_live_8f3a2c91b7');
    document.head.appendChild(s);
  })();
</script>`

  const toggle = (meta: ChannelMeta, next: boolean) => {
    setEnabled((prev) => ({ ...prev, [meta.key]: next }))
    const action = !next
      ? `Disabled ${meta.name}`
      : meta.selfServe
        ? `Enabled ${meta.name}`
        : `Requested ${meta.name}: ${meta.provisioning}`
    setLog((prev) => [makeAuditEntry(actor, action), ...prev])
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <PageHeader
        icon={Radio}
        title="Channels"
        eyebrow={entityName}
        description="Choose where this entity's Temi agent is available. Some channels need central provisioning and can't be switched on instantly."
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Changes are audit-logged
          </span>
        }
      />

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {CHANNELS.map((meta) => (
            <ChannelCard
              key={meta.key}
              meta={meta}
              enabled={enabled[meta.key]}
              onToggle={(next) => toggle(meta, next)}
              embedCode={embedCode}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <ActivityLog
            entries={log}
            emptyHint="Toggle a channel and the change will be logged here with your name and a timestamp."
          />
        </div>
      </div>
    </div>
  )
}

export default function Channels() {
  const { persona } = usePersona()
  // key on entityId - channel toggle state never carries across entities (§9.2).
  return (
    <ChannelsInner
      key={persona.entityId}
      entityId={persona.entityId}
      entityName={persona.entityName}
      actor={persona.name}
    />
  )
}
