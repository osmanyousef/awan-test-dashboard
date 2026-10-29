<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  disabled?: boolean
  error?: string
  prefix?: string
  suffix?: string
}>()

defineEmits<{
  'update:modelValue': [val: string]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
}>()
</script>

<template>
  <div class="input-wrap" :class="{ 'input-wrap--error': error, 'input-wrap--disabled': disabled }">
    <span v-if="prefix" class="input-affix input-affix--pre">{{ prefix }}</span>
    <input
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-el"
      :class="{ 'has-pre': prefix, 'has-suf': suffix }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="suffix" class="input-affix input-affix--suf">{{ suffix }}</span>
  </div>
  <p v-if="error" class="input-error">{{ error }}</p>
</template>

<style scoped>
.input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color 0.15s;
  overflow: hidden;
}
.input-wrap:focus-within { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }
.input-wrap--error { border-color: var(--color-danger); }
.input-wrap--error:focus-within { box-shadow: 0 0 0 3px var(--color-danger-light); }
.input-wrap--disabled { opacity: 0.55; background: var(--color-bg); }

.input-el {
  flex: 1;
  padding: 9px var(--space-3);
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  min-width: 0;
}
.input-el::placeholder { color: var(--color-text-muted); }

.input-affix {
  padding: 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  user-select: none;
}
.input-affix--pre { border-right: 1px solid var(--color-border); background: var(--color-bg); }
.input-affix--suf { border-left: 1px solid var(--color-border); background: var(--color-bg); }

.input-error { margin: var(--space-1) 0 0; font-size: var(--font-size-xs); color: var(--color-danger); }
</style>

