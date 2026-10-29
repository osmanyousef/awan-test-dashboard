<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string }[]
  modelValue: string
}>()
defineEmits<{ 'update:modelValue': [key: string] }>()
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      role="tab"
      :aria-selected="modelValue === tab.key"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': modelValue === tab.key }"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
}
.tabs__tab {
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tabs__tab:hover { color: var(--color-primary); }
.tabs__tab--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
</style>

