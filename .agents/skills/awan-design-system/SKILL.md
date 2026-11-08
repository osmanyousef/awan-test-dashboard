---
name: awan-design-system
description: MUST be used for any UI work in the Awan Travel frontend (booking dashboard, Vue 3 + Tailwind v4) — styling, colors, tokens, new components, contrast, RTL/Arabic, dark mode, or converting mockups. Defines the token system, component standards, contrast rules and the pre-change audit.
license: Proprietary (Awan Travel project)
metadata:
  version: "1.0.0"
  owner: Awan frontend
---

# Awan Design System

The single source of truth for visual decisions. Takes precedence over generic design
skills (frontend-design, web-design-guidelines) and over the hex snippets in the older
`html-to-vue` and `mockup-to-vue-tailwind` skills.

## 0. Before any UI change (required)

1. Read `src/tokens/tokens.css`, `src/style.css`, and `design-map.md`.
2. List the existing components that could cover the request (`src/components/`, `src/layout/`,
   feature folders). Reuse → extend (new prop/slot/variant) → compose with token utilities →
   new small component. Custom CSS last, with a comment saying why.
3. Note which other pages use any component you plan to change; keep changes backward compatible.
4. If the project has a `components.json`, it is a shadcn-vue project: also load the `shadcn-vue`
   skill and use its semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`,
   `border-border`, `bg-primary`). Do not mix the two token vocabularies in one project.

## 1. Token inventory (booking_dashboard)

All tokens live in `src/tokens/tokens.css`. Brand colors are fixed — do not change their values
without explicit approval.

| Role | Token | Notes |
|---|---|---|
| Primary | `--color-primary` (#5782ce) | Brand blue. See contrast limits below |
| Primary hover / strong | `--color-primary-hover` (#44659c) | Passes AA with white text |
| Primary tint | `--color-primary-light`, `--color-primary-subtle` | Chips, selected rows |
| Secondary | `--color-secondary` | |
| Accent | `--color-accent`, `--color-accent-hover` | |
| Navy / ink | `--color-navy*` | Hero, header |
| Background | `--color-bg` | Page canvas |
| Surface | `--color-surface`, `--color-surface-hover` | Cards, inputs |
| Text primary | `--color-text` | |
| Text secondary / muted | `--color-text-muted` | ≥4.5:1 on surface and bg |
| Text inverse | `--color-text-inverse` | On filled primary/navy |
| Border | `--color-border`, `--color-border-focus` | |
| Success / Warning / Error / Info | `--color-success|warning|danger|info` + `-light` | |
| Radius | `--radius-sm|md|lg|xl|full` | |
| Spacing | `--space-1…8` (4px base) | Tailwind spacing is also 4px-based |
| Type | `--font-sans`, `--font-size-xs…3xl` | |
| Shadows | `--shadow-sm|md|lg` | |
| Layering | `--z-dropdown|modal|toast` | |
| Layout | `--container-max-width`, `--header-*` | |

Missing today (add as tokens when first needed, never inline): text-secondary distinct from
muted, breakpoints (use Tailwind defaults `sm md lg xl 2xl` until defined), component heights
(`--control-h-sm|md|lg`), motion (`--duration-fast|base`, `--ease-standard`), focus ring.

## 2. Color rules

- No hex, rgb or hsl in components. No Tailwind palette classes (`bg-slate-900`, `text-gray-500`,
  `bg-blue-50`). Use tokens.
- Today the tokens are plain CSS variables, so Tailwind usage is `bg-[var(--color-surface)]`,
  `text-[var(--color-text-muted)]`, `border-[var(--color-border)]`. This is the correct form until
  the tokens are registered with Tailwind (see §6).
- A new color needs a semantic name and a reason. It must sit in the existing blue/navy family
  or be a semantic status color, and pass §3 before it is used.
- Product tints (flight, hotel, wallet) currently use palette classes in `design-map.md`; treat
  them as missing tokens (`--color-product-flight`, …) and add them before new usage.
- Don't communicate state with color alone: pair status color with text or an icon.
- Never set `class="dark"` on an element; theme switching happens on `<html>` only.

## 3. Contrast (WCAG 2.2 AA)

Text 4.5:1 (3:1 for ≥24px or ≥18.66px bold). UI boundaries, icons and focus indicators 3:1.

Measured on current tokens — respect these until the token fixes in §6 land:

| Pair | Ratio | Use |
|---|---|---|
| white on `--color-primary` | 3.83 | **Fails for normal text.** Filled buttons with 14px text must use `--color-primary-hover` as background, or large/bold text only |
| white on `--color-primary-hover` | 5.85 | OK for filled buttons |
| `--color-primary` text on surface | 3.83 | Large text, icons, borders only — not body links |
| `--color-text-muted` on surface / bg | 4.96 / 4.59 | OK |
| `--color-success` on `--color-success-light` | 2.24 | **Fails.** Needs a darker success text token |
| `--color-danger` on `--color-danger-light` | 3.95 | **Fails** for small text |
| `--color-info` on `--color-info-light` | 3.09 | **Fails** for small text |
| `--color-border` on surface | 1.45 | Fine for card dividers; **input outlines need 3:1** |
| focus ring `--color-primary-light` on surface | 1.10 | **Invisible.** Use a `--color-border-focus` outline ≥2px |

Check new pairs with a contrast calculation before shipping; report the ratio in the PR.

## 4. Component standards

- Base components: `BaseButton` (variants primary/secondary/ghost/danger, sizes sm/md/lg),
  `BaseInput`, `BaseSelect`, `BaseModal`, `BaseTabs`, `BaseCard`, `StatusPill`, `DataTable`,
  `EmptyState`, `FormField`, `PageHeader`, `ToastNotification`. Extend these; don't fork them.
- Every interactive component: semantic element (`button`, `a`/`RouterLink`, `label`), visible
  `:focus-visible` style, disabled and loading states, keyboard support, `aria-*` where native
  semantics are not enough. Dialogs trap focus, close on Escape, and have a title.
- Inputs: associated `<label>` (via `FormField`), error text linked with `aria-describedby`,
  `aria-invalid` on error.
- States to design for every data view: loading (skeleton), empty (`EmptyState`), error, and success.
- Props typed with `defineProps<…>()`; variants as string unions; no boolean explosions
  (`primary`, `secondary` booleans) — use `variant`.
- Size budget: SFCs aim for under ~200 lines of template+script. Over that, look for a separable
  responsibility (see `vue-best-practices` §"Choose useful boundaries"); don't split arbitrarily.

## 5. Layout, RTL, numerals, responsive

- Logical properties only: `ms-* me-* ps-* pe-* start-* end-* text-start text-end`, `rtl:` variants.
  No `ml-* mr-* pl-* pr-* left-* right-*` for direction-dependent spacing.
- Western Arabic numerals (0–9) in every language. Format with `Intl.*Format('ar-EG-u-nu-latn', …)`
  for Arabic. Tabular numbers (`tabular-nums`) for prices, PNRs, flight numbers.
- Mobile-first. Verify at 360px, 768px, 1280px. Touch targets ≥ 24×24px (44px preferred for primary actions).
- Container: `.layout-container` (max 1520px). Don't invent new page wrappers.

## 6. Planned token fixes (needs approval — do not apply during unrelated work)

1. Register tokens with Tailwind v4 by moving the color/radius/shadow/font tokens into
   `@theme static { … }` in `tokens.css` (`static` makes Tailwind emit every variable, not only
   the ones it detects as used). They are emitted as the same `:root` variables, so existing
   `var(--color-*)` usage keeps working, and utilities like `bg-surface`, `text-text-muted`,
   `border-border`, `rounded-lg` become available.
2. Add AA-safe tokens: `--color-primary-strong` (filled button bg), `--color-success-text`
   (≈#047857, 4.84:1 on success-light), `--color-warning-text` (≈#92400e), `--color-danger-text`,
   `--color-info-text` (≈#3b5fa8), `--color-input-border` (≥3:1), `--color-focus-ring`.
3. Reconcile `design-map.md` with `tokens.css` (it lists a different canvas value and hex
   classes that contradict the no-hex rule).
4. If dark mode is required: add a `.dark` block that overrides the same variable names.

## 7. Done checklist

- [ ] No hex/palette classes added (`grep -nE '#[0-9a-fA-F]{3,8}|-(slate|gray|blue|amber|emerald)-[0-9]'` on changed files)
- [ ] New/changed colour pairs meet §3
- [ ] Focus visible, keyboard path works, labels present
- [ ] Logical (RTL-safe) spacing; Western numerals
- [ ] Reused/extended existing components; `design-map.md` updated for new tokens/components
- [ ] `npm run build` passes (vue-tsc with noUnusedLocals/noUnusedParameters)
