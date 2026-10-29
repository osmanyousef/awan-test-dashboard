// src/config/nav.ts

export interface NavChild {
  label: string
  to: string
  icon?: string
}

export interface NavGroup {
  sectionTitle?: string
  collapsible?: boolean
  items: {
    label: string
    to: string
    icon: string
  }[]
}

export const navSections: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
      { label: 'My Account', to: '/account', icon: 'account' },
      { label: 'Flight Search', to: '/flights', icon: 'flight' },
      { label: 'Hotel Search', to: '/hotels', icon: 'hotel' },
    ],
  },
  {
    sectionTitle: 'OPERATIONS',
    collapsible: true,
    items: [
      { label: 'Bookings', to: '/operations/bookings', icon: 'calendar' },
      { label: 'Amendment Requests', to: '/operations/amendments', icon: 'edit' },
    ],
  },
  {
    sectionTitle: 'FINANCE',
    collapsible: true,
    items: [
      { label: 'Wallet', to: '/finance/wallet', icon: 'wallet' },
      { label: 'Request Credit', to: '/finance/request-credit', icon: 'credit-card' },
      { label: 'Account Statement', to: '/finance/statement', icon: 'statement' },
    ],
  },
  {
    sectionTitle: 'AGENCIES',
    collapsible: true,
    items: [
      { label: 'Markup Rules', to: '/agency/markup', icon: 'percent' },
      { label: 'Sub-Agencies', to: '/agency/sub-agencies', icon: 'agency' },
      { label: 'Users', to: '/agency/users', icon: 'users' },
      { label: 'Agency Settings', to: '/agency/settings', icon: 'settings' },
    ],
  },
]
