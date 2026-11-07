import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0, left: 0, behavior: 'instant' }),
  routes: [
    // Primary landing page: Portal Dashboard
    { path: '/', component: () => import('../pages/DashboardPage.vue') },
    { path: '/hotels', component: () => import('../pages/HomePage.vue') },
    { path: '/hotels/results', component: () => import('../pages/HotelResultsPage.vue') },
    { path: '/hotels/details', component: () => import('../pages/HotelDetailsPage.vue') },
    { path: '/hotels/guests', component: () => import('../pages/HotelGuestsPage.vue') },
    { path: '/hotels/pay', component: () => import('../pages/HotelPaymentPage.vue') },
    { path: '/hotels/:id', component: () => import('../pages/HotelDetailsPage.vue') },
    { path: '/flights', component: () => import('../pages/HomePage.vue') },
    { path: '/flights/results', component: () => import('../pages/FlightResultsPage.vue') },
    { path: '/flights/review', component: () => import('../pages/FlightReviewPage.vue') },
    { path: '/flights/traveller', component: () => import('../pages/TravellerDetailsPage.vue') },
    { path: '/flights/pay', component: () => import('../pages/FlightPaymentPage.vue') },

    // Dashboard overview
    { path: '/dashboard', component: () => import('../pages/DashboardPage.vue') },

    // Finance
    { path: '/wallet', redirect: '/finance/wallet' },
    { path: '/finance/wallet', component: () => import('../pages/WalletPage.vue') },
    { path: '/finance/request-credit', component: () => import('../pages/RequestCreditPage.vue') },
    { path: '/finance/statement', component: () => import('../pages/StatementPage.vue') },

    // Agencies
    { path: '/agency/markup', component: () => import('../pages/MarkupPage.vue') },
    { path: '/agency/sub-agencies', component: () => import('../pages/SubAgenciesPage.vue') },
    { path: '/agency/users', component: () => import('../pages/UsersPage.vue') },
    { path: '/agency/settings', component: () => import('../pages/AgencySettingsPage.vue') },

    // Operations
    { path: '/bookings', redirect: '/operations/bookings' },
    { path: '/operations/bookings', component: () => import('../pages/BookingsPage.vue') },
    { path: '/operations/amendments', component: () => import('../pages/AmendmentsPage.vue') },

    // Account
    { path: '/account', component: () => import('../pages/AccountPage.vue') },
  ],
})

export default router
