<script setup lang="ts">
interface Props {
  title?: string
  hotelName?: string
  hotelAddress?: string
  hotelImage?: string
  stars?: number
  roomName?: string
  board?: string
  checkIn?: string
  checkOut?: string
  nights?: number
  guestsText?: string
  nightlyRate: number
  stayPrice: number
  totalPrice: number
  currency?: string
  refundable?: boolean
  buttonText: string
  buttonDisabled?: boolean
  isLoading?: boolean
  completionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Booking summary',
  hotelName: 'Silka Maytower Kuala Lumpur',
  hotelAddress: '7 Jalan Munshi Abdullah, 50100 Kuala Lumpur',
  hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
  stars: 3,
  roomName: 'Standard Twin',
  board: 'Room Only',
  checkIn: '2026-12-05',
  checkOut: '2026-12-08',
  nights: 3,
  guestsText: '1 Guest · 1 Room',
  currency: 'USD',
  refundable: false,
  buttonDisabled: false,
  isLoading: false,
  completionText: '',
})

const emit = defineEmits<{
  (e: 'submit'): void
}>()

function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<template>
  <aside class="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[84px] self-start z-20">
    <div class="bg-white rounded-2xl border border-[#d3dff1] p-5 shadow-xs">
      <!-- Title -->
      <h3 class="text-base font-bold text-[#0c1f44] m-0 mb-3">
        {{ title }}
      </h3>

      <!-- Hotel Image Preview Banner -->
      <div class="relative h-32 w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 border border-[#e5edfa] shadow-2xs group">
        <img
          :src="hotelImage"
          :alt="hotelName"
          class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
        <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
          <span class="font-bold truncate drop-shadow-xs">{{ hotelName }}</span>
          <span class="text-[#f59e0b] text-xs shrink-0 font-medium">★★★</span>
        </div>
      </div>

      <!-- Hotel Name & Rating -->
      <div class="mb-1 text-sm font-bold text-[#0c1f44] flex items-center justify-between gap-1.5 flex-wrap">
        <span>{{ hotelName }}</span>
        <span class="flex items-center text-[#e8a500] text-xs">
          <span v-for="s in stars" :key="s">★</span>
        </span>
      </div>

      <!-- Address / Location Subtitle -->
      <p class="text-xs text-[#63708b] m-0 mb-3 leading-relaxed">
        {{ hotelAddress }}
      </p>

      <!-- Stay Dates & Room Tag -->
      <div class="p-2.5 rounded-xl bg-[#f6f8fd] border border-[#e5edfa] mb-3 text-xs text-[#3d4a66] space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[#63708b]">Stay duration:</span>
          <span class="font-semibold">{{ checkIn }} → {{ checkOut }} ({{ nights }}N)</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#63708b]">Room &amp; Board:</span>
          <span class="font-semibold">{{ roomName }} · {{ board }}</span>
        </div>
      </div>

      <!-- Policy Pill -->
      <div class="mb-3">
        <span
          v-if="refundable"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]"
        >
          ✓ Refundable
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fdecec] text-[#b42318]"
        >
          ✕ Non-refundable
        </span>
      </div>

      <div class="border-t border-[#e5edfa] my-3"></div>

      <!-- Line Items -->
      <dl class="space-y-2 text-xs text-[#3d4a66] m-0">
        <div class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">Nightly rate × {{ nights }} nights</dt>
          <dd class="font-mono font-medium text-[#0c1f44] m-0">${{ formatMoney(nightlyRate) }}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">Stay price</dt>
          <dd class="font-mono font-medium text-[#0c1f44] m-0">${{ formatMoney(stayPrice) }}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">Taxes &amp; fees</dt>
          <dd class="font-medium text-[#0d8a58] m-0">Included</dd>
        </div>
      </dl>

      <div class="border-t border-[#e5edfa] my-3.5"></div>

      <!-- Total Price -->
      <div class="flex items-baseline justify-between mb-2">
        <span class="text-sm font-semibold text-[#0c1f44]">Total</span>
        <div class="text-right">
          <div class="font-mono font-bold text-2xl text-[#0c1f44] tabular-nums">
            <span class="text-xs font-sans font-normal text-[#63708b] mr-1">{{ currency }}</span>${{ formatMoney(totalPrice) }}
          </div>
          <div class="text-[11px] text-[#63708b]">Includes all mandatory taxes</div>
        </div>
      </div>

      <!-- Completion Indicator (if provided) -->
      <div v-if="completionText" class="mt-3 py-2 px-3 rounded-lg bg-[#eef3fa] text-xs flex items-center justify-between font-medium text-[#4a6cc0]">
        <span>Guest Details:</span>
        <span class="font-bold">{{ completionText }}</span>
      </div>

      <!-- Action Button -->
      <button
        type="button"
        class="w-full h-11 mt-4 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
        :disabled="buttonDisabled || isLoading"
        @click="emit('submit')"
      >
        <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>{{ buttonText }}</span>
      </button>

      <!-- Security / Guarantee badge -->
      <p class="text-[11px] text-[#63708b] text-center mt-3 mb-0 flex items-center justify-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#0d8a58] stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Instant B2B confirmation &amp; wallet settlement</span>
      </p>
    </div>
  </aside>
</template>

