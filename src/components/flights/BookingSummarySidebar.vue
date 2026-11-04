<script setup lang="ts">
interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

interface Props {
  title?: string
  originCode: string
  originName?: string
  destCode: string
  destName?: string
  flightName?: string
  cabinClass?: string
  tripType?: string
  dateText?: string
  travellerText?: string
  baseFare: number
  taxesAndFees: number
  extraBagsCount?: number
  extraBagsPrice?: number
  totalPrice: number
  currency?: string
  buttonText: string
  buttonDisabled?: boolean
  isLoading?: boolean
  finePrint?: string
  showBadges?: boolean
  isRefundable?: boolean
  isChangeable?: boolean
  showChecklist?: boolean
  checklistItems?: ChecklistItem[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Booking summary',
  originName: '',
  destName: '',
  flightName: '',
  cabinClass: 'Economy',
  tripType: 'One way',
  dateText: '',
  travellerText: '1 Adult',
  extraBagsCount: 0,
  extraBagsPrice: 0,
  currency: 'USD',
  buttonDisabled: false,
  isLoading: false,
  showBadges: false,
  isRefundable: true,
  isChangeable: true,
  showChecklist: false,
  checklistItems: () => [],
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

      <!-- Route Header -->
      <div class="mb-1 text-sm font-semibold text-[#0c1f44] flex items-center gap-1.5 flex-wrap">
        <span>{{ originName || originCode }}</span>
        <span class="text-[11px] font-mono text-[#63708b] bg-[#eef3fa] px-1 py-0.5 rounded">{{ originCode }}</span>
        <span class="text-[#8fa9de]">→</span>
        <span>{{ destName || destCode }}</span>
        <span class="text-[11px] font-mono text-[#63708b] bg-[#eef3fa] px-1 py-0.5 rounded">{{ destCode }}</span>
      </div>

      <!-- Flight & Date Subtitle -->
      <p class="text-xs text-[#63708b] m-0 mb-4 leading-relaxed">
        <span v-if="dateText">{{ dateText }}</span>
        <span v-if="flightName"> · {{ flightName }}</span>
        <span v-if="travellerText"> · {{ travellerText }}</span>
        <span v-if="cabinClass"> · {{ cabinClass }}</span>
      </p>

      <div class="border-t border-[#e5edfa] my-3"></div>

      <!-- Line Items -->
      <dl class="space-y-2 text-xs text-[#3d4a66] m-0">
        <div class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">Base fare</dt>
          <dd class="font-mono font-medium text-[#0c1f44] m-0">${{ formatMoney(baseFare) }}</dd>
        </div>

        <div class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">Taxes &amp; fees</dt>
          <dd class="font-mono font-medium text-[#0c1f44] m-0">${{ formatMoney(taxesAndFees) }}</dd>
        </div>

        <div v-if="extraBagsCount > 0" class="flex items-center justify-between">
          <dt class="font-normal text-[#63708b]">
            Extra baggage ({{ extraBagsCount }}x)
          </dt>
          <dd class="font-mono font-medium text-[#0c1f44] m-0">${{ formatMoney(extraBagsPrice) }}</dd>
        </div>
      </dl>

      <!-- Total Row -->
      <div class="border-t border-[#d3dff1] pt-3.5 mt-3.5 flex items-baseline justify-between">
        <span class="text-sm font-bold text-[#0c1f44]">Total</span>
        <div class="text-right">
          <span class="text-xs font-semibold text-[#63708b] mr-1.5">{{ currency }}</span>
          <span class="text-2xl font-bold font-mono text-[#0c1f44] tracking-tight">
            {{ formatMoney(totalPrice) }}
          </span>
        </div>
      </div>

      <!-- Optional Step 2 Checklist -->
      <div v-if="showChecklist && checklistItems.length > 0" class="mt-4 pt-3.5 border-t border-[#e5edfa] space-y-2">
        <div
          v-for="item in checklistItems"
          :key="item.id"
          class="flex items-center justify-between text-xs py-1"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-4 h-4 rounded-full flex items-center justify-center transition-colors"
              :class="item.done ? 'bg-[#0d8a58] text-white' : 'border border-[#c9d6ec]'"
            >
              <svg v-if="item.done" class="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <span :class="item.done ? 'font-medium text-[#0c1f44]' : 'text-[#63708b]'">
              {{ item.label }}
            </span>
          </div>
          <span
            class="text-[11px] font-semibold"
            :class="item.done ? 'text-[#0d8a58]' : 'text-[#9a5a06]'"
          >
            {{ item.done ? 'Complete' : 'To do' }}
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <button
        type="button"
        class="w-full h-11 bg-[#4a6cc0] hover:bg-[#3f5fae] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="buttonDisabled || isLoading"
        @click="emit('submit')"
      >
        <svg
          v-if="isLoading"
          class="w-4 h-4 animate-spin text-white"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{{ buttonText }}</span>
        <svg v-if="!isLoading && buttonText.includes('→')" class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Policy Badges (Step 1) -->
      <div v-if="showBadges" class="mt-3.5 pt-3 border-t border-[#e5edfa] flex items-center gap-2 flex-wrap">
        <span
          v-if="isRefundable"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5f6ee] text-[#0d8a58]"
        >
          <svg class="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Refundable
        </span>
        <span
          v-if="isChangeable"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5f6ee] text-[#0d8a58]"
        >
          <svg class="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Changeable
        </span>
      </div>

      <!-- Fine Print -->
      <p v-if="finePrint" class="text-center text-[11.5px] text-[#63708b] m-0 mt-3 leading-normal">
        {{ finePrint }}
      </p>
    </div>

    <!-- Mobile Fixed Bottom Action Bar -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#d3dff1] p-3 shadow-lg flex items-center justify-between gap-4">
      <div>
        <div class="text-[11px] text-[#63708b] font-medium">Total ({{ currency }})</div>
        <div class="text-lg font-bold font-mono text-[#0c1f44]">${{ formatMoney(totalPrice) }}</div>
      </div>
      <button
        type="button"
        class="flex-1 max-w-[240px] h-10 bg-[#4a6cc0] hover:bg-[#3f5fae] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
        :disabled="buttonDisabled || isLoading"
        @click="emit('submit')"
      >
        <span>{{ buttonText }}</span>
      </button>
    </div>
  </aside>
</template>

