<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RoomConfig {
  rooms: number
  adults: number
  children: number
  childAges: number[]
}

const props = defineProps<{ modelValue: RoomConfig }>()
const emit = defineEmits<{ 'update:modelValue': [v: RoomConfig] }>()

const open = ref(false)
const local = ref<RoomConfig>({ ...props.modelValue, childAges: [...(props.modelValue.childAges || [])] })

const summary = computed(() => {
  const pax = local.value.adults + local.value.children
  return `${local.value.rooms} Room${local.value.rooms > 1 ? 's' : ''}, ${pax} Guest${pax !== 1 ? 's' : ''}`
})

function change(field: 'rooms' | 'adults' | 'children', delta: number) {
  let val = Math.max(field === 'rooms' || field === 'adults' ? 1 : 0, (local.value[field] as number) + delta)
  val = Math.min(val, field === 'rooms' ? 9 : 12)
  if (field === 'children') {
    const ages = [...local.value.childAges]
    if (delta > 0) ages.push(5)
    else ages.splice(ages.length - 1, 1)
    local.value = { ...local.value, children: val, childAges: ages }
  } else {
    local.value = { ...local.value, [field]: val }
  }
  emit('update:modelValue', { ...local.value })
}

function setAge(i: number, age: number) {
  const ages = [...local.value.childAges]
  ages[i] = age
  local.value = { ...local.value, childAges: ages }
  emit('update:modelValue', { ...local.value })
}

function close() { setTimeout(() => open.value = false, 150) }
</script>

<template>
  <div class="rg" style="position:relative">
    <button type="button" class="rg__trigger" @click="open = !open" @blur="close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>{{ summary }}</span>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style="opacity:0.5;margin-left:auto">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
    <div v-if="open" class="rg__popover">
      <div v-for="field in (['rooms', 'adults', 'children'] as const)" :key="field" class="rg__row">
        <div>
          <span class="rg__field-label">{{ field.charAt(0).toUpperCase() + field.slice(1) }}</span>
          <span v-if="field === 'children'" class="rg__field-hint">Ages 0–17</span>
        </div>
        <div class="rg__counter">
          <button type="button" class="rg__btn" @click="change(field, -1)" :disabled="local[field] <= (field === 'children' ? 0 : 1)">−</button>
          <span class="rg__val">{{ local[field] }}</span>
          <button type="button" class="rg__btn" @click="change(field, 1)">+</button>
        </div>
      </div>
      <div v-if="local.children > 0" class="rg__ages">
        <p class="rg__ages-label">Child ages at time of travel</p>
        <div class="rg__ages-grid">
          <select v-for="(age, i) in local.childAges" :key="i" class="rg__age-sel"
            :value="age" @change="setAge(i, Number(($event.target as HTMLSelectElement).value))">
            <option v-for="n in 18" :key="n - 1" :value="n - 1">{{ n - 1 }} yr{{ n - 1 !== 1 ? 's' : '' }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rg__trigger {
  display: flex; align-items: center; gap: var(--space-2); width: 100%;
  padding: 9px var(--space-3); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); background: var(--color-surface);
  font-size: var(--font-size-sm); color: var(--color-text); cursor: pointer; text-align: left;
}
.rg__popover {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: var(--z-dropdown);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  padding: var(--space-4); width: 270px; display: flex; flex-direction: column; gap: var(--space-4);
}
.rg__row { display: flex; align-items: center; justify-content: space-between; }
.rg__field-label { display: block; font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); }
.rg__field-hint { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.rg__counter { display: flex; align-items: center; gap: var(--space-2); }
.rg__btn {
  width: 28px; height: 28px; border-radius: var(--radius-full);
  border: 1px solid var(--color-border); background: var(--color-surface);
  font-size: 1rem; cursor: pointer; color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.rg__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.rg__btn:not(:disabled):hover { background: var(--color-primary-light); }
.rg__val { font-size: var(--font-size-sm); font-weight: 600; min-width: 20px; text-align: center; }
.rg__ages { display: flex; flex-direction: column; gap: var(--space-2); }
.rg__ages-label { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }
.rg__ages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
.rg__age-sel { padding: 4px var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--font-size-xs); background: var(--color-surface); }
</style>

