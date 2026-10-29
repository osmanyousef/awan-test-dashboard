<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Option {
  value: string
  label: string
  subtitle?: string
  type?: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
  select: [option: Option]
}>()

const query = ref(props.modelValue)
const open = ref(false)
const focused = ref(false)

watch(() => props.modelValue, v => { query.value = v })

const filtered = computed(() => {
  if (!query.value) return props.options.slice(0, 8)
  const q = query.value.toLowerCase()
  return props.options.filter(o =>
    o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q) || (o.subtitle || '').toLowerCase().includes(q)
  ).slice(0, 8)
})

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  emit('update:modelValue', query.value)
  open.value = true
}

function select(opt: Option) {
  query.value = opt.label
  emit('update:modelValue', opt.label)
  emit('select', opt)
  open.value = false
}

function onBlur() {
  setTimeout(() => { open.value = false; focused.value = false }, 150)
}

const typeColors: Record<string, string> = {
  airport:  '#ebf5ff',
  city:     '#fef3c7',
  hotel:    '#d1fae5',
  country:  '#ede9fe',
  landmark: '#fee2e2',
  district: '#fce7f3',
  metro:    '#dbeafe',
}
</script>

<template>
  <div class="ac" style="position:relative">
    <input
      class="ac__input"
      :value="query"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="off"
      @input="onInput"
      @focus="open = true; focused = true"
      @blur="onBlur"
    />
    <div v-if="open && filtered.length" class="ac__dropdown">
      <button
        v-for="opt in filtered"
        :key="opt.value"
        class="ac__item"
        type="button"
        @mousedown.prevent="select(opt)"
      >
        <div class="ac__item-main">
          <span class="ac__label">{{ opt.label }}</span>
          <span v-if="opt.subtitle" class="ac__subtitle">{{ opt.subtitle }}</span>
        </div>
        <span v-if="opt.type" class="ac__type-badge" :style="{ background: typeColors[opt.type] || '#f3f4f6' }">
          {{ opt.type }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ac__input {
  width: 100%;
  padding: 9px var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-surface);
  outline: none;
  transition: border-color 0.15s;
}
.ac__input:focus { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }
.ac__input::placeholder { color: var(--color-text-muted); }
.ac__dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: var(--z-dropdown);
  overflow: hidden;
}
.ac__item {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border: none; background: none; cursor: pointer; text-align: left;
  gap: var(--space-3);
}
.ac__item:hover { background: var(--color-surface-hover); }
.ac__item-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ac__label { font-size: var(--font-size-sm); color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac__subtitle { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.ac__type-badge {
  font-size: 10px; font-weight: 600; padding: 2px 6px;
  border-radius: var(--radius-full);
  text-transform: uppercase; letter-spacing: 0.04em;
  flex-shrink: 0; color: #374151;
}
</style>

