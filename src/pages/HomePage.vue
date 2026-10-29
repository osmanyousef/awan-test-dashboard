<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hotelDestinations, airports } from '../config/mockData'

const route = useRoute()
const router = useRouter()

// ── Tabs ───────────────────────────────────────────────────
const tabs = ['Stays', 'Flights', 'Experiences', 'Theme parks', 'Transfers', 'Car Rental']
const activeTab = ref(route.path === '/flights' ? 'Flights' : 'Stays')

watch(() => route.path, (p) => {
  if (p === '/flights') activeTab.value = 'Flights'
  else if (p === '/hotels') activeTab.value = 'Stays'
})

// ── Flights State ──────────────────────────────────────────
const flightTripType = ref<'return' | 'one-way' | 'multi'>('return')
const flightFrom = ref('TIP - Tripoli')
const flightTo = ref('DXB - Dubai')
const flightFromOpen = ref(false)
const flightToOpen = ref(false)
const flightFromQuery = ref('')
const flightToQuery = ref('')

const filteredAirportsFrom = computed(() => {
  if (!flightFromQuery.value) return airports.slice(0, 6)
  const q = flightFromQuery.value.toLowerCase()
  return airports.filter(a => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
})

const filteredAirportsTo = computed(() => {
  if (!flightToQuery.value) return airports.slice(0, 6)
  const q = flightToQuery.value.toLowerCase()
  return airports.filter(a => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
})

function selectAirportFrom(a: typeof airports[number]) {
  flightFrom.value = `${a.code} - ${a.city}`
  flightFromOpen.value = false
}
function selectAirportTo(a: typeof airports[number]) {
  flightTo.value = `${a.code} - ${a.city}`
  flightToOpen.value = false
}

// ── Destination State ──────────────────────────────────────
const destinationQuery = ref('')
const selectedDestination = ref<typeof hotelDestinations[number] | null>(null)
const destinationDropdownOpen = ref(false)
const hasSubmitted = ref(false)
const destinationError = computed(() => {
  return hasSubmitted.value && !destinationQuery.value.trim()
})

const filteredDestinations = computed(() => {
  if (!destinationQuery.value.trim()) {
    return hotelDestinations.slice(0, 6)
  }
  const q = destinationQuery.value.toLowerCase()
  return hotelDestinations.filter(d =>
    d.name.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q)
  ).slice(0, 8)
})

function selectDestination(dest: typeof hotelDestinations[number]) {
  destinationQuery.value = dest.name
  selectedDestination.value = dest
  destinationDropdownOpen.value = false
}

// ── Date Range State ───────────────────────────────────────
const calendarOpen = ref(false)

// Start date: 29 Oct 2026
const startDate = ref<Date | null>(new Date(2026, 9, 29))
// End date: 1 Nov 2026 (3 nights)
const endDate = ref<Date | null>(new Date(2026, 10, 1))
const hoverDate = ref<Date | null>(null)

// Current view month (0 = Jan, 9 = Oct 2026)
const viewYear = ref(2026)
const viewMonth = ref(9) // October 2026

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(d1: Date | null, d2: Date | null) {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isBetween(d: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false
  const t = d.getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return t > s && t < e
}

function onDateClick(date: Date) {
  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date
    endDate.value = null
  } else if (startDate.value && !endDate.value) {
    if (date.getTime() < startDate.value.getTime()) {
      startDate.value = date
      endDate.value = null
    } else if (isSameDay(date, startDate.value)) {
      // Same day clicked
    } else {
      endDate.value = date
      calendarOpen.value = false
    }
  }
}

const nightsCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const diffTime = Math.abs(endDate.value.getTime() - startDate.value.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

function formatDisplayDate(d: Date | null): string {
  if (!d) return 'dd/mm/yyyy'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ── Rooms & Guests State (matching Image 3) ────────────────
interface RoomItem {
  id: number
  adults: number
  children: number
  childAges: number[]
}

const rooms = ref<RoomItem[]>([
  { id: 1, adults: 2, children: 0, childAges: [] },
])

const roomsOpen = ref(false)

function addRoom() {
  const nextId = rooms.value.length > 0 ? Math.max(...rooms.value.map(r => r.id)) + 1 : 1
  rooms.value.push({ id: nextId, adults: 2, children: 0, childAges: [] })
}

function deleteRoom(index: number) {
  if (rooms.value.length > 1) {
    rooms.value.splice(index, 1)
  }
}

function updateAdults(room: RoomItem, delta: number) {
  room.adults = Math.max(1, Math.min(10, room.adults + delta))
}

function updateChildren(room: RoomItem, delta: number) {
  const next = Math.max(0, Math.min(6, room.children + delta))
  if (next > room.children) {
    room.childAges.push(5)
  } else if (next < room.children) {
    room.childAges.pop()
  }
  room.children = next
}

const guestsSummary = computed(() => {
  const totalAdults = rooms.value.reduce((s, r) => s + r.adults, 0)
  const totalChildren = rooms.value.reduce((s, r) => s + r.children, 0)
  const totalGuests = totalAdults + totalChildren

  if (rooms.value.length === 1 && totalChildren === 0) {
    return `${totalAdults} Adult${totalAdults > 1 ? 's' : ''}`
  }
  return `${rooms.value.length} Room${rooms.value.length > 1 ? 's' : ''} · ${totalGuests} Guest${totalGuests !== 1 ? 's' : ''}`
})

// ── Additional Parameters ──────────────────────────────────
const showAdditional = ref(false)

const mealPlans = ['Room only', 'Incl. breakfast', 'Half Board', 'Full Board', 'All Inclusive']
const selectedMealPlans = ref<string[]>([])

function toggleMeal(m: string) {
  const idx = selectedMealPlans.value.indexOf(m)
  if (idx > -1) selectedMealPlans.value.splice(idx, 1)
  else selectedMealPlans.value.push(m)
}

const starRatings = [1, 2, 3, 4, 5]
const selectedStars = ref<number[]>([])

function toggleStar(star: number) {
  const idx = selectedStars.value.indexOf(star)
  if (idx > -1) selectedStars.value.splice(idx, 1)
  else selectedStars.value.push(star)
}

const luxuryCollection = ref(false)
const freeCancellation = ref(false)

// ── Search Action & Test Results ───────────────────────────
const searchPerformed = ref(false)
const searchResults = ref([
  {
    id: 1,
    name: 'Atlantis The Palm, Dubai',
    location: 'Palm Jumeirah, Dubai',
    rating: 5,
    meal: 'Incl. breakfast',
    pricePerNight: 420,
    total: 1260,
    cancellation: 'Free cancellation before 27 Oct',
    tag: 'Contracted B2B Rate',
  },
  {
    id: 2,
    name: 'Burj Al Arab Jumeirah',
    location: 'Umm Suqeim, Dubai',
    rating: 5,
    meal: 'Half Board',
    pricePerNight: 980,
    total: 2940,
    cancellation: 'Free cancellation',
    tag: 'Luxury Collection',
  },
  {
    id: 3,
    name: 'Rixos Premium Dubai JBR',
    location: 'The Walk, JBR, Dubai',
    rating: 5,
    meal: 'All Inclusive',
    pricePerNight: 340,
    total: 1020,
    cancellation: 'Free cancellation',
    tag: 'Special Promo',
  },
])

function handleSearch() {
  hasSubmitted.value = true
  if (!destinationQuery.value.trim()) {
    return
  }
  calendarOpen.value = false
  roomsOpen.value = false
  destinationDropdownOpen.value = false
  if (activeTab.value === 'Stays') {
    router.push({
      path: '/hotels/results',
      query: {
        dest: destinationQuery.value.trim(),
        guests: guestsSummary.value,
        nights: String(nightsCount.value),
      }
    })
  } else {
    searchPerformed.value = true
  }
}

// Click outside handling helper
function closeAllDropdowns() {
  destinationDropdownOpen.value = false
  calendarOpen.value = false
  roomsOpen.value = false
}
</script>

<template>
  <div class="page-container" @click="closeAllDropdowns">

    <!-- ── Search Box Main Card ─────────────────────────────── -->
    <div class="search-card" @click.stop>

      <!-- 1. Tabs at top of search card (Awan Theme) -->
      <div class="tabs-row">
        <button
          v-for="t in tabs"
          :key="t"
          class="tab-pill"
          :class="{ 'tab-pill--active': activeTab === t }"
          @click="activeTab = t"
        >
          <!-- Bed icon for stays tab -->
          <svg v-if="t === 'Stays'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
            <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
          </svg>
          <!-- Plane icon for flights tab -->
          <svg v-else-if="t === 'Flights'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.7l-.7.7 6.4 3.8-3.6 3.6-2.5-.5c-.5-.1-1 .1-1.3.4l-.4.4 2.8 2.8 2.8 2.8.4-.4c.3-.3.5-.8.4-1.3l-.5-2.5 3.6-3.6 3.8 6.4.7-.7c.6-.5.9-1.3.7-2.1z" />
          </svg>
          <span>{{ t }}</span>
        </button>
      </div>

      <!-- ── FLIGHTS SEARCH BAR ── -->
      <div v-if="activeTab === 'Flights'" class="flight-search-wrapper">
        <!-- Trip Type Switcher -->
        <div class="trip-types-row">
          <label class="trip-radio">
            <input type="radio" value="return" v-model="flightTripType" />
            <span>Return</span>
          </label>
          <label class="trip-radio">
            <input type="radio" value="one-way" v-model="flightTripType" />
            <span>One-way</span>
          </label>
          <label class="trip-radio">
            <input type="radio" value="multi" v-model="flightTripType" />
            <span>Multi-city</span>
          </label>
        </div>

        <div class="search-inputs-bar">
          <!-- From Airport -->
          <div class="input-col input-col--destination">
            <div class="input-box" @click="flightFromOpen = !flightFromOpen; flightToOpen = false">
              <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.7l-.7.7 6.4 3.8-3.6 3.6-2.5-.5c-.5-.1-1 .1-1.3.4l-.4.4 2.8 2.8 2.8 2.8.4-.4c.3-.3.5-.8.4-1.3l-.5-2.5 3.6-3.6 3.8 6.4.7-.7c.6-.5.9-1.3.7-2.1z" />
              </svg>
              <input
                type="text"
                class="field-input"
                v-model="flightFrom"
                placeholder="From where?"
                @focus="flightFromOpen = true"
              />
            </div>
            <div v-if="flightFromOpen" class="dest-dropdown">
              <div
                v-for="a in filteredAirportsFrom"
                :key="a.code"
                class="dest-item"
                @click="selectAirportFrom(a)"
              >
                <div class="dest-item-icon">✈</div>
                <div class="dest-item-content">
                  <span class="dest-item-title">{{ a.code }} - {{ a.city }}</span>
                  <span class="dest-item-sub">{{ a.name }}</span>
                </div>
                <span class="dest-type-badge">{{ a.country }}</span>
              </div>
            </div>
          </div>

          <!-- To Airport -->
          <div class="input-col input-col--destination">
            <div class="input-box" @click="flightToOpen = !flightToOpen; flightFromOpen = false">
              <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                class="field-input"
                v-model="flightTo"
                placeholder="To where?"
                @focus="flightToOpen = true"
              />
            </div>
            <div v-if="flightToOpen" class="dest-dropdown">
              <div
                v-for="a in filteredAirportsTo"
                :key="a.code"
                class="dest-item"
                @click="selectAirportTo(a)"
              >
                <div class="dest-item-icon">✈</div>
                <div class="dest-item-content">
                  <span class="dest-item-title">{{ a.code }} - {{ a.city }}</span>
                  <span class="dest-item-sub">{{ a.name }}</span>
                </div>
                <span class="dest-type-badge">{{ a.country }}</span>
              </div>
            </div>
          </div>

          <!-- Flight Dates -->
          <div class="input-col input-col--dates">
            <div class="input-box input-box--split" @click="calendarOpen = !calendarOpen">
              <div class="split-left">
                <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span class="date-text">
                  {{ formatDisplayDate(startDate) }} {{ flightTripType === 'return' ? '- ' + formatDisplayDate(endDate) : '' }}
                </span>
              </div>
              <div class="split-right">
                <span class="nights-text">{{ flightTripType === 'return' ? nightsCount + ' days' : 'One way' }}</span>
              </div>
            </div>
          </div>

          <!-- Passengers -->
          <div class="input-col input-col--guests">
            <div class="input-box" @click="roomsOpen = !roomsOpen">
              <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span class="guests-text">{{ guestsSummary }}</span>
            </div>
          </div>

          <!-- Search Button -->
          <button class="search-submit-btn" @click="handleSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search Flights</span>
          </button>
        </div>
      </div>

      <!-- ── STAYS SEARCH BAR ── -->
      <div v-else class="search-inputs-bar">

        <!-- Input 1: Destination -->
        <div class="input-col input-col--destination" :class="{ 'input-col--error': destinationError }">
          <div class="input-box" @click="destinationDropdownOpen = true">
            <!-- Pin Icon -->
            <svg class="box-icon" :class="{ 'box-icon--error': destinationError }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              class="field-input"
              v-model="destinationQuery"
              placeholder="Where are you going?"
              @focus="destinationDropdownOpen = true"
              @input="hasSubmitted = false"
            />
          </div>

          <!-- Error message below input -->
          <span v-if="destinationError" class="mandatory-text">
            This field is mandatory
          </span>

          <!-- Autocomplete Dropdown -->
          <div v-if="destinationDropdownOpen" class="dest-dropdown">
            <div
              v-for="dest in filteredDestinations"
              :key="dest.id"
              class="dest-item"
              @click="selectDestination(dest)"
            >
              <div class="dest-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="dest-item-content">
                <span class="dest-item-title">{{ dest.name }}</span>
                <span class="dest-item-sub">{{ dest.subtitle }}</span>
              </div>
              <span class="dest-type-badge">{{ dest.type }}</span>
            </div>
          </div>
        </div>

        <!-- Input 2: Dates & Nights -->
        <div class="input-col input-col--dates">
          <div class="input-box input-box--split" @click="calendarOpen = !calendarOpen; roomsOpen = false; destinationDropdownOpen = false">
            <div class="split-left">
              <!-- Calendar Icon -->
              <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span class="date-text">
                {{ formatDisplayDate(startDate) }} - {{ formatDisplayDate(endDate) }}
              </span>
            </div>

            <!-- Nights Dropdown portion with divider -->
            <div class="split-right">
              <span class="nights-text">{{ nightsCount }} night{{ nightsCount !== 1 ? 's' : '' }}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="chevron-icon">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Two-Month Range Picker Popup (Awan Blue Theme) -->
          <div v-if="calendarOpen" class="calendar-popover" @click.stop>
            <!-- Calendar Header with Month/Year and Chevrons -->
            <div class="cal-header">
              <button class="cal-nav-btn" @click="prevMonth" title="Previous Month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div class="cal-month-title">
                {{ monthNames[viewMonth] }} {{ viewYear }}
              </div>

              <div class="cal-month-title cal-month-title--right">
                {{ monthNames[(viewMonth + 1) % 12] }} {{ viewMonth === 11 ? viewYear + 1 : viewYear }}
              </div>

              <button class="cal-nav-btn" @click="nextMonth" title="Next Month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <!-- Double Month Grid -->
            <div class="cal-months-container">
              <!-- Month 1 -->
              <div class="month-grid">
                <div class="day-headers">
                  <span v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d" class="day-header-cell">
                    {{ d }}
                  </span>
                </div>
                <div class="days-cells">
                  <!-- Empty leading days -->
                  <div
                    v-for="empty in getFirstDayOfWeek(viewYear, viewMonth)"
                    :key="'m1-e-' + empty"
                    class="day-cell day-cell--empty"
                  ></div>

                  <!-- Actual Days -->
                  <div
                    v-for="dayNum in getDaysInMonth(viewYear, viewMonth)"
                    :key="'m1-d-' + dayNum"
                    class="day-cell"
                    :class="{
                      'day-cell--start': isSameDay(new Date(viewYear, viewMonth, dayNum), startDate),
                      'day-cell--end': isSameDay(new Date(viewYear, viewMonth, dayNum), endDate),
                      'day-cell--in-range': isBetween(new Date(viewYear, viewMonth, dayNum), startDate, endDate || hoverDate),
                    }"
                    @mouseenter="hoverDate = new Date(viewYear, viewMonth, dayNum)"
                    @click="onDateClick(new Date(viewYear, viewMonth, dayNum))"
                  >
                    <span class="day-num">{{ dayNum }}</span>
                  </div>
                </div>
              </div>

              <!-- Month 2 -->
              <div class="month-grid">
                <div class="day-headers">
                  <span v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d" class="day-header-cell">
                    {{ d }}
                  </span>
                </div>
                <div class="days-cells">
                  <!-- Empty leading days -->
                  <div
                    v-for="empty in getFirstDayOfWeek(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12)"
                    :key="'m2-e-' + empty"
                    class="day-cell day-cell--empty"
                  ></div>

                  <!-- Actual Days -->
                  <div
                    v-for="dayNum in getDaysInMonth(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12)"
                    :key="'m2-d-' + dayNum"
                    class="day-cell"
                    :class="{
                      'day-cell--start': isSameDay(new Date(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12, dayNum), startDate),
                      'day-cell--end': isSameDay(new Date(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12, dayNum), endDate),
                      'day-cell--in-range': isBetween(new Date(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12, dayNum), startDate, endDate || hoverDate),
                    }"
                    @mouseenter="hoverDate = new Date(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12, dayNum)"
                    @click="onDateClick(new Date(viewMonth === 11 ? viewYear + 1 : viewYear, (viewMonth + 1) % 12, dayNum))"
                  >
                    <span class="day-num">{{ dayNum }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer: Summary -->
            <div class="cal-footer">
              <span class="cal-footer-text">
                {{ formatDisplayDate(startDate) }} - {{ endDate ? formatDisplayDate(endDate) : 'Select date' }}
                <span v-if="nightsCount > 0"> ({{ nightsCount }} night{{ nightsCount > 1 ? 's' : '' }})</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Input 3: Guests -->
        <div class="input-col input-col--guests">
          <div class="input-box" @click="roomsOpen = !roomsOpen; calendarOpen = false; destinationDropdownOpen = false">
            <svg class="box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span class="guests-text">{{ guestsSummary }}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="chevron-icon">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Rooms & Guests Popover -->
          <div v-if="roomsOpen" class="rooms-popover" @click.stop>
            <div v-for="(room, rIdx) in rooms" :key="room.id" class="room-block">
              <!-- Room Header -->
              <div class="room-header">
                <span class="room-title">Room {{ rIdx + 1 }}</span>
                <button
                  v-if="rooms.length > 1"
                  class="delete-room-btn"
                  @click="deleteRoom(rIdx)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  <span>Delete room</span>
                </button>
              </div>

              <!-- Adults Counter -->
              <div class="counter-row">
                <span class="counter-label">Adults</span>
                <div class="counter-box">
                  <button
                    class="counter-btn"
                    :disabled="room.adults <= 1"
                    @click="updateAdults(room, -1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                  <span class="counter-val">{{ room.adults }}</span>
                  <button
                    class="counter-btn"
                    @click="updateAdults(room, 1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Children Counter -->
              <div class="counter-row">
                <span class="counter-label">Children</span>
                <div class="counter-box">
                  <button
                    class="counter-btn"
                    :disabled="room.children <= 0"
                    @click="updateChildren(room, -1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                  <span class="counter-val">{{ room.children }}</span>
                  <button
                    class="counter-btn"
                    @click="updateChildren(room, 1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Child Ages if children > 0 -->
              <div v-if="room.children > 0" class="child-ages-wrap">
                <span class="child-ages-label">Ages of children:</span>
                <div class="child-ages-selects">
                  <select
                    v-for="(_, cIdx) in room.childAges"
                    :key="cIdx"
                    v-model="room.childAges[cIdx]"
                    class="age-select"
                  >
                    <option v-for="age in 18" :key="age - 1" :value="age - 1">
                      {{ age - 1 }} yrs
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Add room link -->
            <button class="add-room-btn" @click="addRoom">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Add room</span>
            </button>

            <!-- Apply Button -->
            <div class="popover-actions">
              <button class="apply-btn" @click="roomsOpen = false">
                Apply
              </button>
            </div>
          </div>
        </div>

        <!-- Search Button (Awan Navy) -->
        <button class="search-submit-btn" @click="handleSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>
      </div>

      <!-- 3. Additional Parameters -->
      <div class="additional-params-section">
        <button class="params-toggle-btn" @click="showAdditional = !showAdditional">
          <span>Additional parameters</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="toggle-arrow"
            :class="{ 'toggle-arrow--open': showAdditional }"
          >
            <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Expanded Filter Options -->
        <div v-if="showAdditional" class="params-expanded-row">
          <!-- Meal plans -->
          <div class="filter-group">
            <button
              v-for="m in mealPlans"
              :key="m"
              class="param-chip"
              :class="{ 'param-chip--active': selectedMealPlans.includes(m) }"
              @click="toggleMeal(m)"
            >
              {{ m }}
            </button>
          </div>

          <!-- Star ratings -->
          <div class="filter-group">
            <button
              v-for="star in starRatings"
              :key="star"
              class="param-chip"
              :class="{ 'param-chip--active': selectedStars.includes(star) }"
              @click="toggleStar(star)"
            >
              {{ star }} ★
            </button>
          </div>

          <!-- Checkboxes -->
          <div class="checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="luxuryCollection" />
              <span>Luxury Collection</span>
            </label>
            <label class="custom-checkbox">
              <input type="checkbox" v-model="freeCancellation" />
              <span>Free cancellation</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Search Results Test Preview ──────────────────────── -->
    <div v-if="searchPerformed" class="results-preview">
      <div class="results-header">
        <h2 class="results-title">
          Available Hotels in {{ destinationQuery }}
        </h2>
        <span class="results-subtitle">
          {{ nightsCount }} nights · {{ formatDisplayDate(startDate) }} to {{ formatDisplayDate(endDate) }} · {{ guestsSummary }}
        </span>
      </div>

      <div class="hotels-grid">
        <div v-for="hotel in searchResults" :key="hotel.id" class="hotel-card">
          <div class="hotel-card-body">
            <div class="hotel-top">
              <span class="hotel-tag">{{ hotel.tag }}</span>
              <div class="stars">
                <span v-for="s in hotel.rating" :key="s">★</span>
              </div>
            </div>

            <h3 class="hotel-name">{{ hotel.name }}</h3>
            <p class="hotel-loc">{{ hotel.location }}</p>

            <div class="hotel-features">
              <span class="feature-badge">{{ hotel.meal }}</span>
              <span class="feature-badge feature-badge--green">{{ hotel.cancellation }}</span>
            </div>

            <div class="hotel-footer">
              <div class="price-box">
                <span class="price-val">${{ hotel.pricePerNight }}</span>
                <span class="price-label">/ night · Total ${{ hotel.total }}</span>
              </div>
              <button class="book-btn">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Manage Bookings Teaser ──────────────────────────── -->
    <div class="bookings-teaser">
      <h2 class="teaser-title">Manage your bookings</h2>
    </div>

  </div>
</template>

<style scoped>
/* Page Layout matching Awan Travel Branding */
.page-container {
  min-height: calc(100vh - 80px);
  padding: 10px 24px 60px;
  max-width: 1280px;
  margin: 0 auto;
}

/* ── Search Card ────────────────────────────────────────── */
.search-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 32px 36px;
  box-shadow: 0 4px 25px -2px rgba(31, 43, 56, 0.08);
  border: 1px solid rgba(204, 216, 230, 0.6);
  margin-bottom: 40px;
}

/* ── Product Tabs ───────────────────────────────────────── */
.tabs-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.tab-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-pill:hover:not(.tab-pill--active) {
  color: var(--color-primary);
  background: rgba(87, 130, 206, 0.06);
}

.tab-pill--active {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(87, 130, 206, 0.3);
}

.tab-icon {
  margin-left: -2px;
}

/* ── Inputs Row ─────────────────────────────────────────── */
.search-inputs-bar {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}

.input-col {
  position: relative;
}

.input-col--destination {
  flex: 1.2;
}

.input-col--dates {
  flex: 1.6;
}

.input-col--guests {
  flex: 1.1;
}

/* Standard Input Box */
.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-box:hover {
  border-color: var(--color-primary);
}

.input-col--error .input-box {
  border-color: #dc2626;
}

.box-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.box-icon--error {
  color: #dc2626;
}

.field-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--color-text);
  width: 100%;
  font-family: inherit;
}

.field-input::placeholder {
  color: #8da2b8;
}

/* Error message below */
.mandatory-text {
  display: block;
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 5px;
  padding-left: 2px;
  font-weight: 500;
}

/* Split Input (Dates & Nights) */
.input-box--split {
  padding: 0;
  display: flex;
  align-items: center;
}

.split-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  height: 100%;
  padding: 0 14px;
}

.date-text {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
}

.split-right {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 14px;
  border-left: 1px solid var(--color-border);
}

.nights-text {
  font-size: 0.92rem;
  color: var(--color-text);
  white-space: nowrap;
}

.chevron-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Guests Input */
.guests-text {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
}

/* Search Submit Button (Awan Deep Navy) */
.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  background: var(--color-navy);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  white-space: nowrap;
}

.search-submit-btn:hover {
  background: var(--color-navy-hover);
}

/* ── Destination Autocomplete Dropdown ──────────────────── */
.dest-dropdown {
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(31, 43, 56, 0.12);
  z-index: 50;
  overflow: hidden;
}

.dest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.dest-item:hover {
  background: var(--color-primary-light);
}

.dest-item-icon {
  color: var(--color-primary);
}

.dest-item-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dest-item-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text);
}

.dest-item-sub {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.dest-type-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  background: var(--color-primary-subtle);
  color: var(--color-secondary);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

/* ── Two-Month Calendar Popover (Awan Ocean Blue) ───────── */
.calendar-popover {
  position: absolute;
  top: 54px;
  left: 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 14px 35px rgba(31, 43, 56, 0.14);
  padding: 20px 24px;
  z-index: 60;
  width: 580px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cal-nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.cal-nav-btn:hover {
  background: var(--color-primary-light);
}

.cal-month-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  flex: 1;
}

.cal-month-title--right {
  text-align: center;
}

.cal-months-container {
  display: flex;
  gap: 32px;
}

.month-grid {
  flex: 1;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.day-header-cell {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.days-cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 2px;
}

.day-cell {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  font-size: 0.88rem;
  color: var(--color-text);
  transition: background 0.1s ease;
}

.day-cell--empty {
  cursor: default;
}

.day-num {
  position: relative;
  z-index: 2;
}

/* Range highlighting in Awan Blue */
.day-cell--start {
  background: var(--color-secondary);
  color: #ffffff !important;
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
  font-weight: 700;
}

.day-cell--end {
  background: var(--color-secondary);
  color: #ffffff !important;
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
  font-weight: 700;
}

.day-cell--in-range {
  background: var(--color-primary);
  color: #ffffff !important;
  border-radius: 0;
}

.day-cell:not(.day-cell--empty):not(.day-cell--start):not(.day-cell--end):not(.day-cell--in-range):hover {
  background: var(--color-primary-light);
  border-radius: 9999px;
}

.cal-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.cal-footer-text {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

/* ── Rooms & Guests Popover ─────────────────────────────── */
.rooms-popover {
  position: absolute;
  top: 54px;
  left: 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 14px 35px rgba(31, 43, 56, 0.14);
  padding: 20px 22px;
  z-index: 60;
  width: 320px;
}

.room-block {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.room-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.delete-room-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.delete-room-btn:hover {
  text-decoration: underline;
}

.counter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.counter-label {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 500;
}

/* Counter Box with border */
.counter-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 130px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0 8px;
}

.counter-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.counter-btn:disabled {
  color: #b0c4de;
  cursor: not-allowed;
}

.counter-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Child ages */
.child-ages-wrap {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.child-ages-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.child-ages-selects {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.age-select {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.82rem;
  color: var(--color-text);
}

/* Add Room Button */
.add-room-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-room-btn:hover {
  text-decoration: underline;
}

/* Apply button */
.popover-actions {
  display: flex;
}

.apply-btn {
  padding: 9px 24px;
  background: var(--color-navy);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.apply-btn:hover {
  background: var(--color-navy-hover);
}

/* ── Additional Parameters ────────────────────────────────── */
.additional-params-section {
  margin-top: 20px;
}

.params-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.toggle-arrow {
  transition: transform 0.2s ease;
}

.toggle-arrow--open {
  transform: rotate(180deg);
}

.params-expanded-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 6px;
}

.param-chip {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #ffffff;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.12s ease;
}

.param-chip:hover {
  border-color: var(--color-primary);
}

.param-chip--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 8px;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
}

.custom-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-navy);
}

/* ── Search Results Test Preview ──────────────────────────── */
.results-preview {
  margin-top: 32px;
}

.results-header {
  margin-bottom: 20px;
}

.results-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.results-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.hotel-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(31, 43, 56, 0.04);
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hotel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 43, 56, 0.09);
}

.hotel-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hotel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hotel-tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.stars {
  color: #f59e0b;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.hotel-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.hotel-loc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

.hotel-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 4px 0;
}

.feature-badge {
  font-size: 0.75rem;
  background: var(--color-primary-subtle);
  color: var(--color-text);
  padding: 3px 8px;
  border-radius: 4px;
}

.feature-badge--green {
  background: #ecfdf5;
  color: #047857;
}

.hotel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  margin-top: 6px;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-text);
}

.price-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.book-btn {
  padding: 8px 18px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.book-btn:hover {
  background: var(--color-primary-hover);
}

/* ── Manage Bookings Teaser ──────────────────────────────── */
.bookings-teaser {
  margin-top: 48px;
}

.teaser-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

@media (max-width: 900px) {
  .search-inputs-bar {
    flex-direction: column;
  }
  .input-col {
    width: 100%;
  }
  .calendar-popover {
    width: 100%;
  }
  .cal-months-container {
    flex-direction: column;
  }
}
</style>
