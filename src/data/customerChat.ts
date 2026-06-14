/**
 * Scripted customer conversation for the End Customer Conversation
 * demonstration (CLAUDE.md §3 Experience 3, §7.13).
 *
 * This is a DEMONSTRATION, not a built product. The conversation is entirely
 * mocked (no LLM, CLAUDE.md §15). It shows one happy-path arc for an FCMB
 * Asset Management customer:
 *   (a) an accurate, knowledge-base-grounded answer with NO advice given
 *       (the no-advice guardrail, CLAUDE.md §9.3);
 *   (b) the agent walking the customer through the modelled Top-up flow as
 *       guidance, explicitly NOT live execution (model mode, §8/§9.1);
 *   (c) a clean handover to a named human team that carries context and does
 *       not make the customer repeat themselves.
 *
 * Figures (e.g. the ₦5,000 minimum) are illustrative placeholders for the
 * demo, consistent with the placeholder fund data elsewhere (OQ-A/OQ-B).
 */

export type ChatSender = "temi" | "customer" | "human"

interface BaseEvent {
  id: string
}

export interface TextEvent extends BaseEvent {
  kind: "text"
  sender: ChatSender
  text: string
  /** Knowledge-base citation shown beneath the bubble (a grounded answer). */
  source?: string
  /** Display name for a human agent (handover phase). */
  senderName?: string
  /** Team label for a human agent. */
  senderTeam?: string
}

export interface GuidedStepsEvent extends BaseEvent {
  kind: "guidedSteps"
  title: string
  note: string
  steps: { label: string; value: string }[]
  footnote: string
}

export interface HandoverEvent extends BaseEvent {
  kind: "handover"
  team: string
  context: { label: string; value: string }[]
}

export type ChatEvent = TextEvent | GuidedStepsEvent | HandoverEvent

/** The sender used for typing-indicator + bubble alignment of any event. */
export function eventSender(e: ChatEvent): ChatSender {
  return e.kind === "text" ? e.sender : "temi"
}

/** How long the "typing…" indicator shows before an agent/human event. */
export function typingDurationFor(e: ChatEvent): number {
  if (e.kind === "text") {
    return Math.min(2000, Math.max(650, e.text.length * 20))
  }
  return 1300
}

export const CUSTOMER_NAME = "Ada Obi"

export const CHAT_SCRIPT: ChatEvent[] = [
  {
    id: "m1",
    kind: "text",
    sender: "temi",
    text: "Hi 👋 I'm Temi, FCMB Asset Management's digital assistant. How can I help you today?",
  },
  {
    id: "m2",
    kind: "text",
    sender: "customer",
    text: "Hi Temi. I've got some cash sitting idle. Should I move it into the Money Market Fund now?",
  },
  {
    id: "m3",
    kind: "text",
    sender: "temi",
    text: "I'm not able to give investment advice or recommend timing. Only a licensed advisor can do that. What I can do is explain exactly how the Money Market Fund and top-ups work, so the decision is yours. Would that help?",
  },
  {
    id: "m4",
    kind: "text",
    sender: "customer",
    text: "Yes please. How does a top-up work, and is there a minimum?",
  },
  {
    id: "m5",
    kind: "text",
    sender: "temi",
    text: "You can top up your Money Market Fund on any business day. Top-ups start from a ₦5,000 minimum and are processed at the next available unit price. There's no charge to add funds.",
    source: "Money Market Fund Factsheet (v2)",
  },
  {
    id: "m6",
    kind: "text",
    sender: "customer",
    text: "Great. Can you help me add ₦50,000 to it?",
  },
  {
    id: "m7",
    kind: "text",
    sender: "temi",
    text: "Of course. I'll guide you through each step. Just so you know: I'll prepare everything, but I don't move money myself. A specialist places the order securely at the end.",
  },
  {
    id: "m8",
    kind: "guidedSteps",
    title: "Top-up: guided walkthrough",
    note: "I'll walk you through each step. Nothing is processed until our team confirms it with you.",
    steps: [
      { label: "Confirm it's you", value: "Verified" },
      { label: "Choose the fund", value: "Money Market Fund" },
      { label: "Enter the amount", value: "₦50,000" },
      { label: "Check the minimum", value: "₦50,000 ≥ ₦5,000" },
      { label: "Your confirmation", value: "Required next" },
      { label: "Order placed by our team", value: "On handover" },
      { label: "Confirmation sent to you", value: "After processing" },
    ],
    footnote: "Guidance only. Temi prepares the request but never moves money.",
  },
  {
    id: "m9",
    kind: "text",
    sender: "customer",
    text: "Yes, that's right, go ahead.",
  },
  {
    id: "m10",
    kind: "text",
    sender: "temi",
    text: "Perfect, everything's prepared. Because placing the order is a secured action, I'm connecting you to our Investment Operations team to complete it. They can see everything we've covered, so you won't need to repeat anything.",
  },
  {
    id: "m11",
    kind: "handover",
    team: "Investment Operations",
    context: [
      { label: "Customer", value: "Ada Obi · identity verified" },
      { label: "Request", value: "Money Market Fund top-up" },
      { label: "Amount", value: "₦50,000" },
      { label: "Source", value: "Web chat · handed over by Temi" },
    ],
  },
  {
    id: "m12",
    kind: "text",
    sender: "human",
    senderName: "Tunde",
    senderTeam: "Investment Operations",
    text: "Hi Ada, I'm Tunde from Investment Operations. I can see your request to top up ₦50,000 into the Money Market Fund, and that Temi has already verified you, so I have everything I need. I'll place that now and you'll get a confirmation shortly.",
  },
  {
    id: "m13",
    kind: "text",
    sender: "customer",
    text: "Thank you, that was easy!",
  },
  {
    id: "m14",
    kind: "text",
    sender: "human",
    senderName: "Tunde",
    senderTeam: "Investment Operations",
    text: "You're welcome, Ada. Have a great day 👋",
  },
]
