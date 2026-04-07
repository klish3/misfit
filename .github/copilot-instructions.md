## Purpose
Short, actionable guidance for AI coding agents working on this repo. Focus on the concrete patterns, hotspots, and commands needed to be productive immediately.

## Quick start (what to run)
- Install: `yarn` (Node.js 16+)
- Dev server: `yarn dev` (Vite at http://localhost:5173)
- Build: `yarn build` (runs `tsc -b && vite build`)
- Preview production build: `yarn preview`
- Lint: `yarn lint` (ESLint)

## Project overview (big picture)
- Single-page React + TypeScript app scaffolded with Vite. Entry: `src/main.tsx` → `src/App.tsx`.
- UI: Tailwind CSS (see `tailwind.config.js`) and `src/index.css`.
- State: MobX State Tree (MST). Root store: `src/store/RootStore.ts`. Provider: `src/store/index.ts`.
- Main UI surface: `src/components/ChatApp.tsx` (sidebar, message list, input). This file contains the simulated AI response code and is the primary integration point for back-end APIs.

## Important patterns & conventions (do not invent behavior)
- Path alias: `@` → `src` is configured in `vite.config.ts` and `tsconfig.json`. Use imports like `import { useStore } from '@/store'`.
- MST usage: create and mutate state only via MST actions defined in `RootStore` and models (`Message`, `Conversation`). Example actions: `createConversation()`, `selectConversation(id)`, `deleteConversation(id)`, `Conversation.addMessage(...)`. Avoid direct mutations outside actions.
- Components that read reactive state are wrapped with `observer` from `mobx-react-lite` (see `ChatApp`), so use `useStore()` to access the store in components.
- UI behavior: `ChatApp.handleSendMessage` simulates the assistant with a `setTimeout`. Replace or augment this area to integrate a real API (search for `// Simulate AI response` in `src/components/ChatApp.tsx`).
- Message model fields: `id`, `content`, `role` (`user`|`assistant`), `timestamp`, `isLoading`. Actions: `setContent`, `setLoading`.
- Input UX: pressing Enter (without Shift) sends; Shift+Enter inserts newline (see `ChatInput` in `ChatApp.tsx`).

## Where to change behavior / integration points
- Integrate HTTP/API: `src/components/ChatApp.tsx` → `handleSendMessage`. `axios` is already a dependency if you need it.
- Persisting conversations: there is no persistence implemented; add persistence inside MST actions in `RootStore` (e.g., after `createConversation`, `addMessage`, etc.) to ensure consistent state updates.

## Build & CI notes
- TypeScript: `build` runs `tsc -b` before `vite build` to ensure type checks. If adding new tsconfigs or packages, update `tsconfig.node.json` if required.
- Lint: the repo includes an ESLint `lint` script. Run it before commits.

## Small examples (copyable)
- Importing the store/provider:
  - `import { StoreProvider } from '@/store'` (used in `src/App.tsx`)
- Selecting a conversation from code:
  - `store.selectConversation(conversationId)` (see usage inside `Sidebar` in `ChatApp.tsx`)

## Tests & missing parts
- There are no automated tests present in the repo. If you add tests, prefer small unit tests around MST actions and a light integration test for `ChatApp` behavior.

## Files to inspect first when changing features
- `src/components/ChatApp.tsx` — main UI + integration point
- `src/store/RootStore.ts` & `src/store/index.ts` — global state shape and actions
- `vite.config.ts` & `tsconfig.json` — aliasing and build target
- `package.json` — scripts (`dev`, `build`, `preview`, `lint`)

If anything here is unclear or you need more examples (e.g., a suggested test harness, persistence example, or API wiring snippet), tell me which area to expand.
