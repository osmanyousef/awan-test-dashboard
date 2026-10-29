<script setup lang="ts">
defineProps<{ title: string; description?: string; icon?: string }>()
</script>

<template>
  <div class="empty">
    <div class="empty__icon">
      <slot name="icon">{{ icon || '📭' }}</slot>
    </div>
    <p class="empty__title">{{ title }}</p>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-8) var(--space-6); gap: var(--space-3); }
.empty__icon { font-size: 2.5rem; }
.empty__title { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); margin: 0; }
.empty__desc { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0; max-width: 320px; line-height: 1.6; }
</style>

