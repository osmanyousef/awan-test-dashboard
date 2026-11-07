<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { dashboardStats, walletTransactions } from '../config/mockData'
import { useToast } from '../composables/useToast'

export interface WalletTransaction {
  id: string
  date: string
  description: string
  amount: number
  balance: number
  currency: string
  type: 'credit' | 'debit' | string
}

const { show } = useToast()

// ── Complete Transactions Data ─────────────────────────────
const allTransactions = ref<WalletTransaction[]>([
  ...walletTransactions,
  { id: 'W006', date: '2026-10-18', description: 'Flight amendment refund - QR 1400', amount: 320.00, balance: 55553.24, currency: 'LYD', type: 'credit' },
  { id: 'W007', date: '2026-10-15', description: 'Booking WD-F192A02 Flight BEN-IST', amount: -890.00, balance: 55233.24, currency: 'LYD', type: 'debit' },
  { id: 'W008', date: '2026-10-10', description: 'Direct Bank Wire Deposit #BW-88219', amount: 30000.00, balance: 56123.24, currency: 'LYD', type: 'credit' },
  { id: 'W009', date: '2026-09-28', description: 'Booking HTL-44600 Burj Al Arab', amount: -7200.00, balance: 26123.24, currency: 'LYD', type: 'debit' },
  { id: 'W010', date: '2026-09-20', description: 'Initial agency deposit allocation', amount: 33323.24, balance: 33323.24, currency: 'LYD', type: 'credit' },
])

// ── Search & Filter State ──────────────────────────────────
const search = ref('')
const typeFilter = ref<'all' | 'credit' | 'debit'>('all')
const periodFilter = ref<'all' | 'oct' | 'sep'>('all')

const typeChips = [
  { value: 'all', label: 'All Types' },
  { value: 'credit', label: 'Credits (+)' },
  { value: 'debit', label: 'Debits (-)' },
] as const

const periodChips = [
  { value: 'all', label: 'All Time' },
  { value: 'oct', label: 'October 2026' },
  { value: 'sep', label: 'September 2026' },
] as const

const columns = [
  { key: 'date', label: 'Date', sortable: true, align: 'left' },
  { key: 'id', label: 'Reference', sortable: true, align: 'left' },
  { key: 'type', label: 'Type', sortable: true, align: 'left' },
  { key: 'description', label: 'Description', sortable: false, align: 'left' },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'balance', label: 'Balance', sortable: true, align: 'right' },
  { key: 'actions', label: 'Receipt', sortable: false, align: 'right' },
] as const

// ── Sorting State ──────────────────────────────────────────
const sortKey = ref<keyof WalletTransaction | null>('date')
const sortDir = ref<1 | -1>(-1)

function toggleSort(key: keyof WalletTransaction) {
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
  return allTransactions.value.filter((tx: WalletTransaction) => {
    if (typeFilter.value !== 'all' && tx.type !== typeFilter.value) return false
    if (periodFilter.value === 'oct' && !tx.date.startsWith('2026-10')) return false
    if (periodFilter.value === 'sep' && !tx.date.startsWith('2026-09')) return false
    if (q) {
      const match = [tx.id, tx.description, tx.date, String(tx.amount)].join(' ').toLowerCase()
      if (!match.includes(q)) return false
    }
    return true
  })
})

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  const k = sortKey.value
  return [...filtered.value].sort((a: WalletTransaction, b: WalletTransaction) => {
    const valA = a[k]
    const valB = b[k]
    if (valA > valB) return sortDir.value
    if (valA < valB) return -sortDir.value
    return 0
  })
})

// ── Summary Stats Computeds ────────────────────────────────
const currentBalance = computed(() => dashboardStats.walletBalance)
const totalSpentMonth = computed(() => {
  return allTransactions.value
    .filter((tx: WalletTransaction) => tx.type === 'debit' && tx.date.startsWith('2026-10'))
    .reduce((sum: number, tx: WalletTransaction) => sum + Math.abs(tx.amount), 0)
})
const totalCreditsMonth = computed(() => {
  return allTransactions.value
    .filter((tx: WalletTransaction) => tx.type === 'credit' && tx.date.startsWith('2026-10'))
    .reduce((sum: number, tx: WalletTransaction) => sum + tx.amount, 0)
})

// ── Pagination State ───────────────────────────────────────
const perPage = 8
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)))
const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return sorted.value.slice(start, start + perPage)
})

// ── Formatters ─────────────────────────────────────────────
function formatCurrency(n: number) {
  return 'LYD ' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(d: string) {
  const parsed = new Date(d)
  return isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Top-Up Modal State ─────────────────────────────────────
const isTopUpModalOpen = ref(false)
const topUpAmount = ref('5000')
const topUpMethod = ref('bank_transfer')
const topUpNotes = ref('')

function openTopUpModal() {
  isTopUpModalOpen.value = true
}

function closeTopUpModal() {
  isTopUpModalOpen.value = false
}

function handleTopUpSubmit() {
  const amountNum = parseFloat(topUpAmount.value) || 0
  if (amountNum <= 0) {
    show('Please enter a valid top-up amount.', 'error')
    return
  }
  show(`Top-up request for LYD ${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} submitted. Under review.`, 'info')
  closeTopUpModal()
}

function handleExportCSV() {
  show('Exporting transaction ledger to CSV...', 'info')
}

function viewReceipt(id: string) {
  show(`Opening transaction receipt for ${id}...`, 'info')
}
</script>

<template>
  <div class="relative w-full min-h-[calc(100vh-80px)] bg-transparent pb-16">
    <!-- Main Container -->
    <div class="relative z-10 w-full px-6 sm:px-10 lg:px-14 pt-10">
      <!-- Header -->
      <div class="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="text-[26px] font-bold text-[#111827] tracking-tight m-0">Wallet</h1>
          <p class="text-sm text-[#7b869c] mt-1 m-0">Manage your agency balance, top-up requests, and ledger statements</p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Request Top-up Primary Button -->
          <button
            type="button"
            class="inline-flex items-center gap-2 h-10 px-4.5 rounded-[10px] bg-[#5b81d0] hover:bg-[#4a6fc0] text-white text-[13.5px] font-semibold transition-all shadow-xs cursor-pointer"
            @click="openTopUpModal"
          >
            <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Request Top-Up</span>
          </button>

          <!-- Statement Link -->
          <RouterLink
            to="/finance/statement"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-[#e3e8f0] text-[#111827] hover:bg-[#f4f6fa] text-[13.5px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#7b869c]" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Statement</span>
          </RouterLink>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Card 1: Available Balance -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Available Balance</span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e3f5ec] text-[#157a54]">
                <span class="w-1.5 h-1.5 rounded-full bg-[#22a974] animate-pulse"></span>
                Active
              </span>
            </div>
            <div class="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tabular-nums">
              {{ formatCurrency(currentBalance) }}
            </div>
          </div>
          <div class="mt-4 pt-3.5 border-t border-[#eef1f6] flex items-center justify-between text-xs text-[#7b869c]">
            <span>Spendable for instant booking</span>
            <button
              type="button"
              class="text-[#2f5fb5] font-semibold hover:underline cursor-pointer"
              @click="openTopUpModal"
            >
              + Add funds
            </button>
          </div>
        </div>

        <!-- Card 2: Total Spent (Oct) -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Total Spent (Oct)</span>
              <div class="w-7 h-7 rounded-lg bg-[#fce8e6] text-[#b4332e] flex items-center justify-center">
                <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M7 17l10-10M17 17V7H7" />
                </svg>
              </div>
            </div>
            <div class="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tabular-nums">
              {{ formatCurrency(totalSpentMonth) }}
            </div>
          </div>
          <div class="mt-4 pt-3.5 border-t border-[#eef1f6] flex items-center justify-between text-xs text-[#7b869c]">
            <span>Booking charges this month</span>
            <span class="font-medium text-[#4b5568]">3 transactions</span>
          </div>
        </div>

        <!-- Card 3: Total Credits (Oct) -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Credits Received (Oct)</span>
              <div class="w-7 h-7 rounded-lg bg-[#e3f5ec] text-[#157a54] flex items-center justify-center">
                <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M17 7l-10 10M7 7v10h10" />
                </svg>
              </div>
            </div>
            <div class="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tabular-nums">
              {{ formatCurrency(totalCreditsMonth) }}
            </div>
          </div>
          <div class="mt-4 pt-3.5 border-t border-[#eef1f6] flex items-center justify-between text-xs text-[#7b869c]">
            <span>Bank deposits &amp; settlements</span>
            <span class="font-medium text-[#157a54] font-semibold">2 credited</span>
          </div>
        </div>
      </div>

      <!-- Filters Bar Card -->
      <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-4 sm:px-[18px] mb-4 shadow-xs flex items-center gap-5 flex-wrap w-full">
        <!-- Search Input -->
        <div class="relative flex-1 sm:flex-initial sm:w-[320px] min-w-[220px]">
          <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#7b869c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Search description, reference, date"
            aria-label="Search transactions"
            class="w-full h-[38px] pl-[34px] pr-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-[10px] text-[13.5px] text-[#111827] placeholder-[#7b869c] focus:bg-white focus:border-[#5b81d0] focus:ring-2 focus:ring-[#eaf0fc] outline-none transition-all"
            @input="currentPage = 1"
          />
        </div>

        <!-- Type Filter Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="t in typeChips"
            :key="t.value"
            type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap"
            :class="typeFilter === t.value ? 'bg-[#eaf0fc] border-transparent text-[#2f5fb5] font-semibold' : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
            @click="typeFilter = t.value; currentPage = 1"
          >
            <!-- All Types -->
            <svg v-if="t.value === 'all'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none opacity-70" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <!-- Credits -->
            <svg v-else-if="t.value === 'credit'" class="w-3.5 h-3.5 stroke-current stroke-2 fill-none text-[#157a54]" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <!-- Debits -->
            <svg v-else class="w-3.5 h-3.5 stroke-current stroke-2 fill-none text-[#b4332e]" viewBox="0 0 24 24">
              <path d="M5 12h14" />
            </svg>
            <span>{{ t.label }}</span>
          </button>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#e3e8f0]"></div>

        <!-- Period Filter Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="p in periodChips"
            :key="p.value"
            type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap"
            :class="periodFilter === p.value ? 'bg-[#eaf0fc] border-transparent text-[#2f5fb5] font-semibold' : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
            @click="periodFilter = p.value; currentPage = 1"
          >
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none opacity-70" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ p.label }}</span>
          </button>
        </div>
      </div>

      <!-- Transaction History Table Card -->
      <div class="bg-white border border-[#e3e8f0] rounded-[14px] shadow-xs overflow-hidden w-full">
        <!-- Table Head Bar -->
        <div class="px-5.5 py-4 text-[13px] text-[#7b869c] border-b border-[#eef1f6] flex items-center justify-between flex-wrap gap-2">
          <div>
            <b class="text-[#111827] font-semibold">{{ filtered.length }}</b>
            transaction{{ filtered.length === 1 ? '' : 's' }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b81d0] hover:text-[#4a6fc0] cursor-pointer"
            @click="handleExportCSV"
          >
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto w-full">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-[#f4f6fa] border-b border-[#e3e8f0]">
                <th
                  v-for="col in columns"
                  :key="col.key"
                  class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap"
                  :class="{ 'text-right': col.align === 'right' }"
                >
                  <button
                    v-if="col.sortable"
                    type="button"
                    class="inline-flex items-center gap-1.5 cursor-pointer hover:text-[#111827]"
                    :class="{ 'ml-auto': col.align === 'right' }"
                    @click="toggleSort(col.key as keyof WalletTransaction)"
                  >
                    <span>{{ col.label }}</span>
                    <span class="text-[10px]" :class="sortKey === col.key ? 'text-[#5b81d0] font-bold' : 'opacity-40'">
                      {{ sortKey === col.key ? (sortDir === 1 ? '↑' : '↓') : '↕' }}
                    </span>
                  </button>
                  <span v-else>{{ col.label }}</span>
                </th>
              </tr>
            </thead>

            <tbody v-if="pagedTransactions.length > 0">
              <tr
                v-for="tx in pagedTransactions"
                :key="tx.id"
                class="border-b border-[#eef1f6] last:border-b-0 hover:bg-[#fafbfd] transition-colors"
              >
                <!-- Date -->
                <td class="px-5.5 py-4 whitespace-nowrap text-[#4b5568]">
                  {{ formatDate(tx.date) }}
                </td>

                <!-- Reference ID -->
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span class="font-mono text-[12.5px] font-medium text-[#4b5568] tracking-wide bg-[#f4f6fa] px-2 py-0.5 rounded border border-[#e3e8f0]">
                    {{ tx.id }}
                  </span>
                </td>

                <!-- Type Badge -->
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span
                    v-if="tx.type === 'credit'"
                    class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[7px] text-xs font-semibold bg-[#e3f5ec] text-[#157a54]"
                  >
                    <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Deposit</span>
                  </span>

                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[7px] text-xs font-semibold bg-[#fce8e6] text-[#b4332e]"
                  >
                    <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path d="M5 12h14" />
                    </svg>
                    <span>Booking</span>
                  </span>
                </td>

                <!-- Description -->
                <td class="px-5.5 py-4 text-[#111827] font-medium max-w-[340px] truncate">
                  {{ tx.description }}
                </td>

                <!-- Amount -->
                <td class="px-5.5 py-4 whitespace-nowrap text-right tabular-nums font-bold">
                  <span :class="tx.type === 'credit' ? 'text-[#157a54]' : 'text-[#b4332e]'">
                    {{ tx.type === 'credit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                  </span>
                </td>

                <!-- Ending Balance -->
                <td class="px-5.5 py-4 whitespace-nowrap text-right font-mono font-medium text-[#4b5568] tabular-nums">
                  {{ formatCurrency(tx.balance) }}
                </td>

                <!-- Actions / Receipt -->
                <td class="px-5.5 py-4 whitespace-nowrap text-right">
                  <button
                    type="button"
                    class="opacity-60 hover:opacity-100 hover:text-[#5b81d0] p-1 rounded transition-all cursor-pointer"
                    title="View Receipt"
                    @click="viewReceipt(tx.id)"
                  >
                    <svg class="w-4 h-4 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filtered.length === 0" class="py-12 px-5 text-center text-[#7b869c] text-sm">
          <b class="block text-[#111827] text-sm mb-1">No transactions match</b>
          Try adjusting your search query or filter settings.
        </div>

        <!-- Pagination Bar -->
        <div class="flex items-center justify-between px-5.5 py-3.5 border-t border-[#e3e8f0] text-[13px] text-[#7b869c]">
          <span>Page {{ currentPage }} of {{ totalPages }}</span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="currentPage <= 1"
              class="h-[34px] px-3.5 rounded-[10px] border border-[#e3e8f0] bg-white text-[#111827] font-semibold text-[13px] hover:bg-[#f4f6fa] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              @click="currentPage--"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              :disabled="currentPage >= totalPages"
              class="h-[34px] px-3.5 rounded-[10px] border border-[#e3e8f0] bg-white text-[#111827] font-semibold text-[13px] hover:bg-[#f4f6fa] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              @click="currentPage++"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Top-Up Modal -->
    <div
      v-if="isTopUpModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1f44]/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div class="bg-white rounded-2xl border border-[#d3dff1] shadow-xl max-w-[480px] w-full p-6 text-left relative">
        <!-- Close button -->
        <button
          type="button"
          class="absolute right-4 top-4 text-[#7b869c] hover:text-[#111827] p-1 rounded-lg hover:bg-[#f4f6fa] transition-colors cursor-pointer"
          @click="closeTopUpModal"
        >
          <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#eaf0fc] text-[#5b81d0] flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#111827] m-0">Request Top-Up</h3>
            <p class="text-xs text-[#7b869c] mt-0.5 m-0">Submit a funds addition request for agency approval</p>
          </div>
        </div>

        <!-- Quick Amount Pills -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-[#4b5568] mb-1.5">Preset Amount</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="amt in ['2500', '5000', '10000', '25000']"
              :key="amt"
              type="button"
              class="h-8 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
              :class="topUpAmount === amt
                ? 'bg-[#eaf0fc] border-[#5b81d0] text-[#2f5fb5]'
                : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
              @click="topUpAmount = amt"
            >
              {{ parseInt(amt).toLocaleString() }}
            </button>
          </div>
        </div>

        <!-- Custom Amount Field -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-[#4b5568] mb-1.5">Amount (LYD)</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7b869c]">LYD</span>
            <input
              v-model="topUpAmount"
              type="number"
              min="100"
              step="100"
              class="w-full h-10 pl-11 pr-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-xl text-sm font-semibold text-[#111827] focus:bg-white focus:border-[#5b81d0] focus:ring-2 focus:ring-[#eaf0fc] outline-none transition-all"
            />
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-[#4b5568] mb-1.5">Payment Method</label>
          <select
            v-model="topUpMethod"
            class="w-full h-10 px-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#5b81d0] outline-none transition-all cursor-pointer"
          >
            <option value="bank_transfer">Direct Bank Wire / Deposit</option>
            <option value="credit_line">Agency Credit Line Facility</option>
            <option value="cash">Branch Office Cash Deposit</option>
          </select>
        </div>

        <!-- Notes -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-[#4b5568] mb-1.5">Reference / Notes (optional)</label>
          <input
            v-model="topUpNotes"
            type="text"
            placeholder="e.g. Bank slip #98421"
            class="w-full h-10 px-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-xl text-xs text-[#111827] focus:bg-white focus:border-[#5b81d0] outline-none transition-all"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5">
          <button
            type="button"
            class="h-9 px-4 rounded-xl border border-[#e3e8f0] bg-white text-[#4b5568] hover:bg-[#f4f6fa] text-xs font-semibold transition-all cursor-pointer"
            @click="closeTopUpModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-9 px-5 rounded-xl bg-[#5b81d0] hover:bg-[#4a6fc0] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            @click="handleTopUpSubmit"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
