<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  sub?: string
  iconBg?: string
  iconColor?: string
  progress?: number
}>()
</script>

<template>
  <div class="bg-white rounded-2xl p-4 sm:p-5 border border-[#e4e9f1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_-18px_rgba(40,70,140,0.35)] flex flex-col justify-between transition-transform hover:-translate-y-0.5">
    <div>
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shrink-0"
        :style="{ backgroundColor: iconBg || '#eaf0fc', color: iconColor || '#5b81d0' }"
      >
        <slot name="icon">
          <span class="text-base">📊</span>
        </slot>
      </div>

      <span class="block text-xs font-medium text-[#8791ab] leading-none mb-1">
        {{ title }}
      </span>

      <b class="block text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
        {{ value }}
      </b>

      <small v-if="sub" class="block text-[11.5px] text-[#8791ab] mt-1 font-normal">
        {{ sub }}
      </small>
    </div>

    <!-- Mini Progress Bar (for conversion rate, etc.) -->
    <div v-if="typeof progress === 'number'" class="w-full h-2 rounded-full bg-[#e8edf7] overflow-hidden mt-3">
      <div
        class="h-full rounded-full bg-gradient-to-r from-[#6a8fdc] to-[#5278c8] transition-all duration-500"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

