<script setup lang="ts">
import SiteHeader from './SiteHeader.vue'
import ToastNotification from '../components/ToastNotification.vue'
</script>

<template>
  <div class="shell">
    <!-- Clean, Single-Tier Top Navigation Header -->
    <SiteHeader />

    <!-- Main Content Canvas (Primary focus is the Booking / Search engine) -->
    <main class="shell__main">
      <div class="container">
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

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}
</style>
