<script setup lang="ts">
import { ref, computed } from 'vue'

export interface PassengerConfig {
  adults: number
  children: number
  infants: number
  cabin: 'Economy' | 'Premium Economy' | 'Business' | 'First'
}

const props = defineProps<{ modelValue: PassengerConfig }>()
const emit = defineEmits<{ 'update:modelValue': [v: PassengerConfig] }>()

const open = ref(false)
const local = ref<PassengerConfig>({ ...props.modelValue })

const cabinOptions = ['Economy', 'Premium Economy', 'Business', 'First']

const summary = computed(() => {
  const pax = local.value.adults + local.value.children + local.value.infants
  return `${pax} Passenger${pax !== 1 ? 's' : ''} · ${local.value.cabin}`
})

function update(field: keyof PassengerConfig, delta: number | string) {
  if (typeof delta === 'number') {
    const val = Math.max(field === 'adults' ? 1 : 0, (local.value[field] as number) + delta)
    local.value = { ...local.value, [field]: Math.min(val, 9) }
  } else {
    local.value = { ...local.value, [field]: delta }
  }
  emit('update:modelValue', { ...local.value })
}

function close() { setTimeout(() => open.value = false, 150) }
</script>

<template>
  <div class="pax" style="position:relative">
    <button type="button" class="pax__trigger" @click="open = !open" @blur="close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
      <span>{{ summary }}</span>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style="opacity:0.5;margin-left:auto">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
    <div v-if="open" class="pax__popover">
      <div v-for="field in (['adults', 'children', 'infants'] as const)" :key="field" class="pax__row">
        <div>
          <span class="pax__field-label">{{ field.charAt(0).toUpperCase() + field.slice(1) }}</span>
          <span class="pax__field-hint">{{ field === 'adults' ? '12+' : field === 'children' ? '2–11' : '0–23 months' }}</span>
        </div>
        <div class="pax__counter">
          <button type="button" class="pax__btn" @click="update(field, -1)" :disabled="local[field] <= (field === 'adults' ? 1 : 0)">−</button>
          <span class="pax__val">{{ local[field] }}</span>
          <button type="button" class="pax__btn" @click="update(field, 1)">+</button>
        </div>
      </div>
      <div class="pax__cabin">
        <span class="pax__field-label">Cabin</span>
        <div class="pax__cabin-opts">
          <button
            v-for="c in cabinOptions" :key="c" type="button"
            :class="['pax__cabin-btn', { 'pax__cabin-btn--active': local.cabin === c }]"
            @click="update('cabin', c)"
          >{{ c }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pax__trigger {
  display: flex; align-items: center; gap: var(--space-2);
  width: 100%; padding: 9px var(--space-3);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: var(--color-surface); font-size: var(--font-size-sm);
  color: var(--color-text); cursor: pointer; text-align: left;
}
.pax__trigger:focus-visible { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); outline: none; }
.pax__popover {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: var(--z-dropdown);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  padding: var(--space-4); width: 260px; display: flex; flex-direction: column; gap: var(--space-4);
}
.pax__row { display: flex; align-items: center; justify-content: space-between; }
.pax__field-label { display: block; font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); }
.pax__field-hint { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.pax__counter { display: flex; align-items: center; gap: var(--space-2); }
.pax__btn {
  width: 28px; height: 28px; border-radius: var(--radius-full);
  border: 1px solid var(--color-border); background: var(--color-surface);
  font-size: 1rem; cursor: pointer; color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.pax__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pax__btn:not(:disabled):hover { background: var(--color-primary-light); }
.pax__val { font-size: var(--font-size-sm); font-weight: 600; min-width: 20px; text-align: center; }
.pax__cabin { display: flex; flex-direction: column; gap: var(--space-2); }
.pax__cabin-opts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
.pax__cabin-btn {
  padding: var(--space-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: var(--font-size-xs);
  background: var(--color-surface); cursor: pointer; color: var(--color-text);
  transition: all 0.15s;
}
.pax__cabin-btn--active { background: var(--color-primary); color: var(--color-text-inverse); border-color: var(--color-primary); }
</style>

