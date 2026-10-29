<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import DataTable from '../components/DataTable.vue'
import StatusPill from '../components/StatusPill.vue'
import { recentBookings, type Booking } from '../config/mockData'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const allBookings = ref<Booking[]>([
  ...recentBookings,
  { id: '7',  ref: 'FLT-78400', type: 'Flight', customer: 'Blue Sky Agency', route: 'CDG → SIN', date: '2025-10-29', amount: 1680, currency: 'LYD', status: 'Confirmed' },
  { id: '8',  ref: 'HTL-44600', type: 'Hotel',  customer: 'Apex Travel',     route: 'Burj Al Arab, Dubai', date: '2025-10-29', amount: 7200, currency: 'LYD', status: 'Pending' },
  { id: '9',  ref: 'FLT-78389', type: 'Flight', customer: 'Global Tours',    route: 'IST → AMS', date: '2025-10-28', amount: 540, currency: 'LYD', status: 'Confirmed' },
  { id: '10', ref: 'HTL-44590', type: 'Hotel',  customer: 'Nomad Agency',    route: 'The Ritz, Paris', date: '2025-10-27', amount: 4400, currency: 'LYD', status: 'Amended' },
])

const search = ref('')
const typeFilter = ref<'all' | 'Flight' | 'Hotel'>('all')
const statusFilter = ref<'all' | 'Confirmed' | 'Pending' | 'Cancelled' | 'Amended'>('all')

const filtered = computed(() =>
  allBookings.value.filter(b => {
    if (typeFilter.value !== 'all' && b.type !== typeFilter.value) return false
    if (statusFilter.value !== 'all' && b.status !== statusFilter.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!b.ref.toLowerCase().includes(q) && !b.customer.toLowerCase().includes(q) && !b.route.toLowerCase().includes(q))
        return false
    }
    return true
  })
)

const columns = [
  { key: 'ref',      label: 'Ref',      sortable: true },
  { key: 'type',     label: 'Type',     sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'route',    label: 'Route / Property' },
  { key: 'date',     label: 'Date',     sortable: true },
  { key: 'amount',   label: 'Amount',   sortable: true, align: 'right' as const },
  { key: 'status',   label: 'Status',   sortable: true },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleAmend(ref: string) {
  show(`Amendment request raised for booking ${ref}.`, 'info')
}
</script>

<template>
  <div>
    <PageHeader title="Bookings" subtitle="View and manage all bookings">
      <template #actions>
        <RouterLink to="/flights"><BaseButton variant="primary">✈ New Flight</BaseButton></RouterLink>
        <RouterLink to="/hotels"><BaseButton variant="secondary">🏨 New Hotel</BaseButton></RouterLink>
      </template>
    </PageHeader>

    <BaseCard padding="md" class="filters-card">
      <div class="filters">
        <BaseInput v-model="search" placeholder="Search ref, customer, route…" type="search" />
        <div class="filter-chips">
          <button
            v-for="t in (['all', 'Flight', 'Hotel'] as const)"
            :key="t"
            :class="['chip', { 'chip--active': typeFilter === t }]"
            @click="typeFilter = t"
          >{{ t === 'all' ? 'All Types' : t }}</button>
        </div>
        <div class="filter-chips">
          <button
            v-for="s in (['all', 'Confirmed', 'Pending', 'Cancelled', 'Amended'] as const)"
            :key="s"
            :class="['chip', { 'chip--active': statusFilter === s }]"
            @click="statusFilter = s"
          >{{ s === 'all' ? 'All Status' : s }}</button>
        </div>
      </div>
    </BaseCard>

    <BaseCard padding="none" class="table-card">
      <div class="section-head">
        <span class="count">{{ filtered.length }} booking{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>
      <DataTable :columns="columns" :rows="filtered" :pageSize="8">
        <template #cell-type="{ value }">
          <span :class="['type-badge', `type-badge--${value.toLowerCase()}`]">{{ value }}</span>
        </template>
        <template #cell-date="{ value }">{{ formatDate(value) }}</template>
        <template #cell-amount="{ value }">
          <span class="amount">{{ formatCurrency(value) }}</span>
        </template>
        <template #cell-status="{ value }">
          <StatusPill :status="value" size="sm" />
        </template>
        <template #cell-ref="{ value }">
          <div class="ref-cell">
            <span class="ref-text">{{ value }}</span>
            <button class="amend-btn" @click="handleAmend(value)" title="Request Amendment">✏</button>
          </div>
        </template>
      </DataTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.filters-card { margin-bottom: var(--space-4); }
.filters { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; }
.filter-chips { display: flex; gap: var(--space-1); flex-wrap: wrap; }
.chip {
  padding: 5px var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-full);
  font-size: var(--font-size-xs); font-weight: 500; cursor: pointer; background: var(--color-surface);
  color: var(--color-text-muted); transition: all 0.15s; font-family: inherit; white-space: nowrap;
}
.chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
.chip--active { background: var(--color-primary); color: var(--color-text-inverse); border-color: var(--color-primary); }

.table-card { overflow: hidden; }
.section-head { padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--color-border); }
.count { font-size: var(--font-size-sm); color: var(--color-text-muted); }

.type-badge {
  display: inline-flex; align-items: center;
  font-size: var(--font-size-xs); font-weight: 500;
  padding: 2px var(--space-2); border-radius: var(--radius-sm);
}
.type-badge--flight { background: var(--color-info-light); color: var(--color-info); }
.type-badge--hotel  { background: var(--color-warning-light); color: var(--color-accent-hover); }
.amount { font-variant-numeric: tabular-nums; font-weight: 500; }

.ref-cell { display: flex; align-items: center; gap: var(--space-2); }
.ref-text { font-weight: 500; }
.amend-btn {
  background: none; border: none; cursor: pointer;
  font-size: 0.8rem; opacity: 0.4; padding: 2px 4px; border-radius: var(--radius-sm);
  transition: opacity 0.15s, background 0.15s;
}
.amend-btn:hover { opacity: 1; background: var(--color-primary-light); }
</style>
