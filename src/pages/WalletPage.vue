<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import { dashboardStats, walletTransactions } from '../config/mockData'
import { useToast } from '../composables/useToast'

const { show } = useToast()

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleTopUp() {
  show('Top-up request submitted. Funds will reflect within 1 business day.', 'info')
}
</script>

<template>
  <div>
    <PageHeader title="Wallet" subtitle="Manage your agency wallet balance and transactions">
      <template #actions>
        <BaseButton variant="primary" @click="handleTopUp">+ Request Top-Up</BaseButton>
      </template>
    </PageHeader>

    <div class="wallet-stats">
      <StatCard
        label="Current Balance"
        :value="formatCurrency(dashboardStats.walletBalance)"
        trend="Available to spend"
        :trendUp="true"
      >
        <template #icon><span style="font-size:1.25rem">💳</span></template>
      </StatCard>
      <StatCard
        label="Total Spent (Oct)"
        :value="formatCurrency(1240 + 3800 + 420)"
        trend="3 transactions"
        :trendUp="false"
      >
        <template #icon><span style="font-size:1.25rem">📤</span></template>
      </StatCard>
      <StatCard
        label="Total Credits (Oct)"
        :value="formatCurrency(10000 + 5200)"
        trend="2 credits received"
        :trendUp="true"
      >
        <template #icon><span style="font-size:1.25rem">📥</span></template>
      </StatCard>
    </div>

    <BaseCard padding="none" class="tx-card">
      <div class="section-head">
        <h2 class="section-head__title">Transaction History</h2>
      </div>
      <table class="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Description</th>
            <th class="right">Amount</th>
            <th class="right">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in walletTransactions" :key="tx.id" class="tx-row">
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
.wallet-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}
.tx-card { overflow: hidden; }
.section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
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

.right { text-align: right; }
.muted { color: var(--color-text-muted); }
.mono { font-variant-numeric: tabular-nums; font-family: monospace; }
.tx-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.tx-amount--credit { color: var(--color-success); }
.tx-amount--debit  { color: var(--color-danger); }
</style>
