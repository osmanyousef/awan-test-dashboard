<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { dashboardStats, currentUser } from '../config/mockData'

const route = useRoute()
const router = useRouter()

const accountMenuOpen = ref(false)
const pnrQuery = ref('')
const selectedAgencyType = ref('SubAgency')
const selectedAgencyName = ref('Tripoli Central')

const isFlightBookingPage = computed(() =>
  ['/flights/review', '/flights/traveller', '/flights/pay'].includes(route.path)
)

function handleRetrievePNR() {
  if (pnrQuery.value.trim()) {
    router.push({
      path: '/operations/bookings',
      query: { search: pnrQuery.value.trim() },
    })
  } else {
    router.push('/operations/bookings')
  }
}

function toggleAccount() {
  accountMenuOpen.value = !accountMenuOpen.value
}

function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target?.closest('.account-menu-wrap')) {
    accountMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

// Navigation Tabs in Blue Bar (aligned with reference screenshot: Dashboard, Flight, Hotel, Bookings, etc.)
const navTabs = [
  { label: 'Flight',       to: '/flights' },
  { label: 'Hotel',        to: '/hotels' },
  { label: 'Bookings',     to: '/operations/bookings' },
  { label: 'Wallet',       to: '/finance/wallet' },
  { label: 'Reports',      to: '/finance/statement' },
  { label: 'Sub-Agencies', to: '/agency/sub-agencies' },
  { label: 'Settings',     to: '/agency/settings' },
]

function isTabActive(tab: { label: string; to: string }) {
  if (tab.to === '/hotels') {
    return route.path === '/hotels' || route.path === '/' || route.path.startsWith('/hotels/')
  }
  if (tab.to === '/flights') {
    return route.path === '/flights' || route.path.startsWith('/flights/')
  }
  return route.path === tab.to || route.path.startsWith(tab.to)
}
</script>

<template>
  <header class="b2b-header" :class="{ 'b2b-header--dark': isFlightBookingPage }">

    <!-- ══ ROW 1: B2B UTILITY BAR (Logo, PNR Search, SubAgency selector, Balance, User) ══ -->
    <div class="top-bar">
      <div class="top-bar-container">

        <!-- Left: Official Awan Travel Logo -->
        <RouterLink to="/" class="brand-link" title="Awan Travel B2B Portal">
          <img src="/awan-logo.png" alt="Awan Travel" class="brand-img" />
        </RouterLink>

        <!-- Center & Right: B2B Operational Utilities -->
        <div class="utility-controls">

          <!-- 1. Retrieve PNR Search Bar -->
          <form @submit.prevent="handleRetrievePNR" class="pnr-box">
            <input
              type="text"
              v-model="pnrQuery"
              placeholder="Retrieve PNR"
              class="pnr-input"
            />
            <button type="submit" class="pnr-btn-search" title="Search PNR">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              type="button"
              class="pnr-btn-add"
              title="New Booking / Search"
              @click="router.push('/hotels')"
            >
              +
            </button>
          </form>

          <!-- 2. Type / SubAgency Selectors (B2B System Style) -->
          <div class="subagency-group">
            <div class="subagency-field">
              <span class="field-tag">Type</span>
              <div class="select-wrapper">
                <select v-model="selectedAgencyType" class="b2b-select">
                  <option value="SubAgency">SubAgency</option>
                  <option value="MainAgency">Main Agency</option>
                  <option value="Corporate">Corporate</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" class="select-chevron">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div class="subagency-field">
              <span class="field-tag">Name</span>
              <div class="select-wrapper">
                <select v-model="selectedAgencyName" class="b2b-select b2b-select--name">
                  <option value="Tripoli Central">Tripoli Central</option>
                  <option value="Benghazi Branch">Benghazi Branch</option>
                  <option value="Misrata Desk">Misrata Desk</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" class="select-chevron">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 3. Balance Box (Styled precisely as in reference) -->
          <RouterLink to="/finance/wallet" class="balance-box" title="View Agency Wallet & Statement">
            <span class="balance-title">Balance</span>
            <span class="balance-number">{{ formatCurrency(dashboardStats.walletBalance) }} LYD</span>
          </RouterLink>

          <!-- 4. Language Selector -->
          <button class="lang-switch-btn" title="Toggle Language">
            <span class="lang-icon">🌐</span>
            <span class="lang-text">العربية</span>
          </button>

          <!-- 5. Notifications Bell -->
          <button class="bell-btn" title="Notifications" @click="router.push('/operations/bookings')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span class="bell-indicator">3</span>
          </button>

          <!-- 6. User Profile Dropdown -->
          <div class="account-menu-wrap">
            <button class="account-btn" @click.stop="toggleAccount" title="User Profile">
              <div class="user-avatar">{{ currentUser.avatar }}</div>
              <span class="user-handle">{{ currentUser.name }}</span>
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" class="user-chevron">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div v-if="accountMenuOpen" class="account-popover">
              <div class="popover-header">
                <span class="popover-name">{{ currentUser.name }}</span>
                <span class="popover-email">{{ currentUser.email }}</span>
                <span class="popover-role">{{ currentUser.role }} · {{ currentUser.agency }}</span>
              </div>
              <div class="popover-divider"></div>
              <RouterLink to="/account" class="popover-link" @click="accountMenuOpen = false">
                <span>👤</span>
                <span>Profile &amp; Account</span>
              </RouterLink>
              <RouterLink to="/agency/settings" class="popover-link" @click="accountMenuOpen = false">
                <span>⚙️</span>
                <span>Agency Settings</span>
              </RouterLink>
              <RouterLink to="/finance/wallet" class="popover-link" @click="accountMenuOpen = false">
                <span>💳</span>
                <span>Wallet &amp; Credit Line</span>
              </RouterLink>
              <div class="popover-divider"></div>
              <button class="popover-link popover-link--logout" @click="accountMenuOpen = false">
                <span>↩</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ══ ROW 2: B2B BLUE NAVIGATION BAR (Matching screenshot exactly) ══ -->
    <nav class="blue-nav-bar">
      <div class="blue-nav-container">

        <!-- Dashboard Speedometer Icon (First item on left) -->
        <RouterLink
          to="/dashboard"
          class="dash-icon-tab"
          :class="{ 'dash-icon-tab--active': route.path === '/dashboard' }"
          title="Operations Dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 14l3-3" />
            <path d="M3.34 19a10 10 0 1 1 17.32 0" />
          </svg>
        </RouterLink>

        <!-- Navigation Tabs -->
        <div class="nav-tabs-list">
          <RouterLink
            v-for="tab in navTabs"
            :key="tab.label"
            :to="tab.to"
            class="b2b-tab-link"
            :class="{ 'b2b-tab-link--active': isTabActive(tab) }"
          >
            {{ tab.label }}
          </RouterLink>
        </div>

      </div>
    </nav>

  </header>
</template>

<style scoped>
/* ── Main Header Shell ── */
.b2b-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid #dce4f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

/* ── Top Utility Row ── */
.top-bar {
  background: #ffffff;
  border-bottom: 1px solid #e8eef6;
  padding: 8px 24px;
}
.top-bar-container {
  max-width: 1560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 46px;
}

/* Brand Logo */
.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}
.brand-img {
  height: 38px;
  width: auto;
  object-fit: contain;
}

/* Utility Controls */
.utility-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

/* 1. Retrieve PNR Search */
.pnr-box {
  display: flex;
  align-items: stretch;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
  height: 34px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}
.pnr-input {
  border: none;
  padding: 0 10px;
  font-size: 13px;
  font-family: inherit;
  width: 130px;
  color: #1e293b;
  outline: none;
  background: transparent;
}
.pnr-input::placeholder {
  color: #94a3b8;
  font-size: 12px;
}
.pnr-btn-search {
  background: #1e293b;
  border: none;
  color: #ffffff;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.pnr-btn-search:hover {
  background: #0f172a;
}
.pnr-btn-add {
  background: #f8fafc;
  border: none;
  border-left: 1px solid #cbd5e1;
  color: #334155;
  font-size: 16px;
  font-weight: 600;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.pnr-btn-add:hover {
  background: #e2e8f0;
}

/* 2. SubAgency Selectors */
.subagency-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.subagency-field {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}
.field-tag {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: capitalize;
}
.select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.b2b-select {
  appearance: none;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  height: 32px;
  padding: 0 24px 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
.b2b-select--name {
  min-width: 120px;
}
.select-chevron {
  position: absolute;
  right: 8px;
  pointer-events: none;
  color: #64748b;
}

/* 3. Balance Box */
.balance-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 3px 12px;
  height: 34px;
  background: #ffffff;
  text-decoration: none;
  min-width: 120px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.15s ease;
}
.balance-box:hover {
  border-color: #059669;
  background: #f0fdf4;
}
.balance-title {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  line-height: 1;
}
.balance-number {
  font-size: 13px;
  font-weight: 700;
  color: #047857;
  line-height: 1.2;
}

/* 4. Language Selector */
.lang-switch-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  height: 34px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s;
}
.lang-switch-btn:hover {
  background: #e2e8f0;
}
.lang-icon {
  font-size: 13px;
}

/* 5. Bell Button */
.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}
.bell-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.bell-indicator {
  position: absolute;
  top: 3px;
  right: 3px;
  background: #ef4444;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 6. Account Menu */
.account-menu-wrap {
  position: relative;
}
.account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.account-btn:hover {
  background: #f1f5f9;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-handle {
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
}
.user-chevron {
  color: #64748b;
}

/* Account Popover */
.account-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 230px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  z-index: 100;
}
.popover-header {
  padding: 10px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.popover-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.popover-email {
  font-size: 11.5px;
  color: #64748b;
}
.popover-role {
  font-size: 10.5px;
  color: #2563eb;
  font-weight: 600;
  margin-top: 2px;
}
.popover-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}
.popover-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: #334155;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: background 0.1s;
}
.popover-link:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.popover-link--logout {
  color: #dc2626;
}
.popover-link--logout:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ── ROW 2: B2B BLUE NAVIGATION BAR (Matching screenshot) ── */
.blue-nav-bar {
  background: #2b5ec4;
  padding: 0 24px;
}
.blue-nav-container {
  max-width: 1560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Dashboard Speedometer Icon */
.dash-icon-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 38px;
  color: #ffffff;
  border-radius: 6px 6px 0 0;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.15s;
  text-decoration: none;
  margin-right: 6px;
}
.dash-icon-tab:hover {
  background: rgba(255, 255, 255, 0.25);
}
.dash-icon-tab--active {
  background: #1d4596;
}

/* Tabs list */
.nav-tabs-list {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-tabs-list::-webkit-scrollbar {
  display: none;
}
.b2b-tab-link {
  padding: 0 16px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  font-size: 13.5px;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
  border-radius: 6px 6px 0 0;
  transition: all 0.15s ease;
  opacity: 0.88;
}
.b2b-tab-link:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.14);
}
.b2b-tab-link--active {
  opacity: 1;
  background: #1d4596;
  font-weight: 700;
  box-shadow: inset 0 -2px 0 #ffffff;
}

/* ── Flight booking dark mode overrides ── */
.b2b-header--dark {
  background: #0c1f44;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
.b2b-header--dark .top-bar {
  background: #0c1f44;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
.b2b-header--dark .pnr-box {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.b2b-header--dark .pnr-input {
  color: #ffffff;
}
.b2b-header--dark .pnr-btn-add {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}
.b2b-header--dark .field-tag {
  color: #94a3b8;
}
.b2b-header--dark .b2b-select {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
.b2b-header--dark .balance-box {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(16, 185, 129, 0.4);
}
.b2b-header--dark .balance-title {
  color: #86efac;
}
.b2b-header--dark .balance-number {
  color: #d1fae5;
}
.b2b-header--dark .lang-switch-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
.b2b-header--dark .bell-btn {
  color: #cbd5e1;
}
.b2b-header--dark .user-handle {
  color: #ffffff;
}
.b2b-header--dark .blue-nav-bar {
  background: #091733;
}

@media (max-width: 1024px) {
  .subagency-group { display: none; }
  .pnr-box { display: none; }
}
@media (max-width: 768px) {
  .lang-switch-btn { display: none; }
  .user-handle { display: none; }
}
</style>
