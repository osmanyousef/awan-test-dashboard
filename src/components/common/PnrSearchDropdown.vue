<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

interface SearchItem {
  ref: string
  pnr: string
  type: 'f' | 'h'
  customer: string
  detail: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

const bookings: SearchItem[] = [
  { ref: 'WD-HFB0B39', pnr: 'K7XP2M', type: 'f', customer: 'yousefreg2003', detail: 'TIP → DXB · Round trip', status: 'confirmed' },
  { ref: 'WD-F192A02', pnr: 'R3QZ9N', type: 'f', customer: 'Al-Madar Travel', detail: 'BEN → IST', status: 'confirmed' },
  { ref: 'WD-HA0571F', pnr: 'HC-55821', type: 'h', customer: 'yousefreg2003', detail: 'Atlantis The Palm, Dubai', status: 'confirmed' },
  { ref: 'WD-H9938B1', pnr: 'HC-55701', type: 'h', customer: 'Sahara Tours', detail: 'Four Seasons Hotel Cairo', status: 'pending' },
  { ref: 'FLT-78400', pnr: 'M8LD4V', type: 'f', customer: 'Blue Sky Agency', detail: 'CDG → SIN', status: 'confirmed' },
  { ref: 'WD-F5C310', pnr: 'Z2HN7W', type: 'f', customer: 'Sahara Tours', detail: 'TIP → CAI', status: 'cancelled' },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return bookings.slice(0, 5)
  return bookings.filter(b =>
    [b.ref, b.pnr, b.customer, b.detail].join(' ').toLowerCase().includes(q)
  ).slice(0, 5)
})

function executeSearch(val?: string) {
  const target = (val ?? query.value).trim()
  isOpen.value = false
  if (target) {
    router.push({ path: '/operations/bookings', query: { search: target } })
  } else {
    router.push('/operations/bookings')
  }
}

function selectItem(item: SearchItem) {
  query.value = item.pnr
  executeSearch(item.pnr)
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)) {
    e.preventDefault()
    inputRef.value?.focus()
    isOpen.value = true
  }
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.pnr-search-wrap')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKeydown)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div class="pnr-search-wrap relative flex-1 min-w-[200px] max-w-[320px]">
    <div class="relative flex items-center">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Retrieve PNR"
        aria-label="Retrieve PNR"
        class="w-full h-[44px] ps-3.5 pe-[48px] rounded-xl border border-[#d9e0ee] bg-white text-sm text-[#0f172a] placeholder-[#8791ab] focus:outline-none focus:border-[#5b81d0] focus:ring-4 focus:ring-[#5b81d0]/15 transition-all"
        @focus="isOpen = true"
        @keydown.enter.prevent="executeSearch()"
      />

      <button
        type="button"
        aria-label="Search"
        class="absolute end-1 top-1 w-[36px] h-[36px] rounded-[9px] bg-[#1f2b45] hover:bg-[#5b81d0] text-white flex items-center justify-center transition-colors cursor-pointer"
        @click="executeSearch()"
      >
        <svg class="w-4 h-4 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      </button>
    </div>

    <!-- Live Suggestions Dropdown Popover -->
    <div
      v-if="isOpen"
      class="absolute start-0 top-[50px] w-[min(400px,92vw)] bg-white border border-[#e4e9f1] rounded-2xl shadow-xl p-1.5 z-70 text-start"
    >
      <div class="px-2.5 py-1 text-[10.5px] font-bold tracking-wider uppercase text-[#8791ab]">
        {{ query ? 'Matching bookings' : 'Recent bookings' }}
      </div>

      <div v-if="filtered.length > 0" class="space-y-1 mt-1">
        <button
          v-for="b in filtered"
          :key="b.ref"
          type="button"
          class="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#eaf0fc] transition-colors text-start cursor-pointer group"
          @click="selectItem(b)"
        >
          <!-- Type icon -->
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
            :class="b.type === 'f' ? 'bg-[#e3eefd] text-[#3b6fc4]' : 'bg-[#fff0cf] text-[#b7791f]'"
          >
            <span v-if="b.type === 'f'">✈</span>
            <span v-else>🏨</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-bold text-[#0f172a] font-mono leading-tight">
              {{ b.pnr }}
            </div>
            <div class="text-[11.5px] text-[#8791ab] truncate mt-0.5">
              {{ b.ref }} · {{ b.customer }} · {{ b.detail }}
            </div>
          </div>

          <!-- Status Pill -->
          <span
            class="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0"
            :class="{
              'bg-[#e1f6ec] text-[#0d8a58]': b.status === 'confirmed',
              'bg-[#fff2d1] text-[#a16207]': b.status === 'pending',
              'bg-[#fde8e8] text-[#c0362c]': b.status === 'cancelled',
            }"
          >
            {{ b.status }}
          </span>
        </button>
      </div>

      <div v-else class="p-3 text-center text-xs text-[#8791ab]">
        No booking found for "{{ query }}". Press Enter to search anyway.
      </div>
    </div>
  </div>
</template>

