<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { HOTELS } from '../config/hotelsData'

const route = useRoute()

// ── Search Parameter Bar ──────────────────────────────────
const destination = computed(() => (route.query.dest as string) || 'Istanbul')
const nightsCount = computed(() => Number(route.query.nights) || 14)
const datesText = computed(() => {
  if (route.query.from && route.query.to) {
    return `${route.query.from} – ${route.query.to} (${nightsCount.value} nights)`
  }
  return `12 Feb – 26 Feb (${nightsCount.value} nights)`
})
const guestsText = computed(() => (route.query.guests as string) || '6 adults, 2 rooms')

// ── Filters State ──────────────────────────────────────────
const filterQ = ref('')
const filterRef = ref(false)
const filterBoards = ref<Set<string>>(new Set())
const filterStars = ref<Set<number>>(new Set())
const filterMax = ref(3000)
const sortBy = ref<'s' | 'pa' | 'pd'>('s')
const resultsPerPage = ref(20)
const sideOpen = ref(false)

// ── Favorites & Expandable Rooms State ─────────────────────
const favs = ref<Set<string>>(new Set())
const openHotelName = ref<string | null>(null)

// ── Toast Notification State ───────────────────────────────
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2200)
}

function toggleFav(hotelName: string) {
  const next = new Set(favs.value)
  if (next.has(hotelName)) {
    next.delete(hotelName)
    showToast('Removed from favorites')
  } else {
    next.add(hotelName)
    showToast(`${hotelName} saved to favorites`)
  }
  favs.value = next
}

function toggleRooms(hotelName: string) {
  openHotelName.value = openHotelName.value === hotelName ? null : hotelName
}

function addBooking(label: string) {
  showToast(`Added to booking · ${label}`)
}

// ── Counts for filter badges ──────────────────────────────
const cRef = computed(() => HOTELS.filter(h => h.ref).length)
const cRo = computed(() => HOTELS.filter(h => h.board === 'Room only').length)
const cBf = computed(() => HOTELS.filter(h => h.board === 'Breakfast').length)

// ── Filtered & Sorted Hotels ──────────────────────────────
const filtered = computed(() => {
  const q = filterQ.value.trim().toLowerCase()
  let r = HOTELS.filter(h =>
    h.n.toLowerCase().includes(q) &&
    (!filterRef.value || h.ref) &&
    (!filterBoards.value.size || filterBoards.value.has(h.board)) &&
    (!filterStars.value.size || filterStars.value.has(h.s)) &&
    h.total <= filterMax.value
  )
  if (sortBy.value === 'pa') {
    r = [...r].sort((a, b) => a.total - b.total)
  } else if (sortBy.value === 'pd') {
    r = [...r].sort((a, b) => b.total - a.total)
  }
  return r
})

const lowestPrice = computed(() => {
  if (!filtered.value.length) return 0
  return Math.min(...filtered.value.map(h => h.total))
})

// ── Active Chips Data ─────────────────────────────────────
interface ActiveChip {
  key: string
  val: string | number
  label: string
}

const activeChips = computed<ActiveChip[]>(() => {
  const list: ActiveChip[] = []
  if (filterQ.value.trim()) {
    list.push({ key: 'q', val: filterQ.value, label: `“${filterQ.value.trim()}”` })
  }
  if (filterRef.value) {
    list.push({ key: 'ref', val: '', label: 'Refundable' })
  }
  filterBoards.value.forEach(b => {
    list.push({ key: 'b', val: b, label: b === 'Breakfast' ? 'Free breakfast' : b })
  })
  filterStars.value.forEach(s => {
    list.push({ key: 's', val: s, label: `${s} ★` })
  })
  if (filterMax.value < 3000) {
    list.push({ key: 'max', val: filterMax.value, label: `Up to ${filterMax.value.toLocaleString('en-US')} USD` })
  }
  return list
})

function removeChip(chip: ActiveChip) {
  if (chip.key === 'q') filterQ.value = ''
  else if (chip.key === 'ref') filterRef.value = false
  else if (chip.key === 'b') {
    const next = new Set(filterBoards.value)
    next.delete(String(chip.val))
    filterBoards.value = next
  } else if (chip.key === 's') {
    const next = new Set(filterStars.value)
    next.delete(Number(chip.val))
    filterStars.value = next
  } else if (chip.key === 'max') {
    filterMax.value = 3000
  }
}

function toggleBoard(board: string, checked: boolean) {
  const next = new Set(filterBoards.value)
  if (checked) next.add(board)
  else next.delete(board)
  filterBoards.value = next
}

function toggleStar(n: number) {
  const next = new Set(filterStars.value)
  if (next.has(n)) next.delete(n)
  else next.add(n)
  filterStars.value = next
}

function clearFilters() {
  filterQ.value = ''
  filterRef.value = false
  filterBoards.value = new Set()
  filterStars.value = new Set()
  filterMax.value = 3000
  sortBy.value = 's'
}

function money(v: number): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

function exportExcel() {
  showToast(`Exporting ${filtered.value.length} hotels to Excel...`)
}
</script>

<template>
  <div class="hotel-results-page">
    <!-- Search summary bar -->
    <section class="sum">
      <div class="wrap sum-wrap">
        <span class="dest">
          <svg class="i" viewBox="0 0 24 24">
            <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {{ destination }}
        </span>
        <span class="m">
          <svg class="i" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {{ datesText }}
        </span>
        <span class="m">
          <svg class="i" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          {{ guestsText }}
        </span>
        <RouterLink to="/hotels" class="btn primary sm sp">Modify search</RouterLink>
      </div>
    </section>

    <!-- Layout: Filters sidebar + Main results -->
    <div class="wrap page">
      <!-- Sidebar Filters -->
      <aside class="side" :class="{ open: sideOpen }" aria-label="Filters">
        <div class="fg">
          <h3>Hotel name</h3>
          <div class="search">
            <input
              v-model="filterQ"
              type="search"
              placeholder="Hotel name"
              aria-label="Hotel name"
            />
            <button type="button" aria-label="Search">
              <svg class="i" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </button>
          </div>
        </div>

        <div class="fg">
          <h3>Cancellation</h3>
          <label class="ck">
            <input type="checkbox" v-model="filterRef" />
            Refundable <span class="c">{{ cRef }}</span>
          </label>
        </div>

        <div class="fg">
          <h3>Board</h3>
          <label class="ck">
            <input
              type="checkbox"
              :checked="filterBoards.has('Room only')"
              @change="toggleBoard('Room only', ($event.target as HTMLInputElement).checked)"
            />
            Room only <span class="c">{{ cRo }}</span>
          </label>
          <label class="ck">
            <input
              type="checkbox"
              :checked="filterBoards.has('Breakfast')"
              @change="toggleBoard('Breakfast', ($event.target as HTMLInputElement).checked)"
            />
            Free breakfast <span class="c">{{ cBf }}</span>
          </label>
        </div>

        <div class="fg">
          <h3>Max total price</h3>
          <input
            type="range"
            min="1500"
            max="3000"
            step="50"
            v-model.number="filterMax"
            aria-label="Max total price"
          />
          <div class="pr">
            <span>1,500</span>
            <b><span>{{ filterMax.toLocaleString('en-US') }}</span> USD</b>
          </div>
        </div>

        <div class="fg">
          <h3>Category</h3>
          <div class="stbtns">
            <button
              v-for="n in [1, 2, 3, 4, 5]"
              :key="n"
              type="button"
              :aria-pressed="filterStars.has(n) ? 'true' : 'false'"
              :aria-label="`${n} star`"
              @click="toggleStar(n)"
            >
              {{ n }}
              <svg viewBox="0 0 24 24">
                <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z" />
              </svg>
            </button>
          </div>
        </div>

        <button type="button" class="clear" @click="clearFilters">Clear all filters</button>
      </aside>

      <!-- Main Results Area -->
      <main>
        <div class="bar">
          <span class="cnt">{{ filtered.length }} {{ filtered.length === 1 ? 'hotel' : 'hotels' }}</span>
          <a href="#" @click.prevent="exportExcel">Export to Excel</a>
          <span class="sp"></span>
          <label for="sort">Sort by</label>
          <select class="sel" id="sort" v-model="sortBy">
            <option value="s">Suggested</option>
            <option value="pa">Price: low to high</option>
            <option value="pd">Price: high to low</option>
          </select>
          <label for="per">Results</label>
          <select class="sel s" id="per" v-model="resultsPerPage">
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <button type="button" class="btn ghost mf" @click="sideOpen = !sideOpen">
            Filters
          </button>
          <button type="button" class="btn ghost" style="height:38px">
            Show map
          </button>
        </div>

        <!-- Filter Chips -->
        <div v-if="activeChips.length" class="chips">
          <button
            v-for="chip in activeChips"
            :key="chip.key + chip.val"
            type="button"
            class="chp"
            :aria-label="'Remove ' + chip.label"
            @click="removeChip(chip)"
          >
            {{ chip.label }}
            <svg class="i" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <!-- Hotels list -->
        <div class="list">
          <article
            class="card"
            v-for="(h, i) in filtered"
            :key="h.n"
            :class="{ open: openHotelName === h.n }"
            :style="{ '--i': i }"
          >
            <!-- Photo & Badges -->
            <div class="photo">
              <img :alt="h.n" :src="h.img" />
              <button
                type="button"
                class="fav"
                :aria-pressed="favs.has(h.n) ? 'true' : 'false'"
                :aria-label="'Save ' + h.n + ' to favorites'"
                @click.stop="toggleFav(h.n)"
              >
                <svg class="i" viewBox="0 0 24 24">
                  <path d="M12 20s-7-4.4-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.6-9 9-9 9z" />
                </svg>
              </button>
              <span v-if="h.total === lowestPrice && filtered.length > 1" class="rib">
                Lowest price
              </span>
            </div>

            <!-- Main Content -->
            <div class="main">
              <h2 class="title">
                <RouterLink to="/hotels/details" class="text-inherit hover:underline cursor-pointer">{{ h.n }}</RouterLink>
                <span class="stars">
                  <svg v-for="starIdx in h.s" :key="starIdx" viewBox="0 0 24 24">
                    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z" />
                  </svg>
                </span>
              </h2>

              <span class="room">
                <svg class="i" viewBox="0 0 24 24">
                  <path d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7M3 15h18M7 9V7a1 1 0 011-1h8a1 1 0 011 1v2" />
                </svg>
                {{ h.room }}
              </span>

              <ul class="amen">
                <li v-for="(a, idx) in h.am.split(' · ')" :key="idx">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {{ a[0].toUpperCase() + a.slice(1) }}
                </li>
              </ul>

              <div class="tags">
                <span class="tag t1">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M12 3l9 5-9 5-9-5z" />
                    <path d="M3 13l9 5 9-5" />
                  </svg>
                  {{ h.opts }} room options
                </span>

                <span v-if="h.board === 'Room only'" class="tag t2">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M7 3v8M4.5 3v4a2.5 2.5 0 005 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" />
                  </svg>
                  Room only
                </span>
                <span v-else class="tag t5">
                  <svg class="i" viewBox="0 0 24 24">
                    <path d="M4 8h13v6a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h2a2 2 0 010 4h-2M7 2v2M11 2v2" />
                  </svg>
                  Breakfast included
                </span>

                <span v-if="h.ref" class="seg">
                  <span class="a">
                    <svg class="i" viewBox="0 0 24 24">
                      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                      <path d="M8.5 12l2.5 2.5 4.5-5" />
                    </svg>
                    Refundable
                  </span>
                  <span class="b ar" dir="rtl">
                    <svg class="i" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
                    </svg>
                    إلغاء مجاني حتى 29 يناير
                  </span>
                </span>
              </div>
            </div>

            <!-- Pricing Sidebar -->
            <div class="cside">
              <div class="tl">
                <span class="ar">الإجمالي</span>
                <i>·</i>
                <span>{{ nightsCount }} nights</span>
              </div>
              <div class="price mono">
                {{ money(h.total) }}<small>USD</small>
              </div>
              <div class="pn mono">
                <b>{{ h.night }} USD</b> / night
              </div>
              <div class="fees">
                <svg class="i" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.7 2.7L16 9.5" />
                </svg>
                Taxes &amp; fees included
              </div>
              <div class="actions">
                <RouterLink to="/hotels/details" class="btn ghost">
                  Details
                </RouterLink>
                <button
                  type="button"
                  class="btn primary"
                  :aria-expanded="openHotelName === h.n ? 'true' : 'false'"
                  @click="toggleRooms(h.n)"
                >
                  {{ openHotelName === h.n ? 'Hide rooms' : 'View rooms' }}
                </button>
                <button type="button" class="btn ghost" @click="addBooking(h.n)">
                  Book
                </button>
              </div>
            </div>

            <!-- Expandable Rooms Drawer -->
            <div class="rooms">
              <div>
                <div class="rbox">
                  <div
                    v-for="(x, j) in h.rooms"
                    :key="j"
                    class="rrow"
                    :style="{ '--j': j }"
                  >
                    <div class="ri">
                      <svg class="i" viewBox="0 0 24 24">
                        <path d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7M3 15h18M7 9V7a1 1 0 011-1h8a1 1 0 011 1v2" />
                      </svg>
                    </div>
                    <div class="rn">
                      <b>{{ x[0] }}</b>
                      <div class="rm">
                        <span v-if="x[1] === 'Room only'" class="tag t2">
                          <svg class="i" viewBox="0 0 24 24">
                            <path d="M7 3v8M4.5 3v4a2.5 2.5 0 005 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" />
                          </svg>
                          Room only
                        </span>
                        <span v-else class="tag t5">
                          <svg class="i" viewBox="0 0 24 24">
                            <path d="M4 8h13v6a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h2a2 2 0 010 4h-2M7 2v2M11 2v2" />
                          </svg>
                          Breakfast included
                        </span>
                        <span class="rc">
                          <svg class="i" viewBox="0 0 24 24">
                            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                            <path d="M8.5 12l2.5 2.5 4.5-5" />
                          </svg>
                          Free cancellation until 29 Jan
                        </span>
                      </div>
                    </div>
                    <div class="rp">
                      <b class="mono">{{ money(x[2]) }}<small>USD</small></b>
                      <span>{{ Math.round(x[2] / nightsCount) }} USD / night</span>
                    </div>
                    <button type="button" class="btn primary" @click="addBooking(h.n + ' - ' + x[0])">
                      Book
                    </button>
                  </div>

                  <button v-if="h.opts > h.rooms.length" type="button" class="rmore">
                    + {{ h.opts - h.rooms.length }} more room options
                  </button>
                </div>
              </div>
            </div>
          </article>

          <!-- Empty state -->
          <div v-if="filtered.length === 0" class="empty">
            <b>No hotels match these filters</b>
            Try removing a filter or clearing them all.
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Notification -->
    <div class="toast" :class="{ on: toastVisible }" role="status" aria-live="polite">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.hotel-results-page {
  --page: #f7f8fa;
  --card: #fff;
  --line: #e4e7ec;
  --ink: #0f172a;
  --mute: #8791ab;
  --mute2: #9aa3b8;
  --sub: #475169;
  --chip-bg: #f5f7fb;
  --chip-line: #e6eaf2;
  --chip-ink: #2d3648;
  --btn: #5b81d0;
  --btn-ink: #fff;
  --btn-line: #5b81d0;
  --btn-soft: #e6effb;
  --t1-bg: #ebedfe;
  --t1-ink: #4a4fc9;
  --t2-bg: #f0f2f5;
  --t2-ink: #364152;
  --t3-bg: #e3f6ec;
  --t3-ink: #0d8a58;
  --t4-bg: #e6effb;
  --t4-ink: #1f66b3;
  --star: #f5b829;
  color-scheme: light;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--ink);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: radial-gradient(900px 320px at 50% -120px, #e2eafc, transparent 70%), var(--page);
  background-repeat: no-repeat;
}

.mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.ar {
  font-family: "Noto Sans Arabic", Inter, system-ui, sans-serif;
}

a {
  color: var(--btn);
  text-decoration: none;
}

button, input, select {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--btn);
  outline-offset: 2px;
}

.wrap {
  max-width: 1560px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

svg.i {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
}

/* search summary */
.sum {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(1.5) blur(14px);
  -webkit-backdrop-filter: saturate(1.5) blur(14px);
  border: 1px solid var(--line);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
}

.sum .sum-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 64px;
  flex-wrap: wrap;
  padding: 10px 16px;
}

.sum .dest {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.sum .dest svg {
  color: var(--btn);
  width: 18px;
  height: 18px;
}

.sum .m {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--sub);
  font-size: 13px;
  padding: 7px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
}

.sum .m svg {
  color: var(--btn);
}

.btn {
  appearance: none;
  font-size: 13.5px;
  font-weight: 600;
  height: 40px;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid var(--btn-line);
  transition: filter 0.15s, background 0.15s, transform 0.1s;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  background: linear-gradient(180deg, #6a8fdc, #5278c8);
  color: var(--btn-ink);
  box-shadow: 0 6px 14px -6px rgba(82, 120, 200, 0.75);
  border-color: #5278c8;
}

.btn.primary:hover {
  filter: brightness(1.07);
}

.btn.ghost {
  background: transparent;
  color: var(--btn);
}

.btn.ghost:hover {
  background: var(--btn-soft);
}

.btn.sm {
  height: 32px;
  font-size: 12.5px;
  padding: 0 12px;
}

.sum .sp {
  margin-left: auto;
}

/* layout */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 28px;
  padding-bottom: 40px;
}

.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 6px 0 14px;
}

.bar .cnt {
  font-size: 16px;
  font-weight: 700;
}

.bar .sp {
  margin-left: auto;
}

.bar label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sub);
}

.sel {
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 7px;
  min-width: 140px;
  cursor: pointer;
}

.sel.s {
  min-width: 68px;
}

.mf {
  display: none;
}

/* Filter chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: -4px 0 14px;
}

.chp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 9px 0 12px;
  border: 0;
  border-radius: 999px;
  background: #e6effb;
  color: #2f5fb5;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.chp:hover {
  background: #d7e5fa;
}

.chp svg {
  width: 13px;
  height: 13px;
}

/* filters sidebar */
.side {
  position: sticky;
  top: 96px;
  align-self: start;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 18px 16px;
}

.side h3 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
}

.fg {
  margin-bottom: 24px;
}

.search {
  display: flex;
  gap: 0;
}

.search input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 11px;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 7px 0 0 7px;
}

.search button {
  width: 40px;
  border: 1px solid var(--line);
  border-left: 0;
  background: var(--chip-bg);
  border-radius: 0 7px 7px 0;
  color: var(--mute);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ck {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  font-size: 13px;
  color: var(--sub);
  cursor: pointer;
}

.ck input {
  appearance: none;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1.5px solid var(--mute2);
  border-radius: 4px;
  background: var(--card);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.ck input:checked {
  background: var(--btn);
  border-color: var(--btn);
}

.ck input:checked::after {
  content: "";
  width: 9px;
  height: 5px;
  border: 2px solid #fff;
  border-top: 0;
  border-right: 0;
  transform: rotate(-45deg) translate(1px, -1px);
}

.ck span.c {
  margin-left: auto;
  color: var(--mute);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
}

input[type=range] {
  width: 100%;
  accent-color: var(--btn);
  margin: 4px 0 0;
}

.pr {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--mute);
  margin-top: 2px;
}

.pr b {
  color: var(--ink);
}

.stbtns {
  display: flex;
  gap: 6px;
}

.stbtns button {
  flex: 1;
  height: 36px;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 12.5px;
  cursor: pointer;
  color: var(--sub);
  transition: all 0.15s ease;
}

.stbtns button svg {
  width: 13px;
  height: 13px;
  fill: var(--star);
}

.stbtns button[aria-pressed="true"] {
  border-color: var(--btn);
  background: var(--btn-soft);
  color: var(--btn);
  font-weight: 600;
}

.clear {
  background: none;
  border: 0;
  color: var(--btn);
  cursor: pointer;
  padding: 0;
  font-size: 12.5px;
  font-weight: 600;
}

.clear:hover {
  text-decoration: underline;
}

/* result cards */
.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  min-height: 240px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.25s, border-color 0.25s;
  animation: up 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: calc(var(--i, 0) * 80ms);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px -10px rgba(40, 70, 140, 0.24);
  border-color: #cdd8ec;
}

.card.open {
  border-color: #c3d3f0;
}

@keyframes up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

.photo {
  position: relative;
  flex: 0 0 280px;
  min-height: 240px;
  background: var(--chip-bg);
  overflow: hidden;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.card:hover .photo img {
  transform: scale(1.06);
}

.fav {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, 0.94);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #475169;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s, background 0.15s;
  z-index: 2;
}

.fav:hover {
  transform: scale(1.1);
  background: #ffffff;
}

.fav svg {
  width: 18px;
  height: 18px;
}

.fav[aria-pressed="true"] {
  color: #e5484d;
}

.fav[aria-pressed="true"] svg {
  fill: currentColor;
  animation: pop 0.35s;
}

@keyframes pop {
  50% {
    transform: scale(1.4);
  }
}

.rib {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  background: #0d8a58;
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 8px rgba(13, 138, 88, 0.35);
  z-index: 2;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 22px 24px 20px 24px;
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.stars {
  display: flex;
  gap: 2px;
  color: var(--star);
}

.stars svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.room {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  align-self: flex-start;
  padding: 6px 12px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-line);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--chip-ink);
}

.room svg {
  stroke: var(--mute);
  width: 15px;
  height: 15px;
}

.amen {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--sub);
}

.amen li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.amen svg.i {
  width: 14px;
  height: 14px;
  stroke: #2fa36f;
  stroke-width: 2.2;
}

.tags {
  margin-top: auto;
  padding-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.tag svg.i, .seg svg.i {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.t1 {
  background: #eef0ff;
  border-color: #d9dcfb;
  color: #4247c4;
}

.t2 {
  background: #f1f3f7;
  border-color: #e0e4eb;
  color: #364152;
}

.t5 {
  background: #fff5e0;
  border-color: #f6e0b0;
  color: #9a5a06;
}

.seg {
  display: inline-flex;
  height: 30px;
  border: 1px solid #bfe6d2;
  border-radius: 8px;
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.seg > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
}

.seg .a {
  background: #d5f3e4;
  color: #0a7a50;
}

.seg .b {
  background: #effaf5;
  color: #0d8a58;
  border-left: 1px solid #bfe6d2;
}

.cside {
  flex: 0 0 240px;
  padding: 22px 22px 20px 24px;
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.tl {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sub);
  direction: ltr;
}

.tl i {
  font-style: normal;
  color: var(--mute2);
}

.price {
  margin-top: 6px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  white-space: nowrap;
  color: var(--ink);
}

.price small {
  font-size: 13px;
  font-weight: 700;
  color: var(--mute);
  letter-spacing: 0;
  margin-left: 5px;
}

.pn {
  margin-top: 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 6px 12px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-line);
  border-radius: 8px;
  font-size: 12px;
  color: var(--sub);
}

.pn b {
  font-size: 13.5px;
  color: var(--ink);
}

.fees {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mute);
}

.fees svg.i {
  width: 14px;
  height: 14px;
  stroke: #2fa36f;
}

.actions {
  margin-top: auto;
  padding-top: 18px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions .btn {
  height: 40px;
  font-size: 13.5px;
  font-weight: 600;
  padding: 0 16px;
  border-radius: 8px;
}

/* Expandable rooms */
.rooms {
  flex: 0 0 100%;
  width: 100%;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  background: linear-gradient(180deg, #f1f5fd, #f8f9fc);
  border-top: 1px solid transparent;
  overflow: hidden;
}

.card.open .rooms {
  grid-template-rows: 1fr;
  border-top-color: var(--line);
}

.rooms > div {
  overflow: hidden;
  min-height: 0;
}

.rbox {
  padding: 18px 24px 20px;
}

.rrow {
  display: grid;
  grid-template-columns: 42px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 12px 18px;
  margin-bottom: 10px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card.open .rrow {
  animation: up 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: calc(var(--j, 0) * 70ms);
}

.rrow:hover {
  border-color: #b9cbee;
  box-shadow: 0 6px 16px -8px rgba(60, 90, 160, 0.3);
}

.ri {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eaf0fc;
  color: var(--btn);
  display: grid;
  place-items: center;
}

.ri svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
}

.rn b {
  display: block;
  font-size: 14.5px;
  margin-bottom: 6px;
}

.rm {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 9px;
  align-items: center;
}

.rm .tag {
  height: 25px;
  font-size: 11.5px;
  padding: 0 9px;
}

.rm .tag svg.i {
  width: 13px;
  height: 13px;
}

.rc {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #0d8a58;
}

.rc svg {
  width: 13px;
  height: 13px;
}

.rp {
  text-align: right;
  white-space: nowrap;
}

.rp b {
  display: block;
  font-size: 18px;
  letter-spacing: -0.3px;
}

.rp b small {
  font-size: 11.5px;
  color: var(--mute);
  margin-left: 4px;
  letter-spacing: 0;
}

.rp span {
  font-size: 12px;
  color: var(--mute);
}

.rrow .btn {
  height: 38px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
}

.rmore {
  width: 100%;
  height: 38px;
  border: 1px dashed #b9cbee;
  border-radius: 8px;
  background: transparent;
  color: var(--btn);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.rmore:hover {
  background: #eaf0fc;
}

/* Toast */
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  transform: translate(-50%, 16px);
  opacity: 0;
  pointer-events: none;
  background: #0f172a;
  color: #fff;
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.4);
  transition: 0.3s;
  z-index: 40;
}

.toast.on {
  opacity: 1;
  transform: translate(-50%, 0);
}

.empty {
  background: var(--card);
  border: 1px dashed var(--line);
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  color: var(--sub);
}

.empty b {
  display: block;
  color: var(--ink);
  margin-bottom: 6px;
  font-size: 15px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

@media (max-width: 980px) {
  .page {
    grid-template-columns: 1fr;
  }
  .side {
    display: none;
    position: static;
  }
  .side.open {
    display: block;
  }
  .mf {
    display: inline-block;
  }
}

@media (max-width: 760px) {
  .wrap {
    padding: 0;
  }
  .sum .sp {
    margin-left: 0;
  }
  .card {
    flex-direction: column;
    flex-wrap: nowrap;
  }
  .photo {
    flex: 0 0 auto;
    height: 200px;
  }
  .main {
    padding: 16px 16px 4px;
  }
  .cside {
    flex: 0 0 auto;
    margin: 0;
    padding: 14px 16px 16px;
    border-left: 0;
    border-top: 1px solid var(--line);
    align-items: flex-start;
    text-align: left;
  }
  .actions {
    margin-top: 14px;
    flex-direction: row;
  }
  .actions .btn {
    flex: 1;
  }
  .tags {
    padding-top: 14px;
    padding-bottom: 6px;
  }
  .rooms {
    flex: 0 0 auto;
  }
  .rbox {
    padding: 14px 12px 16px;
  }
  .rrow {
    grid-template-columns: 44px 1fr;
    gap: 12px 14px;
  }
  .rp {
    grid-column: 1 / -1;
    text-align: left;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .rp b {
    display: inline;
  }
  .rrow .btn {
    grid-column: 1 / -1;
  }
}
</style>
