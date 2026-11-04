<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface Props {
  currentStep: 1 | 2 | 3
  title: string
  subtitle?: string
  backLabel?: string
  backRoute?: string
  showArc?: boolean
  originCode?: string
  destCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  showArc: false,
  originCode: 'TUN',
  destCode: 'KUL',
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
    router.push({ path: '/flights/review', query: route.query })
  } else if (step === 2 && props.currentStep > 2) {
    router.push({ path: '/flights/traveller', query: route.query })
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-[#0c1f44] text-white pt-6 pb-26 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1.2px)] bg-[size:18px_18px]">
    <!-- Optional Flight Arc Illustration -->
    <svg
      v-if="showArc"
      class="hidden md:block absolute right-[max(20px,calc((100%-1080px)/2+20px))] top-2.5 w-[420px] max-w-[46%] text-[#8fa9de] pointer-events-none opacity-60"
      viewBox="0 0 420 96"
      aria-hidden="true"
    >
      <path class="fill-none stroke-current stroke-[1.6] [stroke-dasharray:3_7] stroke-round" d="M22 70 C 110 0, 300 0, 398 70" />
      <circle class="fill-[#0c1f44] stroke-[#8fa9de] stroke-2" cx="22" cy="70" r="5" />
      <circle class="fill-[#0c1f44] stroke-[#8fa9de] stroke-2" cx="398" cy="70" r="5" />
      <text class="fill-[#a9bde6] font-mono font-semibold text-[11px] tracking-wide" x="22" y="91" text-anchor="middle">{{ originCode }}</text>
      <text class="fill-[#a9bde6] font-mono font-semibold text-[11px] tracking-wide" x="398" y="91" text-anchor="middle">{{ destCode }}</text>
      <g transform="translate(210 18) rotate(45)">
        <path
          class="fill-white"
          transform="translate(-12 -12)"
          d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
        />
      </g>
    </svg>

    <div class="max-w-[1080px] mx-auto px-5 relative z-10">
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
        <!-- Step 1: Select flight -->
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
          <b :class="{ 'hidden sm:inline': currentStep !== 1 }">Select flight</b>
        </li>

        <!-- Separator 1 -->
        <li
          class="flex-1 h-0.5 min-w-4 rounded-full transition-colors"
          :class="currentStep >= 2 ? 'bg-[#2fbf86]' : 'bg-white/20'"
        ></li>

        <!-- Step 2: Traveller details -->
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
          <b :class="{ 'hidden sm:inline': currentStep !== 2 }">Traveller details</b>
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
          <b :class="{ 'hidden sm:inline': currentStep !== 3 }">Review & pay</b>
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

