# Temi AI — FCMB Group Platform (Prototype)

High-fidelity interactive prototype for the **Temi AI Group Platform**: FCMB's
evolution of its live bank chatbot into shared, multi-tenant AI support and
workflow infrastructure for all FCMB Group entities.

This is a **design and behavioural specification**, not the production system.
It demonstrates the parts that do not exist yet — the Group Platform Console,
the Entity Admin Console, and the model-mode Flow Builder — so stakeholders and
the Temi Engineering team can align on a single target experience. All data is
mocked; there is no backend, no real authentication, and no LLM.

> **`CLAUDE.md` is the single source of truth for this build.** Read it before
> contributing.

## Tech stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config; FCMB design tokens in `src/index.css`,
  no `tailwind.config.js`)
- **shadcn/ui** — primitives installed on demand into `src/components/ui`
- React Router · Framer Motion · Lucide · React Hook Form + Zod · TanStack Table · Recharts · date-fns
- State via React Context only (no Redux/Zustand). All data mocked in `src/data`.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # type-check (tsc -b) + production build
npm run lint     # eslint
npm run preview  # preview the production build locally
```

## The three experiences and four personas

The prototype is **one shell that adapts to the active persona**. Use the
persona switcher in the top header (labelled **PROTOTYPE MODE**) to move between
the three distinct experiences. The whole console — sidebar and content —
changes with the persona, and tenant isolation is absolute: an entity admin
only ever sees their own entity's data.

| Persona | Experience | Scope | What it shows |
|---|---|---|---|
| **Temi Platform Admin** | Group Platform Console | FCMB Group | Every entity at a glance — status, volume, AI resolution, escalation — plus the group security gate and the onboarding pipeline. The executive anchor. |
| **FADE** | Entity Admin Console | FCMB Asset Management | The pilot entity. Knowledge base, the **Flow Builder**, channels, escalation routing, capabilities and analytics. Most of the prototype's value lives here. |
| **Bank Ops Admin** | Entity Admin Console | FCMB Bank | The already-live reference tenant, shown for contrast. |
| **Investor (Demo)** | Customer Conversation | FCMB Asset Management | A scripted, web-widget-style investor chat demonstration — an accurate knowledge-base answer, a guided modelled flow, and a clean human handover. Mocked end to end. |

**Group Platform Console** (`/group/*`) — Overview, Entities (+ drill-in, access
logged), Onboarding Pipeline, Platform Security, Capabilities, Settings.

**Entity Admin Console** (`/entity/*`) — Dashboard, Knowledge Base, Flows
(+ full-page Flow editor), Channels, Escalation, Capabilities, Analytics,
Settings.

**Customer Conversation** (`/chat`) — the demonstration; no sidebar.

### Locked behaviours worth seeing

- **Flow Builder is model mode only** — flows are designed, versioned and
  reviewed but never execute. Every Action step carries a
  "MODEL MODE — does not execute" badge.
- **No advice for Asset Management** — advice-type capabilities are shown but
  locked off; in the customer demo Temi explicitly declines to advise.
- **Security gate is visible** — the open P0/P1 count is surfaced in the Group
  Console and shown red when above zero.
- **Tenant isolation** — switching persona never leaks one entity's data into
  another's console.

## Project structure

See `CLAUDE.md` §11 for the full layout. In short:

```
src/
├── components/   ui · layout · group · entity · flow-builder · customer-chat
├── pages/        group · entity · CustomerChatDemo
├── context/      PersonaContext (active persona) · FlowsContext (flow state)
├── data/         mock data (entities, flows, KB, security, analytics, …)
├── lib/          utils · format · audit · flowModel
└── types/        shared TypeScript interfaces
```

## Deployment

Deployed on **Vercel** via GitHub auto-deploy on push to `main`. Client-side
SPA routing (deep links such as `/entity/flows/:id`) is handled by the rewrite
in `vercel.json`, which serves `index.html` for all paths.
