# Temi AI — FCMB Group Intelligent Support and Workflow Platform — Prototype Build Context

> **This is the single source of truth for the Temi Group Platform prototype build. Claude Code reads this on every session start. Do not begin work without reading this file end to end.**

---

## 1. What This Project Is

This is a **high-fidelity interactive prototype** for the Temi AI Group Platform: FCMB's evolution of its existing bank chatbot into shared AI support and workflow infrastructure for all FCMB Group entities. The prototype's purpose is to set the design, UX, and behavioural standard that the Temi Engineering team builds toward, and to align business stakeholders (Felicia, Sola, FADE) and the engineering team on a single shared vision.

**Critical framing:** Temi already exists and is live in production for FCMB Bank (WhatsApp, web, mobile), built on LangGraph, Corrective RAG, multi-model LLM routing, Chatwoot, and AWS. This prototype is NOT the production system and does NOT rebuild the live customer chat experience. It is a design and behavioural specification for the parts that do not exist yet: the multi-tenant platform layer, the entity admin console, the group platform console, and the Workflow / Flow Builder. Build it in React for speed, polish, and shareability. The Temi Engineering team will implement these in the production stack.

**What this prototype must demonstrate, in priority order:**
1. The **Group Platform Console** (what the Temi team sees across all entities)
2. The **Entity Admin Console** (what FADE at Asset Management sees and configures)
3. The **Workflow / Flow Builder in model mode** (the differentiating capability)

When in doubt about a design decision, the right answer is: "what gives stakeholders and engineers the clearest possible vision of the target experience?"

---

## 2. Business Context

FCMB Group is a Nigerian financial services group. The relevant entities for this platform are: FCMB Bank (the reference tenant, already live), FCMB Asset Management (the first new tenant, pilot), CSL Stockbrokers, Credit Direct Limited (CDL), FCMB Pensions, FCMB MFB, FCMB Trustees, and ROVA.

Temi was built as a single-entity bank chatbot. The product problem is that every other entity that wants AI support has no shared infrastructure, no onboarding path, and no standard. ROVA is already building its own divergent agent (Ruby) rather than being onboarded, which is the platform failure made concrete.

The strategy is to turn Temi into shared infrastructure with three layers: a shared core engine (no entity owns it), entity-specific configuration (each entity owns its knowledge base, flows, escalation, branding), and channel delivery (WhatsApp, web, mobile). FCMB Asset Management is the first entity onboarded under this model, and the onboarding becomes the repeatable playbook every other entity follows.

This is internal group infrastructure. There is no external customer and no subscription or billing. "Onboarding" means standing up a new entity tenant, not signing up a paying customer. Do not build any billing, pricing, or subscription UI.

The long-term direction is for Temi to become the intelligence and interaction layer of the FCMB financial superapp.

---

## 3. The Three Experiences (Critical for Conditional UI)

This prototype is not one app with one user. It is a platform with three distinct experiences, switched via the persona switcher. Conditional rendering based on the active persona is a core requirement.

### Experience 1: Group Platform Console (FCMB Bank Temi team)
- Sees ALL entities in one view
- Entity overview: status (Live, Onboarding, Pending), conversation volume, AI resolution rate, escalation rate per entity
- Group-level security status: open P0 / P1 count and remediation state
- Onboarding pipeline: which entity is at which playbook stage
- Can drill into any entity's detail (this access is shown as logged)
- Manages which shared capabilities exist for entities to enable

### Experience 2: Entity Admin Console (FADE, FCMB Asset Management)
- Sees ONLY their own entity's data (tenant isolation is visible and absolute)
- Knowledge base management: upload, version, activate documents; knowledge gap report
- Channel configuration: toggle WhatsApp / web / mobile, retrieve embed code
- Escalation routing: map intent categories to human teams
- Capability toggles: enable/disable what the agent can do (advice-type capabilities are NOT available to toggle on for Asset Management)
- Flow Builder: design transactional flows in model mode
- Entity analytics dashboard: volume, resolution rate, escalation rate, CSAT, knowledge gaps

### Experience 3: End Customer Conversation (demonstration only)
- A simulated chat interface showing what an Asset Management investor experiences
- This is NOT the focus and should NOT be over-built. The live Temi widget already demonstrates the customer chat. Build a clean, representative simulation that shows: accurate KB answer, a walked-through modelled flow, and a clean human handover. Mock the conversation; do not wire a real LLM in V1 unless explicitly instructed.

---

## 4. Personas for the Prototype

Build a persona switcher into the prototype header (visible only in prototype mode, clearly labelled "PROTOTYPE MODE"). It switches between these personas so stakeholders can experience each view:

| Persona Name | Role | Experience | Entity | Purpose |
|---|---|---|---|---|
| Temi Platform Admin | Group Platform Administrator | Group Console | FCMB Bank / Group | Default group-level view across all entities |
| FADE | Entity Admin / PM | Entity Admin Console | FCMB Asset Management | The pilot entity onboarding and management |
| Bank Ops Admin | Entity Admin | Entity Admin Console | FCMB Bank | Shows the reference tenant already live, for contrast |
| Investor (Demo) | End Customer | Customer Conversation | FCMB Asset Management | Demonstrates the investor support experience |

Notes:
- FADE is the central persona. Most of the prototype's value is in her console and her Flow Builder.
- The Temi Platform Admin persona is the executive anchor (the Felicia / Sola view of the whole platform).
- Keep the persona list short and purposeful. Do not invent additional personas without instruction.

---

## 5. Design System (FCMB Brand)

This is the same design system used for the FCMB PMS prototype. Reuse it exactly. No new design language.

### Primary Colors
- **FCMB Purple (Primary):** `#5C2D91` — primary actions, headers, brand, active nav
- **FCMB Yellow (Accent):** `#F5C518` — accent only, sparingly (matches the logo underline)
- **White:** `#FFFFFF` — backgrounds
- **Off-White / Light Gray:** `#F7F7F7` — secondary backgrounds, cards

### Status Colors
- **Green (Healthy / Live / Resolved):** `#16A34A`
- **Amber (At Risk / In Progress / Onboarding):** `#F59E0B`
- **Red (Critical / Blocked / Security P0-P1):** `#DC2626`

### Neutral Grays
- Text primary: `#111827`
- Text secondary: `#4B5563`
- Borders: `#E5E7EB`
- Disabled: `#9CA3AF`

### Typography
- Font family: Inter or system sans-serif (clean, modern, banking-appropriate)
- Headings: Semibold
- Body: Regular, 14-16px
- Small text: 12-13px

### Layout Principles
- Generous spacing (16px, 24px, 32px scale)
- Rounded corners: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons and inputs
- Subtle shadows for elevation, not heavy
- White cards on light gray background
- Persistent left sidebar navigation
- Persistent top header with persona switcher, search, notifications, user identity

### Visual Reference
Match the FCMB mobile banking aesthetic: deep purple primary actions on white, rounded cards, generous spacing. The reference product Sola admires for the platform concept is **Chatbase** (multi-tenant chatbot platform) — clean, modern, console-driven. Aim for that level of polish in the admin consoles. Avoid a bland admin-portal look.

---

## 6. Information Architecture

### Group Platform Console (Temi Platform Admin persona)
Left sidebar:
1. **Overview** — all entities at a glance (landing page)
2. **Entities** — list and detail of each entity tenant
3. **Onboarding Pipeline** — playbook stage tracker per onboarding entity
4. **Platform Security** — group-level P0/P1 status and remediation state
5. **Capabilities** — the shared capability catalogue entities can enable
6. **Settings**

### Entity Admin Console (FADE persona)
Left sidebar:
1. **Dashboard** — this entity's performance at a glance (landing page)
2. **Knowledge Base** — upload, version, activate documents; knowledge gap report
3. **Flows** — the Flow Builder (model mode)
4. **Channels** — WhatsApp / web / mobile config and embed codes
5. **Escalation** — intent-to-team routing matrix
6. **Capabilities** — capability toggles for this entity
7. **Analytics** — volume, resolution, escalation, CSAT
8. **Settings** — bot identity and tone

### Persistent Top Header (both consoles)
- FCMB logo (left)
- Persona switcher dropdown (clearly labelled "PROTOTYPE MODE")
- Active context indicator (which entity / which console you are in)
- Search
- Notifications bell
- User avatar with name, role, entity

---

## 7. V1 Prototype Scope (What Gets Built)

### IN SCOPE — Build These

1. **Persona Switcher and App Shell**
   - Top header persona dropdown switching between the four personas
   - The shell adapts: Group personas get the Group Console sidebar; Entity personas get the Entity Console sidebar
   - Clear visual indicator of which experience and which entity is active

2. **Group Platform Console — Overview (landing)**
   - Entity cards: name, status badge (Live / Onboarding / Pending), volume, resolution rate, escalation rate
   - Group summary stats: total entities, total conversations, average resolution rate, open P0/P1 security count
   - The security count is prominent and red when above zero (this is a deliberate stakeholder message)

3. **Group Platform Console — Entities**
   - List of all entities with status and key metrics
   - Entity detail view: drill into one entity's metrics and config (read-only from the group view), with a visible "access logged" indicator

4. **Group Platform Console — Onboarding Pipeline**
   - Visual pipeline showing the 7 playbook stages (Scoping, KB Prep, Flow Design, Configuration, Testing, Soft Launch, Live) plus the 2 gates (Security, Compliance)
   - Asset Management shown mid-pipeline as the active onboarding
   - Each stage shows status and what is outstanding

5. **Group Platform Console — Platform Security**
   - List of open P0/P1 security items with status (mock data based on the real backlog categories: credential exposure, RBAC, session handling, token revocation, PII logging)
   - This screen makes the security gate real and visible. Do not soften it.

6. **Entity Admin Console — Dashboard (FADE landing)**
   - Asset Management performance: conversation volume over time, AI resolution rate, escalation rate by intent, CSAT, knowledge gap count
   - Onboarding status indicator showing where Asset Management is in the playbook

7. **Entity Admin Console — Knowledge Base (Full Build)**
   - Document list with ingestion status (Uploaded, Indexed, Active, Error) and version history
   - Upload zone (drag-and-drop, simulated)
   - Activate / deactivate document versions without deleting history
   - Knowledge gap report: questions received that no active document answered
   - All changes shown as logged

8. **Entity Admin Console — Flow Builder (Full Build — THE DIFFERENTIATOR)**
   - See Section 8 below for the full Flow Builder specification. This is the most important and most novel screen in the prototype. Give it the most care.

9. **Entity Admin Console — Channels**
   - Toggle WhatsApp / web widget / mobile per entity
   - Web widget shows a copyable embed code snippet
   - Channels requiring central provisioning (WhatsApp number) show a status flag

10. **Entity Admin Console — Escalation Routing**
    - Editable matrix: intent category → human team / queue
    - A default fallback route
    - Add / edit / remove routing rules

11. **Entity Admin Console — Capabilities**
    - List of platform capabilities with toggles for this entity
    - Capabilities not yet available (e.g. live transaction execution) shown as disabled with a "v2.0" label
    - For Asset Management, advice-type capabilities are shown but locked OFF and not toggleable, with a compliance note

12. **Entity Admin Console — Analytics**
    - Fuller analytics view than the dashboard summary: trends, breakdowns by channel and intent, CSAT distribution, exportable

13. **End Customer Conversation (Demonstration)**
    - A simulated WhatsApp-style or web-widget-style chat showing an Asset Management investor: asking a balance/top-up question, getting an accurate KB answer, being walked through a modelled flow, and a clean handover to a human
    - Mocked conversation, scripted. Clearly a demonstration.

### DEFERRED (Do Not Build in V1)
- Live LLM integration in the customer chat (mock it unless instructed)
- Voice channel UI
- Customer memory features
- Live execution mode for flows (model mode only)
- Cross-entity customer identity / group intelligence layer
- Any billing, pricing, or subscription UI (there is none in this product)
- Real authentication or SSO
- CSL, CDL, Pensions, ROVA entity consoles (Asset Management and Bank only in V1; other entities appear only as cards/rows in the Group Console)

---

## 8. The Flow Builder (Detailed Spec — Most Important Screen)

The Flow Builder is what separates Temi from a configurable chatbot. It lets an entity admin (FADE) design the transactional flows they want the agent to follow, as an explicit, ordered, reviewable sequence. This is the screen stakeholders will remember.

### Model Mode constraint (LOCKED — do not deviate)
In V1 / v1.5 the Flow Builder is **model mode only**. Flows are designed, viewed, versioned, and reviewed by humans. They DO NOT execute. Every Action step is a placeholder describing what would happen, clearly labelled as non-executing. This is a compliance-critical constraint, not a UI preference. Never build or imply live transaction execution in V1.

### Flow structure
- A flow has: name, description, review status (Draft / In Review / Reviewed), version history
- A flow is an ordered list of steps, with decision branches
- Supported step types (V1, model mode):
  - **Message** — the agent says something
  - **Collect Input** — agent requests a typed input (e.g. account number, amount); has an input name and type
  - **Validate** — a check against a rule or placeholder data source (e.g. "amount ≥ fund minimum")
  - **Decision** — branch on a condition (yes/no paths)
  - **Action (Placeholder)** — describes a transaction that WOULD occur; visibly labelled "MODEL MODE — does not execute"
  - **Confirm** — customer confirmation step
  - **Notify** — a notification that would be sent
  - **Escalate** — handover to a named human team

### Builder UX
- A canvas or vertical sequence view showing the steps in order with branches visible
- Add a step, configure its fields, reorder, delete
- Every Action step renders with a clear model-mode badge
- A flow cannot be marked "Reviewed" / candidate for execution without all steps configured; for Asset Management, marking a flow as execution-candidate shows a "requires compliance review" flag (this is a v2.0 transition, shown but not actioned)
- Flow edits shown as logged with timestamp and actor

### The three pilot flows to pre-build (placeholder logic — FADE will correct)
These use sensible placeholder steps for a Nigerian asset manager. Label them clearly as draft placeholders pending FADE's input (open questions OQ-A, OQ-B).

1. **Balance Enquiry**: Identify customer → Validate account → Action(retrieve balance, placeholder) → Message(present balance) → Escalate(offer human)
2. **Subscription (top-up)**: Identify customer → Collect Input(fund) → Collect Input(amount) → Validate(amount ≥ minimum subscription) → Confirm → Action(subscribe, placeholder) → Notify(confirmation) → Escalate(on failure)
3. **Redemption**: Identify customer → Collect Input(fund and units) → Validate(units ≤ holding) → Confirm → Action(redeem, placeholder) → Message(state redemption timeline) → Notify(confirmation) → Escalate(on failure)

---

## 9. Locked Architectural Decisions (Do Not Deviate)

These are finalized. Do not redesign them.

1. **Flow Builder is model mode only in V1.** Flows never execute. Action steps are labelled placeholders. This is compliance-critical.
2. **Tenant isolation is absolute and visible.** An entity admin sees only their own entity. The Group admin can drill across entities, and that access is shown as logged. Never show one entity's data inside another entity's console.
3. **No advice capability for Asset Management.** Advice-type capabilities are shown but locked off and not toggleable, with a compliance note. The agent explains and informs; it never recommends, projects returns, or assesses suitability.
4. **Security gate is real and prominent.** The open P0/P1 count is surfaced in the Group Console and is red when above zero. Do not hide or soften it. The product story depends on it being visible.
5. **Three experiences, one shell.** Group Console and Entity Console are different sidebars and different content, switched by persona. The customer conversation is a demonstration, not a built product.
6. **No billing or subscription.** This is internal group infrastructure. There is no paying customer.
7. **Search boxes, not dropdowns**, for selecting entities, team members, or intents where a list could be long. Search with autocomplete (same convention as the PMS prototype).
8. **Mock all data.** No backend, no real LLM, no real integrations in V1.

---

## 10. Technology Stack (For This Prototype)

### Core
- **React 19** with **Vite** (originally specced as React 18; bumped to 19 during
  the foundation build because the current shadcn/ui + radix-ui stack is
  React-19-first — radix's `Primitive` uses React 19's ref-as-prop pattern and
  emits console errors under React 18 in dialog/popover/select paths. React 19 is
  the stable, ecosystem-aligned choice and keeps the console clean.)
- **TypeScript** (all files)
- **Tailwind CSS** (v4, CSS-first config; FCMB design tokens live in
  `src/index.css` via `@theme`, so there is no `tailwind.config.js`) for styling
- **shadcn/ui** for component library (install components as needed)

### Recommended Libraries
- **React Router** for routing (and for switching between the two console layouts)
- **Framer Motion** for transitions and micro-animations (especially the Flow Builder)
- **Lucide React** for icons
- **React Hook Form** + **Zod** for forms (knowledge base upload, flow step config, escalation rules)
- **TanStack Table** for entity lists, document lists, security item lists
- **Recharts** for analytics dashboards
- **date-fns** for dates

### State Management
- React Context for persona switching and active-entity state
- React Hook Form for form state
- No Redux or Zustand

### Deployment
- **Vercel** via GitHub auto-deploy on push to main

### What NOT to Use
- Do not use Next.js
- Do not use a separate backend (mock all data in JSON/TS files in `/src/data`)
- Do not implement real authentication
- Do not wire a real LLM into the customer chat in V1
- Do not use Redux or Zustand

---

## 11. Project Structure

```
temi-platform-prototype/
├── CLAUDE.md (this file)
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── public/
│   └── fcmb-logo.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css (Tailwind + design tokens as CSS variables)
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx (chooses console layout by persona)
│   │   │   ├── GroupSidebar.tsx
│   │   │   ├── EntitySidebar.tsx
│   │   │   ├── TopHeader.tsx
│   │   │   └── PersonaSwitcher.tsx
│   │   ├── group/ (overview, entities, pipeline, security, capabilities)
│   │   ├── entity/ (dashboard, knowledge-base, channels, escalation, capabilities, analytics)
│   │   ├── flow-builder/ (canvas, step types, step config, flow list)
│   │   └── customer-chat/ (the demonstration conversation)
│   ├── pages/
│   │   ├── group/ (Overview, Entities, EntityDetail, Pipeline, Security, Capabilities)
│   │   ├── entity/ (Dashboard, KnowledgeBase, Flows, FlowEditor, Channels, Escalation, Capabilities, Analytics, Settings)
│   │   └── CustomerChatDemo.tsx
│   ├── context/
│   │   ├── PersonaContext.tsx
│   │   └── PrototypeStateContext.tsx
│   ├── data/
│   │   ├── personas.ts
│   │   ├── entities.ts (all FCMB entities with status and metrics)
│   │   ├── knowledgeBase.ts (Asset Management mock documents)
│   │   ├── flows.ts (the three pilot flows, model mode)
│   │   ├── escalation.ts (Asset Management routing matrix)
│   │   ├── capabilities.ts (platform capability catalogue)
│   │   ├── securityItems.ts (mock P0/P1 items based on backlog categories)
│   │   └── analytics.ts (mock conversation/resolution/CSAT data)
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── permissions.ts (persona-based access: group vs entity, tenant isolation)
│   │   └── flowModel.ts (flow + step type definitions and helpers)
│   └── types/
│       └── index.ts (Entity, Persona, Flow, Step, KBDocument, SecurityItem, etc.)
└── vercel.json
```

---

## 12. Coding Conventions

- **Functional components** with hooks only. No class components.
- **TypeScript** for all files. Interfaces in `src/types/index.ts`.
- **Tailwind utility classes** for all styling. No CSS modules or styled-components.
- **shadcn/ui components** wherever a primitive exists. Install with `npx shadcn@latest add <component>`.
- Component file names: PascalCase. Variables/functions: camelCase. Constants: SCREAMING_SNAKE_CASE.
- Always handle loading and empty states explicitly.
- Use semantic HTML (`button`, `nav`, `main`, `section`, `header`).
- Accessibility: every interactive element has a clear label or aria-label.
- Mobile-responsive by default. Test at 375px, 768px, 1280px. (The admin consoles are desktop-first but must not break on mobile.)
- **Suppress Co-Authored-By git attribution on all commits.** Do not add Claude as a co-author.

### Active Plugins (Use Proactively)
- **Frontend Design:** Use for every component, layout, and design decision. This prototype must set a high visual bar (Chatbase-level polish in the consoles, a genuinely impressive Flow Builder). Non-negotiable.
- **Context7:** Use before installing or using any library (shadcn/ui, react-hook-form, framer-motion, TanStack Table, Recharts) to fetch current docs.
- **Code Review:** Run on request at the end of a phase.
- **Security Guidance (deprioritized):** This is a prototype with no real auth, backend, or data. Do not over-trigger security warnings on simulated flows or mock data. Note: the prototype DEPICTS security status as content (the P0/P1 screen) — that is mock display data, not a real vulnerability to flag.

---

## 13. Definition of "Done" for Each Component

1. Renders correctly at mobile, tablet, desktop widths.
2. Respects the active persona: Group personas see only the Group Console; entity personas see only their own entity (tenant isolation holds).
3. Uses the FCMB design system colors and spacing consistently.
4. All interactive elements have hover and focus states.
5. Loading and empty states handled.
6. Does not break when switching personas mid-session.
7. Console is clean (no errors or warnings).
8. For the Flow Builder: every Action step shows the model-mode badge; no step implies live execution.

---

## 14. What to Do When Stuck

If you hit ambiguity this document does not resolve, **stop and ask in the chat**. Do not invent business logic, and especially do not invent fund process details for Asset Management (those are pending FADE's input — see OQ-A, OQ-B in the PRD). The product owner is Ayodeji Popoola.

Common ambiguities and defaults:
- "What should this button do?" → If not specified, non-functional with a console.log placeholder, and flag it in your response.
- "What data should populate this?" → Use the mock data files. For Asset Management fund details, use clearly-labelled placeholder data, not invented specifics presented as real.
- "Modal or new page?" → Modals for quick actions and confirmations. New pages for substantial workflows (the Flow editor is a full page).

---

## 15. Out of Scope — Do Not Build

- Real authentication or SSO
- Real LLM calls in the customer chat (V1 mocks the conversation)
- Live flow execution (model mode only)
- Real integrations (LangGraph, Chatwoot, AWS, IMS core)
- Billing, pricing, subscription
- Voice channel
- Customer memory
- Cross-entity customer identity / group intelligence
- Full consoles for CSL, CDL, Pensions, ROVA (they appear only as entries in the Group Console)
- Dark mode (light mode only for V1)
- Multi-language support

---

*End of context document. Read this before every Claude Code session on this project.*
