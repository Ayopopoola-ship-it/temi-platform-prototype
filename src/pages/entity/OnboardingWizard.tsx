import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  FileText,
  FlaskConical,
  Globe,
  Headset,
  Plus,
  Rocket,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react"
import { usePersona } from "@/context/PersonaContext"
import { useFlows } from "@/context/FlowsContext"
import {
  useOnboarding,
  type BotTone,
  type OnboardingData,
} from "@/context/OnboardingContext"
import { balanceEnquiryTemplate } from "@/lib/flowModel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SearchSelect } from "@/components/entity/SearchSelect"
import { UploadZone, type UploadedFile } from "@/components/entity/UploadZone"
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper"

const STEP_LABELS = [
  "Entity Setup",
  "Knowledge Base",
  "Channels",
  "Escalation",
  "First Flow",
  "Review",
]

const TONES: { value: BotTone; label: string; blurb: string }[] = [
  {
    value: "friendly",
    label: "Friendly",
    blurb: "Warm and approachable. Good for everyday customer support.",
  },
  {
    value: "formal",
    label: "Formal",
    blurb: "Professional and precise. Good for regulated, detailed topics.",
  },
  {
    value: "neutral",
    label: "Neutral",
    blurb: "Clear and plain. A balanced, straightforward voice.",
  },
]

const INTENT_OPTIONS = [
  "Account balance & holdings",
  "Buy or sell shares",
  "Statement request",
  "Market information",
  "Complaints",
  "KYC & account opening",
  "Profile & contact update",
]

const TEAM_OPTIONS = [
  "Customer Support Team",
  "Trading Desk",
  "Operations",
  "Complaints & Resolution",
  "Onboarding & KYC",
  "Compliance",
]

/** Step completion, derived from the wizard data plus any created flow. */
function getCompletion(data: OnboardingData, hasFlow: boolean): boolean[] {
  return [
    data.botName.trim().length > 0,
    data.kbDocs.length > 0,
    Object.values(data.channels).some(Boolean),
    data.escalationRules.length > 0,
    data.templateFlowStarted || hasFlow,
    false, // Review is an action, not a completable step.
  ]
}

export default function OnboardingWizard() {
  const { persona } = usePersona()
  const ob = useOnboarding()
  const navigate = useNavigate()
  const { flowsForEntity, createFlow } = useFlows()

  const hasFlow = flowsForEntity(persona.entityId).length > 0
  const completion = getCompletion(ob.data, hasFlow)

  // Open at the first step that still needs attention (handy when returning
  // from the Flow Builder), or the Review step once everything is done.
  const [step, setStep] = useState(() => {
    const firstIncomplete = completion.slice(0, 5).findIndex((c) => !c)
    return firstIncomplete === -1 ? 5 : firstIncomplete
  })

  if (ob.data.submitted) {
    return <SubmittedScreen entityName={persona.entityName} />
  }

  const startTemplate = () => {
    const tpl = balanceEnquiryTemplate()
    const id = createFlow(persona.entityId, persona.name, tpl)
    ob.markTemplateFlowStarted()
    navigate(`/entity/flows/${id}`)
  }
  const startScratch = () => {
    const id = createFlow(persona.entityId, persona.name)
    ob.markTemplateFlowStarted()
    navigate(`/entity/flows/${id}`)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      {/* Welcome header */}
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Rocket className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="mb-1 text-xs font-medium text-text-secondary">
            {persona.entityName} · Onboarding
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Welcome to Temi, {persona.entityName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Let's get your assistant ready in six short steps. Nothing goes
            live until the platform team reviews your setup, so feel free to
            explore.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-xs">
        <OnboardingStepper
          labels={STEP_LABELS}
          current={step}
          completed={completion}
          onStepClick={setStep}
        />
      </div>

      {/* Step content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6"
          >
            {step === 0 && <StepEntitySetup entityName={persona.entityName} />}
            {step === 1 && <StepKnowledgeBase />}
            {step === 2 && <StepChannels />}
            {step === 3 && <StepEscalation />}
            {step === 4 && (
              <StepFirstFlow
                hasFlow={hasFlow}
                onTemplate={startTemplate}
                onScratch={startScratch}
              />
            )}
            {step === 5 && (
              <StepReview completion={completion} onSubmit={ob.submit} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft /> Back
        </Button>
        {step < 5 && (
          <Button onClick={() => setStep((s) => Math.min(5, s + 1))}>
            Continue <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ step header ------------------------------ */

function StepHeader({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Rocket
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">{children}</p>
      </div>
    </div>
  )
}

const fieldLabel = "mb-1 block text-xs font-medium text-text-secondary"
const inputClass =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-text-primary outline-none transition-[box-shadow] placeholder:text-disabled focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

/* -------------------------------- step 1 -------------------------------- */

function StepEntitySetup({ entityName }: { entityName: string }) {
  const { data, setBotName, setTone } = useOnboarding()
  return (
    <div>
      <StepHeader icon={Sparkles} title="Let's set up your assistant">
        Confirm your entity details and choose how your assistant should sound.
        You can change these later in Settings.
      </StepHeader>

      <div className="mt-5 space-y-4">
        <div>
          <span className={fieldLabel}>Entity name</span>
          <div className="flex items-center gap-2 rounded-md border border-border bg-fcmb-offwhite px-3 py-2 text-sm text-text-primary">
            <Building2 className="size-4 text-text-secondary" />
            {entityName}
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-text-secondary">
              <BadgeCheck className="size-3.5 text-primary" /> Set by the
              platform team
            </span>
          </div>
        </div>

        <div>
          <label className={fieldLabel} htmlFor="bot-name">
            Assistant name
          </label>
          <input
            id="bot-name"
            value={data.botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="e.g. CSL Assistant"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-text-secondary">
            This is the name customers see when they chat.
          </p>
        </div>

        <div>
          <span className={fieldLabel}>Tone of voice</span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {TONES.map((t) => {
              const active = data.tone === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {t.label}
                    </span>
                    {active && <CheckCircle2 className="size-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{t.blurb}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- step 2 -------------------------------- */

function StepKnowledgeBase() {
  const { data, addKbDocs } = useOnboarding()
  const handleFiles = (files: UploadedFile[]) =>
    addKbDocs(files.map((f) => f.name))

  return (
    <div>
      <StepHeader icon={FileText} title="Add your first documents">
        Temi answers from the documents you give it. Prepare your FAQs, product
        factsheets, and process guides. Accepted formats are PDF, DOCX, TXT, and
        Markdown. You can add more at any time.
      </StepHeader>

      <div className="mt-5">
        <UploadZone onFiles={handleFiles} />
      </div>

      <div className="mt-4">
        {data.kbDocs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-fcmb-offwhite/60 px-4 py-6 text-center">
            <p className="text-sm font-medium text-text-primary">
              No documents yet
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Drop a file into the area above to give your assistant something
              to answer from.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {data.kbDocs.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2"
              >
                <FileText className="size-4 text-primary" />
                <span className="truncate text-sm text-text-primary">
                  {name}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-status-green/10 px-2 py-0.5 text-[11px] font-medium text-status-green">
                  Uploaded
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* -------------------------------- step 3 -------------------------------- */

function StepChannels() {
  const { data, toggleChannel } = useOnboarding()
  const channels = [
    {
      key: "whatsapp" as const,
      icon: Headset,
      label: "WhatsApp",
      blurb:
        "Requires a WhatsApp Business number. The platform team provisions this for you.",
    },
    {
      key: "web" as const,
      icon: Globe,
      label: "Web widget",
      blurb: "Embed a chat widget on your website. Ready right away.",
    },
    {
      key: "mobile" as const,
      icon: Smartphone,
      label: "Mobile app",
      blurb: "Add Temi to your mobile app with the SDK.",
    },
  ]
  return (
    <div>
      <StepHeader icon={Globe} title="Choose where customers reach you">
        Turn on the channels you want your assistant to serve. Start with one
        and add more whenever you are ready.
      </StepHeader>

      <div className="mt-5 space-y-2.5">
        {channels.map((c) => {
          const on = data.channels[c.key]
          return (
            <div
              key={c.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 transition-colors",
                on ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  on ? "bg-primary/10 text-primary" : "bg-fcmb-offwhite text-text-secondary"
                )}
              >
                <c.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text-primary">
                  {c.label}
                </div>
                <p className="text-xs text-text-secondary">{c.blurb}</p>
              </div>
              <Switch
                checked={on}
                onCheckedChange={() => toggleChannel(c.key)}
                aria-label={`Activate ${c.label}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------- step 4 -------------------------------- */

function StepEscalation() {
  const { data, addEscalationRule, removeEscalationRule } = useOnboarding()
  const [adding, setAdding] = useState(false)
  const [intent, setIntent] = useState("")
  const [team, setTeam] = useState("")

  const submit = () => {
    if (!intent.trim() || !team.trim()) return
    addEscalationRule(intent.trim(), team.trim())
    setIntent("")
    setTeam("")
    setAdding(false)
  }

  return (
    <div>
      <StepHeader icon={Headset} title="Set up human handover">
        When your assistant cannot help, it hands the conversation to a human
        team. We have suggested a default route to get you started. Add rules to
        send specific topics to specific teams.
      </StepHeader>

      <ul className="mt-5 space-y-2">
        {data.escalationRules.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-text-primary">
                  {r.intentCategory}
                </span>
                {r.isDefault && (
                  <span className="rounded-full bg-fcmb-offwhite px-2 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-inset ring-border">
                    Suggested default
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Routes to {r.team}
              </p>
            </div>
            {!r.isDefault && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Remove rule"
                onClick={() => removeEscalationRule(r.id)}
                className="text-text-secondary hover:text-status-red"
              >
                <Trash2 />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-3 rounded-lg border border-border bg-fcmb-offwhite/50 p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className={fieldLabel}>Intent category</span>
              <SearchSelect
                value={intent}
                onChange={setIntent}
                options={INTENT_OPTIONS}
                allowCustom
                placeholder="Search intents…"
                ariaLabel="Intent category"
              />
            </div>
            <div>
              <span className={fieldLabel}>Routes to</span>
              <SearchSelect
                value={team}
                onChange={setTeam}
                options={TEAM_OPTIONS}
                allowCustom
                placeholder="Search teams…"
                ariaLabel="Team"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={submit} disabled={!intent.trim() || !team.trim()}>
              Add rule
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              <X /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setAdding(true)}>
          <Plus /> Add routing rule
        </Button>
      )}
    </div>
  )
}

/* -------------------------------- step 5 -------------------------------- */

function StepFirstFlow({
  hasFlow,
  onTemplate,
  onScratch,
}: {
  hasFlow: boolean
  onTemplate: () => void
  onScratch: () => void
}) {
  return (
    <div>
      <StepHeader icon={Workflow} title="Create your first flow">
        Flows describe how your assistant guides a customer through a task, step
        by step. Flows are model mode only: they are designed and reviewed,
        never run automatically.
      </StepHeader>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-text-secondary">
        <FlaskConical className="size-3.5 text-primary" />
        Model mode only. Nothing a flow describes will execute in the prototype.
      </div>

      {hasFlow ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-status-green/30 bg-status-green/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-green" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">
              You have started your first flow
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Open the Flow Builder any time to keep shaping it.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/entity/flows">
                <Workflow /> Open the Flow Builder
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onTemplate}
            className="flex flex-col rounded-xl border border-primary/40 bg-primary/5 p-4 text-left transition-colors hover:border-primary"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <span className="mt-3 text-sm font-semibold text-text-primary">
              Start from a template
            </span>
            <span className="mt-1 text-xs text-text-secondary">
              Preloads a Balance Enquiry flow you can customise. The easiest way
              to begin.
            </span>
          </button>
          <button
            type="button"
            onClick={onScratch}
            className="flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-fcmb-offwhite text-text-secondary">
              <Workflow className="size-4" />
            </span>
            <span className="mt-3 text-sm font-semibold text-text-primary">
              Start from scratch
            </span>
            <span className="mt-1 text-xs text-text-secondary">
              Open an empty flow and build each step yourself.
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- step 6 -------------------------------- */

function StepReview({
  completion,
  onSubmit,
}: {
  completion: boolean[]
  onSubmit: () => void
}) {
  const items = [
    { label: "Entity setup", done: completion[0], outstanding: "Add your assistant name." },
    { label: "Knowledge base", done: completion[1], outstanding: "Upload at least one document." },
    { label: "Channels", done: completion[2], outstanding: "Activate at least one channel." },
    { label: "Escalation routing", done: completion[3], outstanding: "Keep or change the default route." },
    { label: "First flow", done: completion[4], outstanding: "Start a flow from a template or scratch." },
  ]
  const doneCount = items.filter((i) => i.done).length

  return (
    <div>
      <StepHeader icon={Rocket} title="Review and submit">
        Here is a summary of your setup. You can submit now and finish anything
        outstanding later; the platform team will review what you send.
      </StepHeader>

      <p className="mt-4 text-xs font-medium text-text-secondary">
        {doneCount} of {items.length} steps complete
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-start gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
          >
            {it.done ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-green" />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-status-amber" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-primary">
                {it.label}
              </div>
              <p className="text-xs text-text-secondary">
                {it.done ? "Complete" : `Outstanding: ${it.outstanding}`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-secondary">
          Submitting sends your setup to the Temi platform team for review.
        </p>
        <Button onClick={onSubmit} className="sm:shrink-0">
          <Send /> Submit for platform review
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------ submitted -------------------------------- */

function SubmittedScreen({ entityName }: { entityName: string }) {
  return (
    <div className="mx-auto grid min-h-[calc(100svh-8rem)] w-full max-w-xl place-items-center px-5 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-status-green/10 text-status-green">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
          Your onboarding request has been submitted.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          The Temi platform team will review your setup and be in touch within 2
          business days.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-fcmb-offwhite px-4 py-2.5 text-xs text-text-secondary">
          <Rocket className="size-3.5 text-primary" />
          We have let the platform team know that {entityName} is ready for
          review.
        </div>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/entity/flows">
            <Workflow /> Keep exploring the Flow Builder
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
