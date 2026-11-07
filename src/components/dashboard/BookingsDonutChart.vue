<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedMonth = ref<'nov' | 'oct'>('nov')
const hoveredIndex = ref<number | null>(null)

interface ServiceData {
  name: string
  color: string
  count: number
  amount: number
}

const dataByMonth: Record<'nov' | 'oct', ServiceData[]> = {
  nov: [
    { name: 'Flights', color: '#5b81d0', count: 11, amount: 18420 },
    { name: 'Hotels', color: '#f2a93b', count: 6, amount: 9870 },
    { name: 'Offline', color: '#7a5af8', count: 2, amount: 1240 },
  ],
  oct: [
    { name: 'Flights', color: '#5b81d0', count: 14, amount: 24100 },
    { name: 'Hotels', color: '#f2a93b', count: 9, amount: 15300 },
    { name: 'Offline', color: '#7a5af8', count: 3, amount: 2050 },
  ],
}

const currentList = computed(() => dataByMonth[selectedMonth.value])
const totalCount = computed(() => currentList.value.reduce((s, x) => s + x.count, 0))

// SVG Donut Math (R = 74, Circumference = 2 * π * 74 ≈ 464.95)
const R = 74
const C = 2 * Math.PI * R

const segments = computed(() => {
  let offset = 0
  const tot = totalCount.value || 1
  return currentList.value.map(item => {
    const len = (item.count / tot) * C
    const strokeDasharray = `${Math.max(len - 4, 1)} ${C - Math.max(len - 4, 1)}`
    const strokeDashoffset = -offset
    offset += len
    return { ...item, strokeDasharray, strokeDashoffset }
  })
})

const activeLabel = computed(() => {
  if (hoveredIndex.value === null) return { title: 'Total', count: totalCount.value }
  const item = currentList.value[hoveredIndex.value]
  return { title: item.name, count: item.count }
})

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e4e9f1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_34px_-22px_rgba(40,70,140,0.35)] overflow-hidden flex flex-col justify-between">
    <!-- Card Header -->
    <div class="flex items-center justify-between p-4 sm:p-5 border-b border-[#eef1f7]">
      <h3 class="text-sm sm:text-base font-bold text-[#0f172a] m-0">Bookings by service</h3>
      <select
        v-model="selectedMonth"
        class="h-8 px-2.5 rounded-lg border border-[#dbe2ef] bg-white text-xs font-semibold text-[#0f172a] outline-none cursor-pointer"
      >
        <option value="nov">November</option>
        <option value="oct">October</option>
      </select>
    </div>

    <!-- Chart + Legend Grid -->
    <div class="p-5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 items-center">

      <!-- Donut Ring -->
      <div class="relative w-[180px] h-[180px] mx-auto">
        <svg class="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 200 200">
          <circle cx="100" cy="100" :r="R" fill="none" stroke="#eef1f7" stroke-width="22" />
          <circle
            v-for="(seg, idx) in segments"
            :key="seg.name"
            cx="100"
            cy="100"
            :r="R"
            fill="none"
            :stroke="seg.color"
            stroke-width="22"
            :stroke-dasharray="seg.strokeDasharray"
            :stroke-dashoffset="seg.strokeDashoffset"
            class="transition-all duration-200 cursor-pointer"
            :class="{ 'opacity-35': hoveredIndex !== null && hoveredIndex !== idx, 'stroke-[26]': hoveredIndex === idx }"
            @mouseenter="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          />
        </svg>

        <!-- Center Counter -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span class="text-xs font-medium text-[#8791ab]">{{ activeLabel.title }}</span>
          <b class="text-3xl font-bold font-mono tracking-tight text-[#0f172a] leading-tight">
            {{ activeLabel.count }}
          </b>
        </div>
      </div>

      <!-- Interactive Legend -->
      <div class="space-y-1.5">
        <div
          v-for="(item, idx) in currentList"
          :key="item.name"
          class="flex items-center justify-between p-2 rounded-xl transition cursor-pointer"
          :class="hoveredIndex === idx ? 'bg-[#f4f6fb]' : 'hover:bg-[#f8fafc]'"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        >
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-md shrink-0" :style="{ backgroundColor: item.color }"></span>
            <div>
              <b class="text-xs font-semibold text-[#0f172a] block">{{ item.name }}</b>
              <small class="text-[11px] text-[#8791ab]">
                {{ Math.round((item.count / totalCount) * 100) }}% of bookings
              </small>
            </div>
          </div>
          <div class="text-end">
            <span class="text-xs font-bold font-mono text-[#0f172a] block">{{ item.count }}</span>
            <small class="text-[11px] text-[#8791ab] block">{{ formatCurrency(item.amount) }}</small>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

