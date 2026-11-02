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

// LABELS (English only)
const S: Record<string, string> = {
  back: 'Back to flight review',
  s1: 'Select flight',
  s2: 'Traveller details',
  s3: 'Review & pay',
  h1: 'Traveller details',
  sub: 'Enter names exactly as they appear on the passport. All fields are required.',
  traveller: 'Traveller',
  adult: 'Adult',
  holder: 'Booking holder',
  done: 'Complete',
  personal: 'Personal details',
  pass: 'Passport',
  title: 'Title',
  Mr: 'Mr',
  Mrs: 'Mrs',
  Ms: 'Ms',
  first: 'First name',
  last: 'Last name',
  dob: 'Date of birth',
  gender: 'Gender',
  M: 'Male',
  F: 'Female',
  nat: 'Nationality',
  pno: 'Passport number',
  exp: 'Expiry date',
  issue: 'Issuing country',
  select: 'Select',
  expH: 'Should be valid for 6 months after you travel.',
  contact: 'Contact details',
  email: 'Email',
  emailH: 'We\'ll send your booking confirmation here.',
  phone: 'Phone number',
  summary: 'Booking summary',
  base: 'Base fare',
  taxes: 'Taxes & fees',
  total: 'Total',
  refundable: 'Refundable',
  cont: 'Continue to review',
  cont2: 'Continue',
  fine: 'You\'ll check everything again before you pay.',
  todo: 'To do',
  ok: 'Details look good. Continuing to review.',
  e_req: 'Required',
  e_date: 'Enter a valid date',
  e_future: 'Date can\'t be in the future',
  e_exp: 'Passport expires before your trip',
  e_email: 'Enter a valid email address',
}

const t = (k: string) => S[k] ?? k

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

// FLIGHT DATA
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

const tripDate = new Date(2026, 11, 2)

const dtf = computed(() => {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(tripDate)
})

const dateText = computed(() => (route.query.date as string) || dtf.value)
const tripType = computed(() => (route.query.trip as string) || 'One way')
const cabinClass = computed(() => (route.query.cabin as string) || 'Economy')

// PRICING
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
  return baseFare.value + taxesAndFees.value + extraBagsPrice.value
})

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// FORM STATE
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

const isoToday = new Date().toISOString().slice(0, 10)
const isoTrip = '2026-12-02'

function getError(field: keyof typeof D.value): string {
  const v = D.value[field] || ''
  switch (field) {
    case 'title': case 'first': case 'last': case 'gender': case 'nat': case 'issue':
      return !v.trim() ? 'req' : ''
    case 'pno':
      return v.trim().length < 5 ? 'req' : ''
    case 'dob': {
      if (!v) return 'req'
      const d = parseDate(v)
      if (!d) return 'date'
      if (d > new Date()) return 'future'
      return ''
    }
    case 'exp': {
      if (!v) return 'req'
      const d = parseDate(v)
      if (!d) return 'date'
      if (d < tripDate) return 'exp'
      return ''
    }
    case 'email':
      if (!v.trim()) return 'req'
      if (!/^\S+@\S+\.\S+$/.test(v)) return 'email'
      return ''
    case 'phone':
      return v.replace(/\D/g, '').length >= 7 ? '' : 'req'
    default: return ''
  }
}

function onBlur(field: keyof typeof D.value) {
  touched.value[field] = true
}

const isTravellerDone = computed(() => {
  const fields: (keyof typeof D.value)[] = ['title','first','last','dob','gender','nat','pno','exp','issue']
  return fields.every(f => !getError(f))
})

const isContactDone = computed(() => !getError('email') && !getError('phone'))

// TOAST + ACTIONS
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2400)
}

function goBack() {
  router.push({ path: '/flights/review', query: route.query })
}

function handleContinue() {
  Object.keys(D.value).forEach(k => { touched.value[k] = true })
  setTimeout(() => {
    const badEl = document.querySelector('.bad') as HTMLElement | null
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
  <div class="traveller-details-page">
    <!-- Deep Navy Hero Banner with 3-Step Wizard -->
    <section class="hero">
      <div class="wrap">
        <!-- Back Navigation in Hero -->
        <div class="hero-top">
          <button type="button" class="hero-back" @click="goBack">
            <svg class="i" viewBox="0 0 24 24">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            <span>Back to flight review</span>
          </button>
        </div>

        <ol class="steps">
          <li class="done clickable" role="button" tabindex="0" @click="goBack">
            <span class="n">
              <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke-width: 3">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <b>{{ t('s1') }}</b>
          </li>
          <li class="sl on"></li>
          <li class="cur" aria-current="step">
            <span class="n">2</span>
            <b>{{ t('s2') }}</b>
          </li>
          <li class="sl"></li>
          <li>
            <span class="n">3</span>
            <b>{{ t('s3') }}</b>
          </li>
        </ol>

        <h1>{{ t('h1') }}</h1>
        <p>{{ t('sub') }}</p>
      </div>
    </section>

    <!-- Main Layout: Form Cards + Summary Sidebar -->
    <div class="wrap lay">
      <main>
        <div class="stack" id="form">
          <!-- Trip Overview Card: Clear, visible double-check bar for route & date -->
          <div class="trip-check-card">
            <div class="trip-check-card__item">
              <span class="trip-check-card__icon-box route-icon">
                <svg class="i" viewBox="0 0 24 24">
                  <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </span>
              <div class="trip-check-card__text">
                <small>Flight route</small>
                <b>{{ fromName }} ({{ fromCode }}) → {{ toName }} ({{ toCode }})</b>
              </div>
            </div>

            <div class="trip-check-card__sep"></div>

            <div class="trip-check-card__item">
              <span class="trip-check-card__icon-box date-icon">
                <svg class="i" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
              </span>
              <div class="trip-check-card__text">
                <small>Travel date</small>
                <b>{{ dateText }} · {{ tripType }}</b>
              </div>
            </div>

            <div class="trip-check-card__sep hide-sm"></div>

            <div class="trip-check-card__item hide-sm">
              <span class="trip-check-card__icon-box air-icon">
                <svg class="i" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a9 9 0 0 0 0 18M3 12h18" />
                </svg>
              </span>
              <div class="trip-check-card__text">
                <small>Airline & Cabin</small>
                <b>{{ rawFlight.al }} · {{ cabinClass }}</b>
              </div>
            </div>

            <button type="button" class="trip-check-card__btn" @click="goBack" title="Change flight or travel date">
              <span>Change</span>
            </button>
          </div>

          <!-- Traveller 1 Card -->
          <section class="card pad">
            <div class="th">
              <span class="av">
                <svg class="i" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <h2>{{ t('traveller') }} 1</h2>
              <span class="pill">{{ t('adult') }}</span>
              <span class="pill a">{{ t('holder') }}</span>
              <span v-if="isTravellerDone" class="pill g">
                <svg class="i" viewBox="0 0 24 24" style="stroke-width: 3">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {{ t('done') }}
              </span>
            </div>

            <!-- Section: Personal Details -->
            <div class="sec">{{ t('personal') }}</div>
            <div class="g">
              <!-- Title -->
              <div
                class="f s3"
                :class="{ bad: touched.title && !!getError('title') }"
              >
                <label for="title">{{ t('title') }}</label>
                <select
                  id="title"
                  class="in sel"
                  v-model="D.title"
                  @blur="onBlur('title')"
                >
                  <option value="" disabled hidden>{{ t('select') }}</option>
                  <option value="Mr">{{ t('Mr') }}</option>
                  <option value="Mrs">{{ t('Mrs') }}</option>
                  <option value="Ms">{{ t('Ms') }}</option>
                </select>
                <small v-if="touched.title && !!getError('title')" class="er">
                  {{ t('e_' + getError('title')) }}
                </small>
              </div>

              <!-- First Name -->
              <div
                class="f s5"
                :class="{ bad: touched.first && !!getError('first') }"
              >
                <label for="first">{{ t('first') }}</label>
                <input
                  id="first"
                  type="text"
                  class="in nm l"
                  v-model="D.first"
                  placeholder="IBRAHIM"
                  autocomplete="off"
                  @blur="onBlur('first')"
                />
                <small v-if="touched.first && !!getError('first')" class="er">
                  {{ t('e_' + getError('first')) }}
                </small>
              </div>

              <!-- Last Name -->
              <div
                class="f s4"
                :class="{ bad: touched.last && !!getError('last') }"
              >
                <label for="last">{{ t('last') }}</label>
                <input
                  id="last"
                  type="text"
                  class="in nm l"
                  v-model="D.last"
                  placeholder="BADER"
                  autocomplete="off"
                  @blur="onBlur('last')"
                />
                <small v-if="touched.last && !!getError('last')" class="er">
                  {{ t('e_' + getError('last')) }}
                </small>
              </div>

              <!-- Date of Birth -->
              <div
                class="f s4"
                :class="{ bad: touched.dob && !!getError('dob') }"
              >
                <label for="dob">{{ t('dob') }}</label>
                <input
                  id="dob"
                  type="date"
                  class="in"
                  min="1900-01-01"
                  :max="isoToday"
                  v-model="D.dob"
                  @blur="onBlur('dob')"
                />
                <small v-if="touched.dob && !!getError('dob')" class="er">
                  {{ t('e_' + getError('dob')) }}
                </small>
              </div>

              <!-- Gender Radio Segment -->
              <div
                class="f s4"
                :class="{ bad: touched.gender && !!getError('gender') }"
              >
                <label>{{ t('gender') }}</label>
                <div class="seg" role="radiogroup">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      v-model="D.gender"
                      @change="onBlur('gender')"
                    />
                    <span>{{ t('M') }}</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      v-model="D.gender"
                      @change="onBlur('gender')"
                    />
                    <span>{{ t('F') }}</span>
                  </label>
                </div>
                <small v-if="touched.gender && !!getError('gender')" class="er">
                  {{ t('e_' + getError('gender')) }}
                </small>
              </div>

              <!-- Nationality -->
              <div
                class="f s4"
                :class="{ bad: touched.nat && !!getError('nat') }"
              >
                <label for="nat">{{ t('nat') }}</label>
                <select
                  id="nat"
                  class="in sel"
                  v-model="D.nat"
                  @blur="onBlur('nat')"
                >
                  <option value="" disabled hidden>{{ t('select') }}</option>
                  <option
                    v-for="c in countriesList"
                    :key="c.code"
                    :value="c.code"
                  >
                    {{ c.name }}
                  </option>
                </select>
                <small v-if="touched.nat && !!getError('nat')" class="er">
                  {{ t('e_' + getError('nat')) }}
                </small>
              </div>
            </div>

            <!-- Section: Passport -->
            <div class="sec">{{ t('pass') }}</div>
            <div class="g">
              <!-- Passport Number -->
              <div
                class="f s4"
                :class="{ bad: touched.pno && !!getError('pno') }"
              >
                <label for="pno">{{ t('pno') }}</label>
                <input
                  id="pno"
                  type="text"
                  class="in nm l mono"
                  v-model="D.pno"
                  autocomplete="off"
                  @blur="onBlur('pno')"
                />
                <small v-if="touched.pno && !!getError('pno')" class="er">
                  {{ t('e_' + getError('pno')) }}
                </small>
              </div>

              <!-- Expiry Date -->
              <div
                class="f s4"
                :class="{ bad: touched.exp && !!getError('exp') }"
              >
                <label for="exp">{{ t('exp') }}</label>
                <input
                  id="exp"
                  type="date"
                  class="in"
                  :min="isoTrip"
                  v-model="D.exp"
                  @blur="onBlur('exp')"
                />
                <small v-if="!(touched.exp && !!getError('exp'))" class="h">
                  {{ t('expH') }}
                </small>
                <small v-else class="er">
                  {{ t('e_' + getError('exp')) }}
                </small>
              </div>

              <!-- Issuing Country -->
              <div
                class="f s4"
                :class="{ bad: touched.issue && !!getError('issue') }"
              >
                <label for="issue">{{ t('issue') }}</label>
                <select
                  id="issue"
                  class="in sel"
                  v-model="D.issue"
                  @blur="onBlur('issue')"
                >
                  <option value="" disabled hidden>{{ t('select') }}</option>
                  <option
                    v-for="c in countriesList"
                    :key="c.code"
                    :value="c.code"
                  >
                    {{ c.name }}
                  </option>
                </select>
                <small v-if="touched.issue && !!getError('issue')" class="er">
                  {{ t('e_' + getError('issue')) }}
                </small>
              </div>
            </div>
          </section>

          <!-- Contact Details Card -->
          <section class="card pad">
            <h2 class="ct">{{ t('contact') }}</h2>
            <div class="g" style="margin-top: 14px">
              <!-- Email -->
              <div
                class="f s6"
                :class="{ bad: touched.email && !!getError('email') }"
              >
                <label for="email">{{ t('email') }}</label>
                <input
                  id="email"
                  type="email"
                  inputmode="email"
                  class="in l"
                  v-model="D.email"
                  @blur="onBlur('email')"
                />
                <small v-if="!(touched.email && !!getError('email'))" class="h">
                  {{ t('emailH') }}
                </small>
                <small v-else class="er">
                  {{ t('e_' + getError('email')) }}
                </small>
              </div>

              <!-- Phone -->
              <div
                class="f s6"
                :class="{ bad: touched.phone && !!getError('phone') }"
              >
                <label for="phone">{{ t('phone') }}</label>
                <input
                  id="phone"
                  type="tel"
                  class="in l"
                  v-model="D.phone"
                  @blur="onBlur('phone')"
                />
                <small v-if="touched.phone && !!getError('phone')" class="er">
                  {{ t('e_' + getError('phone')) }}
                </small>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Sidebar: Booking Summary & Checklist -->
      <aside class="sum card">
        <div class="pad">
          <h3>{{ t('summary') }}</h3>
          <div class="rt">
            <b>{{ fromName }}</b>
            <i class="mono">{{ fromCode }}</i>
            <svg class="i" viewBox="0 0 24 24" style="width: 14px; height: 14px">
              <path d="M3 12h18M15 6l6 6-6 6" />
            </svg>
            <b>{{ toName }}</b>
            <i class="mono">{{ toCode }}</i>
          </div>

          <div class="sum-date-badge">
            <svg class="i" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <b>{{ dateText }}</b>
            <span>· {{ tripType }}</span>
          </div>

          <p class="sub">
            {{ rawFlight.al }} · {{ cabinClass }} · 1 Adult
          </p>

          <div class="rows">
            <div class="pr">
              <span>{{ t('base') }}</span>
              <span class="mono">${{ money(baseFare) }}</span>
            </div>
            <div class="pr">
              <span>{{ t('taxes') }}</span>
              <span class="mono">${{ money(taxesAndFees) }}</span>
            </div>
            <div v-if="extraBagsCount > 0" class="pr">
              <span>Extra bags ({{ extraBagsCount }} × $50)</span>
              <span class="mono">${{ money(extraBagsPrice) }}</span>
            </div>
          </div>

          <div class="tot">
            <span>{{ t('total') }}</span>
            <span>
              <small class="mono">USD</small>
              <b class="mono">{{ money(totalPrice) }}</b>
            </span>
          </div>

          <!-- Dynamic Checklist of Completion -->
          <ul class="chk">
            <li :class="{ ok: isTravellerDone }">
              <span class="d">
                <svg v-if="isTravellerDone" class="i" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              {{ t('traveller') }} 1
              <em>{{ isTravellerDone ? t('done') : t('todo') }}</em>
            </li>

            <li :class="{ ok: isContactDone }">
              <span class="d">
                <svg v-if="isContactDone" class="i" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              {{ t('contact') }}
              <em>{{ isContactDone ? t('done') : t('todo') }}</em>
            </li>
          </ul>

          <button type="button" class="btn pri" @click="handleContinue">
            <span>{{ t('cont') }}</span>
            <svg class="i" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          <p class="fine">{{ t('fine') }}</p>
        </div>
      </aside>
    </div>

    <!-- Mobile Fixed Bottom CTA Bar -->
    <div class="mbar">
      <div>
        <small>{{ t('total') }}</small>
        <b class="mono">USD {{ money(totalPrice) }}</b>
      </div>
      <button type="button" class="btn pri" @click="handleContinue">
        {{ t('cont2') }}
      </button>
    </div>

    <!-- Floating Toast Notification -->
    <div class="toast" :class="{ on: toastVisible }" role="status" aria-live="polite">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.traveller-details-page {
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
  --warn: #9a5a06;
  --warnbg: #fff4dc;
  --bad: #b42318;
  --fld: #c9d6ec;
  color-scheme: light;
  font: 14px/1.45 Inter, "Noto Sans Arabic", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: var(--page) radial-gradient(rgba(12, 31, 68, 0.07) 1px, transparent 1.2px) 0 0/18px 18px;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
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

[dir="rtl"] .flip {
  transform: scaleX(-1);
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
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 0;
  background: none;
  color: var(--btn);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn:hover {
  background: var(--soft);
}

.btn.pri {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  background: var(--btn);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid #4565b7;
}

.btn.pri:hover {
  filter: brightness(1.08);
  background: var(--btn);
}

/* ── Hero Top Back Button ───────────────────────────────── */
.hero-top {
  margin-bottom: 20px;
}

.hero-back {
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  color: #c9d7f3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 14px;
  transition: all 0.15s ease;
}

.hero-back:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-back svg {
  width: 15px;
  height: 15px;
}

/* ── Trip Overview Check Card ────────────────────────────── */
.trip-check-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(12, 31, 68, 0.04);
}

.trip-check-card__item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trip-check-card__icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--soft);
  color: var(--btn);
  display: grid;
  place-items: center;
  flex: none;
}

.trip-check-card__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.trip-check-card__text small {
  font-size: 11px;
  color: var(--mute);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
}

.trip-check-card__text b,
.trip-check-card__text strong {
  font-size: 13px;
  color: var(--ink);
  font-weight: 600;
}

.trip-check-card__sep {
  width: 1px;
  height: 28px;
  background: var(--line);
  flex: none;
}

.trip-check-card__btn {
  appearance: none;
  margin-inline-start: auto;
  border: 1px solid var(--line);
  background: #f8fafc;
  color: var(--btn);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: none;
}

.trip-check-card__btn:hover {
  background: var(--soft);
  border-color: var(--btn);
}

/* ── Summary Date Badge in Sidebar ────────────────────────── */
.sum-date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5fd;
  border: 1px solid #d9e3f3;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--sub);
  margin-bottom: 8px;
}

.sum-date-badge svg {
  color: var(--btn);
  width: 14px;
  height: 14px;
}

.sum-date-badge b {
  color: var(--ink);
  font-weight: 600;
}

/* ── Hero Banner with Step Wizard ────────────────────────── */
.hero {
  background: var(--navy) radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1.2px) 0 0/18px 18px;
  color: #fff;
  padding: 34px 0 106px;
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

.steps .clickable {
  cursor: pointer;
  transition: opacity 0.15s, color 0.15s;
}

.steps .clickable:hover {
  opacity: 0.9;
}

.steps .clickable:hover .n {
  transform: scale(1.05);
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

/* ── Layout Overlapping Hero ─────────────────────────────── */
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
}

.card {
  background: #fff;
  border: 1px solid #d3dff1;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(12, 31, 68, 0.06), 0 10px 26px -16px rgba(12, 31, 68, 0.28);
}

.pad {
  padding: 20px 22px;
}

.th {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--soft);
  color: var(--btn);
  display: grid;
  place-items: center;
}

.th h2,
.ct {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
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

.pill.g {
  background: var(--okbg);
  color: var(--ok);
}

.pill.a {
  background: var(--warnbg);
  color: var(--warn);
}

.pill svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.4;
}

.th .pill.g {
  margin-inline-start: auto;
}

.sec {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sub);
}

.sec::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e6ecf6;
}

.th + .sec {
  margin-top: 18px;
}

/* ── 12-Column Responsive Form Grid ──────────────────────── */
.g {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.s3 {
  grid-column: span 3;
}
.s4 {
  grid-column: span 4;
}
.s5 {
  grid-column: span 5;
}
.s6 {
  grid-column: span 6;
}

.f label {
  display: block;
  margin-bottom: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sub);
}

.in {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--fld);
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 14.5px;
  color: var(--ink);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.in:hover {
  border-color: #a9bde6;
}

.in:focus {
  outline: 0;
  border-color: var(--btn);
  box-shadow: 0 0 0 3px rgba(74, 108, 192, 0.18);
}

.in::placeholder {
  color: #9aa6bf;
}

.nm {
  text-transform: uppercase;
}

input[type="date"].in {
  min-width: 0;
}

.l {
  direction: ltr;
  text-align: left;
}

.sel {
  appearance: none;
  padding-inline-end: 34px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2363708b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E") no-repeat right 12px center;
}

[dir="rtl"] .sel {
  background-position: left 12px center;
}

.h,
.er {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

.h {
  color: var(--mute);
}

.er {
  color: var(--bad);
}

.bad .in,
.bad .seg {
  border-color: var(--bad);
  background-color: #fffafa;
}

/* ── Gender Radio Segment ────────────────────────────────── */
.seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  height: 44px;
  padding: 3px;
  border: 1px solid var(--fld);
  border-radius: 10px;
  background: #f3f6fc;
}

.seg label {
  position: relative;
  margin: 0;
  cursor: pointer;
}

.seg input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}

.seg span {
  display: grid;
  place-items: center;
  height: 100%;
  border-radius: 7px;
  font-size: 14px;
  color: var(--sub);
  transition: 0.15s;
}

.seg input:checked + span {
  background: #fff;
  color: var(--btn);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(12, 31, 68, 0.15);
}

.seg input:focus-visible + span {
  outline: 2px solid var(--btn);
}

/* ── Sidebar: Booking Summary ────────────────────────────── */
.sum {
  position: sticky;
  top: 70px;
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
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
}

.rt i {
  font-style: normal;
  font-size: 11px;
  color: var(--mute);
}

.sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--mute);
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

.rows {
  margin-top: 12px;
  border-top: 1px solid #eef1f6;
}

.tot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.tot span {
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

/* ── Dynamic Completion Checklist ────────────────────────── */
.chk {
  list-style: none;
  margin: 16px 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 10px;
  font-size: 13px;
}

.chk li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--sub);
}

.chk .d {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #b9c6de;
  display: grid;
  place-items: center;
  color: #fff;
  transition: 0.2s;
}

.chk .d svg {
  width: 11px;
  height: 11px;
  stroke-width: 3;
}

.chk .ok .d {
  background: var(--ok);
  border-color: var(--ok);
}

.chk .ok {
  color: var(--ink);
}

.chk em {
  margin-inline-start: auto;
  font-style: normal;
  font-size: 12px;
  color: var(--mute);
}

.fine {
  margin: 12px 0 0;
  font-size: 11.5px;
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
    inset: auto 0 0;
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
  .trip-check-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .trip-check-card__sep {
    display: none;
  }
  .trip-check-card__btn {
    align-self: flex-start;
  }
  .hide-sm {
    display: none;
  }
  .hide {
    display: none;
  }
  .g .f {
    grid-column: span 12;
  }
  .th .pill.g {
    margin-inline-start: 0;
  }
}
</style>

