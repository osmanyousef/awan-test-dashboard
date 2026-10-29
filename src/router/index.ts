import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Primary landing page: Bedsonline / OTA Booking Engine (Hotels & Flights)
    { path: '/', component: () => import('../pages/HomePage.vue') },
    { path: '/hotels', component: () => import('../pages/HomePage.vue') },
    { path: '/hotels/results', component: () => import('../pages/HotelResultsPage.vue') },
    { path: '/flights', component: () => import('../pages/HomePage.vue') },

    // Dashboard overview
    { path: '/dashboard', component: () => import('../pages/DashboardPage.vue') },

    // Finance
    { path: '/finance/wallet', component: () => import('../pages/WalletPage.vue') },
    { path: '/finance/request-credit', component: () => import('../pages/RequestCreditPage.vue') },
    { path: '/finance/statement', component: () => import('../pages/StatementPage.vue') },

    // Agencies
    { path: '/agency/markup', component: () => import('../pages/MarkupPage.vue') },
    { path: '/agency/sub-agencies', component: () => import('../pages/SubAgenciesPage.vue') },
    { path: '/agency/users', component: () => import('../pages/UsersPage.vue') },
    { path: '/agency/settings', component: () => import('../pages/AgencySettingsPage.vue') },

    // Operations
    { path: '/operations/bookings', component: () => import('../pages/BookingsPage.vue') },
    { path: '/operations/amendments', component: () => import('../pages/AmendmentsPage.vue') },

    // Account
    { path: '/account', component: () => import('../pages/AccountPage.vue') },
  ],
})

export default router
