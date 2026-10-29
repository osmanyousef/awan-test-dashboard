<script setup lang="ts">
defineProps<{
  modelValue?: string
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>()
defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="dp-wrap" :class="{ 'dp-wrap--error': error }">
    <input
      type="date"
      class="dp-input"
      :value="modelValue"
      :min="min"
      :max="max"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
  <p v-if="error" class="dp-error">{{ error }}</p>
</template>

<style scoped>
.dp-wrap {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color 0.15s;
}
.dp-wrap:focus-within { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }
.dp-wrap--error { border-color: var(--color-danger); }
.dp-input {
  width: 100%; padding: 9px var(--space-3); border: none; outline: none;
  background: transparent; font-size: var(--font-size-sm); color: var(--color-text);
  font-family: var(--font-sans);
}
.dp-error { margin: var(--space-1) 0 0; font-size: var(--font-size-xs); color: var(--color-danger); }
</style>

