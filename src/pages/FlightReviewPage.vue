<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FLIGHTS,
  AIRPORT_NAMES,
  type RawFlight,
} from '../config/flightsData'

const route = useRoute()
const router = useRouter()

// ── Selected Flight Resolution ─────────────────────────────
const flightId = computed(() => Number(route.query.id) || 1)
const selectedTierIndex = computed(() => Number(route.query.tier) || 0)
const extraBagsCount = computed(() => Number(route.query.bags) || 0)

const rawFlight = computed<RawFlight>(() => {
  return FLIGHTS.find(f => f.id === flightId.value) || FLIGHTS[0]
})

// Query-based labels or intelligent defaults
const originCode = computed(() => {
  const q = (route.query.from as string) || ''
  return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[0]
})
const originName = computed(() => {
  const code = originCode.value
  return AIRPORT_NAMES[code]?.[0] || 'Tunis'
})

const destCode = computed(() => {
  const q = (route.query.to as string) || ''
  return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[rawFlight.value.route.length - 1]
})
const destName = computed(() => {
  const code = destCode.value
  return AIRPORT_NAMES[code]?.[0] || 'Kuala Lumpur'
})

const dateText = computed(() => (route.query.date as string) || 'Wed, 2 Dec')
const tripType = computed(() => (route.query.trip as string) || 'One way')
const cabinClass = computed(() => (route.query.cabin as string) || 'Economy')

// ── Fare Tiers ─────────────────────────────────────────────
const tierNames = ['Economy Classic', 'Economy Flex', 'Premium Economy', 'Business']
const tierDiffs = [0, 85, 310, 880]

const currentFareName = computed(() => {
  const idx = selectedTierIndex.value
  if (idx === 0) return rawFlight.value.fare
  return tierNames[idx] || rawFlight.value.fare
})

const tierDiff = computed(() => tierDiffs[selectedTierIndex.value] || 0)

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

// Build segments from raw flight data
const segments = computed<ReviewSegment[]>(() => {
  const f = rawFlight.value
  // Specific Qatar Airways 1 flight accurate times matching user mockup
  if (f.id === 1) {
    return [
      { from: 'TUN', to: 'DOH', no: 'QR 1400', dep: '16:00', dd: 0, arr: '23:15', ad: 0, m: 315 },
      { from: 'DOH', to: 'KUL', no: 'QR 852',  dep: '02:20', dd: 1, arr: '14:40', ad: 1, m: 440 },
    ]
  }

  // Generic dynamic segments for other flights
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

    // Advance for layover
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

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getAirport(code: string): [string, string] {
  return AIRPORT_NAMES[code] || [code, `${code} Airport`]
}

// ── Pricing Breakdown ──────────────────────────────────────
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

const baseFare = computed(() => {
  // If Qatar 1, match template base of 251.14
  if (rawFlight.value.id === 1 && selectedTierIndex.value === 0) return 251.14
  return Math.round((rawFlight.value.price * 0.48 + tierDiff.value) * 100) / 100
})

const taxesAndFees = computed(() => {
  if (rawFlight.value.id === 1 && selectedTierIndex.value === 0) return 268.34
  return Math.round((rawFlight.value.price * 0.52) * 100) / 100
})

const extraBagsPrice = computed(() => extraBagsCount.value * 50)

const totalPrice = computed(() => {
  if (rawFlight.value.id === 1 && selectedTierIndex.value === 0 && extraBagsCount.value === 0) {
    return 519.48
  }
  return baseFare.value + taxesAndFees.value + extraBagsPrice.value
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

// ── Actions ─────────────────────────────────────────────────
function goBack() {
  router.push({
    path: '/flights/results',
    query: route.query,
  })
}

function continueBooking() {
  router.push({
    path: '/flights/traveller',
    query: route.query,
  })
}
</script>

<template>
  <div class="flight-review-page">
    <!-- Sticky Navigation Top Bar -->
    <header class="bar">
      <div class="wrap bar-inner">
        <button type="button" class="back" @click="goBack">
          <svg class="i" viewBox="0 0 24 24">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to results
        </button>

        <span class="chip">
          <b>{{ originName }}</b><i>{{ originCode }}</i>
          <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px">
            <path d="M3 12h18M15 6l6 6-6 6" />
          </svg>
          <b>{{ destName }}</b><i>{{ destCode }}</i>
        </span>

        <span class="chip hide">
          <svg class="i" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {{ dateText }} · {{ tripType }}
        </span>

        <span class="chip hide">
          <svg class="i" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          1 adult · {{ cabinClass }}
        </span>
      </div>
    </header>

    <!-- Deep Navy Hero Banner with Flight Arc -->
    <section class="hero">
      <svg class="arc" viewBox="0 0 420 96" aria-hidden="true">
        <path class="a" d="M22 70 C 110 0, 300 0, 398 70" />
        <circle class="n" cx="22" cy="70" r="5" />
        <circle class="n" cx="398" cy="70" r="5" />
        <text class="t" x="22" y="91" text-anchor="middle">{{ originCode }}</text>
        <text class="t" x="398" y="91" text-anchor="middle">{{ destCode }}</text>
        <g transform="translate(210 18) rotate(45)">
          <path
            class="pl"
            transform="translate(-12 -12)"
            d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
          />
        </g>
      </svg>
      <div class="wrap">
        <!-- 3-Step Wizard Indicator -->
        <ol class="steps">
          <li class="cur" aria-current="step">
            <span class="n">1</span>
            <b>Select flight</b>
          </li>
          <li class="sl"></li>
          <li class="clickable" role="button" tabindex="0" @click="continueBooking">
            <span class="n">2</span>
            <b>Traveller details</b>
          </li>
          <li class="sl"></li>
          <li>
            <span class="n">3</span>
            <b>Review & pay</b>
          </li>
        </ol>

        <h1>Review your flight</h1>
        <p>Check the details below, then continue to passenger information.</p>
      </div>
    </section>

    <!-- Main Content Review Layout -->
    <div class="wrap lay">
      <main>
        <div class="stack">
          <!-- Card 1: Flight Overview & Detailed Timeline -->
          <section class="card pad">
            <!-- Flight Header -->
            <div class="fh">
              <span
                class="lg"
                :class="{ ok: logoState.loaded && !logoState.failed }"
                :style="{ background: rawFlight.c }"
              >
                {{ rawFlight.ini }}
                <img
                  v-if="!logoState.failed"
                  :src="logoState.src"
                  alt=""
                  referrerpolicy="no-referrer"
                  @load="onLogoLoad"
                  @error="onLogoError"
                />
              </span>

              <div class="an">
                <b>{{ rawFlight.al }}</b>
                <span>
                  {{ currentFareName }} · {{ segments.map(s => s.no).join(', ') }}
                </span>
              </div>

              <div class="pills">
                <span v-if="isRefundable" class="pill g">Refundable</span>
                <span v-if="isChangeable" class="pill g">Changeable</span>
              </div>
            </div>

            <!-- Flight Overview Row -->
            <div class="ov">
              <div class="pt">
                <b>{{ firstSeg.dep }}</b>
                <strong>{{ firstSeg.from }}</strong>
                <span>{{ DAYS[firstSeg.dd] }}</span>
              </div>

              <div class="ln">
                <span class="du">{{ hm(totalDuration) }}</span>
                <div class="tk">
                  <i style="left: 0"></i>
                  <i style="left: 100%"></i>
                  <i
                    v-for="(v, j) in viaAirports"
                    :key="v"
                    class="v"
                    :style="{ left: `${((j + 1) * 100) / (viaAirports.length + 1)}%` }"
                  ></i>
                </div>
                <span class="sp2">
                  {{ viaAirports.length ? `${viaAirports.length} stop${viaAirports.length > 1 ? 's' : ''} · ${viaAirports.join(', ')}` : 'Nonstop' }}
                </span>
              </div>

              <div class="pt e">
                <b>
                  {{ lastSeg.arr }}
                  <sup v-if="lastSeg.ad > firstSeg.dd">+{{ lastSeg.ad - firstSeg.dd }}</sup>
                </b>
                <strong>{{ lastSeg.to }}</strong>
                <span>{{ DAYS[lastSeg.ad] }}</span>
              </div>
            </div>

            <!-- Detailed Itinerary Timeline -->
            <div class="tlw">
              <template v-for="(s, j) in segments" :key="j">
                <!-- Departure Node -->
                <div class="tr">
                  <div class="tm">
                    <b>{{ s.dep }}</b>
                    <small>{{ DAYS[s.dd] }}</small>
                  </div>
                  <div class="rl">
                    <span class="u" :class="j === 0 ? 'no' : 'dash'"></span>
                    <span class="d" :class="j === 0 ? '' : ''"></span>
                    <i :class="{ v: j > 0 }"></i>
                  </div>
                  <div class="nd">
                    <b>{{ getAirport(s.from)[1] }} <em>{{ s.from }}</em></b>
                    <small v-if="j > 0">Departs</small>
                  </div>
                </div>

                <!-- Flight Leg Details -->
                <div class="tr">
                  <div></div>
                  <div class="rl">
                    <span class="f"></span>
                  </div>
                  <div class="nd">
                    <div class="leg">
                      <svg class="i" viewBox="0 0 24 24">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                      </svg>
                      {{ s.no }}
                      <span>{{ hm(s.m) }} · {{ getAirport(s.from)[0] }} to {{ getAirport(s.to)[0] }}</span>
                    </div>
                  </div>
                </div>

                <!-- Layover Node (if not last) -->
                <template v-if="j < segments.length - 1">
                  <!-- Arrival at Transit Airport -->
                  <div class="tr">
                    <div class="tm">
                      <b>{{ s.arr }}</b>
                      <small>{{ DAYS[s.ad] }}</small>
                    </div>
                    <div class="rl">
                      <span class="u"></span>
                      <span class="d dash"></span>
                      <i class="v"></i>
                    </div>
                    <div class="nd">
                      <b>{{ getAirport(s.to)[1] }} <em>{{ s.to }}</em></b>
                      <small>Arrives</small>
                    </div>
                  </div>

                  <!-- Layover Callout Box -->
                  <div class="tr">
                    <div></div>
                    <div class="rl">
                      <span class="f dash"></span>
                    </div>
                    <div class="nd">
                      <div class="lay-box">
                        <svg class="i" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        <div>
                          <b>{{ hm(layovers[j]) }} layover in {{ getAirport(s.to)[0] }}</b>
                          <small>
                            {{ layTag(layovers[j]) }}
                            <template v-if="segments[j + 1].dd > s.ad"> · overnight</template>
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Final Arrival Node (if last leg) -->
                <template v-else>
                  <div class="tr">
                    <div class="tm">
                      <b>
                        {{ s.arr }}
                        <sup v-if="s.ad > firstSeg.dd">+{{ s.ad - firstSeg.dd }}</sup>
                      </b>
                      <small>{{ DAYS[s.ad] }}</small>
                    </div>
                    <div class="rl">
                      <span class="u"></span>
                      <span class="d no"></span>
                      <i></i>
                    </div>
                    <div class="nd">
                      <b>{{ getAirport(s.to)[1] }} <em>{{ s.to }}</em></b>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </section>

          <!-- Card 2: What's Included -->
          <section class="card pad">
            <h2 class="ct">What's included</h2>
            <div class="inc">
              <!-- Checked bags -->
              <div class="it">
                <span class="ic">
                  <svg class="i" viewBox="0 0 24 24">
                    <rect x="4" y="7" width="16" height="14" rx="2" />
                    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M8 11v6M16 11v6" />
                  </svg>
                </span>
                <div>
                  <b>{{ rawFlight.bags + extraBagsCount }} checked bag{{ (rawFlight.bags + extraBagsCount) > 1 ? 's' : '' }}</b>
                  <small>23 kg each</small>
                </div>
              </div>

              <!-- Cabin class -->
              <div class="it">
                <span class="ic">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M4 18h16M6 18V9a3 3 0 013-3h1a3 3 0 013 3v9M13 12h4a2 2 0 012 2v4" />
                  </svg>
                </span>
                <div>
                  <b>Cabin class</b>
                  <small>{{ cabinClass }}</small>
                </div>
              </div>

              <!-- Refundable -->
              <div class="it" :class="{ g: isRefundable }">
                <span class="ic">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </span>
                <div>
                  <b>{{ isRefundable ? 'Refundable' : 'Non-refundable' }}</b>
                  <small>{{ isRefundable ? 'Cancel for a fee, before travel' : 'No refund on this fare' }}</small>
                </div>
              </div>

              <!-- Changeable -->
              <div class="it" :class="{ g: isChangeable }">
                <span class="ic">
                  <svg class="i" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
                <div>
                  <b>{{ isChangeable ? 'Changeable' : 'No changes' }}</b>
                  <small>{{ isChangeable ? 'Change your date for a fee' : 'Dates can\'t be changed' }}</small>
                </div>
              </div>
            </div>
          </section>

          <!-- Card 3: Cancelling or Changing Policy -->
          <section class="card pad">
            <h2 class="ct">Cancelling or changing</h2>
            <div class="fees">
              <!-- Cancel Fee Box -->
              <div class="fee">
                <div class="t">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M9 9l6 6M15 9l-6 6" />
                  </svg>
                  Cancel flight
                </div>
                <div class="amt mono">
                  {{ isRefundable ? `$${money(cancelFeeAmount)}` : 'Not allowed' }}
                </div>
                <small v-if="isRefundable">
                  You'd get back about <b>${{ money(totalPrice - cancelFeeAmount) }}</b>
                </small>
                <small v-else>No refund on this fare</small>
              </div>

              <!-- Change Fee Box -->
              <div class="fee">
                <div class="t">
                  <svg class="i" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  Change date
                </div>
                <div class="amt mono">
                  {{ isChangeable ? (changeFeeAmount === 0 ? 'Free' : `$${money(changeFeeAmount)}`) : 'Not allowed' }}
                </div>
                <small v-if="isChangeable">Airline fee to move your flight</small>
                <small v-else>Dates can't be changed on this fare</small>
              </div>
            </div>

            <!-- No Show Alert -->
            <div class="ns">
              <svg class="i" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <div>
                <b>If you miss the flight (no-show),</b> refunds and changes are not allowed.
              </div>
            </div>

            <p class="note">
              Fees are per passenger and apply before travel. Amounts are approximate and service fees may apply. The final amount is set when you make the request.
            </p>
          </section>
        </div>
      </main>

      <!-- Sidebar: Price Summary -->
      <aside class="sum card">
        <div class="pad">
          <h3>Price summary</h3>
          <p class="rt">
            {{ firstSeg.from }} → {{ lastSeg.to }} · {{ DAYS[firstSeg.dd] }} · 1 adult
          </p>

          <div class="price-rows">
            <div class="pr">
              <span>Base fare</span>
              <span class="mono">${{ money(baseFare) }}</span>
            </div>
            <div class="pr">
              <span>Taxes &amp; fees</span>
              <span class="mono">${{ money(taxesAndFees) }}</span>
            </div>
            <div v-if="extraBagsCount > 0" class="pr">
              <span>Extra bags ({{ extraBagsCount }} × $50)</span>
              <span class="mono">${{ money(extraBagsPrice) }}</span>
            </div>
          </div>

          <div class="tot">
            <span>Total</span>
            <b class="mono">${{ money(totalPrice) }}</b>
          </div>

          <button type="button" class="btn pri" @click="continueBooking">
            Continue booking
          </button>

          <div class="tr1">
            <span v-if="isRefundable" class="pill g">
              <svg class="i" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Refundable
            </span>
            <span v-if="isChangeable" class="pill g">
              <svg class="i" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Changeable
            </span>
          </div>

          <p class="fine">Fares can change until you complete your booking.</p>
        </div>
      </aside>
    </div>

    <!-- Mobile Fixed Bottom CTA Bar -->
    <div class="mbar">
      <div>
        <small>Total · 1 adult</small>
        <b class="mono">${{ money(totalPrice) }}</b>
      </div>
      <button type="button" class="btn pri" @click="continueBooking">
        Continue
      </button>
    </div>
  </div>
</template>

<style scoped>
.flight-review-page {
  --page: #eef3fa;
  --card: #fff;
  --line: #d9e3f3;
  --ink: #0c1f44;
  --sub: #3d4a66;
  --mute: #63708b;
  --navy: #0c1f44;
  --btn: #4a6cc0;
  --btn2: #4565b7;
  --soft: #e9effb;
  --ok: #0d8a58;
  --okbg: #e5f6ee;
  --warn: #9a5a06;
  --warnbg: #fff4dc;
  --bad: #b42318;
  --badbg: #fdecec;
  color-scheme: light;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--ink);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background-color: var(--page);
  background-image: radial-gradient(rgba(12, 31, 68, 0.07) 1px, transparent 1.2px);
  background-size: 18px 18px;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}

.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 20px;
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

button {
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
  border-radius: 10px;
  border: 1px solid var(--btn);
  background: #fff;
  color: var(--btn);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, filter 0.15s;
}

.btn:hover {
  background: var(--soft);
}

.btn:active {
  transform: scale(0.98);
}

.btn.pri {
  background: var(--btn);
  border-color: var(--btn2);
  color: #fff;
  height: 46px;
  font-size: 15px;
  font-weight: 700;
  width: 100%;
}

.btn.pri:hover {
  filter: brightness(1.08);
  background: var(--btn);
}

/* ── Top Bar ─────────────────────────────────────────────── */
.bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(12, 31, 68, 0.08);
}

.bar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 54px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.back {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px 0 8px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--btn);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.back:hover {
  background: var(--soft);
}

.back svg {
  width: 17px;
  height: 17px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--line);
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

/* ── Hero Section with Arc ───────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--navy);
  color: #fff;
  padding: 34px 0 106px;
  background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1.2px);
  background-size: 18px 18px;
}

.hero .wrap {
  position: relative;
  z-index: 1;
}

/* ── 3-Step Wizard Indicator ─────────────────────────────── */
.steps {
  display: flex;
  align-items: center;
  gap: 10px;
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  max-width: 580px;
  font-size: 13px;
  font-weight: 600;
  color: #a9bde6;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.steps .n {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.steps .done {
  color: #fff;
}

.steps .done .n {
  background: #2fbf86;
  border-color: #2fbf86;
  color: #fff;
}

.steps .cur {
  color: #fff;
}

.steps .cur .n {
  background: #fff;
  border-color: #fff;
  color: var(--navy);
}

.steps .sl {
  flex: 1;
  height: 2px;
  min-width: 16px;
  background: rgba(255, 255, 255, 0.18);
}

.steps .sl.on {
  background: #2fbf86;
}

.steps .clickable {
  cursor: pointer;
  transition: opacity 0.15s, color 0.15s;
}

.steps .clickable:hover {
  color: #fff;
}

.steps .clickable:hover .n {
  border-color: rgba(255, 255, 255, 0.65);
}

.hero h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero p {
  margin: 6px 0 0;
  color: #a9bde6;
  font-size: 13.5px;
}

.arc {
  position: absolute;
  right: max(20px, calc((100% - 1080px) / 2 + 20px));
  top: 10px;
  width: 420px;
  max-width: 46%;
  height: auto;
  color: #8fa9de;
  pointer-events: none;
}

.arc .a {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-dasharray: 3 7;
  stroke-linecap: round;
  opacity: 0.65;
}

.arc .n {
  fill: var(--navy);
  stroke: #8fa9de;
  stroke-width: 2;
}

.arc .t {
  fill: #a9bde6;
  font: 600 11px "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: 0.5px;
}

.arc .pl {
  fill: #fff;
}

/* ── Layout Overlapping Hero ─────────────────────────────── */
.lay {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
  margin-top: -68px;
  position: relative;
  padding-bottom: 60px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  background: #fff;
  border: 1px solid #d3dff1;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.06), 0 10px 26px -16px rgba(12, 31, 68, 0.28);
}

.pad {
  padding: 18px 20px;
}

.ct {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
}

/* ── Flight Header + Overview ────────────────────────────── */
.fh {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lg {
  position: relative;
  overflow: hidden;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  flex: none;
}

.lg img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
  padding: 5px;
}

.lg.ok {
  background: #fff !important;
  color: transparent !important;
  box-shadow: inset 0 0 0 1px var(--line);
}

.an b {
  display: block;
  font-size: 14.5px;
  font-weight: 700;
}

.an span {
  font-size: 12.5px;
  color: var(--mute);
}

.pills {
  margin-left: auto;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  background: #eef2f8;
  color: var(--sub);
}

.pill svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.4;
}

.pill.g {
  background: var(--okbg);
  color: var(--ok);
}

.ov {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  gap: 16px;
  align-items: center;
  margin-top: 20px;
}

.pt b {
  display: block;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.8px;
  line-height: 1.1;
}

.pt b sup {
  font-size: 11px;
  color: #c2410c;
  font-weight: 700;
  margin-left: 2px;
  letter-spacing: 0;
  vertical-align: top;
}

.pt strong {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
}

.pt span {
  font-size: 12px;
  color: var(--mute);
}

.pt.e {
  text-align: right;
}

.ln {
  text-align: center;
}

.du {
  font-size: 12.5px;
  font-weight: 600;
}

.tk {
  position: relative;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #8fa9de, #c4d3ee 50%, #8fa9de);
  margin: 10px 4px;
}

.tk i {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
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
  background: var(--warnbg);
  color: var(--warn);
  font-size: 11.5px;
  font-weight: 600;
}

/* ── Timeline ────────────────────────────────────────────── */
.tlw {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e6ecf6;
}

.tr {
  display: grid;
  grid-template-columns: 64px 16px minmax(0, 1fr);
  column-gap: 12px;
}

.tm {
  text-align: right;
}

.tm b {
  display: block;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.tm b sup {
  font-size: 9px;
  color: #c2410c;
  margin-left: 1px;
}

.tm small {
  display: block;
  font-size: 11px;
  color: var(--mute);
  line-height: 1.3;
  white-space: nowrap;
}

.rl {
  position: relative;
}

.rl span {
  position: absolute;
  left: 50%;
  margin-left: -1px;
  border-left: 2px solid #c5d1ea;
}

.rl .u {
  top: 0;
  height: 10px;
}

.rl .d {
  top: 10px;
  bottom: 0;
}

.rl .f {
  top: 0;
  bottom: 0;
}

.rl .dash {
  border-left-style: dashed;
  border-left-color: #e3b052;
}

.rl .no {
  display: none;
}

.rl i {
  position: absolute;
  left: 50%;
  top: 5px;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: var(--btn);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px var(--btn);
  z-index: 1;
}

.rl i.v {
  background: #fff;
  box-shadow: 0 0 0 1.5px #e09a1a;
}

.nd > b {
  display: block;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.nd > b em {
  font-style: normal;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--mute);
  font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}

.nd > small {
  display: block;
  font-size: 12px;
  color: var(--mute);
}

.leg {
  padding: 10px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sub);
  flex-wrap: wrap;
}

.leg svg {
  color: var(--btn);
  width: 14px;
  height: 14px;
}

.leg span {
  font-weight: 400;
  color: var(--mute);
}

.lay-box {
  margin: 10px 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--warnbg);
  color: var(--warn);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12.5px;
  line-height: 1.4;
}

.lay-box svg {
  margin-top: 1px;
}

.lay-box b {
  display: block;
  font-size: 13px;
}

.lay-box small {
  display: block;
  margin-top: 1px;
  font-size: 11.5px;
  opacity: 0.85;
}

/* ── Included Grid ───────────────────────────────────────── */
.inc {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.it {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: #fbfcff;
}

.it .ic {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: var(--soft);
  color: var(--btn);
  flex: none;
}

.it.g .ic {
  background: var(--okbg);
  color: var(--ok);
}

.it b {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
}

.it small {
  display: block;
  margin-top: 1px;
  font-size: 12px;
  color: var(--mute);
}

/* ── Fees ────────────────────────────────────────────────── */
.fees {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fee {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: #fbfcff;
}

.fee .t {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sub);
}

.fee .t svg {
  color: var(--btn);
}

.fee .amt {
  margin: 8px 0 3px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.fee small {
  display: block;
  font-size: 12px;
  color: var(--mute);
  line-height: 1.4;
}

.fee small b {
  color: var(--ink);
  font-weight: 600;
}

.ns {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 11px 14px;
  border-radius: 10px;
  background: var(--badbg);
  color: var(--bad);
  font-size: 12.5px;
  line-height: 1.4;
}

.ns svg {
  margin-top: 1px;
}

.ns b {
  font-weight: 600;
}

.note {
  margin: 12px 2px 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--mute);
}

/* ── Price Summary Sidebar ───────────────────────────────── */
.sum {
  position: sticky;
  top: 70px;
}

.sum .pad {
  padding: 20px;
}

.sum h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
}

.sum .rt {
  margin: 0 0 14px;
  font-size: 12.5px;
  color: var(--mute);
}

.pr {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 9px 0;
  font-size: 13.5px;
  color: var(--sub);
}

.pr + .pr {
  border-top: 1px solid #eef1f6;
}

.pr .mono {
  color: var(--ink);
  font-size: 13.5px;
}

.tot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 6px 0 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.tot span {
  font-weight: 700;
  font-size: 14px;
}

.tot b {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: #243f7e;
}

.tr1 {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.fine {
  margin: 12px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--mute);
  text-align: center;
}

/* ── Mobile Fixed Bar & Toast ────────────────────────────── */
.mbar {
  display: none;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
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
  white-space: nowrap;
}

.toast.on {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

@media (max-width: 900px) {
  .lay {
    grid-template-columns: 1fr;
    padding-bottom: 100px;
  }
  .sum {
    position: static;
  }
  .sum .btn.pri,
  .sum .fine {
    display: none;
  }
  .mbar {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 25;
    align-items: center;
    gap: 14px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--line);
  }
  .mbar div {
    flex: 1;
    line-height: 1.25;
  }
  .mbar small {
    display: block;
    font-size: 11.5px;
    color: var(--mute);
  }
  .mbar b {
    font-size: 20px;
    letter-spacing: -0.5px;
  }
  .mbar .btn {
    width: auto;
    padding: 0 28px;
    flex: none;
  }
  .toast {
    bottom: 84px;
  }
}

@media (max-width: 640px) {
  .wrap {
    padding: 0 12px;
  }
  .hero {
    padding: 22px 0 84px;
  }
  .hero h1 {
    font-size: 23px;
  }
  .steps li:not(.cur) b {
    display: none;
  }
  .arc {
    display: none;
  }
  .lay {
    margin-top: -60px;
  }
  .chip.hide {
    display: none;
  }
  .pad {
    padding: 16px;
  }
  .pills {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }
  .fh {
    flex-wrap: wrap;
  }
  .ov {
    grid-template-columns: 72px 1fr 72px;
    gap: 10px;
  }
  .pt b {
    font-size: 21px;
  }
  .tr {
    grid-template-columns: 58px 14px minmax(0, 1fr);
    column-gap: 10px;
  }
  .inc,
  .fees {
    grid-template-columns: 1fr;
  }
}
</style>
