<script setup lang="ts">
interface Props {
  originCode: string
  originName?: string
  destCode: string
  destName?: string
  dateText: string
  cabinClass?: string
  travellerText?: string
}

withDefaults(defineProps<Props>(), {
  originName: '',
  destName: '',
  cabinClass: 'Economy',
  travellerText: '1 Adult',
})
</script>

<template>
  <div class="bg-white border border-[#d3dff1] rounded-2xl p-3.5 px-4.5 mb-4 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
    <!-- Flight Route -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-[#eef3fa] text-[#4a6cc0] flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 fill-current rotate-45" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>
      <div>
        <div class="text-[11px] font-medium text-[#63708b]">Flight route</div>
        <div class="text-[13px] font-semibold text-[#0c1f44] flex items-center gap-1.5">
          <span>{{ originName || originCode }}</span>
          <span class="text-[11px] font-mono text-[#63708b]">({{ originCode }})</span>
          <span class="text-[#8fa9de]">→</span>
          <span>{{ destName || destCode }}</span>
          <span class="text-[11px] font-mono text-[#63708b]">({{ destCode }})</span>
        </div>
      </div>
    </div>

    <!-- Travel Date & Cabin Info -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-[#eef3fa] text-[#4a6cc0] flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div>
        <div class="text-[11px] font-medium text-[#63708b]">Travel dates &amp; class</div>
        <div class="text-[13px] font-semibold text-[#0c1f44]">
          {{ dateText }} · {{ cabinClass }} · {{ travellerText }}
        </div>
      </div>
    </div>
  </div>
</template>

