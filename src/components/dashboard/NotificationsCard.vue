<script setup lang="ts">
import { ref, computed } from 'vue'

interface NotificationItem {
  id: number
  icon: string
  bg: string
  color: string
  title: string
  desc: string
  time: string
  unread: boolean
}

const notifications = ref<NotificationItem[]>([
  { id: 1, icon: '✓', bg: '#e1f6ec', color: '#0d8a58', title: 'Ticket issued', desc: 'WD-HFB0B39 · TIP → DXB · Round trip', time: '2 min ago', unread: true },
  { id: 2, icon: '⚠️', bg: '#ffe9e6', color: '#d4473d', title: 'Ticketing deadline in 3 hours', desc: 'PNR R3QZ9N · BEN → IST', time: '25 min ago', unread: true },
  { id: 3, icon: '💳', bg: '#fff2d1', color: '#b7791f', title: 'Payment pending', desc: 'WD-H9938B1 · Four Seasons Hotel Cairo · $1,820', time: '1 h ago', unread: true },
  { id: 4, icon: '📄', bg: '#efe9ff', color: '#6a3fe0', title: 'Quotation accepted', desc: 'Q-1042 · Al-Madar Travel accepted your quote', time: '3 h ago', unread: false },
  { id: 5, icon: '🕐', bg: '#e3eefd', color: '#3b6fc4', title: 'Schedule change', desc: 'QR 1400 now departs 15 min later · PNR K7XP2M', time: 'Yesterday', unread: false },
  { id: 6, icon: '↩', bg: '#e1f6ec', color: '#0d8a58', title: 'Refund processed', desc: 'WD-F5C310 · $430 returned to your balance', time: 'Yesterday', unread: false },
])

const filter = ref<'all' | 'unread'>('all')

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)

const filteredList = computed(() => {
  if (filter.value === 'unread') {
    return notifications.value.filter(n => n.unread)
  }
  return notifications.value
})

function markAsRead(id: number) {
  const item = notifications.value.find(n => n.id === id)
  if (item) item.unread = false
}

function markAllRead() {
  notifications.value.forEach(n => { n.unread = false })
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e4e9f1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_34px_-22px_rgba(40,70,140,0.35)] overflow-hidden flex flex-col justify-between">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 sm:p-5 border-b border-[#eef1f7] flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-[#eaf0fc] text-[#5b81d0] flex items-center justify-center text-sm font-bold">
          🔔
        </span>
        <h3 class="text-sm sm:text-base font-bold text-[#0f172a] m-0">Notifications</h3>
        <span
          v-if="unreadCount > 0"
          class="min-w-[20px] h-5 px-1.5 rounded-full bg-[#ff6b5e] text-white text-[11px] font-bold flex items-center justify-center leading-none"
        >
          {{ unreadCount }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 bg-[#f4f6fb] p-0.5 rounded-lg text-xs">
          <button
            type="button"
            class="px-2.5 py-1 rounded-md font-semibold transition"
            :class="filter === 'all' ? 'bg-[#1f2b45] text-white shadow-xs' : 'text-[#475169] hover:text-[#0f172a]'"
            @click="filter = 'all'"
          >
            All
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md font-semibold transition"
            :class="filter === 'unread' ? 'bg-[#1f2b45] text-white shadow-xs' : 'text-[#475169] hover:text-[#0f172a]'"
            @click="filter = 'unread'"
          >
            Unread
          </button>
        </div>

        <!-- Mark all read -->
        <button
          type="button"
          class="text-xs font-semibold text-[#5b81d0] hover:underline cursor-pointer bg-transparent border-0 p-0"
          @click="markAllRead"
        >
          Mark all read
        </button>
      </div>
    </div>

    <!-- Notification Items List -->
    <div class="divide-y divide-[#f0f3f8] max-h-[340px] overflow-y-auto">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="flex items-start gap-3 p-3.5 sm:px-5 hover:bg-[#f7f9fe] transition cursor-pointer relative"
        :class="{ 'bg-blue-50/20': item.unread }"
        @click="markAsRead(item.id)"
      >
        <!-- Unread Blue Dot -->
        <span
          v-if="item.unread"
          class="absolute start-2 top-5 w-2 h-2 rounded-full bg-[#5b81d0]"
        ></span>

        <!-- Icon -->
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
          :style="{ backgroundColor: item.bg, color: item.color }"
        >
          {{ item.icon }}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <b class="text-[13px] text-[#0f172a] block" :class="{ 'font-bold': item.unread, 'font-semibold': !item.unread }">
            {{ item.title }}
          </b>
          <p class="text-xs text-[#475169] m-0 mt-0.5 truncate">
            {{ item.desc }}
          </p>
        </div>

        <!-- Time -->
        <small class="text-[11.5px] text-[#8791ab] whitespace-nowrap shrink-0 pt-0.5">
          {{ item.time }}
        </small>
      </div>

      <div v-if="filteredList.length === 0" class="p-8 text-center text-xs text-[#8791ab]">
        You are all caught up 🎉
      </div>
    </div>
  </div>
</template>

