<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  prefix?: string
  suffix?: string
}>()
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__top">
      <span class="stat-card__label">{{ label }}</span>
      <slot name="icon" />
    </div>
    <div class="stat-card__value">
      <span v-if="prefix" class="stat-card__prefix">{{ prefix }}</span>
      {{ value }}
      <span v-if="suffix" class="stat-card__suffix">{{ suffix }}</span>
    </div>
    <div v-if="trend" class="stat-card__trend" :class="trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'">
      <span>{{ trendUp ? '↑' : '↓' }}</span>
      {{ trend }}
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.stat-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.stat-card__label { font-size: var(--font-size-sm); color: var(--color-text-muted); font-weight: 500; }
.stat-card__value { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text); }
.stat-card__prefix, .stat-card__suffix { font-size: var(--font-size-base); font-weight: 500; color: var(--color-text-muted); }
.stat-card__trend { font-size: var(--font-size-xs); font-weight: 500; }
.stat-card__trend--up { color: var(--color-success); }
.stat-card__trend--down { color: var(--color-danger); }
</style>

