import type { CollectInputType, FlowStep } from "@/types"
import { SearchSelect } from "@/components/entity/SearchSelect"
import { ModelModeBadge } from "./ModelModeBadge"
import { cn } from "@/lib/utils"

const INPUT_TYPES: { value: CollectInputType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "amount", label: "Amount" },
  { value: "account", label: "Account" },
  { value: "selection", label: "Selection" },
]

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-text-secondary">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-secondary">{hint}</span>}
    </label>
  )
}

const inputClass =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-text-primary outline-none transition-[box-shadow] placeholder:text-disabled focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

/**
 * The editable field set for a single step, keyed by step type. Every change
 * is pushed up via `onUpdate` so the editor can re-version and log it. The
 * Action step shows the model-mode badge inline — it describes a transaction
 * that would occur but never executes (CLAUDE.md §8).
 */
export function StepConfig({
  step,
  onUpdate,
  teamOptions,
}: {
  step: FlowStep
  onUpdate: (patch: Partial<FlowStep>) => void
  teamOptions: string[]
}) {
  switch (step.type) {
    case "message":
      return (
        <Field label="Message the agent sends">
          <textarea
            rows={2}
            value={step.text}
            onChange={(e) => onUpdate({ text: e.target.value } as Partial<FlowStep>)}
            placeholder="What should the agent say?"
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      )

    case "collectInput":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Input name">
              <input
                value={step.inputName}
                onChange={(e) =>
                  onUpdate({ inputName: e.target.value } as Partial<FlowStep>)
                }
                placeholder="e.g. Amount"
                className={inputClass}
              />
            </Field>
            <Field label="Input type">
              <div className="flex flex-wrap gap-1.5">
                {INPUT_TYPES.map((it) => (
                  <button
                    key={it.value}
                    type="button"
                    onClick={() =>
                      onUpdate({ inputType: it.value } as Partial<FlowStep>)
                    }
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      step.inputType === it.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-fcmb-offwhite text-text-secondary ring-1 ring-inset ring-border hover:text-text-primary"
                    )}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Prompt to the customer">
            <input
              value={step.prompt}
              onChange={(e) =>
                onUpdate({ prompt: e.target.value } as Partial<FlowStep>)
              }
              placeholder="How should the agent ask for it?"
              className={inputClass}
            />
          </Field>
        </div>
      )

    case "validate":
      return (
        <div className="space-y-3">
          <Field label="Rule to check" hint="A check against a rule or placeholder data source — model mode does not run it.">
            <input
              value={step.rule}
              onChange={(e) => onUpdate({ rule: e.target.value } as Partial<FlowStep>)}
              placeholder="e.g. Amount ≥ fund minimum"
              className={inputClass}
            />
          </Field>
          <Field label="Data source (optional)">
            <input
              value={step.dataSource ?? ""}
              onChange={(e) =>
                onUpdate({ dataSource: e.target.value } as Partial<FlowStep>)
              }
              placeholder="e.g. Fund parameters (placeholder)"
              className={inputClass}
            />
          </Field>
        </div>
      )

    case "decision":
      return (
        <div className="space-y-3">
          <Field label="Condition to branch on">
            <input
              value={step.condition}
              onChange={(e) =>
                onUpdate({ condition: e.target.value } as Partial<FlowStep>)
              }
              placeholder="e.g. Is the customer verified?"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {step.branches.map((br, i) => (
              <Field key={i} label={`Branch ${i + 1} label`}>
                <input
                  value={br.label}
                  onChange={(e) => {
                    const branches = step.branches.map((b, j) =>
                      j === i ? { ...b, label: e.target.value } : b
                    )
                    onUpdate({ branches } as Partial<FlowStep>)
                  }}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </div>
      )

    case "action":
      return (
        <div className="space-y-3">
          <ModelModeBadge />
          <Field
            label="Transaction this step would perform"
            hint="Describe what would happen in production. This step never executes in the prototype."
          >
            <textarea
              rows={2}
              value={step.description}
              onChange={(e) =>
                onUpdate({ description: e.target.value } as Partial<FlowStep>)
              }
              placeholder="e.g. Submit the subscription order (placeholder)"
              className={cn(inputClass, "resize-y")}
            />
          </Field>
        </div>
      )

    case "confirm":
      return (
        <Field label="Confirmation prompt">
          <input
            value={step.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value } as Partial<FlowStep>)}
            placeholder="e.g. Confirm ₦{amount} into {fund}? (Yes / No)"
            className={inputClass}
          />
        </Field>
      )

    case "notify":
      return (
        <div className="space-y-3">
          <Field label="Notification message">
            <textarea
              rows={2}
              value={step.message}
              onChange={(e) =>
                onUpdate({ message: e.target.value } as Partial<FlowStep>)
              }
              placeholder="What the customer is told was sent"
              className={cn(inputClass, "resize-y")}
            />
          </Field>
          <Field label="Channel (optional)">
            <input
              value={step.channel ?? ""}
              onChange={(e) =>
                onUpdate({ channel: e.target.value } as Partial<FlowStep>)
              }
              placeholder="e.g. WhatsApp / email"
              className={inputClass}
            />
          </Field>
        </div>
      )

    case "escalate":
      return (
        <div className="space-y-3">
          <Field label="Hand over to team">
            <SearchSelect
              value={step.team}
              onChange={(v) => onUpdate({ team: v } as Partial<FlowStep>)}
              options={teamOptions}
              allowCustom
              placeholder="Search teams…"
              ariaLabel="Escalation team"
            />
          </Field>
          <Field label="Reason (optional)">
            <input
              value={step.reason ?? ""}
              onChange={(e) =>
                onUpdate({ reason: e.target.value } as Partial<FlowStep>)
              }
              placeholder="When this handover happens"
              className={inputClass}
            />
          </Field>
        </div>
      )
  }
}
