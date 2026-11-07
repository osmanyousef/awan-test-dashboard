<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface Props {
  currentStep: 1 | 2 | 3
  title: string
  subtitle?: string
  backLabel?: string
  backRoute?: string
  hotelName?: string
  city?: string
}

const props = withDefaults(defineProps<Props>(), {
  hotelName: 'Silka Maytower Kuala Lumpur',
  city: 'Kuala Lumpur',
})

const emit = defineEmits<{
  (e: 'back'): void
}>()

const route = useRoute()
const router = useRouter()

function handleBack() {
  emit('back')
  if (props.backRoute) {
    router.push({ path: props.backRoute, query: route.query })
  }
}

function navigateStep(step: 1 | 2 | 3) {
  if (step === props.currentStep) return
  if (step === 1) {
    router.push({ path: '/hotels/details', query: route.query })
  } else if (step === 2 && props.currentStep > 2) {
    router.push({ path: '/hotels/guests', query: route.query })
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-[#0c1f44] text-white pt-6 pb-26 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1.2px)] bg-[size:18px_18px]">
    <!-- Decorative Hotel Architectural Outline -->
    <svg
      class="hidden md:block absolute right-[max(20px,calc((100%-1520px)/2+48px))] top-2 w-[340px] max-w-[40%] text-[#8fa9de] pointer-events-none opacity-40"
      viewBox="0 0 340 100"
      fill="none"
      aria-hidden="true"
    >
      <path d="M40 90V30h50v60M90 90V15h60v75M150 90V40h50v50M200 90V25h60v65M260 90V45h40v45" stroke="currentColor" stroke-width="1.4" />
      <circle cx="120" cy="30" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="120" cy="45" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="120" cy="60" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="230" cy="40" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="230" cy="55" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="230" cy="70" r="3" fill="currentColor" opacity="0.6" />
      <line x1="10" y1="90" x2="330" y2="90" stroke="currentColor" stroke-width="1.8" />
    </svg>

    <div class="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
      <!-- Back Navigation Button -->
      <div v-if="backLabel" class="mb-5">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/8 text-[#c9d7f3] text-[13px] font-medium hover:bg-white/15 hover:text-white transition-all cursor-pointer"
          @click="handleBack"
        >
          <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none stroke-round" viewBox="0 0 24 24">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>{{ backLabel }}</span>
        </button>
      </div>

      <!-- 3-Step Wizard Indicator -->
      <ol class="flex items-center gap-2.5 list-none m-0 p-0 mb-6 max-w-[620px] text-[13px] font-semibold text-[#a9bde6]">
        <!-- Step 1: Select room -->
        <li
          class="flex items-center gap-2 whitespace-nowrap transition-colors"
          :class="{
            'text-white cursor-pointer hover:opacity-90': currentStep > 1,
            'text-white': currentStep === 1,
          }"
          :role="currentStep > 1 ? 'button' : undefined"
          :tabindex="currentStep > 1 ? 0 : undefined"
          @click="currentStep > 1 && navigateStep(1)"
        >
          <span
            class="w-6.5 h-6.5 rounded-full grid place-items-center text-xs font-semibold"
            :class="[
              currentStep > 1 ? 'bg-[#2fbf86] border border-[#2fbf86] text-white' :
              currentStep === 1 ? 'bg-white border border-white text-[#0c1f44]' :
              'border border-white/30 text-white'
            ]"
          >
            <svg v-if="currentStep > 1" class="w-3.5 h-3.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span v-else>1</span>
          </span>
          <b :class="{ 'hidden sm:inline': currentStep !== 1 }">Select room</b>
        </li>

        <!-- Separator 1 -->
        <li
          class="flex-1 h-0.5 min-w-4 rounded-full transition-colors"
          :class="currentStep >= 2 ? 'bg-[#2fbf86]' : 'bg-white/20'"
        ></li>

        <!-- Step 2: Guest details -->
        <li
          class="flex items-center gap-2 whitespace-nowrap transition-colors"
          :class="{
            'text-white cursor-pointer hover:opacity-90': currentStep > 2,
            'text-white': currentStep === 2,
            'text-[#a9bde6]': currentStep < 2,
          }"
          :role="currentStep > 2 ? 'button' : undefined"
          :tabindex="currentStep > 2 ? 0 : undefined"
          @click="currentStep > 2 && navigateStep(2)"
        >
          <span
            class="w-6.5 h-6.5 rounded-full grid place-items-center text-xs font-semibold"
            :class="[
              currentStep > 2 ? 'bg-[#2fbf86] border border-[#2fbf86] text-white' :
              currentStep === 2 ? 'bg-white border border-white text-[#0c1f44]' :
              'border border-white/30 text-white'
            ]"
          >
            <svg v-if="currentStep > 2" class="w-3.5 h-3.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span v-else>2</span>
          </span>
          <b :class="{ 'hidden sm:inline': currentStep !== 2 }">Guest details</b>
        </li>

        <!-- Separator 2 -->
        <li
          class="flex-1 h-0.5 min-w-4 rounded-full transition-colors"
          :class="currentStep >= 3 ? 'bg-[#2fbf86]' : 'bg-white/20'"
        ></li>

        <!-- Step 3: Review & pay -->
        <li
          class="flex items-center gap-2 whitespace-nowrap transition-colors"
          :class="currentStep === 3 ? 'text-white' : 'text-[#a9bde6]'"
        >
          <span
            class="w-6.5 h-6.5 rounded-full grid place-items-center text-xs font-semibold"
            :class="currentStep === 3 ? 'bg-white border border-white text-[#0c1f44]' : 'border border-white/30 text-white'"
          >
            3
          </span>
          <b :class="{ 'hidden sm:inline': currentStep !== 3 }">Review &amp; pay</b>
        </li>
      </ol>

      <!-- Hero Heading & Subtitle -->
      <slot name="header">
        <h1 class="m-0 text-2xl sm:text-[26px] font-bold tracking-tight text-white">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1.5 text-[13.5px] text-[#a9bde6]">
          {{ subtitle }}
        </p>
      </slot>
    </div>
  </section>
</template>

