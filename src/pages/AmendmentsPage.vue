<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import StatusPill from '../components/StatusPill.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

interface Amendment {
  id: string
  bookingRef: string
  type: 'Flight' | 'Hotel'
  customer: string
  change: string
  requestedOn: string
  status: 'Pending' | 'Confirmed' | 'Cancelled'
}

const amendments = ref<Amendment[]>([
  { id: 'AMD-001', bookingRef: 'FLT-78250', type: 'Flight', customer: 'Nomad Agency', change: 'Date change: 25 Oct → 28 Oct', requestedOn: '2025-10-25', status: 'Pending' },
  { id: 'AMD-002', bookingRef: 'HTL-44480', type: 'Hotel',  customer: 'Acme Travel',  change: 'Check-in extension by 1 night', requestedOn: '2025-10-24', status: 'Pending' },
  { id: 'AMD-003', bookingRef: 'FLT-78301', type: 'Flight', customer: 'Sky Riders',   change: 'Passenger name correction',    requestedOn: '2025-10-22', status: 'Confirmed' },
  { id: 'AMD-004', bookingRef: 'HTL-44521', type: 'Hotel',  customer: 'Global Tours', change: 'Room upgrade request',         requestedOn: '2025-10-20', status: 'Cancelled' },
])

const search = ref('')
const statusFilter = ref<'all' | 'Pending' | 'Confirmed' | 'Cancelled'>('all')

const filtered = computed(() =>
  amendments.value.filter(a => {
    if (statusFilter.value !== 'all' && a.status !== statusFilter.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!a.id.toLowerCase().includes(q) && !a.bookingRef.toLowerCase().includes(q) && !a.customer.toLowerCase().includes(q))
        return false
    }
    return true
  })
)

const detailModal = ref<Amendment | null>(null)

function handleApprove(a: Amendment) {
  a.status = 'Confirmed'
  show(`Amendment ${a.id} approved.`, 'success')
  detailModal.value = null
}
function handleReject(a: Amendment) {
  a.status = 'Cancelled'
  show(`Amendment ${a.id} rejected.`, 'warning')
  detailModal.value = null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <PageHeader title="Amendment Requests" subtitle="Review and action pending booking amendments" />

    <div class="summary-chips">
      <div class="chip-stat chip-stat--warning">
        <span class="chip-stat__num">{{ amendments.filter(a => a.status === 'Pending').length }}</span>
        <span class="chip-stat__label">Pending</span>
      </div>
      <div class="chip-stat chip-stat--success">
        <span class="chip-stat__num">{{ amendments.filter(a => a.status === 'Confirmed').length }}</span>
        <span class="chip-stat__label">Approved</span>
      </div>
      <div class="chip-stat chip-stat--danger">
        <span class="chip-stat__num">{{ amendments.filter(a => a.status === 'Cancelled').length }}</span>
        <span class="chip-stat__label">Rejected</span>
      </div>
    </div>

    <BaseCard padding="md" class="filters-card">
      <div class="filters">
        <BaseInput v-model="search" placeholder="Search by ID, booking ref, customer…" type="search" />
        <div class="filter-chips">
          <button
            v-for="s in (['all', 'Pending', 'Confirmed', 'Cancelled'] as const)"
            :key="s"
            :class="['chip', { 'chip--active': statusFilter === s }]"
            @click="statusFilter = s"
          >{{ s === 'all' ? 'All' : s }}</button>
        </div>
      </div>
    </BaseCard>

    <div class="amendment-list">
      <p v-if="filtered.length === 0" class="empty">No amendments match your filters.</p>

      <BaseCard v-for="a in filtered" :key="a.id" padding="md" class="amendment-card">
        <div class="amendment-top">
          <div class="amendment-meta">
            <span class="amendment-id">{{ a.id }}</span>
            <span :class="['type-badge', `type-badge--${a.type.toLowerCase()}`]">{{ a.type }}</span>
          </div>
          <StatusPill :status="a.status" size="sm" />
        </div>
        <div class="amendment-body">
          <p class="amendment-booking">Booking: <strong>{{ a.bookingRef }}</strong> · {{ a.customer }}</p>
          <p class="amendment-change">{{ a.change }}</p>
          <p class="amendment-date">Requested on {{ formatDate(a.requestedOn) }}</p>
        </div>
        <div class="amendment-actions">
          <BaseButton variant="ghost" size="sm" @click="detailModal = a">View Details</BaseButton>
          <template v-if="a.status === 'Pending'">
            <BaseButton variant="primary" size="sm" @click="handleApprove(a)">✓ Approve</BaseButton>
            <BaseButton variant="danger" size="sm" @click="handleReject(a)">✗ Reject</BaseButton>
          </template>
        </div>
      </BaseCard>
    </div>

    <BaseModal :open="!!detailModal" :title="`Amendment ${detailModal?.id}`" size="md" @close="detailModal = null">
      <div v-if="detailModal" class="detail-grid">
        <div class="detail-row"><span class="detail-label">Amendment ID</span><span>{{ detailModal.id }}</span></div>
        <div class="detail-row"><span class="detail-label">Booking Ref</span><span>{{ detailModal.bookingRef }}</span></div>
        <div class="detail-row"><span class="detail-label">Type</span><span>{{ detailModal.type }}</span></div>
        <div class="detail-row"><span class="detail-label">Customer</span><span>{{ detailModal.customer }}</span></div>
        <div class="detail-row"><span class="detail-label">Requested Change</span><span>{{ detailModal.change }}</span></div>
        <div class="detail-row"><span class="detail-label">Requested On</span><span>{{ formatDate(detailModal.requestedOn) }}</span></div>
        <div class="detail-row"><span class="detail-label">Status</span><StatusPill :status="detailModal.status" /></div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="detailModal = null">Close</BaseButton>
        <template v-if="detailModal?.status === 'Pending'">
          <BaseButton variant="danger" @click="handleReject(detailModal!)">Reject</BaseButton>
          <BaseButton variant="primary" @click="handleApprove(detailModal!)">Approve</BaseButton>
        </template>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.summary-chips { display: flex; gap: var(--space-3); margin-bottom: var(--space-5); flex-wrap: wrap; }
.chip-stat {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid;
}
.chip-stat--warning { background: var(--color-warning-light); border-color: var(--color-warning); }
.chip-stat--success { background: var(--color-success-light); border-color: var(--color-success); }
.chip-stat--danger  { background: var(--color-danger-light);  border-color: var(--color-danger); }
.chip-stat__num   { font-size: var(--font-size-xl); font-weight: 700; }
.chip-stat__label { font-size: var(--font-size-sm); font-weight: 500; }
.chip-stat--warning .chip-stat__num, .chip-stat--warning .chip-stat__label { color: var(--color-accent-hover); }
.chip-stat--success .chip-stat__num, .chip-stat--success .chip-stat__label { color: var(--color-success); }
.chip-stat--danger  .chip-stat__num, .chip-stat--danger  .chip-stat__label { color: var(--color-danger); }

.filters-card { margin-bottom: var(--space-4); }
.filters { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; }
.filter-chips { display: flex; gap: var(--space-1); }
.chip {
  padding: 5px var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-full);
  font-size: var(--font-size-xs); font-weight: 500; cursor: pointer; background: var(--color-surface);
  color: var(--color-text-muted); transition: all 0.15s; font-family: inherit;
}
.chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
.chip--active { background: var(--color-primary); color: var(--color-text-inverse); border-color: var(--color-primary); }

.amendment-list { display: flex; flex-direction: column; gap: var(--space-3); }
.empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }
.amendment-card { display: flex; flex-direction: column; gap: var(--space-3); }
.amendment-top { display: flex; justify-content: space-between; align-items: center; }
.amendment-meta { display: flex; align-items: center; gap: var(--space-2); }
.amendment-id { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-muted); font-family: monospace; }
.type-badge {
  font-size: var(--font-size-xs); font-weight: 500;
  padding: 2px var(--space-2); border-radius: var(--radius-sm);
}
.type-badge--flight { background: var(--color-info-light); color: var(--color-info); }
.type-badge--hotel  { background: var(--color-warning-light); color: var(--color-accent-hover); }
.amendment-booking { margin: 0; font-size: var(--font-size-sm); color: var(--color-text-muted); }
.amendment-booking strong { color: var(--color-text); }
.amendment-change { margin: 4px 0 0; font-size: var(--font-size-base); font-weight: 500; color: var(--color-text); }
.amendment-date { margin: 4px 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.amendment-actions { display: flex; gap: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
.detail-grid { display: flex; flex-direction: column; gap: var(--space-3); }
.detail-row { display: grid; grid-template-columns: 160px 1fr; gap: var(--space-3); align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
.detail-row:last-child { border-bottom: none; }
.detail-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-muted); }
</style>
