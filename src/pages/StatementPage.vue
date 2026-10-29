<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import { walletTransactions } from '../config/mockData'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const fromDate = ref('2025-10-01')
const toDate   = ref('2025-10-31')
const typeFilter = ref<'all' | 'debit' | 'credit'>('all')

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filtered = computed(() =>
  walletTransactions.filter(tx => {
    if (typeFilter.value !== 'all' && tx.type !== typeFilter.value) return false
    if (fromDate.value && tx.date < fromDate.value) return false
    if (toDate.value && tx.date > toDate.value) return false
    return true
  })
)

const totalDebit  = computed(() => filtered.value.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0))
const totalCredit = computed(() => filtered.value.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0))

function handleExport() {
  show('Statement exported as CSV.', 'success')
}
</script>

<template>
  <div>
    <PageHeader title="Account Statement" subtitle="Review your financial activity">
      <template #actions>
        <BaseButton variant="secondary" @click="handleExport">⬇ Export CSV</BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <BaseCard padding="md" class="filters-card">
      <div class="filters">
        <div class="filter-group">
          <label class="filter-label">From</label>
          <input type="date" v-model="fromDate" class="date-input" />
        </div>
        <div class="filter-group">
          <label class="filter-label">To</label>
          <input type="date" v-model="toDate" class="date-input" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Type</label>
          <div class="type-tabs">
            <button
              v-for="opt in (['all', 'debit', 'credit'] as const)"
              :key="opt"
              :class="['type-tab', { 'type-tab--active': typeFilter === opt }]"
              @click="typeFilter = opt"
            >
              {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
            </button>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Summary -->
    <div class="summary-row">
      <BaseCard padding="md" class="summary-card">
        <p class="summary__label">Total Credits</p>
        <p class="summary__value summary__value--green">{{ formatCurrency(totalCredit) }}</p>
      </BaseCard>
      <BaseCard padding="md" class="summary-card">
        <p class="summary__label">Total Debits</p>
        <p class="summary__value summary__value--red">{{ formatCurrency(totalDebit) }}</p>
      </BaseCard>
      <BaseCard padding="md" class="summary-card">
        <p class="summary__label">Net</p>
        <p class="summary__value" :class="totalCredit - totalDebit >= 0 ? 'summary__value--green' : 'summary__value--red'">
          {{ formatCurrency(totalCredit - totalDebit) }}
        </p>
      </BaseCard>
    </div>

    <!-- Table -->
    <BaseCard padding="none" class="table-card">
      <div class="section-head">
        <h2 class="section-head__title">{{ filtered.length }} transaction{{ filtered.length !== 1 ? 's' : '' }}</h2>
      </div>
      <table class="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Description</th>
            <th class="right">Amount</th>
            <th class="right">Balance After</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="empty">No transactions in this range</td>
          </tr>
          <tr v-for="tx in filtered" :key="tx.id" class="tx-row">
            <td class="muted">{{ formatDate(tx.date) }}</td>
            <td class="mono">{{ tx.id }}</td>
            <td>{{ tx.description }}</td>
            <td class="right">
              <span :class="['tx-amount', tx.type === 'credit' ? 'tx-amount--credit' : 'tx-amount--debit']">
                {{ tx.type === 'credit' ? '+' : '' }}{{ formatCurrency(tx.amount) }}
              </span>
            </td>
            <td class="right mono">{{ formatCurrency(tx.balance) }}</td>
          </tr>
        </tbody>
      </table>
    </BaseCard>
  </div>
</template>

<style scoped>
.filters-card { margin-bottom: var(--space-4); }
.filters { display: flex; gap: var(--space-5); flex-wrap: wrap; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
.filter-label { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.date-input {
  padding: 8px var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md);
  font-size: var(--font-size-sm); color: var(--color-text); background: var(--color-surface);
  font-family: inherit;
}
.date-input:focus { outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }

.type-tabs { display: flex; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.type-tab {
  padding: 7px var(--space-3); font-size: var(--font-size-sm); font-weight: 500;
  background: var(--color-surface); border: none; cursor: pointer; color: var(--color-text-muted);
  transition: background 0.15s, color 0.15s; font-family: inherit;
}
.type-tab:not(:last-child) { border-right: 1px solid var(--color-border); }
.type-tab--active { background: var(--color-primary); color: var(--color-text-inverse); }

.summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-bottom: var(--space-4); }
.summary-card { text-align: center; }
.summary__label { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0 0 var(--space-1); }
.summary__value { font-size: var(--font-size-xl); font-weight: 700; margin: 0; color: var(--color-text); }
.summary__value--green { color: var(--color-success); }
.summary__value--red   { color: var(--color-danger); }

.table-card { overflow: hidden; }
.section-head { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); }
.section-head__title { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); margin: 0; }

.tx-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.tx-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left; font-weight: 600; font-size: var(--font-size-xs);
  color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border); background: var(--color-bg);
}
.tx-table th.right { text-align: right; }
.tx-row td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.tx-row:hover { background: var(--color-surface-hover); }
.tx-row:last-child td { border-bottom: none; }
.empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }

.right { text-align: right; }
.muted { color: var(--color-text-muted); }
.mono { font-variant-numeric: tabular-nums; }
.tx-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.tx-amount--credit { color: var(--color-success); }
.tx-amount--debit  { color: var(--color-danger); }

@media (max-width: 640px) {
  .summary-row { grid-template-columns: 1fr; }
}
</style>
