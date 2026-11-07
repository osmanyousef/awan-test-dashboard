<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

// ── Types ──────────────────────────────────────────────────
type ServiceType = 'Flight' | 'Hotel'
type EntryStatus = 'Active' | 'Completed' | 'Cancelled'

interface ManualEntry {
  id: string
  type: ServiceType
  status: EntryStatus
  customer: string
  supplier: string
  description: string
  issuedOn: string
  travelDate: string
  cost: number
  sellingPrice: number
  pnrOrConf: string
  notes: string
}

// ── Mock existing entries ──────────────────────────────────
const entries = ref<ManualEntry[]>([
  {
    id: 'MAN-001', type: 'Flight', status: 'Active',
    customer: 'Al-Madar Travel', supplier: 'Booking.com',
    description: 'TIP → IST · 2 adults · Economy',
    issuedOn: '2026-11-02', travelDate: '2026-11-15',
    cost: 780, sellingPrice: 890, pnrOrConf: 'ABC123',
    notes: 'Booked via Booking.com, customer requested urgently',
  },
  {
    id: 'MAN-002', type: 'Hotel', status: 'Completed',
    customer: 'Sahara Tours', supplier: 'Expedia',
    description: 'Hilton Garden Inn, Istanbul · 3 nights',
    issuedOn: '2026-10-20', travelDate: '2026-10-25',
    cost: 420, sellingPrice: 510, pnrOrConf: 'EXP-99281',
    notes: '',
  },
  {
    id: 'MAN-003', type: 'Flight', status: 'Cancelled',
    customer: 'Blue Sky Agency', supplier: 'Direct airline',
    description: 'BEN → CAI · 1 adult · Business',
    issuedOn: '2026-10-15', travelDate: '2026-10-22',
    cost: 1200, sellingPrice: 1450, pnrOrConf: 'LY4820',
    notes: 'Customer cancelled — partial refund applied',
  },
  {
    id: 'MAN-004', type: 'Hotel', status: 'Active',
    customer: 'Nomad Agency', supplier: 'Hotels.com',
    description: 'Rixos Premium Dubai JBR · 5 nights',
    issuedOn: '2026-11-05', travelDate: '2026-12-01',
    cost: 2100, sellingPrice: 2480, pnrOrConf: 'HTC-55012',
    notes: 'Corporate rate applied',
  },
])

// ── Search & filter ────────────────────────────────────────
const search = ref('')
const typeFilter = ref<'all' | ServiceType>('all')
const statusFilter = ref<'all' | EntryStatus>('all')

const typeChips = [
  { value: 'all', label: 'All Types', icon: 'grid' },
  { value: 'Flight', label: 'Flights', icon: 'plane' },
  { value: 'Hotel', label: 'Hotels', icon: 'hotel' },
] as const

const statusChips = [
  { value: 'all', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return entries.value.filter(e => {
    if (typeFilter.value !== 'all' && e.type !== typeFilter.value) return false
    if (statusFilter.value !== 'all' && e.status !== statusFilter.value) return false
    if (q) {
      const hay = [e.id, e.customer, e.supplier, e.description, e.pnrOrConf].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

// ── Stats ──────────────────────────────────────────────────
const totalEntries = computed(() => entries.value.length)
const totalProfit = computed(() => entries.value
  .filter(e => e.status !== 'Cancelled')
  .reduce((s, e) => s + (e.sellingPrice - e.cost), 0)
)
const activeCount = computed(() => entries.value.filter(e => e.status === 'Active').length)

// ── New entry form ─────────────────────────────────────────
const showForm = ref(false)
const form = ref({
  type: 'Flight' as ServiceType,
  customer: '',
  supplier: '',
  description: '',
  travelDate: '',
  cost: '',
  sellingPrice: '',
  pnrOrConf: '',
  notes: '',
})

function resetForm() {
  form.value = {
    type: 'Flight', customer: '', supplier: '', description: '',
    travelDate: '', cost: '', sellingPrice: '', pnrOrConf: '', notes: '',
  }
}

function submitEntry() {
  if (!form.value.customer.trim() || !form.value.description.trim()) {
    show('Please fill in at least customer and service description.', 'error')
    return
  }
  const next = entries.value.length + 1
  const newEntry: ManualEntry = {
    id: `MAN-${String(next).padStart(3, '0')}`,
    type: form.value.type,
    status: 'Active',
    customer: form.value.customer.trim(),
    supplier: form.value.supplier.trim() || '—',
    description: form.value.description.trim(),
    issuedOn: new Date().toISOString().slice(0, 10),
    travelDate: form.value.travelDate || '—',
    cost: parseFloat(form.value.cost) || 0,
    sellingPrice: parseFloat(form.value.sellingPrice) || 0,
    pnrOrConf: form.value.pnrOrConf.trim() || '—',
    notes: form.value.notes.trim(),
  }
  entries.value.unshift(newEntry)
  show(`Manual service ${newEntry.id} recorded successfully.`, 'success')
  resetForm()
  showForm.value = false
}

// ── Detail modal ───────────────────────────────────────────
const detailEntry = ref<ManualEntry | null>(null)

function markComplete(e: ManualEntry) {
  e.status = 'Completed'
  show(`${e.id} marked as completed.`, 'success')
  detailEntry.value = null
}

function markCancelled(e: ManualEntry) {
  e.status = 'Cancelled'
  show(`${e.id} marked as cancelled.`, 'warning')
  detailEntry.value = null
}

// ── Formatters ─────────────────────────────────────────────
function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(d: string) {
  if (!d || d === '—') return d
  const p = new Date(d)
  return isNaN(p.getTime()) ? d : p.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusMeta: Record<string, { bg: string; text: string; dot: string }> = {
  Active:    { bg: 'bg-[#e3effd]', text: 'text-[#2d5fb0]', dot: 'bg-[#5b81d0]' },
  Completed: { bg: 'bg-[#e3f5ec]', text: 'text-[#157a54]', dot: 'bg-[#22a974]' },
  Cancelled: { bg: 'bg-[#fce8e6]', text: 'text-[#b4332e]', dot: 'bg-[#e0524b]' },
}
</script>

<template>
  <div class="relative w-full min-h-[calc(100vh-80px)] bg-transparent pb-16">
    <div class="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 pt-10">

      <!-- ══ Header ══ -->
      <div class="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="text-[26px] font-bold text-[#111827] tracking-tight m-0">Manual Services</h1>
          <p class="text-sm text-[#7b869c] mt-1 m-0">Record flights & hotels booked outside Awan to keep everything in one place</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-[#5b81d0] hover:bg-[#4a6fc0] text-white text-[13.5px] font-semibold transition-all shadow-xs cursor-pointer"
          @click="showForm = !showForm"
        >
          <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          <span>{{ showForm ? 'Cancel' : 'Record Service' }}</span>
        </button>
      </div>

      <!-- ══ Quick Stats ══ -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <!-- Total Entries -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Total Entries</span>
            <div class="w-7 h-7 rounded-lg bg-[#eaf0fc] text-[#5b81d0] flex items-center justify-center">
              <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 11h6M9 15h4" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-[#111827] tabular-nums">{{ totalEntries }}</div>
          <p class="text-xs text-[#7b869c] mt-1 m-0">{{ activeCount }} active</p>
        </div>
        <!-- Profit -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Total Margin</span>
            <div class="w-7 h-7 rounded-lg bg-[#e1f6ec] text-[#0d8a58] flex items-center justify-center">
              <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-[#111827] tabular-nums">{{ formatCurrency(totalProfit) }}</div>
          <p class="text-xs text-[#7b869c] mt-1 m-0">selling − cost (excl. cancelled)</p>
        </div>
        <!-- Flights vs Hotels -->
        <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#63708b]">Breakdown</span>
            <div class="w-7 h-7 rounded-lg bg-[#efe9ff] text-[#6a3fe0] flex items-center justify-center">
              <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0110 10h-10z" />
              </svg>
            </div>
          </div>
          <div class="flex gap-4 mt-1">
            <div>
              <span class="text-lg font-bold text-[#111827] tabular-nums">{{ entries.filter(e => e.type === 'Flight').length }}</span>
              <span class="text-xs text-[#7b869c] ms-1">flights</span>
            </div>
            <div>
              <span class="text-lg font-bold text-[#111827] tabular-nums">{{ entries.filter(e => e.type === 'Hotel').length }}</span>
              <span class="text-xs text-[#7b869c] ms-1">hotels</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ New Entry Form ══ -->
      <div
        v-if="showForm"
        class="bg-white border border-[#d3dff1] rounded-2xl p-5 sm:p-6 shadow-xs mb-6 border-s-[3px] border-s-[#4a6cc0]"
      >
        <div class="flex items-center gap-2.5 mb-5">
          <span class="w-8 h-8 rounded-full bg-[#e9effb] text-[#4a6cc0] flex items-center justify-center">
            <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <h2 class="text-lg font-bold text-[#0c1f44] m-0">Record a New Service</h2>
        </div>

        <!-- Service Type Toggle -->
        <div class="flex gap-2 mb-5">
          <button
            v-for="t in (['Flight', 'Hotel'] as const)"
            :key="t"
            type="button"
            class="h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all cursor-pointer"
            :class="form.type === t
              ? 'bg-[#eaf0fc] border-[#5b81d0] text-[#2f5fb5]'
              : 'bg-white border-[#e3e8f0] text-[#4b5568] hover:border-[#b9cbee]'"
            @click="form.type = t"
          >
            <span v-if="t === 'Flight'">✈ Flight</span>
            <span v-else>🏨 Hotel</span>
          </button>
        </div>

        <!-- Form Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <!-- Customer -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Customer / Agency *</label>
            <input
              v-model="form.customer"
              type="text"
              placeholder="e.g. Al-Madar Travel"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all"
            />
          </div>
          <!-- Supplier -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Booked via (Supplier)</label>
            <input
              v-model="form.supplier"
              type="text"
              placeholder="e.g. Booking.com, Direct airline"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all"
            />
          </div>
          <!-- PNR / Confirmation -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">PNR / Confirmation #</label>
            <input
              v-model="form.pnrOrConf"
              type="text"
              placeholder="e.g. ABC123"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all font-mono"
            />
          </div>
          <!-- Description -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Service Description *</label>
            <input
              v-model="form.description"
              type="text"
              :placeholder="form.type === 'Flight' ? 'e.g. TIP → IST · 2 adults · Economy' : 'e.g. Hilton Istanbul · 3 nights · Deluxe room'"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all"
            />
          </div>
          <!-- Travel Date -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Travel / Check-in Date</label>
            <input
              v-model="form.travelDate"
              type="date"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all"
            />
          </div>
          <!-- Cost -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Cost Price ($)</label>
            <input
              v-model="form.cost"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all tabular-nums"
            />
          </div>
          <!-- Selling Price -->
          <div>
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Selling Price ($)</label>
            <input
              v-model="form.sellingPrice"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              class="w-full h-10 px-3 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all tabular-nums"
            />
          </div>
          <!-- Notes -->
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-xs font-semibold text-[#3d4a66] mb-1.5">Notes (optional)</label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="Any extra details about this booking…"
              class="w-full px-3 py-2 rounded-xl border border-[#c9d6ec] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a6cc0] focus:border-[#4a6cc0] transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Submit Row -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#eef1f6]">
          <button
            type="button"
            class="h-10 px-5 rounded-xl border border-[#e3e8f0] bg-white text-[#111827] text-[13.5px] font-semibold hover:bg-[#f4f6fa] transition-all cursor-pointer"
            @click="showForm = false; resetForm()"
          >Cancel</button>
          <button
            type="button"
            class="h-10 px-6 rounded-xl bg-[#5b81d0] hover:bg-[#4a6fc0] text-white text-[13.5px] font-semibold transition-all shadow-xs cursor-pointer"
            @click="submitEntry"
          >
            <span>Save Entry</span>
          </button>
        </div>
      </div>

      <!-- ══ Filters ══ -->
      <div class="bg-white border border-[#e3e8f0] rounded-[14px] p-4 sm:px-[18px] mb-4 shadow-xs flex items-center gap-5 flex-wrap w-full">
        <!-- Search -->
        <div class="relative flex-1 sm:flex-initial sm:w-[320px] min-w-[220px]">
          <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#7b869c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Search customer, PNR, description…"
            aria-label="Search manual services"
            class="w-full h-[38px] pl-[34px] pr-3 bg-[#f4f6fa] border border-[#e3e8f0] rounded-[10px] text-[13.5px] text-[#111827] placeholder-[#7b869c] focus:bg-white focus:border-[#5b81d0] focus:ring-2 focus:ring-[#eaf0fc] outline-none transition-all"
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
            @click="typeFilter = t.value"
          >
            <!-- Icons -->
            <svg v-if="t.icon === 'grid'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none opacity-70" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <svg v-else-if="t.icon === 'plane'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#2d5fb0]" viewBox="0 0 24 24">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#6a3fe0]" viewBox="0 0 24 24">
              <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
            </svg>
            <span>{{ t.label }}</span>
          </button>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#e3e8f0]"></div>

        <!-- Status Filter Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="s in statusChips"
            :key="s.value"
            type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-[12.5px] font-medium transition-all cursor-pointer whitespace-nowrap"
            :class="statusFilter === s.value ? 'bg-[#eaf0fc] border-transparent text-[#2f5fb5] font-semibold' : 'border-[#e3e8f0] bg-white text-[#4b5568] hover:border-[#b9cbee]'"
            @click="statusFilter = s.value"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- ══ Entries Table ══ -->
      <div class="bg-white border border-[#e3e8f0] rounded-[14px] shadow-xs overflow-hidden w-full">
        <!-- Count -->
        <div class="px-5.5 py-4 text-[13px] text-[#7b869c] border-b border-[#eef1f6]">
          <b class="text-[#111827] font-semibold">{{ filtered.length }}</b>
          entr{{ filtered.length === 1 ? 'y' : 'ies' }}
        </div>

        <!-- Table -->
        <div class="overflow-x-auto w-full">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-[#f4f6fa] border-b border-[#e3e8f0]">
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">ID</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">Type</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">Customer</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">Description</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">PNR / Conf</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">Travel Date</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap text-right">Selling</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap">Status</th>
                <th class="px-5.5 py-3 text-[11px] font-semibold tracking-[0.7px] uppercase text-[#7b869c] whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody v-if="filtered.length > 0">
              <tr
                v-for="e in filtered"
                :key="e.id"
                class="border-b border-[#eef1f6] last:border-b-0 hover:bg-[#fafbfd] transition-colors"
              >
                <td class="px-5.5 py-4 whitespace-nowrap font-mono text-[12.5px] font-medium text-[#4b5568] tracking-wide">{{ e.id }}</td>
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[7px] text-xs font-semibold"
                    :class="e.type === 'Flight' ? 'bg-[#e3effd] text-[#2d5fb0]' : 'bg-[#f1e9ff] text-[#6a3fe0]'"
                  >
                    <svg v-if="e.type === 'Flight'" class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                      <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
                    </svg>
                    <span>{{ e.type }}</span>
                  </span>
                </td>
                <td class="px-5.5 py-4 whitespace-nowrap font-medium text-[#111827]">{{ e.customer }}</td>
                <td class="px-5.5 py-4 text-[#4b5568] max-w-[260px] truncate">{{ e.description }}</td>
                <td class="px-5.5 py-4 whitespace-nowrap font-mono text-[12.5px] text-[#4b5568]">{{ e.pnrOrConf }}</td>
                <td class="px-5.5 py-4 whitespace-nowrap text-[#4b5568]">{{ formatDate(e.travelDate) }}</td>
                <td class="px-5.5 py-4 whitespace-nowrap text-right font-semibold text-[#111827] tabular-nums">{{ formatCurrency(e.sellingPrice) }}</td>
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-xs font-semibold"
                    :class="[statusMeta[e.status]?.bg, statusMeta[e.status]?.text]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[e.status]?.dot"></span>
                    <span>{{ e.status }}</span>
                  </span>
                </td>
                <td class="px-5.5 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    class="text-[#5b81d0] text-xs font-semibold hover:underline cursor-pointer"
                    @click="detailEntry = e"
                  >Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div v-if="filtered.length === 0" class="py-12 px-5 text-center text-[#7b869c] text-sm">
          <b class="block text-[#111827] text-sm mb-1">No entries match</b>
          Try a different search or clear a filter.
        </div>
      </div>
    </div>

    <!-- ══ Detail Modal ══ -->
    <div
      v-if="detailEntry"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1f44]/50 backdrop-blur-xs"
      @click.self="detailEntry = null"
    >
      <div class="bg-white rounded-2xl border border-[#d3dff1] shadow-xl max-w-[540px] w-full p-6 text-left relative">
        <button
          type="button"
          class="absolute right-4 top-4 text-[#7b869c] hover:text-[#111827] p-1 rounded-lg hover:bg-[#f4f6fa] transition-colors cursor-pointer"
          @click="detailEntry = null"
        >
          <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="flex items-center gap-3 mb-5">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="detailEntry.type === 'Flight' ? 'bg-[#e3effd] text-[#2d5fb0]' : 'bg-[#f1e9ff] text-[#6a3fe0]'"
          >
            <svg v-if="detailEntry.type === 'Flight'" class="w-5 h-5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <svg v-else class="w-5 h-5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 10h5a1 1 0 011 1v10M2 21h20M8 8h2M8 12h2M8 16h2" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#111827] m-0">{{ detailEntry.id }}</h3>
            <p class="text-xs text-[#7b869c] mt-0.5 m-0">Manual {{ detailEntry.type.toLowerCase() }} service</p>
          </div>
        </div>

        <!-- Detail Grid -->
        <div class="space-y-3 mb-5">
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Customer</span>
            <span class="text-[#111827] font-semibold">{{ detailEntry.customer }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Supplier</span>
            <span class="text-[#111827]">{{ detailEntry.supplier }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Description</span>
            <span class="text-[#111827]">{{ detailEntry.description }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">PNR / Conf #</span>
            <span class="text-[#111827] font-mono">{{ detailEntry.pnrOrConf }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Issued On</span>
            <span class="text-[#111827]">{{ formatDate(detailEntry.issuedOn) }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Travel Date</span>
            <span class="text-[#111827]">{{ formatDate(detailEntry.travelDate) }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm border-t border-[#eef1f6] pt-3">
            <span class="text-[#7b869c] font-medium">Cost Price</span>
            <span class="text-[#111827] tabular-nums">{{ formatCurrency(detailEntry.cost) }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Selling Price</span>
            <span class="text-[#111827] font-semibold tabular-nums">{{ formatCurrency(detailEntry.sellingPrice) }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Margin</span>
            <span class="text-[#0d8a58] font-semibold tabular-nums">{{ formatCurrency(detailEntry.sellingPrice - detailEntry.cost) }}</span>
          </div>
          <div class="grid grid-cols-[130px_1fr] gap-2 text-sm border-t border-[#eef1f6] pt-3">
            <span class="text-[#7b869c] font-medium">Status</span>
            <span
              class="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-xs font-semibold w-fit"
              :class="[statusMeta[detailEntry.status]?.bg, statusMeta[detailEntry.status]?.text]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[detailEntry.status]?.dot"></span>
              {{ detailEntry.status }}
            </span>
          </div>
          <div v-if="detailEntry.notes" class="grid grid-cols-[130px_1fr] gap-2 text-sm">
            <span class="text-[#7b869c] font-medium">Notes</span>
            <span class="text-[#4b5568]">{{ detailEntry.notes }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#eef1f6]">
          <button
            type="button"
            class="h-9 px-4 rounded-xl border border-[#e3e8f0] bg-white text-[#111827] text-[13px] font-semibold hover:bg-[#f4f6fa] transition-all cursor-pointer"
            @click="detailEntry = null"
          >Close</button>
          <template v-if="detailEntry.status === 'Active'">
            <button
              type="button"
              class="h-9 px-4 rounded-xl border border-[#e3e8f0] bg-white text-[#b4332e] text-[13px] font-semibold hover:bg-[#fce8e6] transition-all cursor-pointer"
              @click="markCancelled(detailEntry!)"
            >Cancel Service</button>
            <button
              type="button"
              class="h-9 px-4 rounded-xl bg-[#0d8a58] hover:bg-[#0a7048] text-white text-[13px] font-semibold transition-all cursor-pointer"
              @click="markComplete(detailEntry!)"
            >Mark Completed</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

