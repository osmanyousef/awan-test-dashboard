<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardKpiCard from '../components/dashboard/DashboardKpiCard.vue'
import BookingsDonutChart from '../components/dashboard/BookingsDonutChart.vue'
import NotificationsCard from '../components/dashboard/NotificationsCard.vue'
import StatusPill from '../components/StatusPill.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const activeTab = ref<'insight' | 'quotation'>('insight')

// ── Recent Bookings Data ───────────────────────────────────
interface RecentBookingItem {
  ref: string
  type: 'f' | 'h'
  customer: string
  route: string
  date: string
  amount: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

const recentBookingsList: RecentBookingItem[] = [
  { ref: 'WD-HA0571F', type: 'h', customer: 'yousefreg2003', route: 'Atlantis The Palm, Dubai', date: '27 Oct 2026', amount: 1460, status: 'Confirmed' },
  { ref: 'WD-H44D785', type: 'h', customer: 'yousefreg2003', route: 'Rixos Premium Dubai JBR', date: '27 Oct 2026', amount: 510, status: 'Confirmed' },
  { ref: 'WD-HFB0B39', type: 'f', customer: 'yousefreg2003', route: 'TIP → DXB (Round Trip)', date: '27 Oct 2026', amount: 2160, status: 'Confirmed' },
  { ref: 'WD-F192A02', type: 'f', customer: 'Al-Madar Travel', route: 'BEN → IST', date: '26 Oct 2026', amount: 890, status: 'Confirmed' },
  { ref: 'WD-H9938B1', type: 'h', customer: 'Sahara Tours', route: 'Four Seasons Hotel Cairo', date: '25 Oct 2026', amount: 1820, status: 'Pending' },
]

// ── Recent Quotations Data ─────────────────────────────────
interface RecentQuoteItem {
  id: string
  customer: string
  details: string
  validUntil: string
  amount: number
  status: 'Accepted' | 'Pending' | 'Cancelled'
}

const recentQuotesList: RecentQuoteItem[] = [
  { id: 'Q-1042', customer: 'Al-Madar Travel', details: 'TIP → IST · 2 adults', validUntil: '14 Nov 2026', amount: 890, status: 'Accepted' },
  { id: 'Q-1041', customer: 'Sahara Tours', details: 'Four Seasons Hotel Cairo · 3 nights', validUntil: '12 Nov 2026', amount: 1820, status: 'Pending' },
  { id: 'Q-1040', customer: 'Blue Sky Agency', details: 'CDG → SIN · 2 adults', validUntil: '10 Nov 2026', amount: 1680, status: 'Pending' },
  { id: 'Q-1039', customer: 'Apex Travel', details: 'Burj Al Arab, Dubai · 3 nights', validUntil: '02 Nov 2026', amount: 7200, status: 'Cancelled' },
  { id: 'Q-1038', customer: 'Global Tours', details: 'IST → AMS · 1 adult', validUntil: '30 Oct 2026', amount: 540, status: 'Accepted' },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function handleQuoteAction() {
  show('New quotation draft created.')
}
</script>

<template>
  <div class="relative w-full min-h-[calc(100vh-100px)] bg-transparent pb-16">
    <!-- Main Content Container -->
    <main class="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8">

      <!-- ══ Welcome Header & Quick Action CTAs ══ -->
      <div class="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 class="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight m-0">
            Welcome back
          </h1>
          <p class="text-xs sm:text-sm text-[#475169] mt-1 m-0">
            Saturday, 7 November 2026 · Awan Travel B2B Portal
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <RouterLink
            to="/flights"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-b from-[#6a8fdc] to-[#5278c8] hover:from-[#5b81d0] hover:to-[#4a70c0] text-white font-semibold text-xs sm:text-[13px] shadow-[0_8px_18px_-8px_rgba(82,120,200,0.85)] transition-all hover:-translate-y-0.5"
          >
            <span>✈</span>
            <span>New flight booking</span>
          </RouterLink>

          <RouterLink
            to="/hotels"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-[#d5dcea] hover:border-[#b7c6e6] text-[#0f172a] font-semibold text-xs sm:text-[13px] shadow-xs transition-all hover:-translate-y-0.5"
          >
            <span>🏨</span>
            <span>New hotel booking</span>
          </RouterLink>
        </div>
      </div>

      <!-- ══ Dual Tabs Switcher ══ -->
      <div class="inline-flex gap-1.5 p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-2xs mb-5 max-w-full overflow-x-auto">
        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 px-4 rounded-xl font-semibold text-xs sm:text-[13px] transition cursor-pointer whitespace-nowrap"
          :class="activeTab === 'insight'
            ? 'bg-[#1f2b45] text-white shadow-[0_8px_16px_-8px_rgba(31,43,69,0.7)]'
            : 'text-[#475169] hover:text-[#0f172a] hover:bg-black/5'"
          @click="activeTab = 'insight'"
        >
          <span>📊</span>
          <span>Booking Insight</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 px-4 rounded-xl font-semibold text-xs sm:text-[13px] transition cursor-pointer whitespace-nowrap"
          :class="activeTab === 'quotation'
            ? 'bg-[#1f2b45] text-white shadow-[0_8px_16px_-8px_rgba(31,43,69,0.7)]'
            : 'text-[#475169] hover:text-[#0f172a] hover:bg-black/5'"
          @click="activeTab = 'quotation'"
        >
          <span>📄</span>
          <span>Quotation Dashboard</span>
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 1: BOOKING INSIGHT                                 -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section v-if="activeTab === 'insight'" class="space-y-4 sm:space-y-5">

        <!-- 4 KPI Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <DashboardKpiCard
            title="Total bookings"
            value="19"
            sub="this month"
            icon-bg="#e6edfa"
            icon-color="#5b81d0"
          >
            <template #icon>📋</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Sales"
            :value="formatCurrency(29530)"
            sub="excluding cancelled"
            icon-bg="#e1f6ec"
            icon-color="#0d8a58"
          >
            <template #icon>💰</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Pending payments"
            :value="formatCurrency(4310)"
            sub="3 bookings awaiting"
            icon-bg="#fff2d1"
            icon-color="#b7791f"
          >
            <template #icon>🕐</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Upcoming departures"
            value="7"
            sub="in the next 7 days"
            icon-bg="#efe9ff"
            icon-color="#6a3fe0"
          >
            <template #icon>✈</template>
          </DashboardKpiCard>
        </div>

        <!-- 2-Column: Donut Chart + Notifications -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div class="lg:col-span-5">
            <BookingsDonutChart />
          </div>
          <div class="lg:col-span-7">
            <NotificationsCard />
          </div>
        </div>

        <!-- Recent Bookings Table Card -->
        <div class="bg-white rounded-2xl border border-[#e4e9f1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_34px_-22px_rgba(40,70,140,0.35)] overflow-hidden">
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-[#eef1f7]">
            <h3 class="text-sm sm:text-base font-bold text-[#0f172a] m-0">Recent bookings</h3>
            <RouterLink
              to="/operations/bookings"
              class="h-8 px-3 rounded-lg border border-[#d5dcea] hover:border-[#b7c6e6] bg-white text-xs font-semibold text-[#0f172a] flex items-center gap-1 transition"
            >
              <span>View all</span>
              <span>→</span>
            </RouterLink>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr class="bg-[#f3f6fb] text-[11px] font-bold uppercase tracking-wider text-[#475169] h-10 border-b border-[#eef1f7]">
                  <th class="ps-5">Ref</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Route / Property</th>
                  <th>Date</th>
                  <th class="text-end pe-5">Amount</th>
                  <th class="pe-5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#eef1f7]">
                <tr
                  v-for="b in recentBookingsList"
                  :key="b.ref"
                  class="h-14 hover:bg-[#f7f9fe] transition cursor-pointer text-xs sm:text-[13px] text-[#0f172a]"
                >
                  <td class="ps-5 font-mono font-bold text-[#0f172a]">
                    <RouterLink :to="`/operations/bookings?search=${b.ref}`" class="hover:underline hover:text-[#5b81d0]">
                      {{ b.ref }}
                    </RouterLink>
                  </td>
                  <td>
                    <span
                      class="inline-flex items-center gap-1.5 font-semibold text-xs"
                      :class="b.type === 'f' ? 'text-[#3b6fc4]' : 'text-[#b7791f]'"
                    >
                      <span class="w-6 h-6 rounded-md flex items-center justify-center text-xs" :class="b.type === 'f' ? 'bg-[#e3eefd]' : 'bg-[#fff0cf]'">
                        {{ b.type === 'f' ? '✈' : '🏨' }}
                      </span>
                      <span>{{ b.type === 'f' ? 'Flight' : 'Hotel' }}</span>
                    </span>
                  </td>
                  <td class="font-medium text-[#3d4a66]">{{ b.customer }}</td>
                  <td class="font-medium text-[#0f172a]">{{ b.route }}</td>
                  <td class="text-[#8791ab]">{{ b.date }}</td>
                  <td class="text-end pe-5 font-mono font-bold text-[#0f172a]">
                    {{ formatCurrency(b.amount) }}
                  </td>
                  <td class="pe-5">
                    <StatusPill :status="b.status" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 2: QUOTATION DASHBOARD                             -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section v-else class="space-y-4 sm:space-y-5">

        <!-- 4 Quotation KPI Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <DashboardKpiCard
            title="Quotes sent"
            value="24"
            sub="this month"
            icon-bg="#efe9ff"
            icon-color="#6a3fe0"
          >
            <template #icon>📄</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Accepted"
            value="9"
            sub="38% conversion"
            icon-bg="#e1f6ec"
            icon-color="#0d8a58"
            :progress="38"
          >
            <template #icon>✓</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Awaiting reply"
            value="11"
            sub="average 2 days"
            icon-bg="#fff2d1"
            icon-color="#b7791f"
          >
            <template #icon>🕐</template>
          </DashboardKpiCard>

          <DashboardKpiCard
            title="Expired"
            value="4"
            sub="need a follow-up"
            icon-bg="#fde8e8"
            icon-color="#c0362c"
          >
            <template #icon>⚠️</template>
          </DashboardKpiCard>
        </div>

        <!-- Recent Quotations Table Card -->
        <div class="bg-white rounded-2xl border border-[#e4e9f1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_34px_-22px_rgba(40,70,140,0.35)] overflow-hidden">
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-[#eef1f7]">
            <h3 class="text-sm sm:text-base font-bold text-[#0f172a] m-0">Recent quotations</h3>
            <button
              type="button"
              class="h-8 px-3 rounded-lg bg-gradient-to-b from-[#6a8fdc] to-[#5278c8] hover:from-[#5b81d0] text-white text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
              @click="handleQuoteAction"
            >
              <span>+</span>
              <span>New quotation</span>
            </button>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr class="bg-[#f3f6fb] text-[11px] font-bold uppercase tracking-wider text-[#475169] h-10 border-b border-[#eef1f7]">
                  <th class="ps-5">Quote</th>
                  <th>Customer</th>
                  <th>Details</th>
                  <th>Valid until</th>
                  <th class="text-end pe-5">Amount</th>
                  <th class="pe-5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#eef1f7]">
                <tr
                  v-for="q in recentQuotesList"
                  :key="q.id"
                  class="h-14 hover:bg-[#f7f9fe] transition cursor-pointer text-xs sm:text-[13px] text-[#0f172a]"
                >
                  <td class="ps-5 font-mono font-bold text-[#0f172a]">
                    {{ q.id }}
                  </td>
                  <td class="font-medium text-[#3d4a66]">{{ q.customer }}</td>
                  <td class="font-medium text-[#0f172a]">{{ q.details }}</td>
                  <td class="text-[#8791ab]">{{ q.validUntil }}</td>
                  <td class="text-end pe-5 font-mono font-bold text-[#0f172a]">
                    {{ formatCurrency(q.amount) }}
                  </td>
                  <td class="pe-5">
                    <StatusPill :status="q.status" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>

    </main>
  </div>
</template>
