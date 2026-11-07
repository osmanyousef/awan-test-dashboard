<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/common/BrandLogo.vue'
import { dashboardStats } from '../config/mockData'

const route = useRoute()
const router = useRouter()

// ── State ───────────────────────────────────────────────────
const plusOpen = ref(false)
const sugOpen = ref(false)
const pnrQuery = ref('')
const selectedType = ref('SubAgency')
const customerName = ref('')
const lang = ref<'en' | 'ar'>('en')
const pnrInputRef = ref<HTMLInputElement | null>(null)

// Sample booking data matching mockup
const bookings = [
  { ref: 'WD-HFB0B39', pnr: 'K7XP2M', t: 'f', cu: 'yousefreg2003', d: 'TIP → DXB · Round trip', s: 'confirmed' },
  { ref: 'WD-F192A02', pnr: 'R3QZ9N', t: 'f', cu: 'Al-Madar Travel', d: 'BEN → IST', s: 'confirmed' },
  { ref: 'WD-HA0571F', pnr: 'HC-55821', t: 'h', cu: 'yousefreg2003', d: 'Atlantis The Palm, Dubai', s: 'confirmed' },
  { ref: 'WD-H9938B1', pnr: 'HC-55701', t: 'h', cu: 'Sahara Tours', d: 'Four Seasons Hotel Cairo', s: 'pending' },
  { ref: 'FLT-78400', pnr: 'M8LD4V', t: 'f', cu: 'Blue Sky Agency', d: 'CDG → SIN', s: 'confirmed' },
  { ref: 'WD-F5C310', pnr: 'Z2HN7W', t: 'f', cu: 'Sahara Tours', d: 'TIP → CAI', s: 'cancelled' },
]

const SC: Record<string, [string, string]> = {
  confirmed: ['#e1f6ec', '#0d8a58'],
  pending: ['#fff2d1', '#a16207'],
  cancelled: ['#fde8e8', '#c0362c'],
}

const filteredBookings = computed(() => {
  const q = pnrQuery.value.trim().toLowerCase()
  if (!q) return bookings.slice(0, 5)
  return bookings.filter(b =>
    [b.ref, b.pnr, b.cu, b.d].join(' ').toLowerCase().includes(q)
  ).slice(0, 5)
})

function executePnr(pnrVal?: string) {
  const val = (pnrVal ?? pnrQuery.value).trim()
  sugOpen.value = false
  if (val) {
    router.push({ path: '/operations/bookings', query: { search: val } })
  } else {
    router.push('/operations/bookings')
  }
}

function selectBooking(b: typeof bookings[0]) {
  pnrQuery.value = b.pnr
  executePnr(b.pnr)
}

function toggleLang() {
  lang.value = lang.value === 'en' ? 'ar' : 'en'
  document.documentElement.lang = lang.value
  document.documentElement.dir = lang.value === 'ar' ? 'rtl' : 'ltr'
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.pw')) {
    plusOpen.value = false
  }
  if (!target.closest('.pnr')) {
    sugOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)) {
    e.preventDefault()
    pnrInputRef.value?.focus()
    sugOpen.value = true
  }
  if (e.key === 'Escape') {
    sugOpen.value = false
    plusOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})

// ── Navigation Bar Items ────────────────────────────────────
interface NavTab {
  key: string
  label: string
  labelAr: string
  to: string
  icon: string
  badge?: number
}

const navItems: NavTab[] = [
  { key: 'quo', label: 'Quotation',       labelAr: 'عروض الأسعار',        to: '/dashboard',            icon: 'quo' },
  { key: 'flt', label: 'Flight',          labelAr: 'الطيران',             to: '/flights',              icon: 'flt' },
  { key: 'htl', label: 'Hotel',           labelAr: 'الفنادق',             to: '/hotels',               icon: 'htl' },
  { key: 'off', label: 'Manual Services', labelAr: 'خدمات يدوية',         to: '/operations/manual-services', icon: 'off' },
  { key: 'usr', label: 'Profile',         labelAr: 'الملف الشخصي',        to: '/account',              icon: 'usr' },
  { key: 'bk',  label: 'Bookings',        labelAr: 'الحجوزات',            to: '/operations/bookings',  icon: 'bk' },
  { key: 'msg', label: 'Messages',        labelAr: 'الرسائل',             to: '/operations/amendments', icon: 'msg', badge: 3 },
  { key: 'dsr', label: 'DSR',             labelAr: 'التقرير اليومي',       to: '/finance/statement',    icon: 'dsr' },
  { key: 'cr',  label: 'CR Request',      labelAr: 'طلب تغيير / استرداد', to: '/operations/amendments', icon: 'cr' },
  { key: 'rep', label: 'Reports',         labelAr: 'التقارير',            to: '/finance/statement',    icon: 'rep' },
]

const isDashActive = computed(() => route.path === '/dashboard' || route.path === '/')

function isItemActive(item: NavTab) {
  if (item.key === 'flt') return route.path === '/flights' || route.path.startsWith('/flights/')
  if (item.key === 'htl') return route.path === '/hotels' || route.path.startsWith('/hotels/')
  if (item.to === '/dashboard') return false
  return route.path === item.to || route.path.startsWith(item.to)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
</script>

<template>
  <header class="hdr">

    <!-- ══ UTIL BAR ══ -->
    <div class="util">
      <div class="wrap">

        <!-- Logo -->
        <RouterLink to="/dashboard" class="logo" aria-label="Awan Travel">
          <BrandLogo class="brand-svg" />
        </RouterLink>

        <!-- PNR search with live suggestion popover -->
        <div class="pnr" id="pw">
          <input
            ref="pnrInputRef"
            v-model="pnrQuery"
            type="text"
            placeholder="Retrieve PNR"
            autocomplete="off"
            aria-label="Retrieve PNR"
            @focus="sugOpen = true"
            @input="sugOpen = true"
            @keydown.enter.prevent="executePnr()"
          />
          <button type="button" class="go" aria-label="Search" @click="executePnr()">
            <svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          </button>

          <!-- Suggestions Dropdown -->
          <div class="sug" :class="{ on: sugOpen }">
            <h6>{{ pnrQuery ? 'Matches' : 'Recent' }}</h6>
            <template v-if="filteredBookings.length > 0">
              <button
                v-for="b in filteredBookings"
                :key="b.ref"
                type="button"
                @click="selectBooking(b)"
              >
                <span class="t" :style="{ background: b.t === 'f' ? '#e3eefd' : '#fff0cf', color: b.t === 'f' ? '#3b6fc4' : '#b7791f' }">
                  <svg v-if="b.t === 'f'" class="i" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
                  <svg v-else class="i" viewBox="0 0 24 24"><path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M3 21h18M8 8h2M8 12h2M8 16h2"/></svg>
                </span>
                <span>
                  <b class="mono">{{ b.pnr }}</b>
                  <small>{{ b.ref }} · {{ b.cu }} · {{ b.d }}</small>
                </span>
                <em :style="{ background: SC[b.s][0], color: SC[b.s][1] }">{{ b.s }}</em>
              </button>
            </template>
            <div v-else class="none">
              No booking found for “{{ pnrQuery }}”. Press Enter to search anyway.
            </div>
          </div>
        </div>

        <!-- Quick create button & dropdown -->
        <div class="pw">
          <button
            type="button"
            class="plus"
            aria-label="Quick create"
            :aria-expanded="plusOpen"
            @click.stop="plusOpen = !plusOpen"
          >
            <svg class="i" viewBox="0 0 24 24" style="width:20px;height:20px">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div class="menu" :class="{ on: plusOpen }">
            <RouterLink to="/flights" @click="plusOpen = false">
              <i style="background:#e3eefd;color:#3b6fc4">
                <svg class="i" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              </i>
              <span>New flight booking</span>
            </RouterLink>

            <RouterLink to="/hotels" @click="plusOpen = false">
              <i style="background:#fff0cf;color:#b7791f">
                <svg class="i" viewBox="0 0 24 24"><path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M3 21h18M8 8h2M8 12h2M8 16h2"/></svg>
              </i>
              <span>New hotel booking</span>
            </RouterLink>

            <RouterLink to="/dashboard" @click="plusOpen = false">
              <i style="background:#efe9ff;color:#6a3fe0">
                <svg class="i" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>
              </i>
              <span>New quotation</span>
            </RouterLink>

            <RouterLink to="/operations/manual-services" @click="plusOpen = false">
              <i style="background:#e1f6ec;color:#0d8a58">
                <svg class="i" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>
              </i>
              <span>Manual service</span>
            </RouterLink>
          </div>
        </div>

        <!-- Type Selector -->
        <label class="fld ty">
          <span>Type</span>
          <select v-model="selectedType">
            <option value="SubAgency">SubAgency</option>
            <option value="Agency">Agency</option>
            <option value="Corporate">Corporate</option>
          </select>
        </label>

        <!-- Customer Name Input -->
        <label class="fld nm">
          <span>Name</span>
          <input
            v-model="customerName"
            type="text"
            placeholder="Customer name"
            autocomplete="off"
          />
        </label>

        <!-- Balance Widget with Top Up Button -->
        <div class="bal">
          <div>
            <span>Balance</span>
            <b class="mono">{{ formatCurrency(dashboardStats.walletBalance) }} LYD</b>
          </div>
          <RouterLink to="/finance/wallet" class="topup-btn">
            Top up
          </RouterLink>
        </div>

        <!-- Language Button -->
        <button type="button" class="lang" @click="toggleLang" :aria-label="lang === 'en' ? 'Switch to Arabic' : 'Switch to English'">
          <svg class="i" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
          </svg>
          <span class="lang-text">{{ lang === 'en' ? 'العربية' : 'English' }}</span>
        </button>

      </div>

      <!-- ══ MAIN NAV BAR ══ -->
      <div class="wrap navw">
        <nav class="nav" aria-label="Main">

          <!-- Dashboard Circular Button -->
          <RouterLink
            to="/dashboard"
            class="dash"
            :class="{ on: isDashActive }"
            aria-label="Dashboard"
            title="Dashboard"
          >
            <svg class="i" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
          </RouterLink>

          <!-- Nav Items with Exact SVGs and Badges -->
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            :class="{ on: isItemActive(item) }"
          >
            <!-- Quotation -->
            <svg v-if="item.icon === 'quo'" class="i" viewBox="0 0 24 24">
              <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6" />
            </svg>

            <!-- Flight -->
            <svg v-else-if="item.icon === 'flt'" class="i" viewBox="0 0 24 24">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>

            <!-- Hotel -->
            <svg v-else-if="item.icon === 'htl'" class="i" viewBox="0 0 24 24">
              <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M3 21h18M8 8h2M8 12h2M8 16h2" />
            </svg>

            <!-- Offline Request -->
            <svg v-else-if="item.icon === 'off'" class="i" viewBox="0 0 24 24">
              <path d="M4 14v-2a8 8 0 0116 0v2M4 14h3v5H5a1 1 0 01-1-1zM20 14h-3v5h2a1 1 0 001-1z" />
            </svg>

            <!-- Profile -->
            <svg v-else-if="item.icon === 'usr'" class="i" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>

            <!-- Bookings -->
            <svg v-else-if="item.icon === 'bk'" class="i" viewBox="0 0 24 24">
              <rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 11h6M9 15h4" />
            </svg>

            <!-- Messages -->
            <svg v-else-if="item.icon === 'msg'" class="i" viewBox="0 0 24 24">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>

            <!-- DSR -->
            <svg v-else-if="item.icon === 'dsr'" class="i" viewBox="0 0 24 24">
              <path d="M5 20V10M12 20V4M19 20v-7" />
            </svg>

            <!-- CR Request -->
            <svg v-else-if="item.icon === 'cr'" class="i" viewBox="0 0 24 24">
              <path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M20 4v5h-5M4 20v-5h5" />
            </svg>

            <!-- Reports -->
            <svg v-else class="i" viewBox="0 0 24 24">
              <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 13h6M9 17h4" />
            </svg>

            <span>{{ lang === 'ar' ? item.labelAr : item.label }}</span>
            <span v-if="item.badge" class="bd">{{ item.badge }}</span>
          </RouterLink>

        </nav>
      </div>
    </div>

  </header>
</template>

<style scoped>
/* ══ EXACT CSS SPECIFICATION FROM MOCKUP ══ */
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-header-atmosphere, linear-gradient(180deg, rgba(235, 242, 252, 0.96) 0%, rgba(228, 238, 251, 0.92) 100%));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(220, 230, 244, 0.7);
}
.util {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(1.5) blur(14px);
  -webkit-backdrop-filter: saturate(1.5) blur(14px);
  border-bottom: 1px solid #e4e9f1;
  box-shadow: 0 6px 20px -16px rgba(40, 70, 140, 0.5);
}
.wrap {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 24px;
}
.util .wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding-top: 10px;
  padding-bottom: 10px;
}
svg.i {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
}
.mono {
  font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  margin-inline-end: 8px;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.logo:hover {
  opacity: 0.9;
}
.brand-svg {
  height: 27px;
  width: auto;
  display: block;
}

/* PNR search */
.pnr {
  position: relative;
  flex: 0 1 300px;
  min-width: 200px;
}
.pnr input {
  width: 100%;
  height: 46px;
  padding: 0 56px 0 14px;
  border: 1px solid #d9e0ee;
  background: #fff;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: 0.15s;
}
:global(html[dir="rtl"]) .pnr input {
  padding: 0 14px 0 56px;
}
.pnr input:focus {
  outline: 0;
  border-color: #5b81d0;
  box-shadow: 0 0 0 4px rgba(91, 129, 208, 0.16);
}
.pnr .go {
  position: absolute;
  inset-inline-end: 5px;
  top: 5px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: #1f2b45;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.15s;
}
.pnr .go:hover {
  background: #5b81d0;
}

/* Suggestions Popover */
.sug {
  position: absolute;
  inset-inline-start: 0;
  top: 52px;
  width: min(420px, 92vw);
  background: #fff;
  border: 1px solid #e4e9f1;
  border-radius: 14px;
  box-shadow: 0 20px 40px -18px rgba(30, 50, 100, 0.45);
  padding: 6px;
  display: none;
  z-index: 70;
}
.sug.on {
  display: block;
}
.sug h6 {
  margin: 8px 10px 4px;
  font-size: 10.5px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #8791ab;
  font-weight: 600;
}
.sug button {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: start;
  transition: background 0.1s;
}
.sug button:hover {
  background: #eaf0fc;
}
.sug .t {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex: none;
}
.sug b {
  display: block;
  font-size: 13px;
  color: #0f172a;
}
.sug small {
  color: #8791ab;
  font-size: 11.5px;
}
.sug em {
  margin-inline-start: auto;
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
}
.sug .none {
  padding: 16px;
  text-align: center;
  color: #8791ab;
  font-size: 13px;
}

/* Quick create (+) */
.pw {
  position: relative;
}
.plus {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 1px dashed #b7c6e6;
  background: #fff;
  color: #5b81d0;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.2s;
}
.plus:hover,
.plus[aria-expanded="true"] {
  background: #5b81d0;
  border: 1px solid #5b81d0;
  color: #fff;
}
.plus svg {
  transition: transform 0.25s;
}
.plus[aria-expanded="true"] svg {
  transform: rotate(45deg);
}

/* Quick Create Menu */
.menu {
  position: absolute;
  inset-inline-start: 0;
  top: 54px;
  min-width: 230px;
  background: #fff;
  border: 1px solid #e4e9f1;
  border-radius: 14px;
  box-shadow: 0 20px 40px -18px rgba(30, 50, 100, 0.45);
  padding: 6px;
  display: none;
  z-index: 70;
}
.menu.on {
  display: block;
  animation: up 0.2s ease;
}
.menu a {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 11px;
  border-radius: 10px;
  color: #0f172a;
  font-weight: 500;
  font-size: 13.5px;
  text-decoration: none;
  cursor: pointer;
}
.menu a:hover {
  background: #eaf0fc;
}
.menu a i {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-style: normal;
}
@keyframes up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Fields (Type / Name) */
.fld {
  position: relative;
  height: 46px;
  border: 1px solid #d9e0ee;
  border-radius: 12px;
  background: #fff;
  padding: 5px 12px 0;
  transition: 0.15s;
}
.fld:focus-within {
  border-color: #5b81d0;
  box-shadow: 0 0 0 4px rgba(91, 129, 208, 0.16);
}
.fld span {
  display: block;
  font-size: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8791ab;
  font-weight: 600;
}
.fld select,
.fld input {
  width: 100%;
  border: 0;
  background: none;
  padding: 0;
  font-size: 13.5px;
  font-weight: 500;
  outline: 0;
  margin-top: 1px;
  color: #0f172a;
}
.fld select {
  appearance: none;
  cursor: pointer;
}
.fld.ty {
  width: 160px;
}
.fld.nm {
  flex: 1;
  min-width: 150px;
  max-width: 260px;
}

/* Balance */
.bal {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 6px 0 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7f9fe, #eaf0fc);
  border: 1px solid #d9e3f6;
  white-space: nowrap;
}
.bal span {
  display: block;
  font-size: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8791ab;
  font-weight: 600;
}
.bal b {
  font-size: 15px;
  letter-spacing: -0.3px;
  color: #0f172a;
}
.bal .topup-btn {
  height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: #fff;
  color: #5b81d0;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.15s;
}
.bal .topup-btn:hover {
  background: #5b81d0;
  color: #fff;
}

/* Language */
.lang {
  height: 40px;
  padding: 0 13px;
  border: 1px solid #d9e0ee;
  border-radius: 11px;
  background: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-inline-start: auto;
  color: #0f172a;
  transition: 0.15s;
}
.lang:hover {
  border-color: #b9cbee;
  color: #5b81d0;
}

/* Main Nav */
.navw {
  padding-top: 12px;
  padding-bottom: 12px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px;
  border-radius: 18px;
  background: linear-gradient(180deg, #6389d8, #4e75c4);
  box-shadow: 0 14px 28px -16px rgba(50, 90, 170, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  overflow-x: auto;
  scrollbar-width: none;
}
.nav::-webkit-scrollbar {
  display: none;
}
.nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 15px;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s;
}
.nav a:hover {
  background: rgba(255, 255, 255, 0.16);
}
.nav a.on {
  background: #fff;
  color: #4a70c0;
  box-shadow: 0 4px 12px -4px rgba(20, 40, 100, 0.45);
}
.nav a.dash {
  width: 46px;
  padding: 0;
  justify-content: center;
  margin-inline-end: 6px;
  background: #fff;
  color: #4a70c0;
  border-radius: 50%;
  height: 42px;
}
.nav a .bd {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ff6b5e;
  color: #fff;
  font-size: 10.5px;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .fld.ty,
  .fld.nm {
    display: none;
  }
}
@media (max-width: 980px) {
  .bal .topup-btn {
    display: none;
  }
  .bal {
    padding-inline-end: 14px;
  }
}
@media (max-width: 700px) {
  .wrap {
    padding: 0 12px;
  }
  .util .wrap {
    flex-wrap: wrap;
    gap: 8px;
    min-height: auto;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .brand-svg {
    height: 22px;
  }
  .pnr {
    flex: 1 1 100%;
    order: 5;
    margin-top: 4px;
  }
  .plus {
    width: 38px;
    height: 38px;
  }
  .lang {
    height: 38px;
    padding: 0 10px;
    margin-inline-start: auto;
  }
  .sug {
    width: 100%;
  }
}
@media (max-width: 640px) {
  .bal {
    display: none;
  }
  .lang-text {
    display: none;
  }
  .navw {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .nav {
    padding: 5px;
    border-radius: 14px;
    gap: 2px;
  }
  .nav a {
    height: 36px;
    padding: 0 11px;
    font-size: 12px;
    border-radius: 10px;
    gap: 6px;
  }
  .nav a.dash {
    width: 36px;
    height: 36px;
    margin-inline-end: 2px;
  }
}
</style>
