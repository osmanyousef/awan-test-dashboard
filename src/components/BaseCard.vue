<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg' | 'none'
  shadow?: 'sm' | 'md' | 'lg' | 'none'
  noBorder?: boolean
}>(), {
  padding: 'md',
  shadow: 'sm',
})
</script>

<template>
  <div :class="['card', `card--pad-${padding}`, `card--shadow-${shadow}`, { 'card--no-border': noBorder }]">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.card--no-border { border: none; }
.card--pad-none  { padding: 0; }
.card--pad-sm    { padding: var(--space-4); }
.card--pad-md    { padding: var(--space-6); }
.card--pad-lg    { padding: var(--space-8); }
.card--shadow-none { box-shadow: none; }
.card--shadow-sm   { box-shadow: var(--shadow-sm); }
.card--shadow-md   { box-shadow: var(--shadow-md); }
.card--shadow-lg   { box-shadow: var(--shadow-lg); }
</style>

