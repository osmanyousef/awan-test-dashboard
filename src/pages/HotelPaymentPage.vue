<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HotelStepHero from '../components/hotels/HotelStepHero.vue'
import HotelBookingSidebar from '../components/hotels/HotelBookingSidebar.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { show } = useToast()

// ── Guest & Contact State (Retrieved from Step 2) ───────────
const guest = ref({
  title: 'Mr',
  firstName: 'IBRAHIM',
  lastName: 'BADER',
  dob: '2001-11-20',
  gender: 'Male',
  nationality: 'LY',
  email: 'gitize@mailinator.com',
  phone: '+1 (685) 784-3921',
  requests: ['non-smoking', 'high-floor'],
})

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('awan_hotel_guest_details')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.firstName) guest.value.firstName = parsed.firstName
      if (parsed.lastName) guest.value.lastName = parsed.lastName
      if (parsed.dob) guest.value.dob = parsed.dob
      if (parsed.gender) guest.value.gender = parsed.gender
      if (parsed.nationality) guest.value.nationality = parsed.nationality
      if (parsed.email) guest.value.email = parsed.email
      if (parsed.phone) guest.value.phone = parsed.phone
      if (parsed.requests) guest.value.requests = parsed.requests
    }
  } catch {}
})

// ── Payment & Terms State ──────────────────────────────────
const selectedPayment = ref<'wallet'>('wallet')
const agreeTerms = ref(false)
const isBusy = ref(false)
const showSuccessModal = ref(false)
const bookingRef = ref('HTL-' + Math.floor(100000 + Math.random() * 900000))

async function handleConfirmBooking() {
  if (selectedPayment.value !== 'wallet') {
    show('Please select a payment method.')
    return
  }
  if (!agreeTerms.value) {
    show('Please agree to the booking terms and cancellation policy.')
    return
  }

  isBusy.value = true
  await new Promise(r => setTimeout(r, 1100))
  isBusy.value = false
  showSuccessModal.value = true
}

function handleDone() {
  router.push('/operations/bookings')
}
</script>

<template>
  <div class="min-h-screen bg-[#eef3fa] bg-[radial-gradient(rgba(12,31,68,0.07)_1px,transparent_1.2px)] bg-[size:18px_18px] text-[#0c1f44]">
    <!-- Step 3 Hero Banner -->
    <HotelStepHero
      :current-step="3"
      title="Review & pay"
      subtitle="Silka Maytower Kuala Lumpur · 05 Dec - 08 Dec 2026 · Standard Twin"
      back-label="Back to guest details"
      back-route="/hotels/guests"
    />

    <!-- Main Content Layout -->
    <div class="max-w-[1400px] mx-auto px-5 sm:px-8 relative -mt-16 pb-16 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 items-start">
        <!-- Left Column: Review & Payment -->
        <main class="space-y-4">

          <!-- Hotel Review Summary Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center justify-between gap-4 flex-wrap mb-3">
              <h2 class="text-lg font-bold text-[#0c1f44] m-0">Review Hotel Booking</h2>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e9effb] text-[#4a6cc0]">
                3 Nights · 1 Room
              </span>
            </div>

            <!-- Hotel Identity with Photo -->
            <div class="p-3.5 sm:p-4 rounded-xl bg-[#f6f8fd] border border-[#e5edfa] mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
              <div class="w-full sm:w-28 h-24 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[#d3dff1] relative bg-slate-100 shadow-2xs group">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80"
                  alt="Silka Maytower Kuala Lumpur"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h3 class="text-base font-bold text-[#0c1f44] m-0">Silka Maytower Kuala Lumpur</h3>
                  <span class="text-[#e8a500] text-sm">★★★</span>
                </div>
                <p class="text-xs text-[#63708b] m-0 mt-1">
                  7 Jalan Munshi Abdullah, 50100 Kuala Lumpur Jalan Munshi Abdullah
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0d8a58] bg-[#e5f6ee] px-2 py-0.5 rounded-md">
                    ✓ Confirmed Instant Reservation
                  </span>
                </div>
              </div>
            </div>

            <!-- Check-in / Out Grid -->
            <div class="grid grid-cols-3 border border-[#d3dff1] rounded-xl overflow-hidden bg-white divide-x divide-[#d3dff1] text-center mb-4">
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Check-in</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">5 Dec 2026</div>
                <div class="text-[10px] text-[#0d8a58] font-medium">From 2:00 PM</div>
              </div>
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Nights</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">3</div>
                <div class="text-[10px] text-[#63708b]">Duration</div>
              </div>
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#63708b]">Check-out</div>
                <div class="text-xs sm:text-sm font-bold text-[#0c1f44] mt-0.5">8 Dec 2026</div>
                <div class="text-[10px] text-[#9a5a06] font-medium">Until 12:00 PM</div>
              </div>
            </div>

            <!-- Room & Inclusions -->
            <div class="flex items-center justify-between flex-wrap gap-2 text-xs py-2 border-t border-[#eef3fa]">
              <span class="font-bold text-sm text-[#0c1f44]">Standard Twin</span>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md font-semibold bg-[#f6f8fd] text-[#4b5568] border border-[#d9e3f3]">
                  Room only
                </span>
                <span class="px-2 py-0.5 rounded-md font-semibold bg-[#fdecec] text-[#b42318]">
                  Non-refundable
                </span>
              </div>
            </div>
          </section>

          <!-- Guests (1) Review Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-full bg-[#e9effb] text-[#4a6cc0] flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <h2 class="text-base font-bold text-[#0c1f44] m-0">Guests (1)</h2>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-[#4a6cc0] hover:underline cursor-pointer bg-transparent border-0 p-0"
                @click="router.push('/hotels/guests')"
              >
                Edit details
              </button>
            </div>

            <div class="p-3.5 rounded-xl bg-[#f6f8fd] border border-[#e5edfa] space-y-2 text-xs">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="font-bold text-sm text-[#0c1f44]">
                  {{ guest.title }} {{ guest.firstName }} {{ guest.lastName }}
                </span>
                <span class="text-[#63708b]">
                  Adult · {{ guest.gender }} · Nationality: {{ guest.nationality }} · Born: {{ guest.dob }}
                </span>
              </div>
              <div class="border-t border-[#e5edfa] pt-2 flex items-center justify-between flex-wrap gap-2 text-[#475467]">
                <span>📧 {{ guest.email }}</span>
                <span>📞 {{ guest.phone }}</span>
              </div>
            </div>
          </section>

          <!-- Payment Method Card (Agency Wallet) -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-base font-bold text-[#0c1f44] m-0 mb-3">Payment Method</h2>

            <div class="p-4 rounded-xl border-2 border-[#4a6cc0] bg-[#f8faff] flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#e3effd] text-[#2d5fb0] flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-bold text-[#0c1f44] flex items-center gap-2">
                    <span>Agency Wallet</span>
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e5f6ee] text-[#0d8a58]">
                      Active
                    </span>
                  </div>
                  <div class="text-xs text-[#63708b] mt-1 leading-relaxed">
                    Spending power (balance + credit): <b class="text-[#0c1f44]">LYD 88,823.24</b>
                  </div>
                  <div class="text-[11px] text-[#0d8a58] font-medium mt-1">
                    ✓ Immediate settlement in LYD · Zero processing surcharge
                  </div>
                </div>
              </div>
              <div class="w-5 h-5 rounded-full border-2 border-[#4a6cc0] flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-[#4a6cc0]"></div>
              </div>
            </div>
          </section>

          <!-- Cancellation Policy & Agreement Card -->
          <section class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
            <h2 class="text-base font-bold text-[#0c1f44] m-0 mb-3">Cancellation Policy</h2>

            <div class="p-3.5 rounded-xl bg-[#fdecec]/30 border border-[#fdecec] text-xs text-[#b42318] mb-4 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Non-refundable Rate
              </div>
              <p class="m-0 leading-relaxed text-[#7a1c13]">
                No refund is issued on cancellation. Once confirmed, this reservation cannot be amended or refunded.
              </p>
            </div>

            <!-- Terms agreement checkbox -->
            <label class="flex items-start gap-3 cursor-pointer select-none text-xs text-[#3d4a66]">
              <input
                v-model="agreeTerms"
                type="checkbox"
                class="w-4.5 h-4.5 mt-0.5 rounded border-[#c9d6ec] text-[#4a6cc0] focus:ring-[#4a6cc0] cursor-pointer"
              />
              <span class="leading-relaxed">
                I agree to the <a href="#" class="text-[#4a6cc0] underline font-semibold" @click.prevent>booking terms</a> and cancellation policy for Silka Maytower Kuala Lumpur.
              </span>
            </label>
          </section>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between pt-2">
            <button
              type="button"
              class="h-11 px-5 border border-[#c9d6ec] bg-white text-[#3d4a66] hover:bg-[#f6f8fd] font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2"
              @click="router.push('/hotels/guests')"
            >
              <span>←</span>
              <span>Back to guest details</span>
            </button>

            <button
              type="button"
              class="h-11 px-7 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!agreeTerms || isBusy"
              @click="handleConfirmBooking"
            >
              <svg v-if="isBusy" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Confirm booking ($80.00)</span>
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
          :button-disabled="!agreeTerms"
          :is-loading="isBusy"
          button-text="Confirm booking"
          @submit="handleConfirmBooking"
        />
      </div>
    </div>

    <!-- ── Booking Confirmation Success Modal ─────────────────── -->
    <Teleport to="body">
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div class="w-16 h-16 rounded-full bg-[#e5f6ee] text-[#0d8a58] flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 class="text-xl font-bold text-[#0c1f44] m-0 mb-1">
            Booking Confirmed!
          </h3>
          <p class="text-xs text-[#63708b] m-0 mb-4">
            Your hotel room reservation has been issued and confirmed with instant wallet debit.
          </p>

          <div class="p-3.5 rounded-xl bg-[#f6f8fd] border border-[#e5edfa] text-xs text-left mb-5 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[#63708b]">Booking Reference:</span>
              <span class="font-mono font-bold text-[#0c1f44]">{{ bookingRef }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#63708b]">Hotel:</span>
              <span class="font-semibold text-[#0c1f44]">Silka Maytower KL</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#63708b]">Stay Dates:</span>
              <span class="font-semibold text-[#0c1f44]">05 Dec - 08 Dec 2026 (3N)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#63708b]">Charged Amount:</span>
              <span class="font-bold text-[#0d8a58]">$80.00 USD</span>
            </div>
          </div>

          <div class="flex gap-2.5">
            <button
              type="button"
              class="flex-1 h-11 rounded-xl bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm transition-all cursor-pointer shadow-xs"
              @click="handleDone"
            >
              View in Bookings
            </button>
            <button
              type="button"
              class="h-11 px-4 rounded-xl border border-[#d3dff1] text-[#3d4a66] hover:bg-[#f6f8fd] font-semibold text-sm transition-all cursor-pointer"
              @click="router.push('/hotels')"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
