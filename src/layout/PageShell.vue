<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './SiteHeader.vue'
import ToastNotification from '../components/ToastNotification.vue'

const route = useRoute()
const isFlushPage = computed(() => {
  return (
    route.path === '/' ||
    route.path === '/hotels' ||
    route.path === '/hotels/details' ||
    route.path.startsWith('/hotels/details') ||
    route.path === '/hotels/guests' ||
    route.path === '/hotels/pay' ||
    route.path === '/flights' ||
    route.path === '/flights/review' ||
    route.path === '/flights/traveller' ||
    route.path === '/flights/pay' ||
    route.path === '/operations/bookings' ||
    route.path === '/bookings' ||
    route.path === '/finance/wallet' ||
    route.path === '/wallet' ||
    route.path === '/dashboard' ||
    route.path === '/flights/results' ||
    route.path === '/hotels/results'
  )
})
</script>

<template>
  <div class="shell">
    <!-- Flights & Stays Signature Hero Atmosphere Canvas -->
    <div class="shell__atmosphere" aria-hidden="true">
      <div class="shell__atmosphere-gradient"></div>
      <div class="shell__atmosphere-dots"></div>
      <svg
        class="shell__atmosphere-svg"
        viewBox="0 0 1400 280"
        preserveAspectRatio="xMaxYMin slice"
        fill="none"
      >
        <g stroke="#5b81d0" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="3 8" stroke-linecap="round">
          <path d="M700 240C860 90 1060 50 1240 120" />
          <path d="M900 250C1040 120 1230 70 1390 100" />
        </g>
      </svg>
    </div>

    <!-- Clean, Single-Tier Top Navigation Header -->
    <SiteHeader />

    <!-- Main Content Canvas (Primary focus is the Booking / Search engine) -->
    <main class="shell__main" :class="{ 'shell__main--flush': isFlushPage }">
      <div :class="isFlushPage ? 'container--flush' : 'container'">
        <slot />
      </div>
    </main>

    <!-- Global Toast stack -->
    <ToastNotification />
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  overflow-x: clip;
}

.shell__atmosphere {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 480px;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.shell__atmosphere-gradient {
  position: absolute;
  inset: 0;
  background: var(--bg-hero-atmosphere);
  mask-image: linear-gradient(180deg, #000 65%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 65%, transparent 100%);
}

.shell__atmosphere-dots {
  position: absolute;
  inset: 0;
  background-image: var(--bg-hero-dots);
  background-size: var(--bg-hero-dots-size, 22px 22px);
  mask-image: linear-gradient(90deg, transparent 25%, #000);
  -webkit-mask-image: linear-gradient(90deg, transparent 25%, #000);
}

.shell__atmosphere-svg {
  position: absolute;
  right: 0;
  top: 130px;
  height: 280px;
  width: 100%;
  max-width: 1400px;
  pointer-events: none;
}
@media (max-width: 640px) {
  .shell__atmosphere-svg {
    display: none;
  }
}

.shell__main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 32px 0 64px;
}

.shell__main--flush {
  padding: 0 0 64px;
}

.container {
  max-width: 1560px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.container--flush {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
</style>
