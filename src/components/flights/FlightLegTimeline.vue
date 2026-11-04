<script setup lang="ts">
import { computed } from 'vue'
import type { FlightSegmentDetail } from '../../composables/useFlightBooking'

interface Props {
  segments: FlightSegmentDetail[]
  airlineName?: string
  cabinClass?: string
  tripType?: string
}

const props = withDefaults(defineProps<Props>(), {
  airlineName: 'Qatar Airways',
  cabinClass: 'Economy',
  tripType: 'One way',
})

const firstSeg = computed(() => props.segments[0])
const lastSeg = computed(() => props.segments[props.segments.length - 1])

function parseUtc(dateStr: string, timeStr = '00:00'): number {
  if (!dateStr) return 0
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  return Date.UTC(y, m - 1, d, h, min)
}

const dayDifference = computed(() => {
  if (!firstSeg.value || !lastSeg.value) return 0
  const d1 = parseUtc(firstSeg.value.depDate, firstSeg.value.depTime)
  const d2 = parseUtc(lastSeg.value.arrDate, lastSeg.value.arrTime)
  return Math.round((d2 - d1) / 864e5)
})

function formatFullDate(dateStr: string): string {
  if (!dateStr) return 'Wednesday, 2 December 2026'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Wed, 2 Dec 2026'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function calculateLayoverMinutes(legA: FlightSegmentDetail, legB: FlightSegmentDetail): number {
  const t1 = parseUtc(legA.arrDate, legA.arrTime)
  const t2 = parseUtc(legB.depDate, legB.depTime)
  return Math.max(0, Math.round((t2 - t1) / 60000))
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
    <!-- Header -->
    <div class="mb-1">
      <h2 class="text-lg font-bold text-[#0c1f44] m-0">Flight details</h2>
      <p class="text-xs text-[#63708b] m-0 mt-1">
        {{ airlineName }} · {{ cabinClass }} · {{ tripType }}
      </p>
    </div>

    <!-- Departure & Arrival Summary Banner -->
    <div
      v-if="firstSeg && lastSeg"
      class="mt-4 p-4 rounded-xl bg-[#f6f8fd] border border-[#d9e3f3] flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <!-- Departs -->
      <div class="flex-1">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-[#63708b]">Departs</span>
        <div class="text-sm font-bold text-[#0c1f44] mt-0.5">
          {{ formatFullDate(firstSeg.depDate) }}
        </div>
        <div class="text-xs text-[#3d4a66] mt-0.5 flex items-center gap-1.5">
          <span class="font-semibold">{{ firstSeg.depTime }}</span>
          <span>·</span>
          <span class="font-mono font-medium text-[#63708b]">{{ firstSeg.from }}</span>
          <span>{{ firstSeg.fromName }}</span>
        </div>
      </div>

      <!-- Arrow -->
      <div class="hidden md:flex items-center text-[#8fa9de] px-2" aria-hidden="true">
        <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      <!-- Arrives -->
      <div class="flex-1 md:text-right">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-[#63708b]">Arrives</span>
        <div class="text-sm font-bold text-[#0c1f44] mt-0.5 flex items-center md:justify-end gap-2">
          <span>{{ formatFullDate(lastSeg.arrDate) }}</span>
          <span
            v-if="dayDifference > 0"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fff4dc] text-[#9a5a06]"
          >
            +{{ dayDifference }} day
          </span>
        </div>
        <div class="text-xs text-[#3d4a66] mt-0.5 flex items-center md:justify-end gap-1.5">
          <span class="font-semibold">{{ lastSeg.arrTime }}</span>
          <span>·</span>
          <span class="font-mono font-medium text-[#63708b]">{{ lastSeg.to }}</span>
          <span>{{ lastSeg.toName }}</span>
        </div>
      </div>
    </div>

    <!-- Segment Legs -->
    <div class="mt-6 space-y-4">
      <template v-for="(seg, idx) in segments" :key="idx">
        <!-- Single Flight Leg Card -->
        <div class="p-4 rounded-xl border border-[#e5edfa] bg-white hover:border-[#c9d6ec] transition-colors">
          <div class="flex items-center justify-between text-xs text-[#63708b] mb-3">
            <span class="font-semibold text-[#0c1f44] flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none text-[#4a6cc0]" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span>{{ seg.no }}</span>
            </span>
            <span class="text-[11px] font-medium bg-[#eef3fa] px-2 py-0.5 rounded text-[#4a6cc0]">
              {{ seg.from }} → {{ seg.to }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <!-- Departure Time & Airport -->
            <div>
              <div class="text-xl font-bold font-mono text-[#0c1f44]">{{ seg.depTime }}</div>
              <div class="text-xs font-semibold text-[#0c1f44] flex items-center gap-1 mt-0.5">
                <span class="font-mono text-[#4a6cc0]">{{ seg.from }}</span>
                <span>{{ seg.fromName }}</span>
              </div>
              <div class="text-[11px] text-[#63708b] mt-1 flex items-center gap-1">
                <svg class="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{{ formatDate(seg.depDate) }}</span>
              </div>
            </div>

            <!-- Duration Indicator -->
            <div class="text-center my-2 md:my-0">
              <span class="text-xs font-semibold text-[#63708b]">
                {{ formatDuration(seg.durationMin) }}
              </span>
              <div class="relative flex items-center justify-center my-1.5">
                <div class="w-full h-0.5 bg-[#d9e3f3]"></div>
                <div class="absolute w-2 h-2 rounded-full bg-[#4a6cc0] border-2 border-white"></div>
              </div>
              <span class="text-[10px] text-[#63708b] uppercase tracking-wider font-semibold">Direct</span>
            </div>

            <!-- Arrival Time & Airport -->
            <div class="md:text-right">
              <div class="text-xl font-bold font-mono text-[#0c1f44]">{{ seg.arrTime }}</div>
              <div class="text-xs font-semibold text-[#0c1f44] flex items-center md:justify-end gap-1 mt-0.5">
                <span class="font-mono text-[#4a6cc0]">{{ seg.to }}</span>
                <span>{{ seg.toName }}</span>
              </div>
              <div class="text-[11px] text-[#63708b] mt-1 flex items-center md:justify-end gap-1">
                <svg class="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{{ formatDate(seg.arrDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Layover Notification (between legs) -->
        <div
          v-if="idx < segments.length - 1"
          class="p-2.5 rounded-xl bg-[#fff8eb] border border-[#fde8c2] text-center text-xs font-semibold text-[#9a5a06] flex items-center justify-center gap-2"
        >
          <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            Layover in {{ seg.toName }}:
            {{ formatDuration(calculateLayoverMinutes(seg, segments[idx + 1])) }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

