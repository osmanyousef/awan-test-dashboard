<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './SiteHeader.vue'
import ToastNotification from '../components/ToastNotification.vue'

const route = useRoute()
const isFlushPage = computed(() => {
  return route.path === '/flights/review' || route.path === '/flights/traveller' || route.path === '/flights/pay'
})
</script>

<template>
  <div class="shell">
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.shell__main {
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
