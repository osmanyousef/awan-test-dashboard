<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  FLIGHTS,
  TIMEZONES,
  AIRPORT_NAMES,
  type ProcessedFlight,
  type RawFlight,
  type FlightSegment,
} from '../config/flightsData'

const route = useRoute()
const router = useRouter()

// ── Search Summary from Route Query or Defaults ───────────
const originText = computed(() => {
  const q = (route.query.from as string) || 'TUN - Tunis'
  return q.split(' - ')[1] || q.split(' - ')[0] || 'Tunis'
})
const originCode = computed(() => {
  const q = (route.query.from as string) || 'TUN'
  return q.slice(0, 3).toUpperCase()
})

const destText = computed(() => {
  const q = (route.query.to as string) || 'KUL - Kuala Lumpur'
  return q.split(' - ')[1] || q.split(' - ')[0] || 'Kuala Lumpur'
})
const destCode = computed(() => {
  const q = (route.query.to as string) || 'KUL'
  return q.slice(0, 3).toUpperCase()
})

const dateText = computed(() => (route.query.date as string) || 'Wed, 2 Dec')
const tripType = computed(() => (route.query.trip as string) || 'One way')
const cabinClass = computed(() => (route.query.cabin as string) || 'Economy')

// ── Time & Math Helpers ────────────────────────────────────
function tm(s: string): number {
  return +s.slice(0, 2) * 60 + +s.slice(3)
}

function hm(m: number): string {
  const hours = Math.floor(m / 60)
  const mins = m % 60
  return `${hours}h ${String(mins).padStart(2, '0')}m`
}

function formatClock(m: number): string {
  const normalized = ((m % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function dateLabel(d: number): string {
  const days = ['Wed', 'Thu', 'Fri']
  const dayName = days[d] || 'Sat'
  return `${dayName}, ${2 + d} Dec`
}

function plusDays(m: number): number {
  return Math.floor(m / 1440)
}

// ── Airline Logo Fallback Cascade ─────────────────────────
const LOGOS = [
  (c: string) => `https://www.gstatic.com/flights/airline_logos/70px/${c}.png`,
  (c: string) => `https://images.kiwi.com/airlines/64x64/${c}.png`,
  (c: string) => `https://images.daisycon.io/airline/?width=100&height=100&iata=${c}`,
  (c: string) => `https://pics.avs.io/120/120/${c}.png`,
]

const logoState = ref<Record<string, { src: string; step: number; loaded: boolean; failed: boolean }>>({})

function getLogo(code: string) {
  if (!logoState.value[code]) {
    logoState.value[code] = {
      src: LOGOS[0](code),
      step: 0,
      loaded: false,
      failed: false,
    }
  }
  return logoState.value[code]
}

function onLogoLoad(code: string) {
  const s = getLogo(code)
  s.loaded = true
}

function onLogoError(code: string) {
  const s = getLogo(code)
  if (s.step + 1 < LOGOS.length) {
    s.step++
    s.src = LOGOS[s.step](code)
  } else {
    s.failed = true
  }
}

// ── Process Raw Flights ────────────────────────────────────
function processFlight(f: RawFlight): ProcessedFlight {
  let u = tm(f.dep) - (TIMEZONES[f.route[0]] ?? 1) * 60
  const segs: FlightSegment[] = []
  const dur = f.sd.reduce((a, b) => a + b, 0) + f.lay.reduce((a, b) => a + b, 0)

  f.route.slice(0, -1).forEach((a, j) => {
    const b = f.route[j + 1]
    const tzA = TIMEZONES[a] ?? 1
    const tzB = TIMEZONES[b] ?? 1
    segs.push({
      a,
      b,
      d: u + tzA * 60,
      r: u + f.sd[j] + tzB * 60,
      m: f.sd[j],
      no: f.nos[j],
    })
    u += f.sd[j] + (f.lay[j] || 0)
  })

  return {
    ...f,
    segs,
    dur,
    via: f.route.slice(1, -1),
    max: Math.max(0, ...f.lay),
  }
}

const allFlights = computed<ProcessedFlight[]>(() => FLIGHTS.map(processFlight))

// ── Scoring & Badges ───────────────────────────────────────
const score = (f: ProcessedFlight) => f.price + f.dur * 0.2 + f.via.length * 40

const bestF = computed(() => {
  if (!allFlights.value.length) return null
  return allFlights.value.reduce((a, b) => (score(b) < score(a) ? b : a))
})

const cheapF = computed(() => {
  if (!allFlights.value.length) return null
  return allFlights.value.reduce((a, b) => (b.price < a.price ? b : a))
})

const fastF = computed(() => {
  if (!allFlights.value.length) return null
  return allFlights.value.reduce((a, b) => (b.dur < a.dur ? b : a))
})

function getPriceDelta(f: ProcessedFlight) {
  if (!cheapF.value) return null
  const dd = Math.round(f.price - cheapF.value.price)
  if (f.id === cheapF.value.id) {
    return { isLowest: true, text: 'Lowest price' }
  }
  if (dd > 0) {
    return { isLowest: false, text: `+$${dd} vs cheapest` }
  }
  return null
}

// ── Departure Periods ──────────────────────────────────────
function getPeriod(f: ProcessedFlight): 'm' | 'a' | 'e' | 'n' {
  const m = tm(f.dep)
  if (m >= 300 && m < 720) return 'm'
  if (m >= 720 && m < 1020) return 'a'
  if (m >= 1020 && m < 1260) return 'e'
  return 'n'
}

// ── Fare Tiers ─────────────────────────────────────────────
export interface FareTier {
  n: string
  d: number
  bag: number
  seat: number
  cf: number | null
  chf: number | null
}

function getTiers(f: ProcessedFlight): FareTier[] {
  return [
    { n: f.fare, d: 0, bag: f.bags, seat: f.seat, cf: f.cf, chf: f.chf },
    { n: 'Economy Flex', d: 85, bag: 2, seat: 1, cf: 60, chf: 0 },
    { n: 'Premium Economy', d: 310, bag: 2, seat: 1, cf: 0, chf: 0 },
    { n: 'Business', d: 880, bag: 2, seat: 1, cf: 0, chf: 0 },
  ]
}

function feeInfo(v: number | null, a: string, b: string): [boolean, string] {
  if (v === null) return [false, a]
  if (v === 0) return [true, b]
  return [true, `${a.split(' ')[0]} · $${v}`]
}

function lvTag(m: number): [string, string] {
  if (m < 120) return ['Short connection', '']
  if (m <= 240) return ['Comfortable', 'ok']
  return ['Long layover', '']
}

function getAirport(code: string): [string, string] {
  return AIRPORT_NAMES[code] || [code, `${code} Airport`]
}

// ── Filter State ───────────────────────────────────────────
const MIN = 450
const MAX = 600
const LAY = 360

const filterDir = ref(false)
const filterRef = ref(false)
const filterLo = ref(MIN)
const filterHi = ref(MAX)
const filterLay = ref(LAY)
const filterStops = ref<Set<number>>(new Set())
const filterDep = ref<Set<'m' | 'a' | 'e' | 'n'>>(new Set())
const filterTransit = ref<Set<string>>(new Set())
const filterAirlines = ref<Set<string>>(new Set())
const sortBy = ref<'best' | 'cheap' | 'fast'>('best')

const sideOpen = ref(false)

// Unique Transits & Airlines for Filters
const transitAirports = computed(() => [...new Set(allFlights.value.flatMap(f => f.via))])
const uniqueAirlines = computed(() => {
  const map = new Map<string, ProcessedFlight>()
  allFlights.value.forEach(f => {
    if (!map.has(f.ini)) map.set(f.ini, f)
  })
  return [...map.values()]
})

function countByStops(s: number): number {
  return allFlights.value.filter(f => Math.min(f.via.length, 2) === s).length
}

function countByTransit(code: string): number {
  return allFlights.value.filter(f => f.via.includes(code)).length
}

function countByAirline(ini: string): number {
  return allFlights.value.filter(f => f.ini === ini).length
}

function toggleDep(v: 'm' | 'a' | 'e' | 'n') {
  const next = new Set(filterDep.value)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  filterDep.value = next
}

function toggleStop(s: number) {
  const next = new Set(filterStops.value)
  if (next.has(s)) next.delete(s)
  else next.add(s)
  filterStops.value = next
}

function toggleTransit(code: string) {
  const next = new Set(filterTransit.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  filterTransit.value = next
}

function toggleAirline(ini: string) {
  const next = new Set(filterAirlines.value)
  if (next.has(ini)) next.delete(ini)
  else next.add(ini)
  filterAirlines.value = next
}

function onLoInput(e: Event) {
  const v = +(e.target as HTMLInputElement).value
  filterLo.value = Math.min(v, filterHi.value - 10)
}

function onHiInput(e: Event) {
  const v = +(e.target as HTMLInputElement).value
  filterHi.value = Math.max(v, filterLo.value + 10)
}

const dualFillStyle = computed(() => {
  const left = ((filterLo.value - MIN) / (MAX - MIN)) * 100
  const right = ((MAX - filterHi.value) / (MAX - MIN)) * 100
  return {
    left: `${left}%`,
    right: `${right}%`,
  }
})

const activeFiltersCount = computed(() => {
  let c = 0
  if (filterDir.value) c++
  if (filterRef.value) c++
  if (filterLo.value > MIN || filterHi.value < MAX) c++
  c += filterStops.value.size
  c += filterDep.value.size
  if (filterLay.value < LAY) c++
  c += filterTransit.value.size
  c += filterAirlines.value.size
  return c
})

function resetFilters() {
  filterDir.value = false
  filterRef.value = false
  filterLo.value = MIN
  filterHi.value = MAX
  filterLay.value = LAY
  filterStops.value = new Set()
  filterDep.value = new Set()
  filterTransit.value = new Set()
  filterAirlines.value = new Set()
  sortBy.value = 'best'
}

// ── Filtering & Sorting ────────────────────────────────────
function passFilter(f: ProcessedFlight): boolean {
  if (filterDir.value && f.via.length > 0) return false
  if (filterRef.value && f.cf === null) return false
  if (f.price < filterLo.value || f.price > filterHi.value) return false
  if (filterStops.value.size > 0 && !filterStops.value.has(Math.min(f.via.length, 2))) return false
  if (filterDep.value.size > 0 && !filterDep.value.has(getPeriod(f))) return false
  if (f.max > filterLay.value) return false
  if (filterTransit.value.size > 0 && !f.via.some(v => filterTransit.value.has(v))) return false
  if (filterAirlines.value.size > 0 && !filterAirlines.value.has(f.ini)) return false
  return true
}

const filteredFlights = computed(() => {
  const list = allFlights.value.filter(passFilter)
  if (sortBy.value === 'cheap') {
    return list.sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'fast') {
    return list.sort((a, b) => a.dur - b.dur)
  }
  return list.sort((a, b) => score(a) - score(b))
})

// ── Interactive Card State (Fares & Details & Baggage) ─────
const openCardPanel = ref<Record<number, 'fares' | 'details' | null>>({})
const selectedFares = ref<Record<number, number>>({})
const extraBags = ref<Record<number, number>>({})

function togglePanel(id: number, panel: 'fares' | 'details') {
  if (openCardPanel.value[id] === panel) {
    openCardPanel.value[id] = null
  } else {
    openCardPanel.value[id] = panel
  }
}

function selectFare(id: number, k: number) {
  selectedFares.value[id] = k
}

function stepBag(id: number, delta: number) {
  const curr = extraBags.value[id] ?? 0
  extraBags.value[id] = Math.max(0, Math.min(6, curr + delta))
}

function getCardTotal(f: ProcessedFlight): number {
  const k = selectedFares.value[f.id] ?? 0
  const tier = getTiers(f)[k]
  const bags = extraBags.value[f.id] ?? 0
  return f.price + tier.d + bags * 50
}

function bookFlight(f: ProcessedFlight) {
  const k = selectedFares.value[f.id] ?? 0
  const bags = extraBags.value[f.id] ?? 0
  router.push({
    path: '/flights/review',
    query: {
      id: String(f.id),
      tier: String(k),
      bags: String(bags),
      from: (route.query.from as string) || 'TUN - Tunis',
      to: (route.query.to as string) || 'KUL - Kuala Lumpur',
      date: (route.query.date as string) || 'Wed, 2 Dec',
      trip: (route.query.trip as string) || 'One way',
      cabin: (route.query.cabin as string) || 'Economy',
    },
  })
}

onMounted(() => {
  allFlights.value.forEach(f => {
    selectedFares.value[f.id] = 0
    extraBags.value[f.id] = 0
  })
})
</script>

<template>
  <div class="flight-results-page">
    <!-- Sticky Search Summary Bar -->
    <header class="bar">
      <div class="wrap bar-inner">
        <span class="chip">
          <svg class="i" viewBox="0 0 24 24">
            <path d="M3 12h18M15 6l6 6-6 6" />
          </svg>
          <b>{{ originText }}</b><i>{{ originCode }}</i> to <b>{{ destText }}</b><i>{{ destCode }}</i>
        </span>

        <span class="chip">
          <svg class="i" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {{ dateText }} · {{ tripType }}
        </span>

        <span class="chip">
          <svg class="i" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          1 adult · {{ cabinClass }}
        </span>

        <RouterLink to="/flights" class="btn pri sm sp">
          Modify search
        </RouterLink>
      </div>
    </header>

    <!-- Main Layout: Filters sidebar + Flight listings -->
    <div class="wrap lay">
      <!-- Sidebar Filters -->
      <aside class="side" :class="{ open: sideOpen }" aria-label="Filters">
        <div class="fh">
          <h3>
            Filters
            <span class="fn-badge" :class="{ on: activeFiltersCount > 0 }">
              {{ activeFiltersCount }}
            </span>
          </h3>
          <button type="button" @click="resetFilters">Reset all</button>
        </div>

        <label class="ck">
          <input type="checkbox" v-model="filterDir" />
          Direct flights only
        </label>

        <label class="ck">
          <input type="checkbox" v-model="filterRef" />
          Refundable only
        </label>

        <!-- Price Dual Range Slider -->
        <div class="sec">
          <div class="st">
            Price
            <b>${{ filterLo }} – ${{ filterHi }}</b>
          </div>
          <div class="dual">
            <div class="tr"></div>
            <div class="fl" :style="dualFillStyle"></div>
            <input
              type="range"
              :min="MIN"
              :max="MAX"
              step="5"
              :value="filterLo"
              @input="onLoInput"
              aria-label="Minimum price"
            />
            <input
              type="range"
              :min="MIN"
              :max="MAX"
              step="5"
              :value="filterHi"
              @input="onHiInput"
              aria-label="Maximum price"
            />
          </div>
        </div>

        <!-- Stops -->
        <div class="sec">
          <div class="st">Stops</div>
          <div>
            <label class="ck">
              <input
                type="checkbox"
                :checked="filterStops.has(0)"
                @change="toggleStop(0)"
              />
              Non-stop
              <em>{{ countByStops(0) }}</em>
            </label>
            <label class="ck">
              <input
                type="checkbox"
                :checked="filterStops.has(1)"
                @change="toggleStop(1)"
              />
              1 stop
              <em>{{ countByStops(1) }}</em>
            </label>
            <label class="ck">
              <input
                type="checkbox"
                :checked="filterStops.has(2)"
                @change="toggleStop(2)"
              />
              2+ stops
              <em>{{ countByStops(2) }}</em>
            </label>
          </div>
        </div>

        <!-- Departure Time -->
        <div class="sec">
          <div class="st">Departure time</div>
          <div class="g4">
            <button
              type="button"
              :class="{ on: filterDep.has('m') }"
              @click="toggleDep('m')"
            >
              Morning
              <small>5 AM–12 PM</small>
            </button>
            <button
              type="button"
              :class="{ on: filterDep.has('a') }"
              @click="toggleDep('a')"
            >
              Afternoon
              <small>12–5 PM</small>
            </button>
            <button
              type="button"
              :class="{ on: filterDep.has('e') }"
              @click="toggleDep('e')"
            >
              Evening
              <small>5–9 PM</small>
            </button>
            <button
              type="button"
              :class="{ on: filterDep.has('n') }"
              @click="toggleDep('n')"
            >
              Night
              <small>9 PM–5 AM</small>
            </button>
          </div>
        </div>

        <!-- Max Layover -->
        <div class="sec">
          <div class="st">
            Max layover
            <b>{{ filterLay >= LAY ? 'No limit' : hm(filterLay) }}</b>
          </div>
          <input
            type="range"
            class="rg"
            min="120"
            :max="LAY"
            step="30"
            v-model.number="filterLay"
            aria-label="Maximum layover"
          />
        </div>

        <!-- Transit Airports -->
        <div class="sec">
          <div class="st">Transit airports</div>
          <div class="sl">
            <label v-for="a in transitAirports" :key="a" class="ck">
              <input
                type="checkbox"
                :checked="filterTransit.has(a)"
                @change="toggleTransit(a)"
              />
              <span class="mono">{{ a }}</span> {{ getAirport(a)[0] }}
              <em>{{ countByTransit(a) }}</em>
            </label>
          </div>
        </div>

        <!-- Airlines -->
        <div class="sec">
          <div class="st">Airline</div>
          <div class="sl">
            <label v-for="a in uniqueAirlines" :key="a.ini" class="ck">
              <input
                type="checkbox"
                :checked="filterAirlines.has(a.ini)"
                @change="toggleAirline(a.ini)"
              />
              <i
                class="ic2"
                :class="{ ok: getLogo(a.ini).loaded && !getLogo(a.ini).failed }"
                :style="{ background: a.c }"
              >
                {{ a.ini }}
                <img
                  v-if="!getLogo(a.ini).failed"
                  :src="getLogo(a.ini).src"
                  alt=""
                  referrerpolicy="no-referrer"
                  @load="onLogoLoad(a.ini)"
                  @error="onLogoError(a.ini)"
                />
              </i>
              {{ a.al }}
              <em>{{ countByAirline(a.ini) }}</em>
            </label>
          </div>
        </div>
      </aside>

      <!-- Main Results Area -->
      <main>
        <div class="tb">
          <div>
            <h1>{{ originText }} → {{ destText }}</h1>
            <p id="cnt">
              {{ filteredFlights.length }} of {{ allFlights.length }} flights · prices per adult, taxes included
            </p>
          </div>

          <div class="tbc">
            <button type="button" class="btn sm mf" @click="sideOpen = !sideOpen">
              Filters
            </button>
            <select class="seg" v-model="sortBy" aria-label="Sort flights by">
              <option value="best">
                Best value · ${{ bestF ? Math.round(bestF.price) : 0 }}
              </option>
              <option value="cheap">
                Cheapest · ${{ cheapF ? Math.round(cheapF.price) : 0 }}
              </option>
              <option value="fast">
                Fastest · {{ fastF ? hm(fastF.dur) : '' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Flights List -->
        <div class="list">
          <article
            v-for="(f, i) in filteredFlights"
            :key="f.id"
            class="card"
            :class="{
              hl: f.id === bestF?.id,
              f: openCardPanel[f.id] === 'fares',
              d: openCardPanel[f.id] === 'details',
            }"
            :style="{ '--i': i }"
          >
            <!-- Card Main Section -->
            <div class="cm">
              <!-- Top Row: Airline Logo & Badges -->
              <div class="l1">
                <span
                  class="lg"
                  :class="{ ok: getLogo(f.ini).loaded && !getLogo(f.ini).failed }"
                  :style="{ background: f.c }"
                >
                  {{ f.ini }}
                  <img
                    v-if="!getLogo(f.ini).failed"
                    :src="getLogo(f.ini).src"
                    alt=""
                    referrerpolicy="no-referrer"
                    @load="onLogoLoad(f.ini)"
                    @error="onLogoError(f.ini)"
                  />
                </span>

                <div class="an">
                  <b>{{ f.al }}</b>
                  <span>{{ f.nos[0] }}</span>
                </div>

                <div class="bd">
                  <span v-if="f.id === bestF?.id" class="bg b">Best value</span>
                  <span v-if="f.id === cheapF?.id" class="bg c">Cheapest</span>
                  <span v-if="f.id === fastF?.id" class="bg f">Fastest</span>
                </div>
              </div>

              <!-- Middle Row: Flight Route Diagram -->
              <div class="rt">
                <!-- Departure -->
                <div class="pt">
                  <b>{{ formatClock(f.segs[0].d) }}</b>
                  <strong>{{ f.segs[0].a }}</strong>
                  <span>{{ dateLabel(0) }}</span>
                </div>

                <!-- Timeline Route Track -->
                <div class="ln">
                  <span class="du">
                    <svg class="i" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {{ hm(f.dur) }}
                  </span>

                  <div class="tk">
                    <i style="left: 0"></i>
                    <i style="left: 100%"></i>
                    <i
                      v-for="(v, j) in f.via"
                      :key="v"
                      class="v"
                      :style="{ left: `${((j + 1) * 100) / (f.via.length + 1)}%` }"
                    ></i>
                  </div>

                  <span class="sp2" :class="{ ok: f.via.length === 0 }">
                    {{ f.via.length ? `${f.via.length} stop${f.via.length > 1 ? 's' : ''} · ${f.via.join(', ')}` : 'Nonstop' }}
                  </span>
                </div>

                <!-- Arrival -->
                <div class="pt e">
                  <b>
                    {{ formatClock(f.segs[f.segs.length - 1].r) }}
                    <sup v-if="plusDays(f.segs[f.segs.length - 1].r)">
                      +{{ plusDays(f.segs[f.segs.length - 1].r) }}
                    </sup>
                  </b>
                  <strong>{{ f.segs[f.segs.length - 1].b }}</strong>
                  <span>{{ dateLabel(plusDays(f.segs[f.segs.length - 1].r)) }}</span>
                </div>
              </div>

              <!-- Bottom Row: Features Chips & Drawer Tabs -->
              <div class="l3">
                <div class="ch">
                  <span class="p">{{ f.fare }}</span>

                  <span class="bl">
                    <svg class="i" viewBox="0 0 24 24">
                      <rect x="4" y="7" width="16" height="14" rx="2" />
                      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M8 11v6M16 11v6" />
                    </svg>
                    {{ f.bags }} bag{{ f.bags > 1 ? 's' : '' }}
                  </span>

                  <span v-if="f.cf === null" class="nx">Non-refundable</span>
                  <span v-else class="gr">Refundable</span>

                  <span v-if="f.chf !== null" class="gr">Changes allowed</span>
                </div>

                <div class="tabs">
                  <button
                    type="button"
                    class="tab"
                    :class="{ active: openCardPanel[f.id] === 'fares' }"
                    :aria-expanded="openCardPanel[f.id] === 'fares' ? 'true' : 'false'"
                    @click="togglePanel(f.id, 'fares')"
                  >
                    <svg class="i" viewBox="0 0 24 24">
                      <path d="M3 3h8l10 10-8 8L3 11V3z" />
                      <circle cx="7.5" cy="7.5" r="1" />
                    </svg>
                    <span class="tt">Fare options</span>
                    <svg class="i cv" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="tab"
                    :class="{ active: openCardPanel[f.id] === 'details' }"
                    :aria-expanded="openCardPanel[f.id] === 'details' ? 'true' : 'false'"
                    @click="togglePanel(f.id, 'details')"
                  >
                    <svg class="i" viewBox="0 0 24 24">
                      <circle cx="6" cy="19" r="2.5" />
                      <circle cx="18" cy="3.5" r="2.5" />
                      <path d="M8.5 19H14a4 4 0 000-8h-4a4 4 0 010-8h5.5" />
                    </svg>
                    <span class="tt">Flight details</span>
                    <svg class="i cv" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Price & CTA Column -->
            <div class="cp">
              <small>Starting from</small>
              <b class="mono">${{ money(f.price) }}</b>
              <span>
                per adult
                <i
                  v-if="getPriceDelta(f)"
                  class="dl"
                  :class="{ lo: getPriceDelta(f)?.isLowest }"
                >
                  {{ getPriceDelta(f)?.text }}
                </i>
              </span>
              <button type="button" class="btn pri" @click="bookFlight(f)">
                Select
              </button>
            </div>

            <!-- Expandable Panel: Fare options & Baggage -->
            <div class="pn pf">
              <div>
                <div class="pi">
                  <h4>Choose your fare &amp; baggage</h4>
                  <div class="fares" role="radiogroup">
                    <button
                      v-for="(t, k) in getTiers(f)"
                      :key="t.n"
                      type="button"
                      class="fare"
                      :class="{ sel: (selectedFares[f.id] ?? 0) === k }"
                      role="radio"
                      :aria-checked="(selectedFares[f.id] ?? 0) === k ? 'true' : 'false'"
                      @click="selectFare(f.id, k)"
                    >
                      <span class="ck2">
                        <svg class="i" viewBox="0 0 24 24">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>

                      <h5>{{ t.n }}</h5>
                      <div class="fp">
                        ${{ money(f.price + t.d) }}
                        <small>{{ k ? `+$${t.d} per adult` : 'Starting fare' }}</small>
                      </div>

                      <ul>
                        <li class="y">
                          <svg class="i" viewBox="0 0 24 24">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          Cabin bag · 8 kg
                        </li>

                        <li :class="t.bag ? 'y' : 'n'">
                          <svg v-if="t.bag" class="i" viewBox="0 0 24 24">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <svg v-else class="i" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                          {{ t.bag ? `${t.bag} × 23 kg checked` : 'No checked bag' }}
                        </li>

                        <li :class="t.seat ? 'y' : 'n'">
                          <svg v-if="t.seat" class="i" viewBox="0 0 24 24">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <svg v-else class="i" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                          {{ t.seat ? 'Seat selection' : 'No seat selection' }}
                        </li>

                        <li :class="feeInfo(t.cf, 'Non-refundable', 'Free cancellation')[0] ? 'y' : 'n'">
                          <svg v-if="feeInfo(t.cf, 'Non-refundable', 'Free cancellation')[0]" class="i" viewBox="0 0 24 24">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <svg v-else class="i" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                          {{ feeInfo(t.cf, 'Non-refundable', 'Free cancellation')[1] }}
                        </li>

                        <li :class="feeInfo(t.chf, 'No changes', 'Free changes')[0] ? 'y' : 'n'">
                          <svg v-if="feeInfo(t.chf, 'No changes', 'Free changes')[0]" class="i" viewBox="0 0 24 24">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <svg v-else class="i" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                          {{ feeInfo(t.chf, 'No changes', 'Free changes')[1] }}
                        </li>
                      </ul>
                    </button>
                  </div>

                  <!-- Extra Checked Bag & Continue Total Footer -->
                  <div class="ft">
                    <div class="xb">
                      <svg class="i" viewBox="0 0 24 24">
                        <rect x="4" y="7" width="16" height="14" rx="2" />
                        <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M8 11v6M16 11v6" />
                      </svg>
                      <div>
                        <b>Extra checked bag</b>
                        <small>23 kg · $50 each</small>
                      </div>
                      <div class="stp">
                        <button type="button" aria-label="Remove bag" @click="stepBag(f.id, -1)">−</button>
                        <span class="xn">{{ extraBags[f.id] ?? 0 }}</span>
                        <button type="button" aria-label="Add bag" @click="stepBag(f.id, 1)">+</button>
                      </div>
                    </div>

                    <div class="go">
                      <div class="pp">
                        {{ getTiers(f)[selectedFares[f.id] ?? 0].n }} · 1 adult
                        <template v-if="extraBags[f.id]">
                          + {{ extraBags[f.id] }} extra bag{{ extraBags[f.id] > 1 ? 's' : '' }}
                        </template>
                      </div>
                      <div class="tot mono">${{ money(getCardTotal(f)) }}</div>
                      <button type="button" class="btn pri" @click="bookFlight(f)">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expandable Panel: Detailed Itinerary & Fees -->
            <div class="pn pd">
              <div>
                <div class="pi">
                  <div class="dg">
                    <!-- Column 1: Detailed Itinerary Timeline -->
                    <div>
                      <div class="ph">
                        <h4>Itinerary</h4>
                      </div>
                      <div class="tl">
                        <!-- Origin Airport Node -->
                        <div class="tr2 first">
                          <div class="tm">
                            <b>{{ formatClock(f.segs[0].d) }}</b>
                            <small>{{ dateLabel(0) }}</small>
                          </div>
                          <div class="rl"><i></i></div>
                          <div class="nd">
                            <b>{{ getAirport(f.segs[0].a)[1] }} <em>{{ f.segs[0].a }}</em></b>
                          </div>
                        </div>

                        <!-- Segments & Layovers -->
                        <template v-for="(s, j) in f.segs" :key="j">
                          <!-- Flight Leg -->
                          <div class="tr2 leg">
                            <div class="tm"></div>
                            <div class="rl"></div>
                            <div class="nd">
                              <div class="ct">
                                <span class="fl2">
                                  <svg class="i" viewBox="0 0 24 24">
                                    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                                  </svg>
                                  {{ s.no }}
                                  <span>{{ hm(s.m) }} · {{ getAirport(s.a)[0] }} → {{ getAirport(s.b)[0] }}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <!-- Layover Stop if not last segment -->
                          <div v-if="j < f.via.length" class="tr2 stop">
                            <div class="tm">
                              <b>{{ formatClock(s.r) }}</b>
                              <small>{{ dateLabel(plusDays(s.r)) }}</small>
                            </div>
                            <div class="rl"><i class="v"></i></div>
                            <div class="nd">
                              <b>{{ getAirport(s.b)[1] }} <em>{{ s.b }}</em></b>
                              <div class="lv">
                                <div class="a">
                                  <strong>
                                    <svg class="i" viewBox="0 0 24 24">
                                      <circle cx="12" cy="12" r="9" />
                                      <path d="M12 7v5l3 2" />
                                    </svg>
                                    {{ hm(f.lay[j]) }} layover in {{ getAirport(s.b)[0] }}
                                  </strong>
                                  <span class="tag2" :class="{ ok: lvTag(f.lay[j])[1] === 'ok' }">
                                    {{ lvTag(f.lay[j])[0] }}
                                  </span>
                                </div>
                                <p>
                                  Lands {{ formatClock(s.r) }} · departs {{ formatClock(f.segs[j + 1].d) }}
                                  <sup v-if="plusDays(f.segs[j + 1].d)">+{{ plusDays(f.segs[j + 1].d) }}</sup>
                                  on {{ f.segs[j + 1].no }}
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Final Arrival Airport Node -->
                          <div v-else class="tr2 last">
                            <div class="tm">
                              <b>{{ formatClock(s.r) }}<sup v-if="plusDays(s.r)">+{{ plusDays(s.r) }}</sup></b>
                              <small>{{ dateLabel(plusDays(s.r)) }}</small>
                            </div>
                            <div class="rl"><i></i></div>
                            <div class="nd">
                              <b>{{ getAirport(s.b)[1] }} <em>{{ s.b }}</em></b>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>

                    <!-- Column 2: Cancel & Change Fees Card -->
                    <div>
                      <div class="ph">
                        <h4>Cancel &amp; change fees</h4>
                        <span class="meta">{{ f.fare }}</span>
                      </div>

                      <div class="fees">
                        <!-- Cancel flight fee -->
                        <div v-if="f.cf === null" class="fc na">
                          <i class="fi">
                            <svg class="i" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M9 9l6 6M15 9l-6 6" />
                            </svg>
                          </i>
                          <div class="fb">
                            <b>Cancel flight</b>
                            <small>No refund on this fare</small>
                          </div>
                          <div class="amt nn">Not allowed</div>
                        </div>

                        <div v-else class="fc">
                          <i class="fi">
                            <svg class="i" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M9 9l6 6M15 9l-6 6" />
                            </svg>
                          </i>
                          <div class="fb">
                            <b>Cancel flight</b>
                            <small>You get back about ${{ money(f.price - f.cf) }}</small>
                          </div>
                          <div class="amt mono">${{ money(f.cf) }}</div>
                        </div>

                        <!-- Change date fee -->
                        <div v-if="f.chf === null" class="fc na">
                          <i class="fi">
                            <svg class="i" viewBox="0 0 24 24">
                              <rect x="3" y="5" width="18" height="16" rx="2" />
                              <path d="M3 10h18M8 3v4M16 3v4" />
                            </svg>
                          </i>
                          <div class="fb">
                            <b>Change date</b>
                            <small>Dates can't be changed on this fare</small>
                          </div>
                          <div class="amt nn">Not allowed</div>
                        </div>

                        <div v-else class="fc">
                          <i class="fi">
                            <svg class="i" viewBox="0 0 24 24">
                              <rect x="3" y="5" width="18" height="16" rx="2" />
                              <path d="M3 10h18M8 3v4M16 3v4" />
                            </svg>
                          </i>
                          <div class="fb">
                            <b>Change date</b>
                            <small>Airline fee to move your flight</small>
                          </div>
                          <div class="amt mono">{{ f.chf === 0 ? 'Free' : '$' + money(f.chf) }}</div>
                        </div>
                      </div>

                      <p class="note">
                        Per adult, before travel. Amounts are approximate; service fees may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <!-- Empty state -->
          <div v-if="filteredFlights.length === 0" class="empty">
            <b>No flights match your filters</b>
            Try widening the price range or removing a filter.
            <br />
            <button type="button" class="btn sm" @click="resetFilters">
              Reset all filters
            </button>
          </div>
        </div>

        <!-- Footnote -->
        <p class="fnote">
          Prices are per adult and include taxes and fees. Fares can change until you complete your booking.
        </p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.flight-results-page {
  --page: var(--color-bg, #f4f6fa);
  --card: #fff;
  --line: #d9e3f3;
  --ink: #0c1f44;
  --sub: #3d4a66;
  --mute: #63708b;
  --btn: #4a6cc0;
  --soft: #e9effb;
  --navy: #0c1f44;
  --ok: #0d8a58;
  --okbg: #e5f6ee;
  --field: #f5f7fb;
  color-scheme: light;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--ink);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: transparent;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}

.wrap {
  max-width: 1560px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

svg.i {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
}

button, input {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--btn);
  outline-offset: 2px;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border-radius: 9px;
  border: 1px solid var(--btn);
  background: #fff;
  color: var(--btn);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: filter 0.15s, background 0.15s, transform 0.1s;
}

.btn:hover {
  background: var(--soft);
}

.btn:active {
  transform: scale(0.98);
}

.btn.pri {
  background: var(--btn);
  color: #fff;
}

.btn.pri:hover {
  filter: brightness(1.08);
  background: var(--btn);
}

.btn.sm {
  height: 32px;
  font-size: 12.5px;
  padding: 0 13px;
}

/* ── Sticky Top Bar ──────────────────────────────────────── */
.bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-bottom-color: rgba(12, 31, 68, 0.08);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
}

.bar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 54px;
  padding: 8px 16px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #d9e3f3;
  border-radius: 8px;
  background: #f6f8fd;
  color: var(--sub);
  font-size: 12.5px;
}

.chip b {
  color: var(--ink);
  font-weight: 600;
}

.chip svg {
  color: var(--btn);
}

.chip i {
  font-style: normal;
  color: var(--mute);
  font-size: 11px;
}

.sp {
  margin-left: auto;
}

/* ── Grid Layout ─────────────────────────────────────────── */
.lay {
  display: grid;
  grid-template-columns: 268px 1fr;
  gap: 20px;
  align-items: start;
  padding-bottom: 50px;
}

.tb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tb h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
}

.tb p {
  margin: 3px 0 0;
  color: #41567f;
  font-size: 12.5px;
}

.tbc {
  display: flex;
  gap: 10px;
  align-items: center;
}

.seg {
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237b869c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
  border: 1px solid #cbd8ee;
  border-radius: 10px;
  padding: 9px 34px 9px 14px;
  cursor: pointer;
  transition: 0.15s;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
}

.seg:hover {
  border-color: #cfd7e6;
}

.mf {
  display: none;
}

/* ── Sidebar Filters ─────────────────────────────────────── */
.side {
  position: sticky;
  top: 70px;
  background: #fff;
  border: 1px solid #d3dff1;
  border-radius: 12px;
  padding: 6px 16px 8px;
  max-height: calc(100vh - 86px);
  overflow-y: auto;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.06), 0 10px 26px -16px rgba(12, 31, 68, 0.28);
}

.fh {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 8px;
}

.fh h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.fn-badge {
  display: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--btn);
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  font-weight: 600;
}

.fn-badge.on {
  display: inline-block;
}

.fh button {
  border: 0;
  background: none;
  color: var(--btn);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ck {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
}

.ck input {
  accent-color: var(--btn);
  width: 16px;
  height: 16px;
  margin: 0;
  flex: none;
  cursor: pointer;
}

.ck em {
  margin-left: auto;
  font-style: normal;
  font-size: 11.5px;
  color: var(--mute);
}

.sec {
  border-top: 1px solid var(--line);
  padding: 14px 0 12px;
  margin-top: 6px;
}

.st {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 9px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  text-transform: none;
  letter-spacing: 0;
}

.st b {
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ink);
  font-weight: 600;
}

/* Dual Thumb Range Slider */
.dual {
  position: relative;
  height: 20px;
  margin: 4px 4px 0;
}

.dual .tr {
  position: absolute;
  left: 0;
  right: 0;
  top: 8px;
  height: 4px;
  border-radius: 4px;
  background: #dfe5f2;
}

.dual .fl {
  position: absolute;
  top: 8px;
  height: 4px;
  border-radius: 4px;
  background: var(--btn);
}

.dual input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 20px;
  margin: 0;
  background: none;
  appearance: none;
  -webkit-appearance: none;
  pointer-events: none;
}

.dual input::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--btn);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.35);
  cursor: grab;
}

.dual input::-moz-range-thumb {
  pointer-events: auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--btn);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.35);
  cursor: grab;
}

.dual input::-webkit-slider-runnable-track,
.dual input::-moz-range-track {
  background: none;
}

.rg {
  width: 100%;
  accent-color: var(--btn);
  margin: 0;
}

/* Departure Period 2x2 Grid */
.g4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.g4 button {
  text-align: left;
  padding: 9px 11px;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  transition: 0.15s;
}

.g4 button small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  color: var(--mute);
}

.g4 button:hover {
  border-color: #b9cbee;
}

.g4 button.on {
  background: var(--soft);
  border-color: var(--btn);
  color: #2f5fb5;
}

/* Scrollable lists */
.sl {
  max-height: 152px;
  overflow-y: auto;
  margin-right: -6px;
  padding-right: 6px;
}

.sl::-webkit-scrollbar {
  width: 5px;
}

.sl::-webkit-scrollbar-thumb {
  background: #ccd4e4;
  border-radius: 5px;
}

/* Airline logo chips */
.lg, .ic2 {
  position: relative;
  overflow: hidden;
}

.lg img, .ic2 img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
  padding: 4px;
}

.ic2 img {
  padding: 2px;
}

.lg.ok, .ic2.ok {
  background: #fff !important;
  color: transparent !important;
  box-shadow: inset 0 0 0 1px var(--line);
}

.lg {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  flex: none;
}

.ic2 {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 8.5px;
  font-weight: 700;
  font-style: normal;
  flex: none;
}

/* ── Flight Cards List ───────────────────────────────────── */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  display: grid;
  grid-template-columns: 1fr 170px;
  background: #fff;
  border: 1px solid #d3dff1;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.06), 0 10px 26px -16px rgba(12, 31, 68, 0.28);
  transition: border-color 0.2s, box-shadow 0.2s;
  animation: up 0.4s ease backwards;
  animation-delay: calc(var(--i, 0) * 50ms);
  overflow: hidden;
}

.card:hover {
  border-color: #a9bfe6;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.08), 0 16px 32px -16px rgba(12, 31, 68, 0.38);
}

.card.hl {
  border-color: #8ea8e0;
  box-shadow: 0 0 0 3px rgba(74, 108, 192, 0.13), 0 14px 30px -16px rgba(12, 31, 68, 0.35);
}

@keyframes up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.cm {
  padding: 14px 18px 12px;
  min-width: 0;
}

.l1 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.an b {
  display: block;
  font-size: 14px;
  font-weight: 700;
}

.an span {
  font-size: 12px;
  color: var(--mute);
}

.bd {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.bg {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.bg.b {
  background: #ffe9b8;
  color: #7a4300;
}

.bg.c {
  background: var(--okbg);
  color: var(--ok);
}

.bg.f {
  background: #e3effd;
  color: #2d5fb0;
}

/* Route Section */
.rt {
  display: grid;
  grid-template-columns: 96px 1fr 96px;
  gap: 16px;
  align-items: center;
  margin: 14px 0 12px;
}

.pt b {
  display: block;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.8px;
  line-height: 1.15;
}

.pt b sup {
  font-size: 10.5px;
  color: #c2410c;
  font-weight: 700;
  margin-left: 2px;
  letter-spacing: 0;
  vertical-align: top;
}

.pt strong {
  display: block;
  margin-top: 1px;
  font-size: 13px;
  color: var(--ink);
  font-weight: 600;
}

.pt span {
  font-size: 11.5px;
  color: var(--mute);
}

.pt.e {
  text-align: right;
}

.ln {
  text-align: center;
}

.du {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink);
  font-weight: 600;
}

.du svg {
  color: var(--btn);
  width: 13px;
  height: 13px;
}

.tk {
  position: relative;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #8fa9de, #c4d3ee 50%, #8fa9de);
  margin: 9px 4px;
}

.tk i {
  position: absolute;
  top: 50%;
  width: 9px;
  height: 9px;
  margin: -4.5px 0 0 -4.5px;
  border-radius: 50%;
  background: var(--btn);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--btn);
}

.tk i.v {
  background: #fff;
  box-shadow: 0 0 0 1.5px #e09a1a;
}

.sp2 {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  background: #fff4dc;
  color: #9a5a06;
  font-size: 11.5px;
  font-weight: 600;
}

.sp2.ok {
  background: var(--okbg);
  color: var(--ok);
}

/* Feature Chips & Tabs */
.l3 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-top: 11px;
  border-top: 1px solid #eef1f6;
}

.ch {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ch span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.ch svg {
  width: 12px;
  height: 12px;
}

.ch .p {
  background: #e4ebfa;
  color: #1b3a8a;
}

.ch .bl {
  background: #eef2f8;
  color: #3d4a66;
}

.ch .gr {
  background: var(--okbg);
  color: var(--ok);
}

.ch .nx {
  background: #fdecec;
  color: #b42318;
}

.tabs {
  display: inline-flex;
  gap: 4px;
  margin-left: -10px;
}

.tab {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  cursor: pointer;
  color: var(--btn);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.tab > svg:first-child {
  width: 14px;
  height: 14px;
}

.tab .tt {
  display: block;
  white-space: nowrap;
}

.tab .cv {
  width: 12px;
  height: 12px;
  color: var(--mute);
  transition: transform 0.25s, color 0.15s;
}

.tab:hover {
  background: var(--soft);
}

.card.f .tab:first-child,
.card.d .tab:last-child {
  background: var(--soft);
  border-color: #c9d8f3;
}

.card.f .tab:first-child .cv,
.card.d .tab:last-child .cv {
  transform: rotate(180deg);
  color: var(--btn);
}

/* Card Price & CTA */
.cp {
  background: linear-gradient(180deg, #f6f8fd, #e8eefa);
  border-left: 1px solid #d3dff1;
  border-radius: 0 12px 12px 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
}

.cp small, .cp span {
  font-size: 11.5px;
  color: var(--mute);
}

.cp b {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: #243f7e;
  line-height: 1.2;
}

.cp span {
  font-size: 11px;
  color: var(--mute);
  margin-bottom: 10px;
}

.cp .btn {
  width: 100%;
}

.cp .btn.pri {
  height: 42px;
  font-size: 14px;
  border-radius: 10px;
  letter-spacing: 0.2px;
  background: linear-gradient(180deg, #5779c8, #4565b7);
  border-color: #4565b7;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 16px -8px rgba(60, 90, 170, 0.7);
}

.cp .btn.pri:hover {
  background: linear-gradient(180deg, #6283d0, #4d6dbf);
  filter: none;
}

.cp .btn.pri:active {
  transform: translateY(1px);
}

.dl {
  display: block;
  margin-top: 8px;
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: #e3eafa;
  color: #33466f;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.dl.lo {
  background: var(--okbg);
  color: var(--ok);
}

/* ── Expandable Panels (Fares & Details) ──────────────────── */
.pn {
  grid-column: 1 / -1;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  background: #f8fafd;
  border-top: 0 solid var(--line);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.pn > div {
  overflow: hidden;
  min-height: 0;
}

.card.f .pf,
.card.d .pd {
  grid-template-rows: 1fr;
  border-top-width: 1px;
}

.pi {
  padding: 16px 18px;
}

.pi h4 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
}

/* 4 Fares Grid */
.fares {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.fare {
  position: relative;
  text-align: left;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 11px;
  padding: 12px;
  cursor: pointer;
  transition: 0.15s;
}

.fare:hover {
  border-color: #b9cbee;
}

.fare.sel {
  border-color: var(--btn);
  background: #fbfcff;
  box-shadow: 0 8px 18px -12px rgba(82, 120, 200, 0.8);
}

.fare h5 {
  margin: 0 0 3px;
  padding-right: 20px;
  font-size: 11px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--sub);
  font-weight: 700;
}

.fare .fp {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 9px;
}

.fare .fp small {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--mute);
}

.fare .ck2 {
  position: absolute;
  top: 11px;
  right: 11px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid #c5cde0;
  display: grid;
  place-items: center;
  color: transparent;
}

.fare.sel .ck2 {
  background: var(--btn);
  border-color: var(--btn);
  color: #fff;
}

.ck2 svg {
  width: 10px;
  height: 10px;
  stroke-width: 3.2;
}

.fare ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11.5px;
  color: var(--sub);
}

.fare li {
  display: flex;
  gap: 6px;
  line-height: 1.3;
}

.fare li svg {
  width: 13px;
  height: 13px;
  margin-top: 0;
  stroke-width: 2.4;
}

.fare li.y svg {
  color: var(--ok);
}

.fare li.n {
  color: #a2abbf;
}

.fare li.n svg {
  color: #c3c9d8;
}

/* Baggage Stepper & Continue Footer */
.ft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #cbd6ec;
}

.xb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.xb svg {
  color: var(--btn);
  width: 18px;
  height: 18px;
}

.xb small {
  color: var(--mute);
  display: block;
  font-size: 11.5px;
}

.stp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
}

.stp button {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--btn);
  font-size: 15px;
  line-height: 1;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
}

.stp button:hover {
  background: var(--soft);
}

.stp span {
  min-width: 14px;
  text-align: center;
  font-weight: 700;
}

.go {
  display: flex;
  align-items: center;
  gap: 14px;
}

.go .pp {
  font-size: 11.5px;
  color: var(--mute);
  text-align: right;
  line-height: 1.35;
}

.go .tot {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* ── Detailed Itinerary & Fees ───────────────────────────── */
.dg {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.pd .pi {
  padding: 14px 18px 16px;
}

.ph {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.ph h4 {
  margin: 0;
  font-size: 12.5px;
  color: var(--sub);
  font-weight: 700;
}

.meta {
  font-size: 11.5px;
  color: var(--mute);
}

/* Timeline */
.tl {
  padding: 0;
}

.tr2 {
  display: grid;
  grid-template-columns: 62px 14px minmax(0, 1fr);
  column-gap: 10px;
}

.tm {
  text-align: right;
}

.tm b {
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.tm b sup {
  font-size: 9px;
  color: #c2410c;
  margin-left: 1px;
}

.tm small {
  display: block;
  font-size: 10.5px;
  color: var(--mute);
  line-height: 1.3;
  white-space: nowrap;
}

.rl {
  position: relative;
}

.rl::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: #c5d1ea;
}

.tr2.first .rl::before {
  top: 9px;
}

.tr2.last .rl::before,
.tr2.stop .rl::before {
  bottom: auto;
  height: 9px;
}

.tr2.stop .rl::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 18px;
  bottom: 0;
  margin-left: -1px;
  border-left: 2px dashed #e3b052;
}

.rl i {
  position: absolute;
  left: 50%;
  top: 4px;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: var(--btn);
  border: 2px solid #f8fafd;
  box-shadow: 0 0 0 1.5px var(--btn);
  z-index: 1;
}

.rl i.v {
  background: #f8fafd;
  box-shadow: 0 0 0 1.5px #e09a1a;
}

.nd {
  min-width: 0;
}

.nd > b {
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.nd > b em {
  font-style: normal;
  margin-left: 6px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--mute);
  font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}

.ct {
  padding: 8px 0 10px;
}

.fl2 {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--sub);
  flex-wrap: wrap;
}

.fl2 svg {
  width: 13px;
  height: 13px;
  color: var(--btn);
}

.fl2 span {
  color: var(--mute);
  font-weight: 400;
}

.lv {
  margin: 2px 0 10px;
}

.lv .a {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lv .a strong {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #8a4e05;
}

.lv .a strong svg {
  width: 13px;
  height: 13px;
}

.lv p {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--mute);
}

.lv p sup {
  color: #c2410c;
  font-size: 9px;
  font-weight: 700;
}

.tag2 {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  background: #fde9b8;
  color: #8a4e05;
}

.tag2.ok {
  background: var(--okbg);
  color: var(--ok);
}

/* Fees Box */
.fees {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.fc {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
}

.fc + .fc {
  border-top: 1px solid var(--line);
}

.fc .fi {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  background: #fff4dc;
  color: #b86a00;
  flex: none;
}

.fc.na .fi {
  background: #eceff5;
  color: #8a94a8;
}

.fc .fi svg {
  width: 14px;
  height: 14px;
}

.fb {
  flex: 1;
  min-width: 0;
}

.fb b {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
}

.fb small {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: var(--mute);
}

.amt {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

.amt.nn {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  color: #7b869c;
  font-family: Inter, system-ui, sans-serif;
}

.note {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--mute);
  line-height: 1.4;
}

.fnote {
  margin: 14px 2px 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--mute);
}

/* Empty State */
.empty {
  background: #fff;
  border: 1px dashed #cdd6e6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--sub);
}

.empty b {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: var(--ink);
}

.empty button {
  margin-top: 12px;
}

/* Floating Toast */
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(22px + env(safe-area-inset-bottom, 0px));
  transform: translate(-50%, 14px);
  opacity: 0;
  pointer-events: none;
  background: #111827;
  color: #fff;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  transition: 0.3s;
  z-index: 40;
}

.toast.on {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* Responsive Media Queries */
@media (max-width: 1020px) {
  .lay {
    grid-template-columns: 1fr;
  }
  .side {
    display: none;
    position: static;
    max-height: none;
  }
  .side.open {
    display: block;
  }
  .mf {
    display: inline-flex;
  }
  .fares {
    grid-template-columns: 1fr 1fr;
  }
  .dg {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 720px) {
  .dl {
    margin: 4px 0 0;
  }
}

@media (max-width: 640px) {
  .wrap {
    padding: 0 12px;
  }
  .sp {
    margin-left: 0;
  }
  .card {
    grid-template-columns: 1fr;
  }
  .cp {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    border-left: 0;
    border-top: 1px solid var(--line);
    border-radius: 0 0 12px 12px;
    padding: 12px 16px;
    text-align: left;
  }
  .cp b {
    font-size: 19px;
  }
  .cp span {
    margin: 0;
    width: 100%;
    order: 3;
  }
  .cp .btn {
    width: auto;
    padding: 0 28px;
  }
  .rt {
    grid-template-columns: 76px 1fr 76px;
    gap: 10px;
  }
  .pt b {
    font-size: 18px;
  }
  .tbc {
    width: 100%;
  }
  .seg {
    flex: 1;
    min-width: 0;
  }
  .bd {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .tabs {
    width: 100%;
    margin-left: 0;
  }
  .tab {
    flex: 1;
    justify-content: center;
    height: 34px;
    border-color: var(--line);
  }
  .tr2 {
    grid-template-columns: 58px 14px minmax(0, 1fr);
    column-gap: 8px;
  }
  .fares {
    grid-template-columns: 1fr;
  }
  .go, .ft {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  .go .pp {
    text-align: left;
  }
}
</style>
