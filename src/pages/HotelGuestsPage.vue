<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HotelStepHero from '../components/hotels/HotelStepHero.vue'
import HotelBookingSidebar from '../components/hotels/HotelBookingSidebar.vue'
import PassportOcrScanner from '../components/common/PassportOcrScanner.vue'
import type { ParsedPassport } from '../utils/mrzParser'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { show } = useToast()

// ── Country List ───────────────────────────────────────────
const countries = [
  { code: 'LY', name: 'Libya (LY)' },
  { code: 'AE', name: 'United Arab Emirates (AE)' },
  { code: 'SA', name: 'Saudi Arabia (SA)' },
  { code: 'EG', name: 'Egypt (EG)' },
  { code: 'TN', name: 'Tunisia (TN)' },
  { code: 'DZ', name: 'Algeria (DZ)' },
  { code: 'MA', name: 'Morocco (MA)' },
  { code: 'TR', name: 'Turkey (TR)' },
  { code: 'MY', name: 'Malaysia (MY)' },
  { code: 'GB', name: 'United Kingdom (GB)' },
  { code: 'US', name: 'United States (US)' },
]

// ── Guest Form State ───────────────────────────────────────
const guest = ref({
  title: 'Mr',
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'Male',
  nationality: 'LY',
  email: 'gitize@mailinator.com',
  phone: '+1 (685) 784-3921',
})

const touched = ref<Record<string, boolean>>({})

function onBlur(field: string) {
  touched.value[field] = true
}

function getError(field: string): string {
  if (!touched.value[field]) return ''
  if (field === 'firstName' && !guest.value.firstName.trim()) return 'First name is required'
  if (field === 'lastName' && !guest.value.lastName.trim()) return 'Last name is required'
  if (field === 'dob' && !guest.value.dob) return 'Date of birth is required'
  if (field === 'email') {
    if (!guest.value.email.trim()) return 'Email is required'
    if (!/^\S+@\S+\.\S+$/.test(guest.value.email)) return 'Enter a valid email address'
  }
  if (field === 'phone' && !guest.value.phone.trim()) return 'Phone number is required'
  return ''
}

const isFormValid = computed(() => {
  return (
    guest.value.firstName.trim() !== '' &&
    guest.value.lastName.trim() !== '' &&
    guest.value.dob !== '' &&
    guest.value.email.trim() !== '' &&
    guest.value.phone.trim() !== ''
  )
})

// ── Special Requests State ─────────────────────────────────
const availableRequests = [
  { id: 'king', label: 'King bed', icon: '🛏️' },
  { id: 'twin', label: 'Twin beds', icon: '🛏️' },
  { id: 'non-smoking', label: 'Non-smoking room', icon: '🚭' },
  { id: 'high-floor', label: 'High floor', icon: '🏙️' },
  { id: 'early-checkin', label: 'Early check-in', icon: '🕐' },
  { id: 'late-checkout', label: 'Late check-out', icon: '🕓' },
  { id: 'honeymoon', label: 'Honeymoon', icon: '💝' },
  { id: 'airport-transfer', label: 'Airport transfer', icon: '🚗' },
]

const selectedRequests = ref<string[]>(['non-smoking', 'high-floor'])

function toggleRequest(id: string) {
  const index = selectedRequests.value.indexOf(id)
  if (index >= 0) {
    selectedRequests.value.splice(index, 1)
  } else {
    selectedRequests.value.push(id)
  }
}

// ── Passport OCR Auto-Fill ──────────────────────────────
function onPassportScanned(data: ParsedPassport) {
  if (data.title) guest.value.title = data.title
  if (data.firstName) guest.value.firstName = data.firstName
  if (data.lastName) guest.value.lastName = data.lastName
  if (data.dateOfBirth) guest.value.dob = data.dateOfBirth
  if (data.gender) guest.value.gender = data.gender
  if (data.nationality) guest.value.nationality = data.nationality
  touched.value = {}
  show(`Passport detected: ${data.firstName || ''} ${data.lastName || ''} (${data.nationality || ''})`.trim())
}

// ── Continue to Review ─────────────────────────────────────
function handleContinue() {
  ['firstName', 'lastName', 'dob', 'email', 'phone'].forEach(f => {
    touched.value[f] = true
  })

  if (!isFormValid.value) {
    show('Please fill in the required fields correctly')
    return
  }

  try {
    sessionStorage.setItem(
      'awan_hotel_guest_details',
      JSON.stringify({
        ...guest.value,
        requests: selectedRequests.value,
      })
    )
  } catch {}

  router.push('/hotels/pay')
}
</script>

<template>
  <div class="min-h-screen bg-[#eef3fa] bg-[radial-gradient(rgba(12,31,68,0.07)_1px,transparent_1.2px)] bg-[size:18px_18px] text-[#0c1f44]">
    <!-- Step 2 Hero Banner -->
    <HotelStepHero
      :current-step="2"
      title="Guest details"
      subtitle="Silka Maytower Kuala Lumpur · 05 Dec - 08 Dec 2026 (3 nights) · Standard Twin"
      back-label="Back to room selection"
      back-route="/hotels/details"
    />

    <!-- Main Content Layout -->
    <div class="max-w-[1400px] mx-auto px-5 sm:px-8 relative -mt-16 pb-16 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 items-start">
        <!-- Left Column: Forms -->
        <main class="space-y-4">

          <!-- Hotel & Stay Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <!-- Hotel Photo Thumbnail -->
              <div class="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[#d3dff1] relative bg-slate-100 shadow-2xs group">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80"
                  alt="Silka Maytower Kuala Lumpur"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span class="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-2xs">
                  ★ 3-Star
                </span>
              </div>

              <!-- Hotel Details -->
              <div class="flex-1 min-w-0 w-full">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-lg sm:text-xl font-bold text-[#0c1f44] m-0">Silka Maytower Kuala Lumpur</h2>
                      <span class="flex items-center text-[#e8a500] text-sm">
                        <span v-for="s in 3" :key="s">★</span>
                      </span>
                    </div>
                    <p class="text-xs text-[#63708b] mt-1 m-0">
                      7 Jalan Munshi Abdullah, 50100 Kuala Lumpur Jalan Munshi Abdullah - 124046
                    </p>
                  </div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e9effb] text-[#4a6cc0] shrink-0">
                    Hotel Booking
                  </span>
                </div>
              </div>
            </div>

            <!-- Check-in / Nights / Check-out Bar -->
            <div class="grid grid-cols-3 border border-[#d3dff1] rounded-xl mt-4 overflow-hidden bg-[#f6f8fd] divide-x divide-[#d3dff1] text-center">
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Check-in</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">5 Dec 2026</div>
                <div class="text-[10px] text-[#0d8a58] font-medium">From 2:00 PM</div>
              </div>
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Duration</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">3 Nights</div>
                <div class="text-[10px] text-[#63708b]">1 Room</div>
              </div>
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Check-out</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">8 Dec 2026</div>
                <div class="text-[10px] text-[#9a5a06] font-medium">Until 12:00 PM</div>
              </div>
            </div>

            <!-- Room info & Policy alert -->
            <div class="mt-4 pt-4 border-t border-[#eef3fa] flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-[#0c1f44]">Standard Twin</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#f6f8fd] text-[#4b5568] border border-[#d9e3f3]">
                  🍽️ Room Only
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#fdecec] text-[#b42318]">
                  Non-refundable
                </span>
              </div>
              <button type="button" class="text-xs font-semibold text-[#4a6cc0] hover:underline cursor-pointer bg-transparent border-0 p-0">
                Full cancellation policy &amp; rules
              </button>
            </div>

            <!-- Cancellation Warning Notice -->
            <div class="mt-3 p-3 rounded-xl bg-[#fff4dc] border border-[#fde4aa] text-xs text-[#9a5a06] flex items-start gap-2.5">
              <svg class="w-4 h-4 text-[#9a5a06] stroke-current stroke-2 fill-none shrink-0 mt-0.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <b>Non-refundable:</b> No refund is issued on cancellation. Please review the cancellation policy and hotel terms before confirming.
              </div>
            </div>
          </section>

          <!-- Special Requests Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base">✨</span>
              <h2 class="text-base font-bold text-[#0c1f44] m-0">Special Requests</h2>
              <span class="text-xs text-[#63708b]">(optional)</span>
            </div>
            <p class="text-xs text-[#63708b] m-0 mb-4">
              These requests are not guaranteed and depend on hotel availability upon check-in.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                v-for="req in availableRequests"
                :key="req.id"
                type="button"
                class="flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer"
                :class="selectedRequests.includes(req.id) ? 'bg-[#e9effb] border-[#4a6cc0] text-[#0c1f44] font-semibold' : 'bg-white border-[#d3dff1] text-[#3d4a66] hover:bg-[#f6f8fd]'"
                @click="toggleRequest(req.id)"
              >
                <span>{{ req.icon }}</span>
                <span>{{ req.label }}</span>
              </button>
            </div>
          </section>

          <!-- Guest Details Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center gap-2.5 flex-wrap mb-2">
              <span class="w-8 h-8 rounded-full bg-[#e9effb] text-[#4a6cc0] flex items-center justify-center">
                <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <h2 class="text-lg font-bold text-[#0c1f44] m-0">Guest 1</h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f6f8fd] text-[#63708b] border border-[#d9e3f3]">
                Adult
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fff4dc] text-[#9a5a06]">
                Booking holder
              </span>
              <span
                v-if="isFormValid"
                class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e5f6ee] text-[#0d8a58] inline-flex items-center gap-1 ml-auto"
              >
                <svg class="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Complete
              </span>
            </div>

            <p class="text-xs text-[#63708b] m-0 mb-4">
              Enter names exactly as they appear on your official ID or passport.
            </p>

            <!-- Passport OCR Scanner Component -->
            <PassportOcrScanner @scan-complete="onPassportScanned" />

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 mb-5">
              <!-- Title -->
              <div class="sm:col-span-3">
                <label for="title" class="block text-xs font-medium text-[#3d4a66] mb-1">Title *</label>
                <select
                  id="title"
                  v-model="guest.title"
                  class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </div>

              <!-- First name -->
              <div class="sm:col-span-5" :class="{ 'has-error': touched.firstName && !!getError('firstName') }">
                <label for="firstName" class="block text-xs font-medium text-[#3d4a66] mb-1">First name *</label>
                <input
                  id="firstName"
                  v-model="guest.firstName"
                  type="text"
                  placeholder="e.g. IBRAHIM"
                  class="w-full h-10 px-3 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.firstName && !!getError('firstName') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('firstName')"
                />
                <small v-if="touched.firstName && !!getError('firstName')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('firstName') }}
                </small>
              </div>

              <!-- Last name -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.lastName && !!getError('lastName') }">
                <label for="lastName" class="block text-xs font-medium text-[#3d4a66] mb-1">Last name *</label>
                <input
                  id="lastName"
                  v-model="guest.lastName"
                  type="text"
                  placeholder="e.g. BADER"
                  class="w-full h-10 px-3 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.lastName && !!getError('lastName') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('lastName')"
                />
                <small v-if="touched.lastName && !!getError('lastName')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('lastName') }}
                </small>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <!-- Date of Birth -->
              <div class="sm:col-span-4" :class="{ 'has-error': touched.dob && !!getError('dob') }">
                <label for="dob" class="block text-xs font-medium text-[#3d4a66] mb-1">Date of birth *</label>
                <input
                  id="dob"
                  v-model="guest.dob"
                  type="date"
                  class="w-full h-10 px-3 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.dob && !!getError('dob') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('dob')"
                />
                <small v-if="touched.dob && !!getError('dob')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('dob') }}
                </small>
              </div>

              <!-- Gender -->
              <div class="sm:col-span-4">
                <label for="gender" class="block text-xs font-medium text-[#3d4a66] mb-1">Gender *</label>
                <select
                  id="gender"
                  v-model="guest.gender"
                  class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <!-- Nationality -->
              <div class="sm:col-span-4">
                <label for="nationality" class="block text-xs font-medium text-[#3d4a66] mb-1">Nationality *</label>
                <select
                  id="nationality"
                  v-model="guest.nationality"
                  class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                >
                  <option v-for="c in countries" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>
          </section>

          <!-- Contact Details Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-base font-bold text-[#0c1f44] m-0 mb-1">Contact Details</h2>
            <p class="text-xs text-[#63708b] m-0 mb-4">
              Booking confirmation and hotel voucher will be sent to these contact coordinates.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Email -->
              <div :class="{ 'has-error': touched.email && !!getError('email') }">
                <label for="email" class="block text-xs font-medium text-[#3d4a66] mb-1">Email *</label>
                <input
                  id="email"
                  v-model="guest.email"
                  type="email"
                  placeholder="e.g. name@example.com"
                  class="w-full h-10 px-3 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.email && !!getError('email') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('email')"
                />
                <small v-if="touched.email && !!getError('email')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('email') }}
                </small>
              </div>

              <!-- Phone -->
              <div :class="{ 'has-error': touched.phone && !!getError('phone') }">
                <label for="phone" class="block text-xs font-medium text-[#3d4a66] mb-1">Phone number *</label>
                <input
                  id="phone"
                  v-model="guest.phone"
                  type="tel"
                  placeholder="+1 (685) 784-3921"
                  class="w-full h-10 px-3 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0]"
                  :class="touched.phone && !!getError('phone') ? 'border-[#b42318] bg-[#fdecec]/20' : 'border-[#c9d6ec]'"
                  @blur="onBlur('phone')"
                />
                <small v-if="touched.phone && !!getError('phone')" class="text-[11px] font-medium text-[#b42318] mt-1 block">
                  {{ getError('phone') }}
                </small>
              </div>
            </div>
          </section>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between pt-2">
            <button
              type="button"
              class="h-11 px-5 border border-[#c9d6ec] bg-white text-[#3d4a66] hover:bg-[#f6f8fd] font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2"
              @click="router.push('/hotels/details')"
            >
              <span>←</span>
              <span>Back to room selection</span>
            </button>

            <button
              type="button"
              class="h-11 px-6 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              @click="handleContinue"
            >
              <span>Continue to review</span>
              <span>→</span>
            </button>
          </div>
        </main>

        <!-- Right Column: Sticky Summary Sidebar -->
        <HotelBookingSidebar
          hotel-name="Silka Maytower Kuala Lumpur"
          room-name="Standard Twin"
          board="Room Only"
          check-in="2026-12-05"
          check-out="2026-12-08"
          :nights="3"
          :nightly-rate="26.67"
          :stay-price="80.0"
          :total-price="80.0"
          :refundable="false"
          :completion-text="isFormValid ? '1/1' : '0/1'"
          button-text="Continue to review"
          @submit="handleContinue"
        />
      </div>
    </div>
  </div>
</template>

