// src/config/mockData.ts

export interface Airport {
  code: string
  name: string
  city: string
  country: string
  type: 'airport' | 'city' | 'metro'
}

export const airports: Airport[] = [
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', type: 'airport' },
  { code: 'TIP', name: 'Mitiga International Airport', city: 'Tripoli', country: 'Libya', type: 'airport' },
  { code: 'BEN', name: 'Benina International Airport', city: 'Benghazi', country: 'Libya', type: 'airport' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', type: 'airport' },
  { code: 'TUN', name: 'Tunis-Carthage Airport', city: 'Tunis', country: 'Tunisia', type: 'airport' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', type: 'airport' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', type: 'airport' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', type: 'airport' },
  { code: 'FCO', name: 'Leonardo da Vinci Airport', city: 'Rome', country: 'Italy', type: 'airport' },
  { code: 'MJI', name: 'Mitiga Airport', city: 'Tripoli', country: 'Libya', type: 'airport' },
]

export interface HotelDestination {
  id: string
  name: string
  type: 'city' | 'country' | 'hotel' | 'landmark' | 'district'
  subtitle: string
}

export const hotelDestinations: HotelDestination[] = [
  { id: 'dubai', name: 'Dubai', type: 'city', subtitle: 'United Arab Emirates' },
  { id: 'tripoli', name: 'Tripoli', type: 'city', subtitle: 'Libya' },
  { id: 'istanbul', name: 'Istanbul', type: 'city', subtitle: 'Turkey' },
  { id: 'cairo', name: 'Cairo', type: 'city', subtitle: 'Egypt' },
  { id: 'tunis', name: 'Tunis', type: 'city', subtitle: 'Tunisia' },
  { id: 'london', name: 'London', type: 'city', subtitle: 'United Kingdom' },
  { id: 'paris', name: 'Paris', type: 'city', subtitle: 'France' },
  { id: 'atlantis', name: 'Atlantis The Palm', type: 'hotel', subtitle: 'Palm Jumeirah, Dubai' },
  { id: 'burj-al-arab', name: 'Burj Al Arab', type: 'hotel', subtitle: 'Dubai, UAE' },
  { id: 'rixos', name: 'Rixos Premium Dubai JBR', type: 'hotel', subtitle: 'The Walk, JBR, Dubai' },
]

export interface Booking {
  id: string
  ref: string
  type: 'Flight' | 'Hotel'
  customer: string
  route: string
  date: string
  amount: number
  currency: string
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Amended'
}

export const recentBookings: Booking[] = [
  {
    id: '1',
    ref: 'WD-HA0571F',
    type: 'Hotel',
    customer: 'yousefreg2003',
    route: 'Atlantis The Palm, Dubai',
    date: '27 Oct 2026, 21:00',
    amount: 1460.00,
    currency: 'LYD',
    status: 'Confirmed',
  },
  {
    id: '2',
    ref: 'WD-H44D785',
    type: 'Hotel',
    customer: 'yousefreg2003',
    route: 'Rixos Premium Dubai JBR',
    date: '27 Oct 2026, 20:41',
    amount: 510.00,
    currency: 'LYD',
    status: 'Confirmed',
  },
  {
    id: '3',
    ref: 'WD-HFB0B39',
    type: 'Flight',
    customer: 'yousefreg2003',
    route: 'TIP → DXB (Round Trip)',
    date: '27 Oct 2026, 20:40',
    amount: 2160.00,
    currency: 'LYD',
    status: 'Confirmed',
  },
  {
    id: '4',
    ref: 'WD-F192A02',
    type: 'Flight',
    customer: 'Al-Madar Travel',
    route: 'BEN → IST',
    date: '26 Oct 2026, 18:15',
    amount: 890.00,
    currency: 'LYD',
    status: 'Confirmed',
  },
  {
    id: '5',
    ref: 'WD-H9938B1',
    type: 'Hotel',
    customer: 'Sahara Tours',
    route: 'Four Seasons Hotel Cairo',
    date: '25 Oct 2026, 14:20',
    amount: 1820.00,
    currency: 'LYD',
    status: 'Pending',
  },
]

export const currentUser = {
  name: 'yousefreg2003',
  email: 'yousefreg2003@gmail.com',
  role: 'TENANT_ADMIN',
  avatar: 'Y',
}

export const dashboardStats = {
  walletBalance: 88823.24,
  currency: 'LYD',
  totalBookings: 11,
  todaysSales: 16905.44,
  todaysBookingsCount: 11,
  commissions: 0.00,
  profitFromAgents: 0.00,
}

export const walletTransactions = [
  { id: 'W001', date: '2026-10-27', description: 'Booking WD-HA0571F Atlantis The Palm', amount: -1460.00, balance: 88823.24, currency: 'LYD', type: 'debit' },
  { id: 'W002', date: '2026-10-27', description: 'Booking WD-H44D785 Rixos Premium', amount: -510.00, balance: 90283.24, currency: 'LYD', type: 'debit' },
  { id: 'W003', date: '2026-10-27', description: 'Booking WD-HFB0B39 Flight TIP-DXB', amount: -2160.00, balance: 90793.24, currency: 'LYD', type: 'debit' },
  { id: 'W004', date: '2026-10-25', description: 'Direct Credit Deposit / Top-up', amount: 25000.00, balance: 92953.24, currency: 'LYD', type: 'credit' },
  { id: 'W005', date: '2026-10-20', description: 'Account settlement & commission', amount: 12400.00, balance: 67953.24, currency: 'LYD', type: 'credit' },
]
