import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CheckCheck,
  FileText,
  Headset,
  ListChecks,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import {
  CHAT_SCRIPT,
  eventSender,
  typingDurationFor,
  type ChatEvent,
  type ChatSender,
  type GuidedStepsEvent,
  type HandoverEvent,
  type TextEvent,
} from "@/data/customerChat"
import { cn } from "@/lib/utils"

/* ------------------------------- avatars -------------------------------- */

function TemiAvatar() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Sparkles className="size-3.5" />
    </span>
  )
}

function HumanAvatar() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-status-green/15 text-status-green">
      <Headset className="size-3.5" />
    </span>
  )
}

/* ------------------------------- bubbles -------------------------------- */

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.26, ease: "easeOut" as const, delay },
  }
}

function TextBubble({ event }: { event: TextEvent }) {
  if (event.sender === "customer") {
    return (
      <motion.div {...fadeIn()} className="flex justify-end">
        <div className="max-w-[82%]">
          <div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-xs">
            {event.text}
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1 pr-1 text-[11px] text-text-secondary">
            Delivered <CheckCheck className="size-3 text-primary" />
          </div>
        </div>
      </motion.div>
    )
  }

  const isHuman = event.sender === "human"
  return (
    <motion.div {...fadeIn()} className="flex justify-start gap-2">
      {isHuman ? <HumanAvatar /> : <TemiAvatar />}
      <div className="max-w-[82%]">
        {isHuman && (
          <div className="mb-0.5 ml-0.5 text-[11px] font-medium text-status-green">
            {event.senderName} · {event.senderTeam}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl rounded-tl-md px-3.5 py-2 text-sm text-text-primary shadow-xs",
            isHuman
              ? "border border-status-green/30 bg-status-green/5"
              : "border border-border bg-card"
          )}
        >
          {event.text}
        </div>
        {event.source && (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 text-[11px] font-medium text-text-secondary ring-1 ring-inset ring-border">
            <FileText className="size-3 text-primary" />
            From knowledge base · {event.source}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function GuidedStepsCard({ event }: { event: GuidedStepsEvent }) {
  return (
    <motion.div {...fadeIn()} className="flex justify-start gap-2">
      <TemiAvatar />
      <div className="w-[88%] rounded-2xl rounded-tl-md border border-border bg-card p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-text-primary">
            {event.title}
          </h3>
        </div>
        <p className="mt-2 text-xs text-text-secondary">{event.note}</p>

        <ol className="mt-3 space-y-1.5">
          {event.steps.map((s, i) => (
            <motion.li
              key={s.label}
              {...fadeIn(0.05 * i)}
              className="flex items-center gap-2.5 rounded-lg bg-fcmb-offwhite px-2.5 py-1.5"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold tabular-nums text-primary">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium text-text-primary">
                {s.label}
              </span>
              <span className="shrink-0 text-[11px] font-medium text-text-secondary">
                {s.value}
              </span>
            </motion.li>
          ))}
        </ol>

        <p className="mt-3 flex items-start gap-1.5 rounded-md bg-status-amber/10 px-2.5 py-1.5 text-[11px] text-status-amber">
          <ShieldCheck className="mt-px size-3.5 shrink-0" />
          {event.footnote}
        </p>
      </div>
    </motion.div>
  )
}

function HandoverCard({ event }: { event: HandoverEvent }) {
  return (
    <motion.div {...fadeIn()} className="px-2">
      <div className="overflow-hidden rounded-xl border border-status-green/30 bg-status-green/5">
        <div className="flex items-center gap-2 border-b border-status-green/20 px-3.5 py-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-status-green/15 text-status-green">
            <Headset className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary">
              Connecting you to {event.team}
            </p>
            <p className="text-[11px] text-text-secondary">
              Your conversation is being handed to a specialist.
            </p>
          </div>
        </div>
        <dl className="divide-y divide-status-green/15">
          {event.context.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-3 px-3.5 py-1.5"
            >
              <dt className="text-[11px] text-text-secondary">{c.label}</dt>
              <dd className="text-[11px] font-medium text-text-primary">
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  )
}

function renderEvent(event: ChatEvent) {
  switch (event.kind) {
    case "text":
      return <TextBubble key={event.id} event={event} />
    case "guidedSteps":
      return <GuidedStepsCard key={event.id} event={event} />
    case "handover":
      return <HandoverCard key={event.id} event={event} />
  }
}

/* ---------------------------- typing bubble ----------------------------- */

function TypingBubble({ sender }: { sender: ChatSender }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex justify-start gap-2"
    >
      {sender === "human" ? <HumanAvatar /> : <TemiAvatar />}
      <div className="rounded-2xl rounded-tl-md border border-border bg-card px-3.5 py-2.5 shadow-xs">
        <TypingDots />
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-text-secondary/60"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  )
}

/* -------------------------------- engine -------------------------------- */

export default function CustomerChatDemo() {
  const [revealed, setRevealed] = useState(0)
  const [typing, setTyping] = useState(false)
  const timers = useRef<number[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  // Drive the script forward one event at a time, with a typing pause before
  // each agent/human turn. Stops when the script ends; it never loops.
  useEffect(() => {
    if (revealed >= CHAT_SCRIPT.length) return
    const next = CHAT_SCRIPT[revealed]
    const sender = eventSender(next)

    if (sender === "customer") {
      timers.current.push(
        window.setTimeout(() => setRevealed((r) => r + 1), 750)
      )
    } else {
      timers.current.push(
        window.setTimeout(() => setTyping(true), 320)
      )
      timers.current.push(
        window.setTimeout(() => {
          setTyping(false)
          setRevealed((r) => r + 1)
        }, 320 + typingDurationFor(next))
      )
    }
    return clearTimers
  }, [revealed])

  // Keep the latest message in view as the conversation plays.
  useLayoutEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [revealed, typing])

  const replay = () => {
    clearTimers()
    setTyping(false)
    setRevealed(0)
  }

  const done = revealed >= CHAT_SCRIPT.length && !typing
  const typingSender =
    typing && revealed < CHAT_SCRIPT.length
      ? eventSender(CHAT_SCRIPT[revealed])
      : null

  return (
    <div
      className="grid h-[calc(100svh-4rem)] place-items-center sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 25% 15%, rgba(92,45,145,0.10), transparent 55%), radial-gradient(circle at 85% 90%, rgba(245,197,24,0.08), transparent 50%)",
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-card shadow-xl sm:h-[680px] sm:max-w-[420px] sm:rounded-3xl sm:border sm:border-border">
        {/* Widget header */}
        <header className="flex items-center gap-3 bg-gradient-to-br from-[#5C2D91] to-[#7B4BB7] px-4 py-3 text-white">
          <span className="relative flex size-9 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="size-4" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#5C2D91] bg-status-green" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">Temi</p>
            <p className="text-[11px] leading-tight text-white/70">
              FCMB Asset Management · online
            </p>
          </div>
          <button
            type="button"
            onClick={replay}
            aria-label="Replay demonstration"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20"
          >
            <RotateCcw className="size-3.5" />
            Replay
          </button>
        </header>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto bg-fcmb-offwhite px-3.5 py-4"
        >
          <div className="flex justify-center">
            <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-text-secondary ring-1 ring-inset ring-border">
              Scripted demonstration · not a live chat
            </span>
          </div>

          {CHAT_SCRIPT.slice(0, revealed).map(renderEvent)}

          <AnimatePresence>
            {typingSender && <TypingBubble sender={typingSender} />}
          </AnimatePresence>

          <AnimatePresence>
            {done && (
              <motion.div
                {...fadeIn()}
                className="flex flex-col items-center gap-2 pt-2"
              >
                <span className="text-[11px] text-text-secondary">
                  End of demonstration
                </span>
                <button
                  type="button"
                  onClick={replay}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <RotateCcw className="size-3.5" /> Replay demonstration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inert composer: this is a scripted demo, not a live input */}
        <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-2.5">
          <div className="flex-1 rounded-full bg-fcmb-offwhite px-3.5 py-2 text-sm text-disabled">
            Message Temi…
          </div>
          <button
            type="button"
            disabled
            aria-label="Send (disabled in demonstration)"
            className="flex size-9 items-center justify-center rounded-full bg-primary/40 text-primary-foreground"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
