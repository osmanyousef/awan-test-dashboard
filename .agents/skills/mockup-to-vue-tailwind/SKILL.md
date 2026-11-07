---
name: mockup-to-vue-tailwind
description: Use when the user shares an HTML mockup, screenshot or design reference to be implemented in our Vue + Tailwind app.
---

# Mockup to Vue + Tailwind Implementation Skill

Transform external visual specifications (HTML mockups, design screenshots, reference pages) into clean, production-ready Vue 3 SFCs using Tailwind CSS, adhering strictly to our component library, design tokens, and two-phase approval workflow.

> [!IMPORTANT]
> The HTML mockup is a **VISUAL SPECIFICATION ONLY**. Do not copy its code, inline scripts, hardcoded hex values, or mock state. Implement the UI using our existing component library and design tokens.

---

## Two-Phase Workflow

### PHASE 1 – Audit & Plan (STOP & WAIT FOR APPROVAL)
**DO NOT WRITE ANY PRODUCTION CODE IN PHASE 1.**

When a design reference or HTML mockup is provided:
1. **Read `design-map.md`** at the project root for token and component mappings. Create or update it if missing.
2. **Audit current project capabilities**:
   - Check `src/tokens/tokens.css` and `src/style.css`
   - Check component library in `src/components/` and `src/layout/`
   - Check existing composables, routing, icons, and i18n
3. **Produce a structured audit report** containing:
   - **a. Color / Token Map**: Map each color in the mockup to an existing token by meaning (not raw hex). If close, map and note the small difference. If missing, list under "Missing tokens" with a proposed semantic name.
   - **b. Component Map**: Map every visual element to one of:
     1. Existing component as-is
     2. Existing component with a new prop, slot, or variant
     3. Tailwind utilities only using theme tokens
     4. New small component (with proposed name and file path)
   - **c. Gaps & Risks**: Identify complex widgets (dual-handle sliders, donut charts, sticky blurred headers, complex autocomplete dropdowns).
   - **d. File Action List**: Explicit list of files to be created or modified.
4. **STOP and wait for user approval** before proceeding to Phase 2.

---

### PHASE 2 – Implementation (Only After User Approval)

Follow this strict priority order for every UI element:
1. **Existing component as-is**
2. **Existing component extended** in a backward-compatible way (new prop, optional slot, variant)
3. **Tailwind utilities** using our theme tokens
4. **New small component** following our conventions (keep SFCs < 200 lines)
5. **Custom CSS only as a last resort**, with an explicit code comment explaining why Tailwind utilities could not achieve it.

---

## Core Rules & Constraints

1. **App Patterns Win**: If the mockup conflicts with an established app pattern (e.g. navigation structure, header, page shell, button style), our app wins. Inform the user of the divergence.
2. **Backward Compatibility**: Never break existing components used on other pages.
3. **Component Sizing**: Keep each SFC small and focused. Extract any component over ~200 lines into sub-components.
4. **No Hardcoded Hex**: Use CSS variables / Tailwind tokens (`var(--color-primary)`, `border-[#d3dff1]`, etc.).
5. **Accessibility**: Maintain accessible `<label>` associations, ARIA attributes, semantic tags, and focus-visible states.
6. **Icons**: Use established SVG icons or SVG components matching the app's style. Do not copy arbitrary inline SVGs from the mockup without sanitization.
7. **RTL & Internationalization**:
   - For layout direction, use Tailwind logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `rtl:*`).
   - Never use physical `left-*`, `right-*`, `ml-*`, `mr-*`.
8. **Verification & Testing**:
   - Run typecheck and build (`npm run build`) with exit code 0.
   - Verify visually against the reference screenshot.
9. **Update `design-map.md`**:
   - Record every new token and component mapping created during implementation.

---

## Color Intent Mapping Reference

| Semantic Intent | Reference Intent | Existing Project Token | Implementation |
|---|---|---|---|
| Primary Blue | `#5b81d0` (nav `#6389d8 → #4e75c4`) | `--color-primary` / `--color-primary-hover` | `text-[var(--color-primary)]` / `bg-[#4a6cc0]` |
| Dark Ink | `#0f172a` | `--color-text` / Ink | `text-[#0c1f44]` or `text-slate-900` |
| Secondary Text | `#475169` | `--color-text` / Sub | `text-[#3d4a66]` or `text-slate-700` |
| Muted Text | `#8791ab` | `--color-text-muted` | `text-[#63708b]` or `text-slate-500` |
| Border | `#e4e9f1` | `--color-border` | `border-[#d3dff1]` or `border-slate-200` |
| Input Background | `#f4f6fb` | `--color-surface-hover` | `bg-white` or `bg-[#f8faff]` |
| Soft Blue Background | `#eaf0fc` | `--color-primary-light` | `bg-[#e9effb]` or `bg-[#f0f4fa]` |
| Canvas Background | `#e0e6ef → #d4dce9` | `--color-bg` | `bg-[#eef3fa]` with radial dot pattern |
| Cards Surface | `#ffffff`, 16–18px radius | `--color-surface` | `bg-white rounded-2xl border border-[#d3dff1]` |
| Confirmed (Green) | `#0d8a58` / `#e1f6ec` | `--color-success` | `bg-[#e5f6ee] text-[#0d8a58]` |
| Pending (Amber) | `#a16207` / `#fff2d1` | `--color-warning` | `bg-[#fff4dc] text-[#9a5a06]` |
| Cancelled (Red) | `#c0362c` / `#fde8e8` | `--color-danger` | `bg-[#fdecec] text-[#b42318]` |
| Amended (Blue) | `#3c5bd0` / `#e4ecfd` | `--color-info` | `bg-[#e9effb] text-[#4a6cc0]` |
| Flight Tint | `#3b6fc4` / `#e3eefd` | Flight Accent | `bg-blue-50 text-blue-700` |
| Hotel Tint | `#b7791f` / `#fff0cf` | Hotel Accent | `bg-amber-50 text-amber-800` |

