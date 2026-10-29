<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: Record<string, any>[]
  pageSize?: number
}>(), { pageSize: 10 })

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
  page.value = 1
}

const sorted = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const va = a[sortKey.value]; const vb = b[sortKey.value]
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const paginated = computed(() => sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in columns" :key="col.key"
            :class="['table__th', `table__th--${col.align || 'left'}`, { 'table__th--sort': col.sortable }]"
            @click="col.sortable && setSort(col.key)"
          >
            {{ col.label }}
            <span v-if="col.sortable" class="table__sort-icon" aria-hidden="true">
              {{ sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="paginated.length === 0">
          <td :colspan="columns.length" class="table__empty">No data</td>
        </tr>
        <tr v-for="(row, i) in paginated" :key="i" class="table__row">
          <td
            v-for="col in columns" :key="col.key"
            :class="['table__td', `table__td--${col.align || 'left'}`]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="table__pagination">
      <span class="table__page-info">Page {{ page }} of {{ totalPages }}</span>
      <div class="table__page-btns">
        <button :disabled="page <= 1" @click="page--" class="page-btn">‹ Prev</button>
        <button :disabled="page >= totalPages" @click="page++" class="page-btn">Next ›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.table__th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  white-space: nowrap;
}
.table__th--sort { cursor: pointer; user-select: none; }
.table__th--sort:hover { color: var(--color-primary); }
.table__th--right { text-align: right; }
.table__th--center { text-align: center; }
.table__sort-icon { margin-left: var(--space-1); opacity: 0.5; font-size: 0.7em; }
.table__row:hover { background: var(--color-surface-hover); }
.table__td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text); vertical-align: middle; }
.table__td--right { text-align: right; }
.table__td--center { text-align: center; }
.table__empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }
.table__pagination { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); }
.table__page-info { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.table__page-btns { display: flex; gap: var(--space-2); }
.page-btn { padding: 5px var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--font-size-sm); cursor: pointer; color: var(--color-text); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn:not(:disabled):hover { background: var(--color-surface-hover); }
</style>

