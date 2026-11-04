---
name: html-to-vue
description: >-
  Use this skill when the user provides raw HTML (from another AI or design tool)
  and wants it converted into a clean Vue 3 page or component using Tailwind CSS.
  Activated when the user pastes a large HTML block and asks to "turn it into Vue",
  "convert to components", "port this to our stack", or similar. Strips out all
  functionality (forms, logic, state) and focuses ONLY on UI/UX, layout, and routing.
  Checks for existing reusable components before creating new ones.
---

# HTML → Vue Converter Skill

Convert raw HTML from external AI tools into clean, lightweight Vue 3 SFCs using Tailwind CSS v4, following this project's established patterns.

---

## Project Context

**Stack**: Vue 3 + `<script setup>` + TypeScript + Tailwind CSS v4 + Vue Router  
**Workspace**: `d:\Awan\frontend-test\booking_dashboard`  
**Design tokens** (from `src/tokens/tokens.css` and inline Tailwind classes):

| Token | Value |
|---|---|
| Page bg | `#eef3fa` + dot pattern |
| Navy hero | `#0c1f44` |
| Primary blue | `#4a6cc0` |
| Border | `#d3dff1` |
| Muted text | `#63708b` |
| Sub text | `#3d4a66` |
| Ink | `#0c1f44` |
| Success | `#0d8a58` / `#e5f6ee` |
| Warning | `#9a5a06` / `#fff4dc` |
| Error | `#b42318` / `#fdecec` |

---

## Rules — What to Keep vs. Ignore

### ✅ KEEP (UI/UX only)
- Visual layout: hero sections, cards, sidebars, grids, flex rows
- Typography: headings, labels, body text, font weights
- Colors, borders, shadows, spacing, rounded corners
- Icons (inline SVG only — no icon libraries)
- Route `<router-link>` navigation between pages
- Empty/placeholder form fields (no v-model, no validation)
- Tabs, accordions, modals (static open/close state only)
- Responsive layout classes

### ❌ IGNORE / STRIP OUT
- All JavaScript logic, computed values, watchers
- Form validation and error messages
- API calls, data fetching
- Multilingual strings (Arabic, RTL — keep English only)
- Any new Navbar/Header (the existing `SiteHeader.vue` is used for all pages)
- Any new global layout wrapper (the existing `PageShell.vue` handles it)
- Authentication / login flows
- Animations beyond simple CSS transitions already in Tailwind

---

## Reusable Components — Check Before Creating

Before writing any new component, check if it already exists:

```
src/components/flights/
  ├── FlightStepHero.vue      ← Blue navy hero banner + 01 02 03 steps wizard + back button
  ├── BookingSummarySidebar.vue ← Sticky booking summary card + mobile bottom bar
  ├── TripCheckBar.vue        ← Route/date/cabin double-check info bar
  ├── FlightLegTimeline.vue   ← Flight segment legs + layover notices
  └── FlightPolicySummary.vue ← Cancellation & change policy card

src/composables/
  └── useFlightBooking.ts     ← All flight data, pricing, segments (use in flight pages)

src/components/
  ├── BaseButton.vue
  ├── BaseCard.vue
  ├── BaseInput.vue
  ├── BaseSelect.vue
  ├── BaseModal.vue
  └── StatusPill.vue
```

**Use these if they match the UI.** Only create a new component if the pattern is genuinely new and would appear on 2+ pages.

---

## Step-by-Step Conversion Process

### Step 1 — Analyze the HTML
1. Identify the page name from context (e.g., "Hotel Search Results", "Booking Confirmation")
2. Identify every distinct visual section: hero, navbar chips, cards, sidebars, tables, modals
3. Note which sections appear only on this page vs. which are shared across pages

### Step 2 — Plan the Component Structure
Decide before writing code:
- Which existing components to reuse (list them)
- Which new components to extract (name + props)
- Target file name: `src/pages/<PageName>Page.vue`

### Step 3 — Convert the HTML

**Card pattern** (use everywhere for white content boxes):
```vue
<section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
```

**Page wrapper** (all booking/results pages):
```vue
<div class="min-h-screen bg-[#eef3fa] bg-[radial-gradient(rgba(12,31,68,0.07)_1px,transparent_1.2px)] bg-[size:18px_18px] text-[#0c1f44]">
```

**Two-column layout** (content + sidebar):
```vue
<div class="max-w-[1080px] mx-auto px-5 pb-16">
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
```

**Badge/pill** (status indicators):
```vue
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]">
```

**Section label** (small uppercase category headers):
```vue
<div class="text-xs font-bold uppercase tracking-wider text-[#63708b] mb-3">Label</div>
```

**Info box** (highlight notice):
```vue
<div class="p-3 rounded-xl bg-[#eef3fa] text-xs text-[#63708b] flex items-start gap-2.5">
```

**Form input** (static/placeholder, no v-model):
```vue
<input type="text" placeholder="..." class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]" />
```

**Primary button**:
```vue
<button class="w-full h-11 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm rounded-xl transition-all cursor-pointer">
```

**Ghost/outline button**:
```vue
<button class="h-9 px-4 rounded-xl border border-[#4a6cc0] text-[#4a6cc0] text-xs font-semibold bg-white hover:bg-[#eef3fa] transition-all cursor-pointer">
```

### Step 4 — Write the Vue SFC

Structure every new page like this:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Import ONLY existing reusable components needed
// NO logic, NO API calls, NO validation

const router = useRouter()

// ONLY static display state if needed for tabs/toggles
const activeTab = ref('details')
</script>

<template>
  <div class="min-h-screen bg-[#eef3fa] ...">
    <!-- Sections mapped directly from HTML -->
  </div>
</template>
<!-- NO <style scoped> unless absolutely unavoidable -->
```

### Step 5 — Add Route (if new page)
Add to `src/router/index.ts`:
```ts
{
  path: '/your/path',
  component: () => import('../pages/YourPage.vue'),
}
```
Check `PageShell.vue` to see if `isFlushPage` needs updating (add the route if the page has a full-bleed hero/no padding).

### Step 6 — Verify Build
```bash
npm --prefix d:\Awan\frontend-test\booking_dashboard run build
```
Build must pass with **zero TypeScript errors**. Fix any unused import or type error before finishing.

---

## Output Quality Checklist

Before declaring done, verify:
- [ ] No `<style scoped>` blocks with custom CSS — Tailwind only
- [ ] No Arabic text, RTL attributes, or bilingual strings
- [ ] No new navbar/header created (uses existing `SiteHeader.vue`)
- [ ] No business logic, only static/display state
- [ ] All existing reusable components used where applicable
- [ ] Build passes with `npm run build`
- [ ] File is under ~200 lines (if longer, extract more components)

---

## Example Usage Trigger

User says:
> "Here's the HTML from Claude for the hotel detail page — convert it to Vue"

You respond by:
1. Reading the HTML
2. Identifying sections
3. Listing reusable components to use
4. Writing the Vue page (no logic, Tailwind only)
5. Running build
