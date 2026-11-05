<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightBooking } from '../composables/useFlightBooking'
import FlightStepHero from '../components/flights/FlightStepHero.vue'
import BookingSummarySidebar from '../components/flights/BookingSummarySidebar.vue'
import PassportOcrScanner from '../components/common/PassportOcrScanner.vue'
import type { ParsedPassport } from '../utils/mrzParser'

const router = useRouter()

// ── Shared Flight Booking Composable ───────────────────────
const {
  route,
  rawFlight,
  fromCode,
  toCode,
  fromName,
  toName,
  tripType,
  cabinClass,
  dateText,
  baseFare,
  taxesAndFees,
  extraBagsCount,
  extraBagsPrice,
  totalPrice,
} = useFlightBooking()

const tripDate = new Date(2026, 11, 2)
const isoToday = new Date().toISOString().slice(0, 10)
const isoTrip = '2026-12-02'

// ── Country List ───────────────────────────────────────────
const CC = [
  'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'SY',
  'PS', 'YE', 'EG', 'LY', 'TN', 'DZ', 'MA', 'SD', 'MR', 'TR',
  'IR', 'PK', 'IN', 'MY', 'ID', 'GB', 'US', 'CA', 'FR', 'DE', 'IT', 'ES',
]

const countriesList = computed(() => {
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' })
    return CC.map(code => ({ code, name: dn.of(code) || code })).sort((a, b) =>
      a.name.localeCompare(b.name, 'en')
    )
  } catch {
    return CC.map(code => ({ code, name: code }))
  }
})

// ── Form State ─────────────────────────────────────────────
const D = ref({
  title: 'Mr',
  first: '',
  last: '',
  dob: '',
  gender: 'M',
  nat: 'AE',
  pno: '',
  exp: '',
  issue: 'AE',
  email: 'puzamyxaw@mailinator.com',
  phone: '+1 (711) 604-5424',
})

const touched = ref<Record<string, boolean>>({})

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('awan_traveller_details')
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(D.value, parsed)
    }
  } catch {}
})

function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || '')
  if (!m) return null
  const d = new Date(+m[1], +m[2] - 1, +m[3])
  return d.getDate() === +m[3] && d.getMonth() === +m[2] - 1 && d.getFullYear() > 1900 ? d : null
}

function getError(field: keyof typeof D.value): string {
  const v = D.value[field] || ''
  switch (field) {
    case 'title':
    case 'first':
    case 'last':
    case 'gender':
    case 'nat':
    case 'issue':
      return !v.trim() ? 'Required' : ''
    case 'pno':
      return v.trim().length < 5 ? 'Required' : ''
    case 'dob': {
      if (!v) return 'Required'
      const d = parseDate(v)
      if (!d) return 'Enter a valid date'
      if (d > new Date()) return "Date can't be in the future"
      return ''
    }
    case 'exp': {
      if (!v) return 'Required'
      const d = parseDate(v)
      if (!d) return 'Enter a valid date'
      if (d < tripDate) return 'Passport expires before your trip'
      return ''
    }
    case 'email':
      if (!v.trim()) return 'Required'
      if (!/^\S+@\S+\.\S+$/.test(v)) return 'Enter a valid email address'
      return ''
    case 'phone':
      return v.replace(/\D/g, '').length >= 7 ? '' : 'Required'
    default:
      return ''
  }
}

function onBlur(field: keyof typeof D.value) {
  touched.value[field] = true
}

function onPassportScanned(data: ParsedPassport) {
  if (data.title) D.value.title = data.title
  if (data.firstName) D.value.first = data.firstName
  if (data.lastName) D.value.last = data.lastName
  if (data.dateOfBirth) D.value.dob = data.dateOfBirth
  if (data.gender) D.value.gender = data.gender === 'Female' ? 'F' : 'M'
  if (data.nationality) D.value.nat = data.nationality
  if (data.passportNumber) D.value.pno = data.passportNumber
  if (data.expiryDate) D.value.exp = data.expiryDate
  if (data.issuingCountry) D.value.issue = data.issuingCountry
  touched.value = {}
}

const isTravellerDone = computed(() => {
  const fields: (keyof typeof D.value)[] = ['title', 'first', 'last', 'dob', 'gender', 'nat', 'pno', 'exp', 'issue']
  return fields.every(f => !getError(f))
})

const isContactDone = computed(() => !getError('email') && !getError('phone'))

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
  }, 2400)
}

function handleContinue() {
  Object.keys(D.value).forEach(k => {
    touched.value[k] = true
  })

  setTimeout(() => {
    const badEl = document.querySelector('.has-error') as HTMLElement | null
    if (badEl) {
      badEl.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const input = badEl.querySelector('input, select') as HTMLElement | null
      if (input) input.focus({ preventScroll: true })
      showToast('Please check the highlighted required fields')
      return
    }

    try {
      sessionStorage.setItem('awan_traveller_details', JSON.stringify(D.value))
    } catch {}

    router.push({
      path: '/flights/pay',
      query: route.query,
    })
  }, 50)
}
</script>

<template>
  <div class="min-h-screen bg-[#eef3fa] bg-[radial-gradient(rgba(12,31,68,0.07)_1px,transparent_1.2px)] bg-[size:18px_18px] text-[#0c1f44]">
    <!-- Step 2 Hero Banner -->
    <FlightStepHero
      :current-step="2"
      title="Traveller details"
      :subtitle="`${fromCode} → ${toCode} · ${dateText} · ${cabinClass} — Enter names exactly as they appear on the passport.`"
      back-label="Back to flight review"
      back-route="/flights/review"
    />

    <!-- Main Content Layout -->
    <div class="max-w-[1080px] mx-auto px-5 relative -mt-16 pb-16 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <!-- Left Column: Forms -->
        <main class="space-y-4">
          <!-- Traveller 1 Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center gap-2.5 flex-wrap mb-5">
              <span class="w-8 h-8 rounded-full bg-[#e9effb] text-[#4a6cc0] flex items-center justify-center">
                <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <h2 class="text-lg font-bold text-[#0c1f44] m-0">Traveller 1</h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f6f8fd] text-[#63708b] border border-[#d9e3f3]">
                Adult
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fff4dc] text-[#9a5a06]">
                Booking holder
              </span>
              <span
                v-if="isTravellerDone"
                class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e5f6ee] text-[#0d8a58] inline-flex items-center gap-1 ml-auto"
              >
                <svg class="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Complete
              </span>
            </div>

            <!-- Passport OCR Scanner Component -->
            <PassportOcrScanner @scan-complete="onPassportScanned" />

            <!-- Section: Personal details -->
            <div class="text-xs font-bold uppercase tracking-wider text-[#63708b] mb-3">
              Personal details
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 mb-5">
              <!-- Title -->
              <div class="sm:col-span-3" :class="{ 'has-error': touched.title && !!getError('title') }">
                <label for="title" class="block text-xs font-medium text-[#3d4a66] mb-1">Title</label>
                <select
                  id="title"
                  v-model="D.title"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.title && !!getError('title') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('title')"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
                <small v-if="touched.title && !!getError('title')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('title') }}
                </small>
              </div>

              <!-- First name -->
              <div class="sm:col-span-5" :class="{ 'has-error': touched.first && !!getError('first') }">
                <label for="first" class="block text-xs font-medium text-[#3d4a66] mb-1">First name</label>
                <input
                  id="first"
                  type="text"
                  v-model="D.first"
                  placeholder="IBRAHIM"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium uppercase tracking-wide transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.first && !!getError('first') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  autocomplete="off"
                  @blur="onBlur('first')"
                />
                <small v-if="touched.first && !!getError('first')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('first') }}
                </small>
              </div>

              <!-- Last name -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.last && !!getError('last') }">
                <label for="last" class="block text-xs font-medium text-[#3d4a66] mb-1">Last name</label>
                <input
                  id="last"
                  type="text"
                  v-model="D.last"
                  placeholder="BADER"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium uppercase tracking-wide transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.last && !!getError('last') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  autocomplete="off"
                  @blur="onBlur('last')"
                />
                <small v-if="touched.last && !!getError('last')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('last') }}
                </small>
              </div>

              <!-- Date of birth -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.dob && !!getError('dob') }">
                <label for="dob" class="block text-xs font-medium text-[#3d4a66] mb-1">Date of birth</label>
                <input
                  id="dob"
                  type="date"
                  v-model="D.dob"
                  min="1900-01-01"
                  :max="isoToday"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.dob && !!getError('dob') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('dob')"
                />
                <small v-if="touched.dob && !!getError('dob')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('dob') }}
                </small>
              </div>

              <!-- Gender -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.gender && !!getError('gender') }">
                <label class="block text-xs font-medium text-[#3d4a66] mb-1">Gender</label>
                <div class="h-10 grid grid-cols-2 p-1 rounded-xl bg-[#f6f8fd] border border-[#c9d6ec]">
                  <label
                    class="flex items-center justify-center text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    :class="D.gender === 'M' ? 'bg-[#4a6cc0] text-white shadow-2xs' : 'text-[#63708b] hover:text-[#0c1f44]'"
                  >
                    <input type="radio" name="gender" value="M" v-model="D.gender" class="sr-only" @change="onBlur('gender')" />
                    <span>Male</span>
                  </label>
                  <label
                    class="flex items-center justify-center text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    :class="D.gender === 'F' ? 'bg-[#4a6cc0] text-white shadow-2xs' : 'text-[#63708b] hover:text-[#0c1f44]'"
                  >
                    <input type="radio" name="gender" value="F" v-model="D.gender" class="sr-only" @change="onBlur('gender')" />
                    <span>Female</span>
                  </label>
                </div>
                <small v-if="touched.gender && !!getError('gender')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('gender') }}
                </small>
              </div>

              <!-- Nationality -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.nat && !!getError('nat') }">
                <label for="nat" class="block text-xs font-medium text-[#3d4a66] mb-1">Nationality</label>
                <select
                  id="nat"
                  v-model="D.nat"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.nat && !!getError('nat') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('nat')"
                >
                  <option v-for="c in countriesList" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
                <small v-if="touched.nat && !!getError('nat')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('nat') }}
                </small>
              </div>
            </div>

            <!-- Section: Passport -->
            <div class="text-xs font-bold uppercase tracking-wider text-[#63708b] mb-3">
              Passport
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <!-- Passport number -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.pno && !!getError('pno') }">
                <label for="pno" class="block text-xs font-medium text-[#3d4a66] mb-1">Passport number</label>
                <input
                  id="pno"
                  type="text"
                  v-model="D.pno"
                  placeholder="A12345678"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-mono font-medium uppercase tracking-wider transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.pno && !!getError('pno') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  autocomplete="off"
                  @blur="onBlur('pno')"
                />
                <small v-if="touched.pno && !!getError('pno')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('pno') }}
                </small>
              </div>

              <!-- Expiry date -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.exp && !!getError('exp') }">
                <label for="exp" class="block text-xs font-medium text-[#3d4a66] mb-1">Expiry date</label>
                <input
                  id="exp"
                  type="date"
                  v-model="D.exp"
                  :min="isoTrip"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.exp && !!getError('exp') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('exp')"
                />
                <small v-if="!(touched.exp && !!getError('exp'))" class="text-[11px] text-[#63708b] mt-1 block">
                  Should be valid for 6 months after you travel.
                </small>
                <small v-else class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('exp') }}
                </small>
              </div>

              <!-- Issuing country -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.issue && !!getError('issue') }">
                <label for="issue" class="block text-xs font-medium text-[#3d4a66] mb-1">Issuing country</label>
                <select
                  id="issue"
                  v-model="D.issue"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.issue && !!getError('issue') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('issue')"
                >
                  <option v-for="c in countriesList" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
                <small v-if="touched.issue && !!getError('issue')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('issue') }}
                </small>
              </div>
            </div>
          </section>

          <!-- Contact Details Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-lg font-bold text-[#0c1f44] m-0 mb-3.5">Contact details</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Email -->
              <div :class="{ 'has-error': touched.email && !!getError('email') }">
                <label for="email" class="block text-xs font-medium text-[#3d4a66] mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  inputmode="email"
                  v-model="D.email"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.email && !!getError('email') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('email')"
                />
                <small v-if="!(touched.email && !!getError('email'))" class="text-[11px] text-[#63708b] mt-1 block">
                  We'll send your booking confirmation here.
                </small>
                <small v-else class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('email') }}
                </small>
              </div>

              <!-- Phone -->
              <div :class="{ 'has-error': touched.phone && !!getError('phone') }">
                <label for="phone" class="block text-xs font-medium text-[#3d4a66] mb-1">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  v-model="D.phone"
                  class="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.phone && !!getError('phone') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('phone')"
                />
                <small v-if="touched.phone && !!getError('phone')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('phone') }}
                </small>
              </div>
            </div>
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
          :date-text="dateText"
          traveller-text="1 Adult"
          :base-fare="baseFare"
          :taxes-and-fees="taxesAndFees"
          :extra-bags-count="extraBagsCount"
          :extra-bags-price="extraBagsPrice"
          :total-price="totalPrice"
          button-text="Continue to review →"
          :show-checklist="true"
          :checklist-items="[
            { id: 'traveller', label: 'Traveller 1', done: isTravellerDone },
            { id: 'contact', label: 'Contact details', done: isContactDone },
          ]"
          fine-print="You'll check everything again before you pay."
          @submit="handleContinue"
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
  </div>
</template>
