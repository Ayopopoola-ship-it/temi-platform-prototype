# Temi AI — FCMB Group Platform (Prototype)

High-fidelity interactive prototype for the **Temi AI Group Platform**: FCMB's
evolution of its live bank chatbot into shared, multi-tenant AI support and
workflow infrastructure for all FCMB Group entities.

This is a **design and behavioural specification**, not the production system.
It demonstrates the parts that do not exist yet — the Group Platform Console,
the Entity Admin Console, and the model-mode Flow Builder — so stakeholders and
the Temi Engineering team can align on a single target experience.

> **`CLAUDE.md` is the single source of truth for this build.** Read it before
> contributing.

## Tech stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config; FCMB design tokens in `src/index.css`)
- **shadcn/ui** (new-york style) — components installed on demand into `src/components/ui`
- React Router · Framer Motion · Lucide · React Hook Form + Zod · TanStack Table · Recharts · date-fns
- State via React Context only (no Redux/Zustand). All data mocked in `src/data`.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

## Project structure

See `CLAUDE.md` §11 for the full layout. In short:

```
src/
├── components/   ui · layout · group · entity · flow-builder · customer-chat
├── pages/        group · entity · CustomerChatDemo
├── context/      PersonaContext · PrototypeStateContext
├── data/         mock data (entities, flows, KB, security, analytics, …)
├── lib/          utils · permissions · flowModel
└── types/        shared TypeScript interfaces
```

## Deployment

Vercel, via GitHub auto-deploy on push to `main`. SPA routing is handled by
`vercel.json`.
