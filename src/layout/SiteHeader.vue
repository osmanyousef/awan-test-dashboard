<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { dashboardStats, currentUser } from '../config/mockData'

const route = useRoute()
const activeDropdown = ref<string | null>(null)
const accountMenuOpen = ref(false)

function toggleDropdown(name: string) {
  activeDropdown.value = activeDropdown.value === name ? null : name
}
function closeDropdown() {
  activeDropdown.value = null
}

function toggleAccount() {
  accountMenuOpen.value = !accountMenuOpen.value
}
function closeAccount() {
  setTimeout(() => (accountMenuOpen.value = false), 150)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <!-- Left: Official Awan Travel Logo -->
      <RouterLink to="/" class="brand">
        <img
          src="/awan-logo.png"
          alt="Awan Travel"
          class="brand-logo"
        />
      </RouterLink>

      <!-- Center: Clean Top Navigation (Bedsonline / Modern OTA style) -->
      <nav class="nav-links">
        <!-- Main Search (Stays & Flights) - Primary Landing -->
        <RouterLink
          to="/"
          class="nav-link"
          :class="{ 'nav-link--active': route.path === '/' || route.path === '/hotels' || route.path === '/flights' }"
        >
          Book / Search
        </RouterLink>

        <!-- Dashboard -->
        <RouterLink
          to="/dashboard"
          class="nav-link"
          :class="{ 'nav-link--active': route.path === '/dashboard' }"
        >
          Dashboard
        </RouterLink>

        <!-- Operations Dropdown (Bookings, Amendment Requests) -->
        <div
          class="nav-dropdown-wrap"
          @mouseenter="activeDropdown = 'operations'"
          @mouseleave="closeDropdown"
        >
          <button
            class="nav-link nav-link--btn"
            :class="{ 'nav-link--active': route.path.startsWith('/operations') }"
            @click="toggleDropdown('operations')"
          >
            <span>Operations</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" class="dropdown-chevron">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <div v-if="activeDropdown === 'operations'" class="dropdown-menu">
            <RouterLink to="/operations/bookings" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">📅</span>
              <span>Bookings</span>
            </RouterLink>
            <RouterLink to="/operations/amendments" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">✏️</span>
              <span>Amendment Requests</span>
            </RouterLink>
          </div>
        </div>

        <!-- Finance Dropdown (Wallet, Request Credit, Account Statement) -->
        <div
          class="nav-dropdown-wrap"
          @mouseenter="activeDropdown = 'finance'"
          @mouseleave="closeDropdown"
        >
          <button
            class="nav-link nav-link--btn"
            :class="{ 'nav-link--active': route.path.startsWith('/finance') }"
            @click="toggleDropdown('finance')"
          >
            <span>Finance</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" class="dropdown-chevron">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <div v-if="activeDropdown === 'finance'" class="dropdown-menu">
            <RouterLink to="/finance/wallet" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">💳</span>
              <span>Wallet</span>
            </RouterLink>
            <RouterLink to="/finance/request-credit" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">➕</span>
              <span>Request Credit</span>
            </RouterLink>
            <RouterLink to="/finance/statement" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">📄</span>
              <span>Account Statement</span>
            </RouterLink>
          </div>
        </div>

        <!-- Agencies Dropdown (Markup Rules, Sub-Agencies, Users, Settings) -->
        <div
          class="nav-dropdown-wrap"
          @mouseenter="activeDropdown = 'agencies'"
          @mouseleave="closeDropdown"
        >
          <button
            class="nav-link nav-link--btn"
            :class="{ 'nav-link--active': route.path.startsWith('/agency') }"
            @click="toggleDropdown('agencies')"
          >
            <span>Agencies</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" class="dropdown-chevron">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <div v-if="activeDropdown === 'agencies'" class="dropdown-menu">
            <RouterLink to="/agency/markup" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">%</span>
              <span>Markup Rules</span>
            </RouterLink>
            <RouterLink to="/agency/sub-agencies" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">🏢</span>
              <span>Sub-Agencies</span>
            </RouterLink>
            <RouterLink to="/agency/users" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">👥</span>
              <span>Users</span>
            </RouterLink>
            <RouterLink to="/agency/settings" class="dropdown-item" @click="closeDropdown">
              <span class="dropdown-icon">⚙️</span>
              <span>Agency Settings</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <!-- Right: Wallet chip, Notifications, Account profile -->
      <div class="header-right">
        <!-- Spendable Wallet Chip (LYD) -->
        <RouterLink to="/finance/wallet" class="wallet-chip">
          <div class="wallet-icon-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12V7H5a2 2 0 010-4h14v4" />
              <path d="M3 7v13a2 2 0 002 2h16v-5" />
              <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <div class="wallet-details">
            <span class="wallet-label">Balance</span>
            <span class="wallet-amount">LYD {{ formatCurrency(dashboardStats.walletBalance) }}</span>
          </div>
        </RouterLink>

        <!-- Notification bell with badge -->
        <button class="action-icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span class="bell-badge">3</span>
        </button>

        <!-- My Account Dropdown -->
        <div class="account-menu-wrap" style="position: relative">
          <button
            class="user-profile-btn"
            title="My Account"
            @click="toggleAccount"
            @blur="closeAccount"
          >
            <div class="user-avatar-sm">
              {{ currentUser.avatar }}
            </div>
            <span class="user-name-text">{{ currentUser.name }}</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <div v-if="accountMenuOpen" class="dropdown-menu account-dropdown">
            <div class="account-dropdown-header">
              <span class="acc-email">{{ currentUser.email }}</span>
              <span class="acc-role">{{ currentUser.role }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <RouterLink to="/account" class="dropdown-item" @click="accountMenuOpen = false">
              👤 Profile & Account
            </RouterLink>
            <RouterLink to="/agency/settings" class="dropdown-item" @click="accountMenuOpen = false">
              ⚙️ Settings
            </RouterLink>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-item--danger" @click="accountMenuOpen = false">
              ↩ Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--color-bg);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(204, 216, 230, 0.7);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Brand Logo */
.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

/* Center Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 9999px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-link:hover {
  color: var(--color-primary);
  background: rgba(87, 130, 206, 0.08);
}

.nav-link--active {
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  background: rgba(87, 130, 206, 0.1);
  font-weight: 600;
}

.dropdown-chevron {
  opacity: 0.6;
  transition: transform 0.15s ease;
}

/* Dropdown Menu */
.nav-dropdown-wrap {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(31, 43, 56, 0.12);
  min-width: 200px;
  padding: 6px 0;
  z-index: 60;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 0.88rem;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.1s ease;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.dropdown-item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.dropdown-item--danger {
  color: var(--color-danger);
}
.dropdown-item--danger:hover {
  background: #fee2e2;
  color: var(--color-danger);
}

.dropdown-icon {
  font-size: 1rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

/* Right Header Actions */
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Spendable Wallet Chip */
.wallet-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 8px;
  border-radius: 9999px;
  background: #ffffff;
  border: 1.5px solid #10b981;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.12);
  transition: all 0.15s ease;
}

.wallet-chip:hover {
  background: #f0fdf4;
  transform: translateY(-1px);
}

.wallet-icon-box {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-details {
  display: flex;
  flex-direction: column;
}
.wallet-label {
  font-size: 0.65rem;
  color: #166534;
  font-weight: 600;
  line-height: 1;
}
.wallet-amount {
  font-size: 0.85rem;
  font-weight: 800;
  color: #14532d;
  line-height: 1.2;
}

/* Notification Bell */
.action-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: color 0.15s, background 0.15s;
}

.action-icon-btn:hover {
  color: var(--color-primary);
  background: rgba(87, 130, 206, 0.1);
}

.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* User Profile button */
.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 9999px;
  transition: background 0.15s ease;
}

.user-profile-btn:hover {
  background: rgba(87, 130, 206, 0.08);
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Account dropdown */
.account-dropdown {
  right: 0;
  left: auto;
  min-width: 220px;
}
.account-dropdown-header {
  padding: 10px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.acc-email {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}
.acc-role {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }
}
</style>
