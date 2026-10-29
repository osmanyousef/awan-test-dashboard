<script setup lang="ts">
const props = defineProps<{
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Amended' | 'Active' | 'Inactive'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span :class="['pill', `pill--${status.toLowerCase()}`, props.size === 'sm' ? 'pill--sm' : 'pill--md']">
    {{ status }}
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-weight: 500;
  letter-spacing: 0.01em;
}
.pill--sm { font-size: var(--font-size-xs); padding: 2px var(--space-2); }
.pill--md { font-size: var(--font-size-xs); padding: 3px var(--space-3); }

.pill--confirmed, .pill--active   { background: var(--color-success-light); color: var(--color-success); }
.pill--pending                     { background: var(--color-warning-light); color: var(--color-accent); }
.pill--cancelled, .pill--inactive  { background: var(--color-danger-light);  color: var(--color-danger); }
.pill--amended                     { background: var(--color-info-light);    color: var(--color-info); }
</style>

