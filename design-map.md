# Design Map: Tokens & Component Registry

> Maintained by the `mockup-to-vue-tailwind` skill. Contains current mappings from visual specs / design references to established tokens and reusable components.

---

## 1. Color & Theme Tokens Map

All colors must map by **meaning** to our CSS custom properties (`src/tokens/tokens.css`) or standard Tailwind utility classes. **Never hardcode hex values.**

| Intent / Semantic Role | Mockup Color Intent | Existing Token (`tokens.css`) | Tailwind Class / CSS Var | Small Differences / Notes |
|---|---|---|---|---|
| **Primary Blue** | `#5b81d0` | `--color-primary: #5782ce` | `text-[var(--color-primary)]` / `bg-[#4a6cc0]` | Awan Primary Blue |
| **Primary Hover** | `#4e75c4` | `--color-primary-hover: #44659c` | `hover:bg-[var(--color-primary-hover)]` | Slightly deeper blue |
| **Primary Light / Tint** | `#eaf0fc` | `--color-primary-light: #f0f4fa` | `bg-[var(--color-primary-light)]` | Soft blue tint for chips & active states |
| **Dark Ink / Headings** | `#0f172a` | `--color-text: #1f2b38` | `text-[#0c1f44]` or `text-slate-900` | Deep slate ink for strong contrast |
| **Secondary Text** | `#475169` | `--color-text: #1f2b38` / sub | `text-[#3d4a66]` or `text-slate-700` | Labels, form field titles |
| **Muted Text** | `#8791ab` | `--color-text-muted: #5e7287` | `text-[#63708b]` or `text-slate-500` | Subtitles, helper text |
| **Borders** | `#e4e9f1` | `--color-border: #ccd8e6` | `border-[#d3dff1]` / `border-slate-200` | Clean structural card & input border |
| **Input Background** | `#f4f6fb` | `--color-surface-hover: #f8fafc` | `bg-white` or `bg-[#f8faff]` | Clean input fill |
| **Page Canvas BG** | `#e0e6ef → #d4dce9` | `--color-bg: #e0e8f0` | `bg-[#eef3fa]` with radial dot pattern | Official Awan platform canvas |
| **Cards Surface** | `#ffffff`, 16-18px | `--color-surface: #ffffff` | `bg-white rounded-2xl border border-[#d3dff1]` | Standard card container |

### Status Colors

| Status | Mockup Intent | Existing Token / Classes | Purpose |
|---|---|---|---|
| **Confirmed / Success** | `#0d8a58` / `#e1f6ec` | `--color-success: #10b981`, `bg-[#e5f6ee] text-[#0d8a58]` | Confirmed bookings, check-in, valid items |
| **Pending / Warning** | `#a16207` / `#fff2d1` | `--color-warning: #f59e0b`, `bg-[#fff4dc] text-[#9a5a06]` | Pending approval, non-refundable notice |
| **Cancelled / Danger** | `#c0362c` / `#fde8e8` | `--color-danger: #dc2626`, `bg-[#fdecec] text-[#b42318]` | Cancelled bookings, errors, voids |
| **Amended / Info** | `#3c5bd0` / `#e4ecfd` | `--color-info: #5782ce`, `bg-[#e9effb] text-[#4a6cc0]` | Modifications, info pills |

### Product Type Tints

| Product Type | Mockup Intent | Implementation Classes |
|---|---|---|
| **Flight** | `#3b6fc4` / `#e3eefd` | `bg-blue-50 text-blue-700 border-blue-200` |
| **Hotel** | `#b7791f` / `#fff0cf` | `bg-amber-50 text-amber-800 border-amber-200` |
| **Wallet / Credit** | `#0d8a58` / `#e1f6ec` | `bg-emerald-50 text-emerald-800 border-emerald-200` |

---

## 2. Component Registry

| Component Name | File Path | Props / Usage |
|---|---|---|
| **SiteHeader** | `src/layout/SiteHeader.vue` | B2B OTA top utility bar + blue navigation toolbar |
| **PageShell** | `src/layout/PageShell.vue` | Global layout wrapper, handles header, sidebar, flush pages |
| **FlightStepHero** | `src/components/flights/FlightStepHero.vue` | `:current-step="1\|2\|3"`, `:title`, `:subtitle`, `:back-label`, `:back-route` |
| **HotelStepHero** | `src/components/hotels/HotelStepHero.vue` | `:current-step="1\|2\|3"`, `:title`, `:subtitle`, `:back-label`, `:back-route` |
| **BookingSummarySidebar** | `src/components/flights/BookingSummarySidebar.vue` | Flight review & payment sidebar with fares & passengers |
| **HotelBookingSidebar** | `src/components/hotels/HotelBookingSidebar.vue` | Hotel stay sidebar with room info, stay dates, total price, and sticky action |
| **PassportOcrScanner** | `src/components/common/PassportOcrScanner.vue` | Real client-side OCR drag & drop scanner with MRZ parsing |
| **PnrSearchDropdown** | `src/components/common/PnrSearchDropdown.vue` | Live PNR search with dropdown suggestions and keyboard `/` shortcut |
| **DashboardKpiCard** | `src/components/dashboard/DashboardKpiCard.vue` | Metric stat card with title, large monospace value, subtitle, progress bar |
| **BookingsDonutChart** | `src/components/dashboard/BookingsDonutChart.vue` | SVG donut chart with interactive hover breakdown and month selector |
| **NotificationsCard** | `src/components/dashboard/NotificationsCard.vue` | Notification feed with unread filter, unread count badge, mark-read action |
| **BaseButton** | `src/components/BaseButton.vue` | Primary, secondary, outline, text buttons |
| **BaseInput** | `src/components/BaseInput.vue` | Form input with label, error message, leading/trailing icons |
| **BaseSelect** | `src/components/BaseSelect.vue` | Form select dropdown |
| **StatusPill** | `src/components/StatusPill.vue` | Status badge (`confirmed`, `pending`, `cancelled`, etc.) |
| **BaseModal** | `src/components/BaseModal.vue` | Modal dialog with header, body, footer slots |

---

## 3. Typography & RTL Standards

- **English font**: `Inter` / `Poppins`, system-ui fallback.
- **Numbers / Codes / Monospace**: Monospace / tabular numbers for amounts, PNR codes, flight numbers.
- **RTL Support**: Use Tailwind logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `rtl:*`). Never hardcode `ml-*`, `mr-*`, `left-*`, `right-*`.

