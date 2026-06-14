import { Globe, MessageCircle, Smartphone, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChannelKey } from "@/types"

const CHANNEL_META: Record<ChannelKey, { label: string; icon: LucideIcon }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  web: { label: "Web", icon: Globe },
  mobile: { label: "Mobile", icon: Smartphone },
}

const ALL_CHANNELS: ChannelKey[] = ["whatsapp", "web", "mobile"]

/**
 * Compact row of channel chips. Enabled channels are solid; the rest are shown
 * dimmed so the on/off state reads at a glance.
 */
export function ChannelBadges({
  channels,
  showInactive = true,
  className,
}: {
  channels: ChannelKey[]
  showInactive?: boolean
  className?: string
}) {
  const list = showInactive
    ? ALL_CHANNELS
    : ALL_CHANNELS.filter((c) => channels.includes(c))

  if (list.length === 0) {
    return (
      <span className={cn("text-xs text-disabled", className)}>
        No channels configured
      </span>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {list.map((c) => {
        const meta = CHANNEL_META[c]
        const Icon = meta.icon
        const active = channels.includes(c)
        return (
          <span
            key={c}
            title={`${meta.label}${active ? "" : " (not configured)"}`}
            className={cn(
              "flex size-6 items-center justify-center rounded-md ring-1 ring-inset",
              active
                ? "bg-primary/10 text-primary ring-primary/15"
                : "bg-transparent text-disabled ring-border"
            )}
          >
            <Icon className="size-3.5" />
          </span>
        )
      })}
    </div>
  )
}
