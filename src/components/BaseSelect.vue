<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  options: { value: string | number; label: string }[]
  placeholder?: string
  disabled?: boolean
  error?: string
}>()
defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="select-wrap" :class="{ 'select-wrap--error': error, 'select-wrap--disabled': disabled }">
    <select
      :value="modelValue"
      :disabled="disabled"
      class="select-el"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <svg class="select-caret" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </div>
  <p v-if="error" class="select-error">{{ error }}</p>
</template>

<style scoped>
.select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.select-el {
  width: 100%;
  padding: 9px var(--space-7) 9px var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.select-el:focus { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }
.select-wrap--error .select-el { border-color: var(--color-danger); }
.select-wrap--disabled { opacity: 0.55; }
.select-caret {
  position: absolute; right: var(--space-3); width: 16px; height: 16px;
  color: var(--color-text-muted); pointer-events: none;
}
.select-error { margin: var(--space-1) 0 0; font-size: var(--font-size-xs); color: var(--color-danger); }
</style>

