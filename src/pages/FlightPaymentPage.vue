<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const fromCode = computed(() => {
  const q = (route.query.from as string) || ''
  return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[0]
})

const toCode = computed(() => {
  const q = (route.query.to as string) || ''
  return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[rawFlight.value.route.length - 1]
})

const fromName = computed(() => AIRPORT_NAMES[fromCode.value]?.[0] || fromCode.value)
const toName = computed(() => AIRPORT_NAMES[toCode.value]?.[0] || toCode.value)

const tripType = computed(() => (route.query.trip as string) || 'One way')
const cabinClass = computed(() => (route.query.cabin as string) || 'Economy')

// ── Fare Tiers & Pricing ───────────────────────────────────
const tierDiffs = [0, 85, 310, 880]
const tierDiff = computed(() => tierDiffs[selectedTierIndex.value] || 0)

const baseFare = computed(() => {
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
  return Math.round((baseFare.value + taxesAndFees.value + extraBagsPrice.value) * 100) / 100
})

const exchangeRate = 5.45 // LYD per USD
const walletSpendingPower = 88823.24
const chargedLyd = computed(() => Math.round(totalPrice.value * exchangeRate * 100) / 100)

function num(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Flight Segments & Date Formatting ──────────────────────
export interface PaySegment {
  from: string
  fromName: string
  to: string
  toName: string
  no: string
  depDate: string
  depTime: string
  arrDate: string
  arrTime: string
  durationMin: number
}

const segments = computed<PaySegment[]>(() => {
  const f = rawFlight.value
  if (f.id === 1) {
    return [
      {
        from: 'TUN',
        fromName: 'Tunis',
        to: 'DOH',
        toName: 'Doha',
        no: 'QR 1400',
        depDate: '2026-12-02',
        depTime: '16:00',
        arrDate: '2026-12-02',
        arrTime: '23:15',
        durationMin: 315,
      },
      {
        from: 'DOH',
        fromName: 'Doha',
        to: 'KUL',
        toName: 'Kuala Lumpur',
        no: 'QR 852',
        depDate: '2026-12-03',
        depTime: '02:20',
        arrDate: '2026-12-03',
        arrTime: '14:40',
        durationMin: 440,
      },
    ]
  }

  // Dynamic calculation for other flights
  const segs: PaySegment[] = []
  let dayOffset = 0
  let curHour = parseInt(f.dep.slice(0, 2), 10)
  let curMin = parseInt(f.dep.slice(3), 10)

  f.route.slice(0, -1).forEach((from, j) => {
    const to = f.route[j + 1]
    const durMins = f.sd[j] || 300
    const depStr = `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`

    const d1 = new Date(2026, 11, 2 + dayOffset)
    const depDateStr = d1.toISOString().slice(0, 10)

    let totalMins = curHour * 60 + curMin + durMins
    if (totalMins >= 1440) {
      dayOffset += Math.floor(totalMins / 1440)
      totalMins = totalMins % 1440
    }
    const arrHour = Math.floor(totalMins / 60)
    const arrMin = totalMins % 60
    const arrStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`

    const d2 = new Date(2026, 11, 2 + dayOffset)
    const arrDateStr = d2.toISOString().slice(0, 10)

    segs.push({
      from,
      fromName: AIRPORT_NAMES[from]?.[0] || from,
      to,
      toName: AIRPORT_NAMES[to]?.[0] || to,
      no: f.nos[j] || `${f.ini} ${100 + j}`,
      depDate: depDateStr,
      depTime: depStr,
      arrDate: arrDateStr,
      arrTime: arrStr,
      durationMin: durMins,
    })

    if (j < f.lay.length) {
      const layMins = f.lay[j] || 120
      let nextTotal = arrHour * 60 + arrMin + layMins
      if (nextTotal >= 1440) {
        dayOffset += Math.floor(nextTotal / 1440)
        nextTotal = nextTotal % 1440
      }
      curHour = Math.floor(nextTotal / 60)
      curMin = nextTotal % 60
    }
  })

  return segs
})

const firstSeg = computed(() => segments.value[0])
const lastSeg = computed(() => segments.value[segments.value.length - 1])

function parseUtc(dateStr: string, timeStr = '00:00'): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  return Date.UTC(y, m - 1, d, h, min)
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function formatSummaryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(y, m - 1, d))
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

const dayDifference = computed(() => {
  if (!firstSeg.value || !lastSeg.value) return 0
  const d1 = parseUtc(firstSeg.value.depDate)
  const d2 = parseUtc(lastSeg.value.arrDate)
  return Math.round((d2 - d1) / 864e5)
})

// ── Policy Details ─────────────────────────────────────────
const cancelFee = computed(() => rawFlight.value.cf ?? 130)
const changeFee = computed(() => rawFlight.value.chf ?? 70)
const isCancellable = computed(() => cancelFee.value !== null)
const isChangeable = computed(() => changeFee.value !== null)

// ── Traveller & Contact Details (from sessionStorage or defaults) ──
const traveller = ref({
  title: 'Mr',
  firstName: 'IBRAHIM',
  lastName: 'BADER',
  gender: 'M',
  dob: '2001-11-20',
  nationality: 'AE',
  passportNumber: 'AUTEM NULLA DOLORE M',
  passportExpiry: '2031-05-01',
})

const contact = ref({
  email: 'puzamyxaw@mailinator.com',
  phone: '+1 (711) 604-5424',
})

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('awan_traveller_details')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.first) traveller.value.firstName = parsed.first.toUpperCase()
      if (parsed.last) traveller.value.lastName = parsed.last.toUpperCase()
      if (parsed.title) traveller.value.title = parsed.title
      if (parsed.gender) traveller.value.gender = parsed.gender
      if (parsed.dob) traveller.value.dob = parsed.dob
      if (parsed.nat) traveller.value.nationality = parsed.nat
      if (parsed.pno) traveller.value.passportNumber = parsed.pno.toUpperCase()
      if (parsed.exp) traveller.value.passportExpiry = parsed.exp
      if (parsed.email) contact.value.email = parsed.email
      if (parsed.phone) contact.value.phone = parsed.phone
    }
  } catch (err) {
    console.error('Failed reading traveller data', err)
  }
})

function formatDob(dateStr: string): string {
  if (!dateStr) return '20 Nov 2001'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function getCountryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}

function maskPassport(num: string): string {
  if (!num) return '••••••'
  const trimmed = num.trim()
  if (trimmed.length <= 4) return '•••' + trimmed
  return '••••••' + trimmed.slice(-3)
}

// ── Interactive Form State & Validation ────────────────────
const agreeDates = ref(false)
const agreeTerms = ref(false)
const selectedPayment = ref('wallet')
const formSubmitted = ref(false)
const isBusy = ref(false)

const errors = computed(() => {
  const errs: Record<string, string> = {}
  if (!agreeDates.value) {
    errs.dates = 'Confirm that your travel dates are correct.'
  }
  if (!agreeTerms.value) {
    errs.terms = 'Accept the terms and conditions to continue.'
  }
  if (!selectedPayment.value) {
    errs.pay = 'Choose a payment method.'
  }
  return errs
})

// ── Toast Notification ─────────────────────────────────────
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}

// ── Navigation Helpers ─────────────────────────────────────
function goToTravellers() {
  router.push({
    path: '/flights/traveller',
    query: route.query,
  })
}

function goToFlightReview() {
  router.push({
    path: '/flights/review',
    query: route.query,
  })
}

// ── Confirmation Modal / Flow ──────────────────────────────
const showSuccessModal = ref(false)
const bookingReference = ref('BK-' + Math.floor(100000 + Math.random() * 900000))

async function handleConfirmBooking() {
  if (isBusy.value) return
  formSubmitted.value = true

  if (Object.keys(errors.value).length > 0) {
    showToast('Fix the highlighted items to continue.')
    setTimeout(() => {
      const badCard = document.querySelector('.card.bad') as HTMLElement | null
      if (badCard) {
        badCard.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }, 50)
    return
  }

  isBusy.value = true

  // Simulate server confirmation
  await new Promise(r => setTimeout(r, 1200))
  isBusy.value = false
  showSuccessModal.value = true
}

function handleDone() {
  router.push('/operations/bookings')
}
</script>

<template>
  <div class="flight-payment-page">
    <!-- Deep Navy Hero Banner with 3-Step Wizard -->
    <section class="hero">
      <div class="wrap">
        <!-- Back Navigation in Hero -->
        <div class="hero-top">
          <button type="button" class="hero-back" @click="goToTravellers">
            <svg class="i" viewBox="0 0 24 24">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            <span>Edit traveller details</span>
          </button>
        </div>

        <!-- 3-Step Wizard Indicator -->
        <ol class="steps">
          <li class="done clickable" role="button" tabindex="0" @click="goToFlightReview">
            <span class="n">
              <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke-width: 3">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <b>Select flight</b>
          </li>
          <li class="sl on"></li>
          <li class="done clickable" role="button" tabindex="0" @click="goToTravellers">
            <span class="n">
              <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke-width: 3">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <b>Traveller details</b>
          </li>
          <li class="sl on"></li>
          <li class="cur" aria-current="step">
            <span class="n">3</span>
            <b>Review & pay</b>
          </li>
        </ol>

        <h1>Review & pay</h1>
        <p>Check the details below, then confirm your booking.</p>
      </div>
    </section>

    <!-- Main Layout: Stack of Cards + Sticky Summary -->
    <div class="wrap lay">
      <main class="stack">
        <!-- Card 1: Flight details -->
        <section class="card pad">
          <div class="ch">
            <h2>Flight details</h2>
          </div>
          <p class="meta">
            {{ rawFlight.al }} · {{ cabinClass }} · {{ tripType }}
          </p>

          <!-- Travel Dates Group -->
          <div class="dates" role="group" aria-label="Travel dates">
            <div class="dd">
              <small>Departs</small>
              <b class="dv">{{ formatFullDate(firstSeg.depDate) }}</b>
              <span class="at">
                {{ firstSeg.depTime }} · <bdi class="mono">{{ firstSeg.from }}</bdi> {{ firstSeg.fromName }}
              </span>
            </div>

            <div class="dar" aria-hidden="true">
              <svg class="i" viewBox="0 0 24 24">
                <path d="M3 12h18M15 6l6 6-6 6" />
              </svg>
            </div>

            <div class="dd">
              <small>Arrives</small>
              <b class="dv">{{ formatFullDate(lastSeg.arrDate) }}</b>
              <span class="at">
                {{ lastSeg.arrTime }} · <bdi class="mono">{{ lastSeg.to }}</bdi> {{ lastSeg.toName }}
              </span>
              <em v-if="dayDifference > 0" class="pl">
                +{{ dayDifference }} day{{ dayDifference > 1 ? 's' : '' }}
              </em>
            </div>
          </div>

          <!-- Segments Timeline -->
          <div v-for="(seg, idx) in segments" :key="seg.no" class="seg-wrap">
            <!-- Layover between segments -->
            <div v-if="idx > 0" class="stop" :class="{ nx: seg.depDate !== segments[idx - 1].arrDate }">
              Layover in {{ segments[idx - 1].toName }}:
              {{
                formatDuration(
                  Math.round(
                    (parseUtc(seg.depDate, seg.depTime) -
                      parseUtc(segments[idx - 1].arrDate, segments[idx - 1].arrTime)) /
                      60000
                  )
                )
              }}
              <template v-if="seg.depDate !== segments[idx - 1].arrDate">
                <br />
                Your next flight leaves on <b>{{ formatShortDate(seg.depDate) }}</b>.
              </template>
            </div>

            <div class="leg">
              <div class="pt">
                <b class="tm mono">{{ seg.depTime }}</b>
                <span class="ap">
                  <i class="mono">{{ seg.from }}</i> {{ seg.fromName }}
                </span>
                <span class="dch">
                  <svg class="i" viewBox="0 0 24 24">
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                    <path d="M8 3v4M16 3v4M3.5 10h17" />
                  </svg>
                  {{ formatShortDate(seg.depDate) }}
                </span>
              </div>

              <div class="mid">
                {{ formatDuration(seg.durationMin) }}
                <span></span>
              </div>

              <div class="pt end">
                <b class="tm mono">{{ seg.arrTime }}</b>
                <span class="ap">
                  <i class="mono">{{ seg.to }}</i> {{ seg.toName }}
                </span>
                <span class="dch">
                  <svg class="i" viewBox="0 0 24 24">
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                    <path d="M8 3v4M16 3v4M3.5 10h17" />
                  </svg>
                  {{ formatShortDate(seg.arrDate) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cancellation & Change Policy -->
          <div class="sec">Cancellation & change policy</div>
          <div class="pills">
            <span v-if="isCancellable" class="pill">
              <svg class="i" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Cancellation available
            </span>
            <span v-if="isChangeable" class="pill">
              <svg class="i" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Change available
            </span>
          </div>

          <div class="pol">
            <span>Cancellation & refund, before departure</span>
            <b>
              <em>approx.</em>
              <bdi class="mono">${{ num(cancelFee) }}</bdi>
            </b>
          </div>

          <div class="pol">
            <span>Date change, before departure</span>
            <b>
              <em>approx.</em>
              <bdi class="mono">${{ num(changeFee) }}</bdi>
            </b>
          </div>

          <div class="pol">
            <span>Refund after no-show</span>
            <span class="no">Not permitted</span>
          </div>

          <div class="pol">
            <span>Change after no-show</span>
            <span class="no">Not permitted</span>
          </div>

          <p class="note">
            Fees are per passenger and approximate. The final amount is set when the request is made.
            <a href="#rules" @click.prevent="showToast('Viewing fare rules...')">Full fare rules</a>
          </p>
        </section>

        <!-- Card 2: Travellers -->
        <section class="card pad">
          <div class="ch">
            <h2>Travellers (1)</h2>
            <button type="button" class="lnk btn-link" @click="goToTravellers">
              Edit
            </button>
          </div>

          <div class="t">
            <div class="tn">
              {{ traveller.title }} {{ traveller.firstName }} {{ traveller.lastName }}
            </div>
            <div class="tm2">
              Adult · {{ traveller.gender === 'M' ? 'Male' : 'Female' }}
            </div>

            <div class="kv">
              <div>
                <small>Date of birth</small>
                <b>{{ formatDob(traveller.dob) }}</b>
              </div>
              <div>
                <small>Nationality</small>
                <b>{{ getCountryName(traveller.nationality) }}</b>
              </div>
              <div>
                <small>Passport</small>
                <b class="mono"><bdi>{{ maskPassport(traveller.passportNumber) }}</bdi></b>
              </div>
            </div>
          </div>
        </section>

        <!-- Card 3: Contact details -->
        <section class="card pad">
          <div class="ch">
            <h2>Contact details</h2>
            <button type="button" class="lnk btn-link" @click="goToTravellers">
              Edit
            </button>
          </div>

          <div class="kv kv2">
            <div>
              <small>Email</small>
              <b><bdi>{{ contact.email }}</bdi></b>
            </div>
            <div>
              <small>Phone</small>
              <b><bdi>{{ contact.phone }}</bdi></b>
            </div>
          </div>
        </section>

        <!-- Card 4: Payment method -->
        <section class="card pad" :class="{ bad: formSubmitted && errors.pay }">
          <div class="ch">
            <h2>Payment method</h2>
          </div>

          <label class="opt" :class="{ selected: selectedPayment === 'wallet' }">
            <input
              type="radio"
              name="pay"
              value="wallet"
              v-model="selectedPayment"
            />
            <span>
              <b>Wallet</b>
              <small>Spending power (balance + credit): <bdi class="mono">LYD {{ num(walletSpendingPower) }}</bdi></small>
            </span>
          </label>

          <p class="chg">
            Charged to wallet (approx.):
            <bdi class="mono">LYD {{ num(chargedLyd) }}</bdi>
          </p>

          <p v-if="formSubmitted && errors.pay" class="er" role="alert">
            {{ errors.pay }}
          </p>
        </section>

        <!-- Card 5: Double-check your travel dates -->
        <section class="card pad dchk" :class="{ bad: formSubmitted && errors.dates }">
          <div class="ch">
            <h2>Double-check your travel dates</h2>
          </div>

          <div class="rc">
            <div>
              <span>Departure · <bdi class="mono">{{ firstSeg.from }}</bdi></span>
              <b>{{ formatFullDate(firstSeg.depDate) }}, {{ firstSeg.depTime }}</b>
            </div>
            <div>
              <span>Arrival · <bdi class="mono">{{ lastSeg.to }}</bdi></span>
              <b>{{ formatFullDate(lastSeg.arrDate) }}, {{ lastSeg.arrTime }}</b>
            </div>
          </div>

          <label class="chk">
            <input type="checkbox" id="dates" v-model="agreeDates" />
            <span>Yes, these travel dates are correct.</span>
          </label>

          <p class="note">
            Changing dates after booking costs approx. <bdi class="mono">${{ num(changeFee) }}</bdi> per passenger.
          </p>

          <p v-if="formSubmitted && errors.dates" class="er" role="alert">
            {{ errors.dates }}
          </p>
        </section>

        <!-- Card 6: Terms & Conditions -->
        <section class="card pad" :class="{ bad: formSubmitted && errors.terms }">
          <label class="chk">
            <input type="checkbox" id="terms" v-model="agreeTerms" />
            <span>
              I agree to the
              <a href="#terms" @click.prevent="showToast('Viewing booking terms...')">booking terms</a>
              and the
              <a href="#cancellation" @click.prevent="showToast('Viewing cancellation policy...')">cancellation policy</a>.
            </span>
          </label>

          <p v-if="formSubmitted && errors.terms" class="er" role="alert">
            {{ errors.terms }}
          </p>
        </section>
      </main>

      <!-- Sidebar: Sticky Booking Summary -->
      <aside class="sum card">
        <div class="pad">
          <h3>Booking summary</h3>

          <div class="rt">
            {{ firstSeg.fromName }} <i class="mono">{{ firstSeg.from }}</i>
            <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px">
              <path d="M3 12h18M15 6l6 6-6 6" />
            </svg>
            {{ lastSeg.toName }} <i class="mono">{{ lastSeg.to }}</i>
          </div>

          <p class="sub dsum">
            {{ formatSummaryDate(firstSeg.depDate) }} → {{ formatSummaryDate(lastSeg.arrDate) }}
          </p>

          <p class="sub">
            {{ tripType }} · {{ rawFlight.al }} · {{ cabinClass }} · 1 traveller
          </p>

          <div class="rows">
            <div class="pr">
              <span>Base fare</span>
              <bdi class="mono">${{ num(baseFare) }}</bdi>
            </div>
            <div class="pr">
              <span>Taxes & fees</span>
              <bdi class="mono">${{ num(taxesAndFees) }}</bdi>
            </div>
            <div v-if="extraBagsCount > 0" class="pr">
              <span>Extra bags ({{ extraBagsCount }} × $50)</span>
              <bdi class="mono">${{ num(extraBagsPrice) }}</bdi>
            </div>
          </div>

          <div class="tot">
            <span>Total</span>
            <span>
              <small class="mono">USD</small>
              <b class="mono">{{ num(totalPrice) }}</b>
            </span>
          </div>

          <button
            type="button"
            class="btn"
            :disabled="isBusy"
            @click="handleConfirmBooking"
          >
            {{ isBusy ? 'Processing…' : 'Confirm booking' }}
          </button>

          <p class="fine">
            When you confirm, the amount is charged to your wallet.
          </p>
        </div>
      </aside>
    </div>

    <!-- Mobile Fixed Bottom CTA Bar -->
    <div class="mbar">
      <div>
        <small>
          Total · {{ formatSummaryDate(firstSeg.depDate) }} → {{ formatSummaryDate(lastSeg.arrDate) }}
        </small>
        <b class="mono">USD {{ num(totalPrice) }}</b>
      </div>
      <button
        type="button"
        class="btn"
        :disabled="isBusy"
        @click="handleConfirmBooking"
      >
        {{ isBusy ? 'Processing…' : 'Confirm' }}
      </button>
    </div>

    <!-- Toast Notification -->
    <div class="toast" :class="{ on: toastVisible }" role="status" aria-live="polite">
      {{ toastMessage }}
    </div>

    <!-- Success Confirmation Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="handleDone">
      <div class="modal-card">
        <div class="modal-icon">
          <svg class="i" viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke-width: 3">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3>Booking Confirmed!</h3>
        <p class="modal-ref">
          Reference: <b class="mono">{{ bookingReference }}</b>
        </p>
        <p class="modal-msg">
          Your flight from <b>{{ fromName }}</b> to <b>{{ toName }}</b> has been successfully booked and charged to your agency wallet.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn" @click="handleDone">
            View in Bookings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flight-payment-page {
  --page: #eef3fa;
  --line: #d9e3f3;
  --ink: #0c1f44;
  --sub: #3d4a66;
  --mute: #63708b;
  --navy: #0c1f44;
  --btn: #4a6cc0;
  --soft: #e9effb;
  --ok: #0d8a58;
  --okbg: #e5f6ee;
  --bad: #b42318;
  --fld: #c9d6ec;
  color-scheme: light;
  font: 14px/1.45 Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: var(--page) radial-gradient(rgba(12, 31, 68, 0.07) 1px, transparent 1.2px) 0 0/18px 18px;
}

button {
  font: inherit;
  color: inherit;
}

a {
  color: var(--btn);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

:focus-visible {
  outline: 2px solid var(--btn);
  outline-offset: 2px;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
}

bdi {
  unicode-bidi: isolate;
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

/* ── Hero Banner ─────────────────────────────────────────── */
.hero {
  background: var(--navy) radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1.2px) 0 0/18px 18px;
  color: #fff;
  padding: 24px 0 106px;
}

.hero-top {
  margin-bottom: 20px;
}

.hero-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #c9d7f3;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hero-back:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  text-decoration: none;
}

.steps {
  display: flex;
  align-items: center;
  gap: 10px;
  list-style: none;
  margin: 0 0 26px;
  padding: 0;
  max-width: 620px;
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

.steps .clickable {
  cursor: pointer;
  transition: opacity 0.15s;
}

.steps .clickable:hover {
  opacity: 0.9;
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

.steps .done .n {
  background: #2fbf86;
  border-color: #2fbf86;
  color: #fff;
}

.steps .done {
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

.hero h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.4px;
}

.hero p {
  margin: 6px 0 0;
  color: #a9bde6;
  font-size: 13.5px;
}

/* ── Content Layout ──────────────────────────────────────── */
.lay {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
  margin-top: -64px;
  position: relative;
  padding-bottom: 60px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.card {
  background: #fff;
  border: 1px solid #d3dff1;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.06), 0 10px 26px -16px rgba(12, 31, 68, 0.28);
  transition: border-color 0.15s ease;
}

.card.bad {
  border-color: var(--bad);
}

.pad {
  padding: 20px 22px;
}

.ch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.ch h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.btn-link {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--btn);
  font-size: 12.5px;
  font-weight: 600;
}
.btn-link:hover {
  text-decoration: underline;
}

.meta {
  margin: -6px 0 14px;
  font-size: 12.5px;
  color: var(--mute);
}

/* ── Travel Dates Overview Box ───────────────────────────── */
.dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin: 0 0 18px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #f6f9fe;
}

.dd {
  min-width: 0;
}

.dd small {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--mute);
}

.dd .dv {
  display: block;
  margin: 2px 0 3px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.dd .at {
  font-size: 12.5px;
  color: var(--sub);
}

.dar {
  color: var(--mute);
}
.dar svg {
  width: 18px;
  height: 18px;
}

.pl {
  display: inline-block;
  margin-inline-start: 6px;
  padding: 2px 7px;
  border-radius: 6px;
  background: #fef3c7;
  color: #92400e;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  vertical-align: middle;
}

.dd .pl {
  display: block;
  width: fit-content;
  margin: 6px 0 0;
}

/* ── Segment Legs ────────────────────────────────────────── */
.leg {
  display: grid;
  grid-template-columns: 1fr minmax(90px, 160px) 1fr;
  gap: 12px;
  align-items: center;
}

.pt b.tm {
  display: block;
  font-size: 22px;
  letter-spacing: -0.5px;
}

.pt .ap {
  display: block;
  font-size: 13px;
  color: var(--sub);
}

.pt .ap i {
  font-style: normal;
  font-weight: 700;
  color: var(--ink);
}

.pt small {
  color: var(--mute);
  font-size: 12px;
}

.pt.end {
  text-align: end;
}

.mid {
  text-align: center;
  font-size: 12px;
  color: var(--mute);
}

.mid span {
  display: block;
  height: 2px;
  margin-top: 6px;
  background: var(--line);
  border-radius: 2px;
}

.dch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 3px 9px;
  border-radius: 8px;
  background: var(--soft);
  color: var(--navy);
  font-size: 12.5px;
  font-weight: 700;
}
.dch svg {
  width: 14px;
  height: 14px;
}

.stop {
  margin: 14px 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f3f6fc;
  color: var(--sub);
  font-size: 12.5px;
  text-align: center;
}

.stop.nx {
  background: #fef3c7;
  color: #92400e;
}
.stop.nx b {
  color: #7c2d12;
}

/* ── Policy ──────────────────────────────────────────────── */
.pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--okbg);
  color: var(--ok);
}
.pill svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.6;
}

.sec {
  margin: 22px 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sub);
}

.pol {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid #eef1f6;
  font-size: 13.5px;
  color: var(--sub);
}

.pol em {
  font-style: normal;
  color: var(--mute);
  font-size: 12px;
  margin-inline-end: 6px;
}

.pol .no {
  color: var(--bad);
  font-weight: 600;
}

.pol b {
  color: var(--ink);
  white-space: nowrap;
}

.note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--mute);
}

/* ── Travellers & Key-Values ─────────────────────────────── */
.tn {
  font-weight: 700;
  font-size: 14.5px;
  word-break: break-word;
}

.tm2 {
  margin: 2px 0 12px;
  font-size: 12.5px;
  color: var(--mute);
}

.kv {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.kv div {
  background: #f3f6fc;
  border-radius: 10px;
  padding: 9px 12px;
  min-width: 0;
}

.kv small {
  display: block;
  font-size: 12px;
  color: var(--mute);
}

.kv b {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.kv2 {
  grid-template-columns: 1fr 1fr;
}

/* ── Payment Option ──────────────────────────────────────── */
.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1.5px solid var(--btn);
  border-radius: 12px;
  background: #f6f9fe;
  cursor: pointer;
  transition: all 0.15s ease;
}

.opt input {
  width: 18px;
  height: 18px;
  accent-color: var(--btn);
  margin: 0;
}

.opt b {
  display: block;
  font-size: 14.5px;
}

.opt small {
  color: var(--mute);
  font-size: 12.5px;
}

.chg {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--sub);
}

/* ── Date Check & Terms ──────────────────────────────────── */
.dchk {
  border-width: 2px;
}
.dchk:not(.bad) {
  border-color: var(--navy);
}

.rc {
  display: grid;
  gap: 8px;
  margin: 0 0 14px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #f6f9fe;
}

.rc div {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
  font-size: 13.5px;
  color: var(--sub);
}

.rc b {
  color: var(--ink);
}

.chk {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13.5px;
  color: var(--sub);
  cursor: pointer;
}

.chk input {
  width: 18px;
  height: 18px;
  margin: 1px 0 0;
  accent-color: var(--btn);
  flex: none;
}

.er {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--bad);
  font-weight: 600;
}

/* ── Sticky Summary Sidebar ──────────────────────────────── */
.sum {
  position: sticky;
  top: 16px;
}

.sum .pad {
  padding: 20px;
}

.sum h3 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
}

.rt {
  font-size: 14px;
  font-weight: 700;
}

.rt i {
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  color: var(--mute);
}

.sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--mute);
}

.dsum {
  color: var(--ink);
  font-weight: 700;
}

.rows {
  margin-top: 14px;
  border-top: 1px solid #eef1f6;
}

.pr {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  font-size: 13.5px;
  color: var(--sub);
}

.pr .mono {
  color: var(--ink);
}

.tot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 0 16px;
  border-top: 1px solid var(--line);
  font-weight: 700;
}

.tot b {
  font-size: 25px;
  letter-spacing: -0.8px;
  color: #243f7e;
}

.tot small {
  font-size: 12px;
  font-weight: 600;
  margin-inline-end: 4px;
}

.btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 46px;
  border-radius: 10px;
  border: 1px solid #4565b7;
  background: var(--btn);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.fine {
  margin: 12px 0 0;
  font-size: 11.5px;
  color: var(--mute);
  text-align: center;
}

/* ── Mobile Fixed Bar ────────────────────────────────────── */
.mbar {
  display: none;
}

/* ── Toast ───────────────────────────────────────────────── */
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translate(-50%, 14px);
  opacity: 0;
  pointer-events: none;
  background: #111827;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 40;
  max-width: 90vw;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.toast.on {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* ── Success Confirmation Modal ──────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 31, 68, 0.6);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  padding: 32px 28px;
  text-align: center;
  box-shadow: 0 20px 40px -10px rgba(12, 31, 68, 0.3);
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--okbg);
  color: var(--ok);
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}

.modal-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

.modal-ref {
  display: inline-block;
  margin: 0 0 14px;
  padding: 4px 12px;
  background: #f1f5fd;
  border-radius: 6px;
  font-size: 13px;
  color: var(--sub);
}

.modal-ref b {
  color: var(--btn);
}

.modal-msg {
  margin: 0 0 24px;
  font-size: 13.5px;
  color: var(--sub);
  line-height: 1.5;
}

.modal-actions .btn {
  height: 44px;
}

/* ── Responsive Rules ────────────────────────────────────── */
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
  .sum .btn,
  .sum .fine {
    display: none;
  }
  .sum .tot {
    padding-bottom: 0;
  }
  .mbar {
    display: flex;
    position: fixed;
    inset: auto 0 0;
    z-index: 25;
    align-items: center;
    gap: 14px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--line);
  }
  .mbar div {
    flex: 1;
  }
  .mbar small {
    display: block;
    font-size: 11.5px;
    color: var(--mute);
  }
  .mbar b {
    font-size: 19px;
  }
  .mbar .btn {
    width: auto;
    padding: 0 26px;
  }
  .toast {
    bottom: 84px;
  }
}

@media (max-width: 640px) {
  .wrap {
    padding: 0 12px;
  }
  .pad {
    padding: 16px;
  }
  .hero {
    padding-bottom: 84px;
  }
  .steps li:not(.cur) b {
    display: none;
  }
  .leg {
    grid-template-columns: 1fr 1fr;
  }
  .leg .mid {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  .kv {
    grid-template-columns: 1fr 1fr;
  }
  .dates {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .dar {
    transform: rotate(90deg);
    justify-self: start;
    margin-inline-start: 6px;
  }
}
</style>
