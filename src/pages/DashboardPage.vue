<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { currentUser, dashboardStats, recentBookings } from '../config/mockData'
import StatusPill from '../components/StatusPill.vue'
import BaseModal from '../components/BaseModal.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const showTopUpModal = ref(false)
const topUpAmount = ref(1000)

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function handleTopUpSubmit() {
  showTopUpModal.value = false
  show(`Top-up request for LYD ${formatNumber(topUpAmount.value)} submitted successfully!`, 'success')
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Page Header (matching screenshot) -->
    <div class="welcome-header">
      <h1 class="welcome-title">Welcome, {{ currentUser.name }}</h1>
      <p class="welcome-sub">Overview of your agency activity</p>
    </div>

    <!-- 1. Stats Row (5 Stat Cards matching screenshot) -->
    <div class="stats-row">
      <!-- Stat 1: Wallet balance -->
      <div class="stat-card">
        <div class="stat-icon-box stat-icon-box--green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12V7H5a2 2 0 010-4h14v4" />
            <path d="M3 7v13a2 2 0 002 2h16v-5" />
            <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Wallet balance</span>
          <div class="stat-value">
            <span class="currency-prefix">LYD</span> {{ formatNumber(dashboardStats.walletBalance) }}
          </div>
          <span class="stat-sub">Total spendable: LYD {{ formatNumber(dashboardStats.walletBalance) }}</span>
        </div>
      </div>

      <!-- Stat 2: Bookings -->
      <div class="stat-card">
        <div class="stat-icon-box stat-icon-box--blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Bookings</span>
          <div class="stat-value">{{ dashboardStats.totalBookings }}</div>
          <span class="stat-sub">Total bookings</span>
        </div>
      </div>

      <!-- Stat 3: Today's sales -->
      <div class="stat-card">
        <div class="stat-icon-box stat-icon-box--purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Today's sales</span>
          <div class="stat-value">
            <span class="currency-prefix">LYD</span> {{ formatNumber(dashboardStats.todaysSales) }}
          </div>
          <span class="stat-sub">{{ dashboardStats.todaysBookingsCount }} bookings</span>
        </div>
      </div>

      <!-- Stat 4: Commissions -->
      <div class="stat-card">
        <div class="stat-icon-box stat-icon-box--amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Commissions</span>
          <div class="stat-value">
            <span class="currency-prefix">LYD</span> {{ formatNumber(dashboardStats.commissions) }}
          </div>
          <span class="stat-sub">Earned commissions</span>
        </div>
      </div>

      <!-- Stat 5: Profit from my agents -->
      <div class="stat-card">
        <div class="stat-icon-box stat-icon-box--indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Profit from my agents</span>
          <div class="stat-value">
            <span class="currency-prefix">LYD</span> {{ formatNumber(dashboardStats.profitFromAgents) }}
          </div>
          <span class="stat-sub">From my agents' bookings</span>
        </div>
      </div>
    </div>

    <!-- 2. Quick Actions (matching screenshot) -->
    <div class="section-container">
      <h2 class="section-heading">Quick actions</h2>
      <div class="quick-actions-grid">
        <RouterLink to="/flights" class="action-card">
          <div class="action-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.7l-.7.7 6.4 3.8-3.6 3.6-2.5-.5c-.5-.1-1 .1-1.3.4l-.4.4 2.8 2.8 2.8 2.8.4-.4c.3-.3.5-.8.4-1.3l-.5-2.5 3.6-3.6 3.8 6.4.7-.7c.6-.5.9-1.3.7-2.1z" />
            </svg>
          </div>
          <span class="action-card-title">Flight search</span>
        </RouterLink>

        <RouterLink to="/" class="action-card">
          <div class="action-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 21h18M6 18h12M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16M9 8h2M9 12h2M13 8h2M13 12h2" />
            </svg>
          </div>
          <span class="action-card-title">Hotel search</span>
        </RouterLink>

        <div class="action-card" @click="showTopUpModal = true">
          <div class="action-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 12V7H5a2 2 0 010-4h14v4" />
              <path d="M3 7v13a2 2 0 002 2h16v-5" />
              <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <span class="action-card-title">Top up wallet</span>
        </div>
      </div>
    </div>

    <!-- 3. Latest Bookings (matching screenshot) -->
    <div class="section-container">
      <div class="section-header-row">
        <h2 class="section-heading">Latest bookings</h2>
        <RouterLink to="/operations/bookings" class="view-all-link">
          View all →
        </RouterLink>
      </div>

      <div class="bookings-list-card">
        <div
          v-for="b in recentBookings"
          :key="b.id"
          class="booking-item-row"
        >
          <!-- Left Icon + Ref details -->
          <div class="item-left">
            <div class="booking-icon-circle">
              <!-- Bed / Hotel icon or Flight icon -->
              <svg v-if="b.type === 'Hotel'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 21h18M6 18h12M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16M9 8h2M9 12h2M13 8h2M13 12h2" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.7l-.7.7 6.4 3.8-3.6 3.6-2.5-.5c-.5-.1-1 .1-1.3.4l-.4.4 2.8 2.8 2.8 2.8.4-.4c.3-.3.5-.8.4-1.3l-.5-2.5 3.6-3.6 3.8 6.4.7-.7c.6-.5.9-1.3.7-2.1z" />
              </svg>
            </div>
            <div class="item-meta">
              <span class="booking-ref">{{ b.ref }}</span>
              <span class="booking-route">{{ b.route }} · {{ b.date }}</span>
            </div>
          </div>

          <!-- Right: Price + Status Pill -->
          <div class="item-right">
            <span class="booking-amount">
              {{ b.currency }} {{ formatNumber(b.amount) }}
            </span>
            <StatusPill :status="b.status" size="sm" />
          </div>
        </div>
      </div>
    </div>

    <!-- Top Up Wallet Modal -->
    <BaseModal :open="showTopUpModal" title="Top Up Wallet" @close="showTopUpModal = false">
      <div class="modal-form">
        <p class="modal-desc">
          Add spendable funds to your Awan Travel B2B wallet. Supported payment methods include Direct Bank Transfer and Letter of Credit.
        </p>
        <div class="amount-field">
          <label class="field-lbl">Amount in LYD</label>
          <input type="number" v-model="topUpAmount" class="modal-input" min="100" step="50" />
        </div>
      </div>
      <template #footer>
        <button class="btn-cancel" @click="showTopUpModal = false">Cancel</button>
        <button class="btn-confirm" @click="handleTopUpSubmit">Submit Request</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Header */
.welcome-header {
  margin-bottom: 4px;
}
.welcome-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
  margin: 0 0 6px 0;
}
.welcome-sub {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Stats Row ─────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px 18px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 6px rgba(31, 43, 56, 0.04);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 43, 56, 0.08);
}

.stat-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.stat-icon-box--green  { background: #10b981; }
.stat-icon-box--blue   { background: #3b82f6; }
.stat-icon-box--purple { background: #8b5cf6; }
.stat-icon-box--amber  { background: #f59e0b; }
.stat-icon-box--indigo { background: #6366f1; }

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: 4px;
  white-space: nowrap;
}

.currency-prefix {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.stat-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Section Container ─────────────────────────────────── */
.section-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.view-all-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
.view-all-link:hover {
  text-decoration: underline;
}

/* ── Quick Actions Grid ────────────────────────────────── */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(31, 43, 56, 0.04);
  transition: all 0.15s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: 0 8px 20px rgba(87, 130, 206, 0.12);
}

.action-card-icon {
  color: var(--color-primary);
}

.action-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

/* ── Latest Bookings List Card ─────────────────────────── */
.bookings-list-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(31, 43, 56, 0.04);
  overflow: hidden;
}

.booking-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s ease;
}

.booking-item-row:last-child {
  border-bottom: none;
}

.booking-item-row:hover {
  background: var(--color-surface-hover);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.booking-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3e8ff;
  color: #7e22ce;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.booking-ref {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
  font-family: monospace;
}

.booking-route {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.booking-amount {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text);
}

/* Modal */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}
.amount-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-lbl {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}
.modal-input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}
.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn-confirm {
  padding: 8px 20px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 900px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
