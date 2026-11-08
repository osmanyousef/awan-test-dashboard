# Rule: Frontend Engineering Standards (always on)

Priorities, in order: **maintainability → consistency → reusability → accessibility → visual quality → performance.**
Never trade code quality for speed of delivery.

## Skill routing

| Task | Load |
|---|---|
| Any `.vue` / composable / Vite work | `vue-best-practices` (always), `vue-router-best-practices` when touching routes/guards |
| Any styling, colour, component or layout work | `awan-design-system` (always for UI) |
| Extracting reusable logic into `useX()` | `create-adaptable-composable` |
| Project has `components.json` (Laravel repo) | `shadcn-vue` |
| Forms, dialogs, keyboard, screen readers, contrast | `accessibility` |
| Bundle size, slow pages, large lists, images | `performance` |
| Reviewing finished UI | `web-design-guidelines` |
| HTML mockup / screenshot to implement | `mockup-to-vue-tailwind` (see `mockup-workflow.md`) |

Precedence when skills disagree: this rule file → `awan-design-system` → `vue-best-practices` → everything else.
The colour snippets in `html-to-vue` and `mockup-to-vue-tailwind` that use raw hex (`bg-[#4a6cc0]`, `border-[#d3dff1]`)
and palette classes are superseded by `awan-design-system` §2. `html-to-vue`'s "strip Arabic/RTL" applies only
to throwaway static ports, never to production pages.

## Before modifying an existing project

1. Inspect structure, framework, dependencies, and conventions (`package.json`, `vite.config.ts`, `tsconfig*`).
2. Inspect tokens (`src/tokens/tokens.css`), global CSS, and `design-map.md`.
3. Identify the reusable components and composables that already cover the need.
4. Identify every page that uses code you will touch; keep changes backward compatible.
5. Propose changes before rebuilding anything that works. Don't replace the design system because another is preferred.

## Architecture

- `pages/` compose; they don't implement whole interfaces. A page wires route params, composables and section components.
- `components/` (base primitives) → `components/common/` (shared project components) → `components/<feature>/` (flights, hotels, dashboard) for feature sections.
- `composables/useX.ts` own stateful/business logic; `utils/` hold pure functions; `config/` holds static data and nav.
- One responsibility per component. Extract when it reduces what a reader must understand — not by line count alone. Single-use components are fine.
- Props down, events up; typed `defineProps`/`defineEmits`. `v-model` only for true two-way contracts.
- No direct DOM manipulation where Vue provides a way (refs, directives, `Teleport`).
- File size is a review signal: SFCs over ~200 lines and any file over ~400 lines need a boundary review. Never create a 1,000+ line file.
- Naming: `PascalCase.vue` components (`Base*` for primitives, `<Feature><Thing>` for feature parts), `useCamelCase.ts` composables, `camelCase.ts` utils.

## CSS

- Tailwind utilities with design tokens first. Scoped `<style>` only for what utilities can't express, using `var(--…)` tokens.
- No hardcoded colours, no inline `style=` for static values, no `!important` (except to override third-party CSS, with a comment), selectors nested at most 2 levels, no new global stylesheet rules outside `style.css`/`tokens.css`.

## JavaScript / TypeScript

- Follow the existing language: this project is TypeScript; don't introduce TS into a JS-only project unless asked.
- Build must pass `npm run build` (`vue-tsc -b` with `noUnusedLocals`/`noUnusedParameters`). Remove unused imports and params.
- No new dependencies without stating why an existing one or a small util won't do.

## Accessibility & i18n (non-negotiable)

- WCAG 2.2 AA contrast; visible focus; keyboard reachable; semantic HTML before ARIA; labels on every control.
- Logical spacing (`ms/me/ps/pe/start/end`) for RTL; Western Arabic numerals (0–9) in every locale.
- Responsive at 360 / 768 / 1280px.

## Not now

Refactoring existing pages is a separate, approved task. Known oversized files (HomePage ~78 KB, FlightResultsPage ~68 KB,
HotelDetailsPage ~47 KB, HotelResultsPage ~37 KB, ManualServicesPage ~32 KB, WalletPage ~29 KB, SiteHeader ~25 KB) are
candidates, but don't touch them during unrelated work.
