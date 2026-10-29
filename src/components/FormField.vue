<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  hint?: string
  id?: string
}>()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-label="required">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="field__hint">{{ hint }}</p>
    <p v-if="error" class="field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); }
.field__required { color: var(--color-danger); margin-left: 2px; }
.field__hint { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }
.field__error { font-size: var(--font-size-xs); color: var(--color-danger); margin: 0; }
</style>

