<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="page-header">
    <div>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__sub">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}
.page-header__title { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text); margin: 0; }
.page-header__sub { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: var(--space-1) 0 0; }
.page-header__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
</style>

