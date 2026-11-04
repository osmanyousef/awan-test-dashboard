<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightBooking } from '../composables/useFlightBooking'
import FlightStepHero from '../components/flights/FlightStepHero.vue'
import BookingSummarySidebar from '../components/flights/BookingSummarySidebar.vue'
import { AIRPORT_NAMES } from '../config/flightsData'

const router = useRouter()

// ── Shared Flight Data Composable ──────────────────────────
const {
  route,
  rawFlight,
  originCode,
  destCode,
  originName,
  destName,
  dateText,
  tripType,
  cabinClass,
  selectedTierIndex,
  currentFareName,
  baseFare,
  taxesAndFees,
  extraBagsCount,
  extraBagsPrice,
  totalPrice,
  money,
} = useFlightBooking()

// ── Segments Definition ────────────────────────────────────
export interface ReviewSegment {
  from: string
  to: string
  no: string
  dep: string
  dd: number
  arr: string
  ad: number
  m: number
}

const segments = computed<ReviewSegment[]>(() => {
  const f = rawFlight.value
  if (f.id === 1) {
    return [
      { from: 'TUN', to: 'DOH', no: 'QR 1400', dep: '16:00', dd: 0, arr: '23:15', ad: 0, m: 315 },
      { from: 'DOH', to: 'KUL', no: 'QR 852', dep: '02:20', dd: 1, arr: '14:40', ad: 1, m: 440 },
    ]
  }

  const segs: ReviewSegment[] = []
  let day = 0
  let currentHour = parseInt(f.dep.slice(0, 2), 10)
  let currentMin = parseInt(f.dep.slice(3), 10)

  f.route.slice(0, -1).forEach((from, j) => {
    const to = f.route[j + 1]
    const durMins = f.sd[j] || 300
    const depStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
    const depDay = day

    let arrTotalMins = currentHour * 60 + currentMin + durMins
    if (arrTotalMins >= 1440) {
      day += Math.floor(arrTotalMins / 1440)
      arrTotalMins = arrTotalMins % 1440
    }
    const arrHour = Math.floor(arrTotalMins / 60)
    const arrMin = arrTotalMins % 60
    const arrStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`
    const arrDay = day

    segs.push({
      from,
      to,
      no: f.nos[j] || `${f.ini} ${100 + j}`,
      dep: depStr,
      dd: depDay,
      arr: arrStr,
      ad: arrDay,
      m: durMins,
    })

    if (j < f.lay.length) {
      const layMins = f.lay[j] || 120
      let nextTotal = arrHour * 60 + arrMin + layMins
      if (nextTotal >= 1440) {
        day += Math.floor(nextTotal / 1440)
        nextTotal = nextTotal % 1440
      }
      currentHour = Math.floor(nextTotal / 60)
      currentMin = nextTotal % 60
    }
  })

  return segs
})

const DAYS = ['Wed, 2 Dec', 'Thu, 3 Dec', 'Fri, 4 Dec', 'Sat, 5 Dec']

function mins(t: string, d: number): number {
  return d * 1440 + +t.slice(0, 2) * 60 + +t.slice(3)
}

const firstSeg = computed(() => segments.value[0])
const lastSeg = computed(() => segments.value[segments.value.length - 1])

const layovers = computed(() => {
  const S = segments.value
  return S.slice(0, -1).map((s, j) => mins(S[j + 1].dep, S[j + 1].dd) - mins(s.arr, s.ad))
})

const totalDuration = computed(() => {
  const S = segments.value
  return S.reduce((a, s) => a + s.m, 0) + layovers.value.reduce((a, b) => a + b, 0)
})

const viaAirports = computed(() => segments.value.slice(0, -1).map(s => s.to))

function layTag(m: number): string {
  if (m < 120) return 'Short connection'
  if (m <= 240) return 'Comfortable'
  return 'Long layover'
}

function hm(m: number): string {
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

function getAirport(code: string): [string, string] {
  return AIRPORT_NAMES[code] || [code, `${code} Airport`]
}

// ── Policy Details ─────────────────────────────────────────
const isRefundable = computed(() => {
  if (selectedTierIndex.value > 0) return true
  return rawFlight.value.cf !== null
})

const isChangeable = computed(() => {
  if (selectedTierIndex.value > 0) return true
  return rawFlight.value.chf !== null
})

const cancelFeeAmount = computed(() => {
  if (selectedTierIndex.value === 1) return 60
  if (selectedTierIndex.value >= 2) return 0
  return rawFlight.value.cf ?? 130
})

const changeFeeAmount = computed(() => {
  if (selectedTierIndex.value >= 1) return 0
  return rawFlight.value.chf ?? 70
})

// ── Airline Logo Loading ───────────────────────────────────
const LOGOS = [
  (c: string) => `https://www.gstatic.com/flights/airline_logos/70px/${c}.png`,
  (c: string) => `https://images.kiwi.com/airlines/64x64/${c}.png`,
  (c: string) => `https://pics.avs.io/120/120/${c}.png`,
]

const logoState = ref({
  src: LOGOS[0](rawFlight.value.ini),
  step: 0,
  loaded: false,
  failed: false,
})

function onLogoLoad() {
  logoState.value.loaded = true
}

function onLogoError() {
  if (logoState.value.step + 1 < LOGOS.length) {
    logoState.value.step++
    logoState.value.src = LOGOS[logoState.value.step](rawFlight.value.ini)
  } else {
    logoState.value.failed = true
  }
}

// ── Navigation ─────────────────────────────────────────────
function continueBooking() {
  router.push({
    path: '/flights/traveller',
    query: route.query,
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#eef3fa] bg-[radial-gradient(rgba(12,31,68,0.07)_1px,transparent_1.2px)] bg-[size:18px_18px] text-[#0c1f44]">
    <!-- Step 1 Hero Banner with Flight Arc -->
    <FlightStepHero
      :current-step="1"
      title="Review your flight"
      :subtitle="`${originName} (${originCode}) → ${destName} (${destCode}) · ${dateText} · ${tripType}`"
      back-label="Back to results"
      back-route="/flights/results"
      :show-arc="true"
      :origin-code="originCode"
      :dest-code="destCode"
    />

    <!-- Main Content Layout -->
    <div class="max-w-[1080px] mx-auto px-5 relative -mt-16 pb-16 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <!-- Left Column: Flight Details -->
        <main class="space-y-4">
          <!-- Card 1: Flight Overview & Detailed Timeline -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <!-- Flight Header -->
            <div class="flex items-center gap-3.5 flex-wrap pb-4 border-b border-[#e5edfa]">
              <span
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden shrink-0 shadow-xs"
                :style="{ background: rawFlight.c }"
              >
                <img
                  v-if="!logoState.failed"
                  :src="logoState.src"
                  alt=""
                  class="w-full h-full object-contain"
                  referrerpolicy="no-referrer"
                  @load="onLogoLoad"
                  @error="onLogoError"
                />
                <span v-else>{{ rawFlight.ini }}</span>
              </span>

              <div class="flex-1 min-w-[200px]">
                <div class="text-base font-bold text-[#0c1f44] leading-tight">
                  {{ rawFlight.al }}
                </div>
                <div class="text-xs text-[#63708b] mt-0.5">
                  {{ currentFareName }} · {{ segments.map(s => s.no).join(', ') }}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  v-if="isRefundable"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]"
                >
                  Refundable
                </span>
                <span
                  v-if="isChangeable"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]"
                >
                  Changeable
                </span>
              </div>
            </div>

            <!-- Flight Overview Line (Times & Duration) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-6 border-b border-[#e5edfa]">
              <!-- Departure -->
              <div>
                <div class="text-2xl font-bold font-mono text-[#0c1f44]">{{ firstSeg.dep }}</div>
                <div class="text-sm font-semibold text-[#0c1f44] mt-0.5">{{ firstSeg.from }}</div>
                <div class="text-xs text-[#63708b] mt-0.5">{{ DAYS[firstSeg.dd] }}</div>
              </div>

              <!-- Duration Bar -->
              <div class="text-center">
                <span class="text-xs font-semibold text-[#63708b]">{{ hm(totalDuration) }}</span>
                <div class="relative flex items-center justify-center my-2">
                  <div class="w-full h-0.5 bg-[#d9e3f3]"></div>
                  <div class="absolute left-0 w-2.5 h-2.5 rounded-full bg-[#4a6cc0] border-2 border-white"></div>
                  <div
                    v-for="(v, j) in viaAirports"
                    :key="v"
                    class="absolute w-2.5 h-2.5 rounded-full bg-[#f59e0b] border-2 border-white"
                    :style="{ left: `${((j + 1) * 100) / (viaAirports.length + 1)}%` }"
                  ></div>
                  <div class="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#4a6cc0] border-2 border-white"></div>
                </div>
                <span class="text-[11px] font-medium text-[#63708b]">
                  {{ viaAirports.length ? `${viaAirports.length} stop · ${viaAirports.join(', ')}` : 'Nonstop' }}
                </span>
              </div>

              <!-- Arrival -->
              <div class="md:text-right">
                <div class="text-2xl font-bold font-mono text-[#0c1f44] flex items-center md:justify-end gap-1">
                  <span>{{ lastSeg.arr }}</span>
                  <sup v-if="lastSeg.ad > firstSeg.dd" class="text-xs text-[#9a5a06] font-semibold">
                    +{{ lastSeg.ad - firstSeg.dd }}
                  </sup>
                </div>
                <div class="text-sm font-semibold text-[#0c1f44] mt-0.5">{{ lastSeg.to }}</div>
                <div class="text-xs text-[#63708b] mt-0.5">{{ DAYS[lastSeg.ad] }}</div>
              </div>
            </div>

            <!-- Detailed Itinerary Timeline -->
            <div class="mt-6 space-y-4">
              <template v-for="(s, j) in segments" :key="j">
                <!-- Flight Segment Node -->
                <div class="p-4 rounded-xl border border-[#e5edfa] bg-[#fbfcfe]">
                  <div class="flex items-center justify-between text-xs text-[#63708b] mb-2">
                    <span class="font-semibold text-[#0c1f44] flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none text-[#4a6cc0]" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                      {{ s.no }}
                    </span>
                    <span class="font-medium text-[#4a6cc0]">
                      {{ hm(s.m) }} · {{ getAirport(s.from)[0] }} to {{ getAirport(s.to)[0] }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="font-mono font-bold text-sm text-[#0c1f44]">{{ s.dep }}</span>
                      <span class="ml-2 font-semibold text-[#0c1f44]">{{ getAirport(s.from)[1] }} ({{ s.from }})</span>
                      <span class="ml-2 text-[#63708b]">{{ DAYS[s.dd] }}</span>
                    </div>
                    <div class="text-right">
                      <span class="font-mono font-bold text-sm text-[#0c1f44]">{{ s.arr }}</span>
                      <span class="ml-2 font-semibold text-[#0c1f44]">{{ getAirport(s.to)[1] }} ({{ s.to }})</span>
                      <span class="ml-2 text-[#63708b]">{{ DAYS[s.ad] }}</span>
                    </div>
                  </div>
                </div>

                <!-- Layover Notice (between legs) -->
                <div
                  v-if="j < segments.length - 1"
                  class="p-3 rounded-xl bg-[#fff8eb] border border-[#fde8c2] text-xs font-semibold text-[#9a5a06] flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{{ hm(layovers[j]) }} layover in {{ getAirport(s.to)[0] }}</span>
                  </div>
                  <span class="text-[11px] font-medium bg-white/70 px-2 py-0.5 rounded">
                    {{ layTag(layovers[j]) }}
                  </span>
                </div>
              </template>
            </div>
          </section>

          <!-- Card 2: What's Included -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-lg font-bold text-[#0c1f44] m-0 mb-4">What's included</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Checked bags -->
              <div class="flex items-center gap-3 p-3.5 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="w-8 h-8 rounded-lg bg-white border border-[#d3dff1] text-[#4a6cc0] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <rect x="4" y="7" width="16" height="14" rx="2" />
                    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M8 11v6M16 11v6" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#0c1f44]">
                    {{ rawFlight.bags + extraBagsCount }} checked bag{{ (rawFlight.bags + extraBagsCount) > 1 ? 's' : '' }}
                  </div>
                  <div class="text-[11px] text-[#63708b]">23 kg each</div>
                </div>
              </div>

              <!-- Cabin class -->
              <div class="flex items-center gap-3 p-3.5 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="w-8 h-8 rounded-lg bg-white border border-[#d3dff1] text-[#4a6cc0] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M4 18h16M6 18V9a3 3 0 013-3h1a3 3 0 013 3v9M13 12h4a2 2 0 012 2v4" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#0c1f44]">Cabin class</div>
                  <div class="text-[11px] text-[#63708b]">{{ cabinClass }}</div>
                </div>
              </div>

              <!-- Refundable -->
              <div class="flex items-center gap-3 p-3.5 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="w-8 h-8 rounded-lg bg-[#e5f6ee] text-[#0d8a58] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#0c1f44]">
                    {{ isRefundable ? 'Refundable' : 'Non-refundable' }}
                  </div>
                  <div class="text-[11px] text-[#63708b]">
                    {{ isRefundable ? 'Cancel for a fee, before travel' : 'No refund on this fare' }}
                  </div>
                </div>
              </div>

              <!-- Changeable -->
              <div class="flex items-center gap-3 p-3.5 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="w-8 h-8 rounded-lg bg-[#e5f6ee] text-[#0d8a58] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#0c1f44]">
                    {{ isChangeable ? 'Changeable' : 'No changes' }}
                  </div>
                  <div class="text-[11px] text-[#63708b]">
                    {{ isChangeable ? 'Change your date for a fee' : "Dates can't be changed" }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Card 3: Cancelling or Changing Policy -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-lg font-bold text-[#0c1f44] m-0 mb-4">Cancelling or changing</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <!-- Cancel Fee Box -->
              <div class="p-4 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="text-xs font-semibold text-[#63708b]">Cancel flight</div>
                <div class="text-lg font-bold font-mono text-[#0c1f44] mt-1">
                  {{ isRefundable ? `$${money(cancelFeeAmount)}` : 'Not allowed' }}
                </div>
                <div class="text-[11px] text-[#63708b] mt-1">
                  <span v-if="isRefundable">You'd get back about <b>${{ money(totalPrice - cancelFeeAmount) }}</b></span>
                  <span v-else>No refund on this fare</span>
                </div>
              </div>

              <!-- Change Fee Box -->
              <div class="p-4 rounded-xl border border-[#e5edfa] bg-[#f6f8fd]">
                <div class="text-xs font-semibold text-[#63708b]">Change date</div>
                <div class="text-lg font-bold font-mono text-[#0c1f44] mt-1">
                  {{ isChangeable ? (changeFeeAmount === 0 ? 'Free' : `$${money(changeFeeAmount)}`) : 'Not allowed' }}
                </div>
                <div class="text-[11px] text-[#63708b] mt-1">
                  {{ isChangeable ? 'Airline fee to move your flight' : "Dates can't be changed on this fare" }}
                </div>
              </div>
            </div>

            <!-- No Show Alert -->
            <div class="p-3 rounded-xl bg-[#fdecec]/50 border border-[#fecdca] text-xs text-[#b42318] flex items-center gap-2.5">
              <svg class="w-4 h-4 stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                <b>If you miss the flight (no-show),</b> refunds and changes are not allowed.
              </span>
            </div>
          </section>
        </main>

        <!-- Right Column: Sticky Price Summary -->
        <BookingSummarySidebar
          title="Price summary"
          :origin-code="originCode"
          :origin-name="originName"
          :dest-code="destCode"
          :dest-name="destName"
          :flight-name="rawFlight.al"
          :cabin-class="cabinClass"
          :trip-type="tripType"
          :date-text="DAYS[firstSeg.dd]"
          traveller-text="1 adult"
          :base-fare="baseFare"
          :taxes-and-fees="taxesAndFees"
          :extra-bags-count="extraBagsCount"
          :extra-bags-price="extraBagsPrice"
          :total-price="totalPrice"
          button-text="Continue booking"
          :show-badges="true"
          :is-refundable="isRefundable"
          :is-changeable="isChangeable"
          fine-print="Fares can change until you complete your booking."
          @submit="continueBooking"
        />
      </div>
    </div>
  </div>
</template>
