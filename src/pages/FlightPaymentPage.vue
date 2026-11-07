<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightBooking } from '../composables/useFlightBooking'
import FlightStepHero from '../components/flights/FlightStepHero.vue'
import FlightLegTimeline from '../components/flights/FlightLegTimeline.vue'
import FlightPolicySummary from '../components/flights/FlightPolicySummary.vue'
import BookingSummarySidebar from '../components/flights/BookingSummarySidebar.vue'

const router = useRouter()

// ── Shared Flight Data Composable ──────────────────────────
const {
  route,
  rawFlight,
  fromCode,
  toCode,
  fromName,
  toName,
  tripType,
  cabinClass,
  baseFare,
  taxesAndFees,
  extraBagsCount,
  extraBagsPrice,
  totalPrice,
  walletSpendingPower,
  chargedLyd,
  num,
  segments,
  firstSeg,
  lastSeg,
  cancelFee,
  changeFee,
  isCancellable,
  isChangeable,
} = useFlightBooking()

// ── Traveller Details State ────────────────────────────────
const traveller = ref({
  title: 'Mr',
  firstName: 'Ibrahim',
  lastName: 'Bader',
  gender: 'M',
  dob: '2001-11-20',
  nationality: 'AE',
  passportNumber: 'A12345678',
  passportExpiry: '2029-05-15',
  issuingCountry: 'AE',
})

const contact = ref({
  email: 'ibrahim.bader@example.com',
  phone: '+971 50 123 4567',
})

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('awan_traveller_details')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.title) traveller.value.title = parsed.title
      if (parsed.first) traveller.value.firstName = parsed.first
      if (parsed.last) traveller.value.lastName = parsed.last
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

function formatFullDate(dateStr: string): string {
  if (!dateStr) return 'Wednesday, 2 December 2026'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function formatSummaryDate(dateStr: string): string {
  if (!dateStr) return 'Wed 2 Dec'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(y, m - 1, d))
}

const summaryDateText = computed(() => {
  if (!firstSeg.value || !lastSeg.value) return 'Wed, 2 Dec'
  return `${formatSummaryDate(firstSeg.value.depDate)} → ${formatSummaryDate(lastSeg.value.arrDate)}`
})

function getCountryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}

function maskPassport(numStr: string): string {
  if (!numStr) return '••••••'
  const trimmed = numStr.trim()
  if (trimmed.length <= 4) return '•••' + trimmed
  return '••••••' + trimmed.slice(-3)
}

// ── Form State & Validation ────────────────────────────────
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

// ── Navigation ─────────────────────────────────────────────
function goToTravellers() {
  router.push({
    path: '/flights/traveller',
    query: route.query,
  })
}

// ── Confirmation Modal ─────────────────────────────────────
const showSuccessModal = ref(false)
const bookingReference = ref('BK-' + Math.floor(100000 + Math.random() * 900000))

async function handleConfirmBooking() {
  if (isBusy.value) return
  formSubmitted.value = true

  if (Object.keys(errors.value).length > 0) {
    showToast('Fix the highlighted items to continue.')
    return
  }

  isBusy.value = true
  await new Promise(r => setTimeout(r, 1200))
  isBusy.value = false
  showSuccessModal.value = true
}

function handleDone() {
  router.push('/operations/bookings')
}
</script>

<template>
  <div class="min-h-screen bg-transparent text-[#0c1f44]">
    <!-- Step 3 Hero Banner -->
    <FlightStepHero
      :current-step="3"
      title="Review & pay"
      subtitle="Check the details below, then confirm your booking."
      back-label="Edit traveller details"
      back-route="/flights/traveller"
    />

    <!-- Main Content Layout -->
    <div class="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 relative -mt-16 pb-16 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
        <!-- Left Column: Review Stack -->
        <main class="space-y-4">
          <!-- Card 1: Flight Details Timeline -->
          <FlightLegTimeline
            :segments="segments"
            :airline-name="rawFlight.al"
            :cabin-class="cabinClass"
            :trip-type="tripType"
          />

          <!-- Card 2: Cancellation & Change Policy -->
          <FlightPolicySummary
            :cancel-fee="cancelFee"
            :change-fee="changeFee"
            :is-cancellable="isCancellable"
            :is-changeable="isChangeable"
          />

          <!-- Card 3: Travellers Review -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-[#0c1f44] m-0">Travellers (1)</h2>
              <button
                type="button"
                class="text-xs font-semibold text-[#4a6cc0] hover:underline cursor-pointer"
                @click="goToTravellers"
              >
                Edit
              </button>
            </div>

            <div class="p-4 rounded-xl bg-[#f6f8fd] border border-[#d9e3f3]">
              <div class="text-sm font-bold text-[#0c1f44]">
                {{ traveller.title }} {{ traveller.firstName }} {{ traveller.lastName }}
              </div>
              <div class="text-xs text-[#63708b] mt-0.5">
                Adult · {{ traveller.gender === 'M' ? 'Male' : 'Female' }}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#e5edfa]">
                <div>
                  <div class="text-[11px] text-[#63708b]">Date of birth</div>
                  <div class="text-xs font-semibold text-[#0c1f44] mt-0.5">{{ formatDob(traveller.dob) }}</div>
                </div>
                <div>
                  <div class="text-[11px] text-[#63708b]">Nationality</div>
                  <div class="text-xs font-semibold text-[#0c1f44] mt-0.5">{{ getCountryName(traveller.nationality) }}</div>
                </div>
                <div>
                  <div class="text-[11px] text-[#63708b]">Passport</div>
                  <div class="text-xs font-semibold font-mono text-[#0c1f44] mt-0.5">{{ maskPassport(traveller.passportNumber) }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Card 4: Contact Details -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-[#0c1f44] m-0">Contact details</h2>
              <button
                type="button"
                class="text-xs font-semibold text-[#4a6cc0] hover:underline cursor-pointer"
                @click="goToTravellers"
              >
                Edit
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#f6f8fd] border border-[#d9e3f3]">
              <div>
                <div class="text-[11px] text-[#63708b]">Email</div>
                <div class="text-xs font-semibold text-[#0c1f44] mt-0.5">{{ contact.email }}</div>
              </div>
              <div>
                <div class="text-[11px] text-[#63708b]">Phone</div>
                <div class="text-xs font-semibold text-[#0c1f44] mt-0.5">{{ contact.phone }}</div>
              </div>
            </div>
          </section>

          <!-- Card 5: Payment Method -->
          <section
            class="bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors"
            :class="formSubmitted && errors.pay ? 'border-[#b42318] ring-1 ring-[#b42318]' : 'border-[#d3dff1]'"
          >
            <h2 class="text-lg font-bold text-[#0c1f44] m-0 mb-4">Payment method</h2>

            <label
              class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
              :class="selectedPayment === 'wallet' ? 'border-[#4a6cc0] bg-[#e9effb]/40 ring-1 ring-[#4a6cc0]' : 'border-[#d9e3f3] hover:bg-slate-50'"
            >
              <input
                type="radio"
                name="pay"
                value="wallet"
                v-model="selectedPayment"
                class="mt-1 accent-[#4a6cc0] cursor-pointer"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="text-sm font-bold text-[#0c1f44]">Agency Wallet</span>
                  <span class="text-xs font-semibold text-[#0d8a58] bg-[#e5f6ee] px-2 py-0.5 rounded-full">Available</span>
                </div>
                <div class="text-xs text-[#63708b] mt-1">
                  Spending power (balance + credit): <span class="font-mono font-medium text-[#0c1f44]">LYD {{ num(walletSpendingPower) }}</span>
                </div>
              </div>
            </label>

            <div class="mt-3.5 text-xs text-[#63708b] flex items-center justify-between bg-[#f6f8fd] p-3 rounded-xl border border-[#e5edfa]">
              <span>Charged to wallet (approx.):</span>
              <span class="font-mono font-bold text-[#0c1f44]">LYD {{ num(chargedLyd) }}</span>
            </div>

            <p v-if="formSubmitted && errors.pay" class="text-xs font-semibold text-[#b42318] mt-2 m-0" role="alert">
              {{ errors.pay }}
            </p>
          </section>

          <!-- Card 6: Double-Check Dates Confirmation -->
          <section
            class="bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors"
            :class="formSubmitted && errors.dates ? 'border-[#b42318] ring-1 ring-[#b42318]' : 'border-[#d3dff1]'"
          >
            <h2 class="text-lg font-bold text-[#0c1f44] m-0 mb-3">Double-check your travel dates</h2>

            <div v-if="firstSeg && lastSeg" class="p-3.5 rounded-xl bg-[#f6f8fd] border border-[#d9e3f3] text-xs space-y-1.5 mb-3.5">
              <div class="flex items-center justify-between flex-wrap gap-1">
                <span class="text-[#63708b]">Departure · <bdi class="font-mono">{{ firstSeg.from }}</bdi></span>
                <span class="font-semibold text-[#0c1f44]">{{ formatFullDate(firstSeg.depDate) }}, {{ firstSeg.depTime }}</span>
              </div>
              <div class="flex items-center justify-between flex-wrap gap-1">
                <span class="text-[#63708b]">Arrival · <bdi class="font-mono">{{ lastSeg.to }}</bdi></span>
                <span class="font-semibold text-[#0c1f44]">{{ formatFullDate(lastSeg.arrDate) }}, {{ lastSeg.arrTime }}</span>
              </div>
            </div>

            <label class="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-[#0c1f44]">
              <input
                type="checkbox"
                id="dates"
                v-model="agreeDates"
                class="mt-0.5 accent-[#4a6cc0] cursor-pointer"
              />
              <span>Yes, these travel dates are correct.</span>
            </label>

            <p class="text-[11px] text-[#63708b] mt-2 mb-0">
              Changing dates after booking costs approx. <span class="font-mono font-semibold">${{ num(changeFee) }}</span> per passenger.
            </p>

            <p v-if="formSubmitted && errors.dates" class="text-xs font-semibold text-[#b42318] mt-2 m-0" role="alert">
              {{ errors.dates }}
            </p>
          </section>

          <!-- Card 7: Booking Terms Agreement -->
          <section
            class="bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors"
            :class="formSubmitted && errors.terms ? 'border-[#b42318] ring-1 ring-[#b42318]' : 'border-[#d3dff1]'"
          >
            <label class="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-[#0c1f44]">
              <input
                type="checkbox"
                id="terms"
                v-model="agreeTerms"
                class="mt-0.5 accent-[#4a6cc0] cursor-pointer"
              />
              <span>
                I agree to the
                <a href="#terms" class="text-[#4a6cc0] hover:underline" @click.prevent="showToast('Viewing booking terms...')">booking terms</a>
                and the
                <a href="#cancellation" class="text-[#4a6cc0] hover:underline" @click.prevent="showToast('Viewing cancellation policy...')">cancellation policy</a>.
              </span>
            </label>

            <p v-if="formSubmitted && errors.terms" class="text-xs font-semibold text-[#b42318] mt-2 m-0" role="alert">
              {{ errors.terms }}
            </p>
          </section>
        </main>

        <!-- Right Column: Sticky Booking Summary -->
        <BookingSummarySidebar
          title="Booking summary"
          :origin-code="fromCode"
          :origin-name="fromName"
          :dest-code="toCode"
          :dest-name="toName"
          :flight-name="rawFlight.al"
          :cabin-class="cabinClass"
          :trip-type="tripType"
          :date-text="summaryDateText"
          traveller-text="1 traveller"
          :base-fare="baseFare"
          :taxes-and-fees="taxesAndFees"
          :extra-bags-count="extraBagsCount"
          :extra-bags-price="extraBagsPrice"
          :total-price="totalPrice"
          button-text="Confirm booking"
          :is-loading="isBusy"
          fine-print="When you confirm, the amount is charged to your wallet."
          @submit="handleConfirmBooking"
        />
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastVisible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0c1f44] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-150"
      role="status"
    >
      {{ toastMessage }}
    </div>

    <!-- Booking Confirmed Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="handleDone"
    >
      <div class="bg-white rounded-2xl max-w-[420px] w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div class="w-14 h-14 rounded-full bg-[#e5f6ee] text-[#0d8a58] flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[#0c1f44] m-0">Booking Confirmed!</h3>
        <p class="text-xs text-[#63708b] mt-1.5 mb-4">
          Reference: <span class="font-mono font-bold text-[#0c1f44]">{{ bookingReference }}</span>
        </p>
        <p class="text-xs text-[#3d4a66] leading-relaxed mb-6">
          Your flight from <b>{{ fromName }}</b> to <b>{{ toName }}</b> has been successfully booked and charged to your agency wallet.
        </p>
        <button
          type="button"
          class="w-full h-11 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-xs"
          @click="handleDone"
        >
          View in Bookings
        </button>
      </div>
    </div>
  </div>
</template>
