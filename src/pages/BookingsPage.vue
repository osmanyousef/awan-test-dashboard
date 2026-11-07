<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { recentBookings, type Booking } from '../config/mockData'
import { useToast } from '../composables/useToast'

const { show } = useToast()

// ── Complete Bookings Data ─────────────────────────────────
const allBookings = ref<Booking[]>([
  ...recentBookings,
  { id: '7', ref: 'FLT-78400', type: 'Flight', customer: 'Blue Sky Agency', route: 'CDG → SIN', date: '2025-10-29', amount: 1680, currency: 'USD', status: 'Confirmed' },
  { id: '8', ref: 'HTL-44600', type: 'Hotel', customer: 'Apex Travel', route: 'Burj Al Arab, Dubai', date: '2025-10-29', amount: 7200, currency: 'USD', status: 'Pending' },
  { id: '9', ref: 'FLT-78389', type: 'Flight', customer: 'Global Tours', route: 'IST → AMS', date: '2025-10-28', amount: 540, currency: 'USD', status: 'Confirmed' },
  { id: '10', ref: 'FLT-78377', type: 'Flight', customer: 'Global Tours', route: 'AMS → LHR', date: '2025-10-27', amount: 210, currency: 'USD', status: 'Confirmed' },
  { id: '11', ref: 'HTL-44590', type: 'Hotel', customer: 'Nomad Agency', route: 'The Ritz, Paris', date: '2025-10-27', amount: 4400, currency: 'USD', status: 'Amended' },
])

// ── Search & Filter State ──────────────────────────────────
const search = ref('')
const typeFilter = ref<'All Types' | 'Flight' | 'Hotel'>('All Types')
const statusFilter = ref<'All Status' | 'Confirmed' | 'Pending' | 'Cancelled' | 'Amended'>('All Status')

const typeChips = [
  { value: 'All Types', label: 'All Types' },
  { value: 'Flight', label: 'Flight' },
  { value: 'Hotel', label: 'Hotel' },
] as const

const statusChips = [
  { value: 'All Status', label: 'All Status' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Amended', label: 'Amended' },
] as const

const columns = [
  { key: 'ref', label: 'Ref', sortable: true, align: 'left' },
  { key: 'type', label: 'Type', sortable: true, align: 'left' },
  { key: 'customer', label: 'Customer', sortable: true, align: 'left' },
  { key: 'route', label: 'Route / Property', sortable: false, align: 'left' },
  { key: 'date', label: 'Date', sortable: true, align: 'left' },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'status', label: 'Status', sortable: true, align: 'left' },
] as const

// ── Sorting State ──────────────────────────────────────────
const sortKey = ref<keyof Booking | null>(null)
const sortDir = ref<1 | -1>(1)

function toggleSort(key: keyof Booking) {
  if (sortKey.value === key) {
    sortDir.value = (sortDir.value === 1 ? -1 : 1) as 1 | -1
  } else {
    sortKey.value = key
    sortDir.value = 1
  }
  currentPage.value = 1
}

// ── Filtered & Sorted Computed ─────────────────────────────
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allBookings.value.filter(b => {
    if (typeFilter.value !== 'All Types' && b.type !== typeFilter.value) return false
    if (statusFilter.value !== 'All Status' && b.status !== statusFilter.value) return false
    if (q) {
      const match = [b.ref, b.customer, b.route].join(' ').toLowerCase()
      if (!match.includes(q)) return false
    }
    return true
  })
})

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  const k = sortKey.value
  return [...filtered.value].sort((a, b) => {
    const valA = a[k]
    const valB = b[k]
    if (valA > valB) return sortDir.value
    if (valA < valB) return -sortDir.value
    return 0
  })
})

// ── Pagination State ───────────────────────────────────────
const perPage = 8
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)))
const pagedBookings = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return sorted.value.slice(start, start + perPage)
})

function formatCurrency(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

function formatDate(d: string) {
  const parsed = new Date(d)
  return isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleAmend(refCode: string) {
  show(`Amendment request raised for booking ${refCode}.`, 'info')
}

const statusMeta: Record<string, { bg: string, text: string, dot: string }> = {
  Confirmed: { bg: 'bg-[#e3f5ec]', text: 'text-[#157a54]', dot: 'bg-[#22a974]' },
  Pending: { bg: 'bg-[#fdf0d4]', text: 'text-[#9a5b00]', dot: 'bg-[#e69a0c]' },
  Cancelled: { bg: 'bg-[#fce8e6]', text: 'text-[#b4332e]', dot: 'bg-[#e0524b]' },
  Amended: { bg: 'bg-[#e0f3f8]', text: 'text-[#0e6f8a]', dot: 'bg-[#2aa5c4]' },
}
</script>

<template>
  <div class="relative w-full min-h-[calc(100vh-80px)] bg-transparent pb-16">
    <!-- Main Container -->
    <div class="relative z-10 w-full px-6 sm:px-10 lg:px-14 pt-10">
      <!-- Header -->
      <div class="flex items-end justify-between gap-4 flex-wrap mb-5.5">
        <div>
          <h1 class="text-[26px] font-bold text-[#111827] tracking-tight m-0">Bookings</h1>
          <p class="text-sm text-[#7b869c] mt-1 m-0">View and manage all bookings</p>
        </div>

        <div class="flex items-center gap-2.5">
          <RouterLink to="/flights"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[#5b81d0] hover:bg-[#4a6fc0] text-white text-[13.5px] font-semibold transition-all shadow-xs">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <path
                d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <span>New Flight</span>
          </RouterLink>

          <RouterLink to="/hotels"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-[#e3e8f0] text-[#111827] hover:bg-[#f4f6fa] text-[13.5px] font-semibold transition-all shadow-xs">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#7b869c]" viewBox="0 0 24 24">
              <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
            </svg>
            <span>New Hotel</span>
          </RouterLink>
        </div>
      </div>

      <!-- Filters Card -->
      <div
        class="bg-white border border-[#e3e8f0] rounded-[14px] p-4 sm:px-[18px] mb-4 shadow-xs flex items-center gap-5 flex-wrap w-full">
        <!-- Search -->
        <div class="relative flex-1 sm:flex-initial sm:w-[320px] min-w-[220px]">
          <svg
            class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#7b869c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input v-model="search" type="search" placeholder="Search ref, customer, route" aria-label="Search bookings"
            class="w-full h-[38px] pl-[34px] pr-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-[10px] text-[13.5px] text-[#111827] placeholder-[#7b869c] focus:bg-white focus:border-[#5b81d0] focus:ring-2 focus:ring-[#eaf0fc] outline-none transition-all"
            @input="currentPage = 1" />
        </div>

        <!-- Type Filter Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button v-for="t in typeChips" :key="t.value" type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap"
            :class="typeFilter === t.value ? 'bg-[#eaf0fc] border-transparent text-[#2f5fb5] font-semibold' : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
            @click="typeFilter = t.value; currentPage = 1">
            <!-- All Types Icon -->
            <svg v-if="t.value === 'All Types'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none opacity-70"
              viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <!-- Flight Icon -->
            <svg v-else-if="t.value === 'Flight'"
              class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#2d5fb0]" viewBox="0 0 24 24">
              <path
                d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <!-- Hotel Icon -->
            <svg v-else class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#6a3fe0]" viewBox="0 0 24 24">
              <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
            </svg>
            <span>{{ t.label }}</span>
          </button>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#e3e8f0]"></div>

        <!-- Status Filter Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button v-for="s in statusChips" :key="s.value" type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap"
            :class="statusFilter === s.value ? 'bg-[#eaf0fc] border-transparent text-[#2f5fb5] font-semibold' : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
            @click="statusFilter = s.value; currentPage = 1">
            <!-- All Status Icon -->
            <svg v-if="s.value === 'All Status'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none opacity-70"
              viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <!-- Confirmed Icon -->
            <svg v-else-if="s.value === 'Confirmed'"
              class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none text-[#157a54]" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <!-- Pending Icon -->
            <svg v-else-if="s.value === 'Pending'"
              class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#9a5b00]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <!-- Cancelled Icon -->
            <svg v-else-if="s.value === 'Cancelled'"
              class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#b4332e]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <!-- Amended Icon -->
            <svg v-else class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#0e6f8a]" viewBox="0 0 24 24">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>{{ s.label }}</span>
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white border border-[#e3e8f0] rounded-[14px] shadow-xs overflow-hidden w-full">
        <!-- Count -->
        <div class="px-5.5 py-4 text-[13px] text-[#7b869c] border-b border-[#eef1f6]">
          <b class="text-[#111827] font-semibold">{{ filtered.length }}</b>
          booking{{ filtered.length === 1 ? '' : 's' }}
        </div>

        <!-- Table -->
        <div class="overflow-x-auto w-full">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-[#f4f6fa] border-b border-[#e3e8f0]">
                <th v-for="col in columns" :key="col.key"
                  class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap"
                  :class="{ 'text-right': col.align === 'right' }">
                  <button v-if="col.sortable" type="button"
                    class="inline-flex items-center gap-1.5 cursor-pointer hover:text-[#111827]"
                    :class="{ 'ml-auto': col.align === 'right' }" @click="toggleSort(col.key as keyof Booking)">
                    <span>{{ col.label }}</span>
                    <span class="text-[10px]" :class="sortKey === col.key ? 'text-[#5b81d0] font-bold' : 'opacity-40'">
                      {{ sortKey === col.key ? (sortDir === 1 ? '↑' : '↓') : '↕' }}
                    </span>
                  </button>
                  <span v-else>{{ col.label }}</span>
                </th>
              </tr>
            </thead>

            <tbody v-if="pagedBookings.length > 0">
              <tr v-for="b in pagedBookings" :key="b.id"
                class="border-b border-[#eef1f6] last:border-b-0 hover:bg-[#fafbfd] transition-colors">
                <!-- Ref -->
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[12.5px] font-medium text-[#4b5568] tracking-wide">{{ b.ref }}</span>
                    <button type="button"
                      class="opacity-40 hover:opacity-100 hover:bg-[#eaf0fc] p-1 rounded text-xs transition-all cursor-pointer"
                      title="Request Amendment" @click="handleAmend(b.ref)">
                      ✏️
                    </button>
                  </div>
                </td>

                <!-- Type -->
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[7px] text-xs font-semibold"
                    :class="b.type === 'Flight' ? 'bg-[#e3effd] text-[#2d5fb0]' : 'bg-[#f1e9ff] text-[#6a3fe0]'">
                    <svg v-if="b.type === 'Flight'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none"
                      viewBox="0 0 24 24">
                      <path
                        d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                      <path
                        d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
                    </svg>
                    <span>{{ b.type }}</span>
                  </span>
                </td>

                <!-- Customer -->
                <td class="px-5.5 py-4 whitespace-nowrap font-medium text-[#111827]">
                  {{ b.customer }}
                </td>

                <!-- Route -->
                <td class="px-5.5 py-4 whitespace-nowrap text-[#4b5568]">
                  {{ b.route }}
                </td>

                <!-- Date -->
                <td class="px-5.5 py-4 whitespace-nowrap text-[#4b5568]">
                  {{ formatDate(b.date) }}
                </td>

                <!-- Amount -->
                <td class="px-5.5 py-4 whitespace-nowrap text-right font-semibold text-[#111827] tabular-nums">
                  {{ formatCurrency(b.amount) }}
                </td>

                <!-- Status -->
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-xs font-semibold"
                    :class="[statusMeta[b.status]?.bg || 'bg-[#f4f6fa]', statusMeta[b.status]?.text || 'text-[#4b5568]']">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[b.status]?.dot || 'bg-[#7b869c]'"></span>
                    <span>{{ b.status }}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div v-if="filtered.length === 0" class="py-12 px-5 text-center text-[#7b869c] text-sm">
          <b class="block text-[#111827] text-sm mb-1">No bookings match</b>
          Try a different search or clear a filter.
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-5.5 py-3.5 border-t border-[#e3e8f0] text-[13px] text-[#7b869c]">
          <span>Page {{ currentPage }} of {{ totalPages }}</span>

          <div class="flex items-center gap-2">
            <button type="button" :disabled="currentPage <= 1"
              class="h-[34px] px-3.5 rounded-[10px] border border-[#e3e8f0] bg-white text-[#111827] font-semibold text-[13px] hover:bg-[#f4f6fa] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              @click="currentPage--">
              ‹ Prev
            </button>
            <button type="button" :disabled="currentPage >= totalPages"
              class="h-[34px] px-3.5 rounded-[10px] border border-[#e3e8f0] bg-white text-[#111827] font-semibold text-[13px] hover:bg-[#f4f6fa] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              @click="currentPage++">
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
