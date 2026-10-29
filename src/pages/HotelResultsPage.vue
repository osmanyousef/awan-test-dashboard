<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ── Search Parameter Bar ──────────────────────────────────
const destination = computed(() => (route.query.dest as string) || 'Istanbul')
const nightsCount = computed(() => Number(route.query.nights) || 3)
const datesText = computed(() => `03 Nov - 06 Nov (${nightsCount.value} nights)`)
const guestsText = computed(() => (route.query.guests as string) || '2 adults, 1 room')

// ── AI Destination Summary ────────────────────────────────
const showAiSummary = ref(true)

// ── Filters State ──────────────────────────────────────────
const hotelNameSearch = ref('')
const selectedTopProducts = ref<string[]>([])
const selectedBoards = ref<string[]>([])
const selectedStars = ref<number[]>([4, 5])
const selectedZone = ref<string[]>([])

// ── Sort & View ────────────────────────────────────────────
const sortBy = ref<'suggested' | 'price-asc' | 'price-desc' | 'rating'>('suggested')
const resultsPerPage = ref(20)
const showMapModal = ref(false)

// ── Wishlist State ─────────────────────────────────────────
const favorites = ref<number[]>([2]) // Hotel id 2 favorited by default
function toggleFavorite(id: number) {
  const idx = favorites.value.indexOf(id)
  if (idx > -1) favorites.value.splice(idx, 1)
  else favorites.value.push(id)
}

// ── Expanded Room Selection ────────────────────────────────
const expandedHotelId = ref<number | null>(null)
function toggleRooms(id: number) {
  expandedHotelId.value = expandedHotelId.value === id ? null : id
}

// ── Mock Hotels Data (Stylized for Awan Travel OTA) ────────
interface RoomRate {
  id: string
  name: string
  board: string
  cancellation: string
  isFreeCancellation: boolean
  pricePerNight: number
  totalPrice: number
  currency: string
  availableRooms: number
}

interface HotelResult {
  id: number
  name: string
  stars: number
  location: string
  zone: string
  image: string
  badge?: string
  tags: string[]
  amenities: { icon: string; label: string }[]
  reviewScore: number
  reviewCount: number
  reviewText: string
  featuredRoom: RoomRate
  rooms: RoomRate[]
}

const hotels = ref<HotelResult[]>([
  {
    id: 1,
    name: 'Sura Hagia Sophia Hotel',
    stars: 5,
    location: 'Sultanahmet / Old City, Istanbul',
    zone: 'Sultanahmet',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80',
    badge: 'LUXURY COLLECTION',
    tags: ['Most popular', 'Preferred Partner', 'Contracted Rate'],
    amenities: [
      { icon: '🅿️', label: 'Parking' },
      { icon: '❄️', label: 'Air conditioned' },
      { icon: '♨️', label: 'Luxury Spa' },
      { icon: '🍴', label: 'Fine Dining' },
      { icon: '🏋️', label: 'Fitness Center' },
      { icon: '📶', label: 'Free Wi-Fi' },
    ],
    reviewScore: 4.8,
    reviewCount: 1671,
    reviewText: 'Exceptional',
    featuredRoom: {
      id: 'r1',
      name: 'Deluxe Queen Room with Historic View',
      board: 'Room Only (RO)',
      cancellation: 'Free cancellation until 01 Nov',
      isFreeCancellation: true,
      pricePerNight: 260.00,
      totalPrice: 780.00,
      currency: 'LYD',
      availableRooms: 3,
    },
    rooms: [
      {
        id: 'r1',
        name: 'Deluxe Queen Room with Historic View',
        board: 'Room Only (RO)',
        cancellation: 'Free cancellation until 01 Nov',
        isFreeCancellation: true,
        pricePerNight: 260.00,
        totalPrice: 780.00,
        currency: 'LYD',
        availableRooms: 3,
      },
      {
        id: 'r2',
        name: 'Deluxe King Room with Balcony',
        board: 'Buffet Breakfast Included (BB)',
        cancellation: 'Free cancellation until 01 Nov',
        isFreeCancellation: true,
        pricePerNight: 310.00,
        totalPrice: 930.00,
        currency: 'LYD',
        availableRooms: 2,
      },
      {
        id: 'r3',
        name: 'Hagia Sophia Suite with Terrace',
        board: 'Half Board (HB)',
        cancellation: 'Non-refundable (Instant Voucher)',
        isFreeCancellation: false,
        pricePerNight: 480.00,
        totalPrice: 1440.00,
        currency: 'LYD',
        availableRooms: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Legacy Ottoman Hotel Istanbul',
    stars: 5,
    location: 'Sirkeci / Eminonu, Istanbul',
    zone: 'Eminonu',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=700&q=80',
    badge: 'LUXURY COLLECTION',
    tags: ['Best Seller', 'Preferred Partner', 'Special Promotion -20%'],
    amenities: [
      { icon: '🅿️', label: 'Valet Parking' },
      { icon: '❄️', label: 'Climate Control' },
      { icon: '♨️', label: 'Ottoman Hammam & Spa' },
      { icon: '🍴', label: 'Rooftop Lounge' },
      { icon: '🏊‍♂️', label: 'Indoor Pool' },
      { icon: '📶', label: 'High-speed Wi-Fi' },
    ],
    reviewScore: 4.6,
    reviewCount: 1097,
    reviewText: 'Very Good',
    featuredRoom: {
      id: 'r4',
      name: 'Superior Double Room with Bosphorus View',
      board: 'Breakfast Included (BB)',
      cancellation: 'Non-refundable (Promo Rate)',
      isFreeCancellation: false,
      pricePerNight: 295.00,
      totalPrice: 885.00,
      currency: 'LYD',
      availableRooms: 4,
    },
    rooms: [
      {
        id: 'r4',
        name: 'Superior Double Room with Bosphorus View',
        board: 'Breakfast Included (BB)',
        cancellation: 'Non-refundable (Promo Rate)',
        isFreeCancellation: false,
        pricePerNight: 295.00,
        totalPrice: 885.00,
        currency: 'LYD',
        availableRooms: 4,
      },
      {
        id: 'r5',
        name: 'Grand Ottoman Heritage Suite',
        board: 'Full Board Included (FB)',
        cancellation: 'Free cancellation until 02 Nov',
        isFreeCancellation: true,
        pricePerNight: 460.00,
        totalPrice: 1380.00,
        currency: 'LYD',
        availableRooms: 2,
      },
    ],
  },
  {
    id: 3,
    name: 'Great Fortune Hotel & Spa',
    stars: 4,
    location: 'Old City Center, Istanbul',
    zone: 'Sultanahmet',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80',
    badge: 'TOP VALUE B2B',
    tags: ['Most Popular', 'Free Airport Shuttle'],
    amenities: [
      { icon: '❄️', label: 'Air conditioning' },
      { icon: '♨️', label: 'Turkish Bath & Spa' },
      { icon: '🍴', label: 'Restaurant' },
      { icon: '📶', label: 'Free Wi-Fi' },
      { icon: '🛏️', label: 'Soundproof Rooms' },
    ],
    reviewScore: 4.5,
    reviewCount: 1032,
    reviewText: 'Very Good',
    featuredRoom: {
      id: 'r6',
      name: 'Standard Double or Twin Room',
      board: 'Breakfast Included (BB)',
      cancellation: 'Free cancellation until 31 Oct',
      isFreeCancellation: true,
      pricePerNight: 187.00,
      totalPrice: 561.00,
      currency: 'LYD',
      availableRooms: 5,
    },
    rooms: [
      {
        id: 'r6',
        name: 'Standard Double or Twin Room',
        board: 'Breakfast Included (BB)',
        cancellation: 'Free cancellation until 31 Oct',
        isFreeCancellation: true,
        pricePerNight: 187.00,
        totalPrice: 561.00,
        currency: 'LYD',
        availableRooms: 5,
      },
      {
        id: 'r7',
        name: 'Executive Family Connecting Room',
        board: 'Breakfast Included (BB)',
        cancellation: 'Free cancellation until 01 Nov',
        isFreeCancellation: true,
        pricePerNight: 290.00,
        totalPrice: 870.00,
        currency: 'LYD',
        availableRooms: 2,
      },
    ],
  },
  {
    id: 4,
    name: 'Golden Crown Hotel Old Town',
    stars: 4,
    location: 'Cemberlitas, Istanbul',
    zone: 'Fatih',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80',
    tags: ['Preferred Partner', 'Instant Confirmation'],
    amenities: [
      { icon: '🅿️', label: 'Parking' },
      { icon: '🍴', label: 'Buffet Restaurant' },
      { icon: '📶', label: 'Wi-Fi 6' },
      { icon: '☕', label: 'Coffee Station' },
    ],
    reviewScore: 4.4,
    reviewCount: 846,
    reviewText: 'Good',
    featuredRoom: {
      id: 'r8',
      name: 'Standard Double Room',
      board: 'Breakfast Included (BB)',
      cancellation: 'Free cancellation until 31 Oct',
      isFreeCancellation: true,
      pricePerNight: 206.00,
      totalPrice: 618.00,
      currency: 'LYD',
      availableRooms: 6,
    },
    rooms: [
      {
        id: 'r8',
        name: 'Standard Double Room',
        board: 'Breakfast Included (BB)',
        cancellation: 'Free cancellation until 31 Oct',
        isFreeCancellation: true,
        pricePerNight: 206.00,
        totalPrice: 618.00,
        currency: 'LYD',
        availableRooms: 6,
      },
    ],
  },
])

// ── Filter Computations ────────────────────────────────────
const filteredHotels = computed(() => {
  return hotels.value.filter(h => {
    // Hotel Name filter
    if (hotelNameSearch.value && !h.name.toLowerCase().includes(hotelNameSearch.value.toLowerCase())) {
      return false
    }
    // Star filter
    if (selectedStars.value.length > 0 && !selectedStars.value.includes(h.stars)) {
      return false
    }
    // Zone filter
    if (selectedZone.value.length > 0 && !selectedZone.value.includes(h.zone)) {
      return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy.value === 'price-asc') return a.featuredRoom.totalPrice - b.featuredRoom.totalPrice
    if (sortBy.value === 'price-desc') return b.featuredRoom.totalPrice - a.featuredRoom.totalPrice
    if (sortBy.value === 'rating') return b.reviewScore - a.reviewScore
    return 0 // default suggested
  })
})

function toggleStarFilter(star: number) {
  const idx = selectedStars.value.indexOf(star)
  if (idx > -1) selectedStars.value.splice(idx, 1)
  else selectedStars.value.push(star)
}

function toggleZoneFilter(zone: string) {
  const idx = selectedZone.value.indexOf(zone)
  if (idx > -1) selectedZone.value.splice(idx, 1)
  else selectedZone.value.push(zone)
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
</script>

<template>
  <div class="results-page">

    <!-- ── Top Search Modifier Bar (Sticky subheader) ──────── -->
    <div class="search-summary-bar">
      <div class="summary-left">
        <div class="summary-pill">
          <span class="dest-strong">{{ destination }}</span>
        </div>
        <div class="summary-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ datesText }}</span>
        </div>
        <div class="summary-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{{ guestsText }}</span>
        </div>
        <RouterLink to="/hotels" class="modify-btn">
          Modify search
        </RouterLink>
      </div>

      <div class="summary-right">
        <!-- AI Destination Assistant Chip (Awan Brand Touch) -->
        <button class="ai-assistant-btn" @click="showAiSummary = !showAiSummary">
          <span class="sparkle-icon">✨</span>
          <span>AI Destination Assistant</span>
        </button>
      </div>
    </div>

    <!-- ── Main Results Viewport (Sidebar + Results) ───────── -->
    <div class="results-layout">

      <!-- ── Left Filters Sidebar ────────────────────────────── -->
      <aside class="filters-sidebar">
        <!-- Hotel Count Header in Sidebar -->
        <div class="sidebar-header">
          <span class="hotels-count">{{ filteredHotels.length }} Hotels</span>
          <button class="export-excel-link" title="Export list to Excel">Export to Excel</button>
        </div>

        <!-- Filter 1: Search by Name -->
        <div class="filter-box">
          <h4 class="filter-title">Hotel Name</h4>
          <div class="search-input-wrap">
            <input
              type="text"
              v-model="hotelNameSearch"
              placeholder="Search hotel name..."
              class="filter-input"
            />
            <button class="filter-search-icon-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter 2: Top Products -->
        <div class="filter-box">
          <h4 class="filter-title">Top product</h4>
          <div class="checkbox-list">
            <label class="check-item">
              <input type="checkbox" value="luxury" v-model="selectedTopProducts" />
              <span class="check-label">Luxury Collection</span>
              <span class="check-count">157</span>
            </label>
            <label class="check-item">
              <input type="checkbox" value="popular" v-model="selectedTopProducts" />
              <span class="check-label">Most popular</span>
              <span class="check-count">61</span>
            </label>
            <label class="check-item">
              <input type="checkbox" value="preferred" v-model="selectedTopProducts" />
              <span class="check-label">Preferred Partner</span>
              <span class="check-count">122</span>
            </label>
          </div>
        </div>

        <!-- Filter 3: Board Basis -->
        <div class="filter-box">
          <h4 class="filter-title">Board Basis</h4>
          <div class="checkbox-list">
            <label class="check-item">
              <input type="checkbox" value="ai" v-model="selectedBoards" />
              <span class="check-label">All inclusive</span>
              <span class="check-count">12</span>
            </label>
            <label class="check-item">
              <input type="checkbox" value="hb" v-model="selectedBoards" />
              <span class="check-label">Half board</span>
              <span class="check-count">105</span>
            </label>
            <label class="check-item">
              <input type="checkbox" value="bb" v-model="selectedBoards" />
              <span class="check-label">Breakfast included</span>
              <span class="check-count">1,376</span>
            </label>
            <label class="check-item">
              <input type="checkbox" value="ro" v-model="selectedBoards" />
              <span class="check-label">Room only</span>
              <span class="check-count">420</span>
            </label>
          </div>
        </div>

        <!-- Filter 4: Category (Star Rating) -->
        <div class="filter-box">
          <h4 class="filter-title">Category</h4>
          <div class="star-rating-buttons">
            <button
              v-for="s in [1, 2, 3, 4, 5]"
              :key="s"
              class="star-toggle-btn"
              :class="{ 'star-toggle-btn--active': selectedStars.includes(s) }"
              @click="toggleStarFilter(s)"
            >
              {{ s }} ★
            </button>
          </div>
        </div>

        <!-- Filter 5: Zone / Area -->
        <div class="filter-box">
          <h4 class="filter-title">Zone / Area</h4>
          <div class="checkbox-list">
            <label class="check-item">
              <input type="checkbox" :checked="selectedZone.includes('Sultanahmet')" @change="toggleZoneFilter('Sultanahmet')" />
              <span class="check-label">Sultanahmet (Old City)</span>
              <span class="check-count">142</span>
            </label>
            <label class="check-item">
              <input type="checkbox" :checked="selectedZone.includes('Taksim')" @change="toggleZoneFilter('Taksim')" />
              <span class="check-label">Taksim / Beyoglu</span>
              <span class="check-count">210</span>
            </label>
            <label class="check-item">
              <input type="checkbox" :checked="selectedZone.includes('Eminonu')" @change="toggleZoneFilter('Eminonu')" />
              <span class="check-label">Eminonu / Sirkeci</span>
              <span class="check-count">65</span>
            </label>
            <label class="check-item">
              <input type="checkbox" :checked="selectedZone.includes('Besiktas')" @change="toggleZoneFilter('Besiktas')" />
              <span class="check-label">Besiktas / Bosphorus</span>
              <span class="check-count">88</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- ── Right Results Feed ──────────────────────────────── -->
      <main class="results-main">

        <!-- Results Toolbar: Sorting & Map toggle -->
        <div class="results-toolbar">
          <div class="toolbar-left">
            <span class="results-count-text">
              Showing <strong>{{ filteredHotels.length }}</strong> verified B2B properties
            </span>
          </div>

          <div class="toolbar-right">
            <!-- Sort dropdown -->
            <div class="sort-selector">
              <label class="sort-label">Sort by</label>
              <select v-model="sortBy" class="sort-select">
                <option value="suggested">Suggested (Best Value)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
              </select>
            </div>

            <!-- Results Count (Like Bedsonline) -->
            <div class="sort-selector">
              <label class="sort-label">Results</label>
              <select v-model="resultsPerPage" class="sort-select" style="min-width: 65px">
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- Show Map Button -->
            <button class="map-view-btn" @click="showMapModal = !showMapModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>Show map</span>
            </button>
          </div>
        </div>

        <!-- AI Destination Summary Banner (Inspired by screenshot) -->
        <div v-if="showAiSummary" class="ai-summary-card">
          <div class="ai-header">
            <div class="ai-badge-title">
              <span class="sparkle-icon">✨</span>
              <strong>AI Travel Insights for Istanbul</strong>
              <span class="ai-tag">Real-time B2B Advisory</span>
            </div>
            <button class="ai-dismiss-btn" @click="showAiSummary = false">Hide ⌃</button>
          </div>
          <p class="ai-text">
            Sultanahmet and Eminonu are seeing high occupancy due to cultural season. Average 5-star wholesale rate is <strong>LYD 780–920/night</strong> with strong demand for Bosphorus-facing suites. Free cancellation options are advised for corporate bookings.
          </p>
        </div>

        <!-- Hotels List -->
        <div class="hotels-stack">
          <div
            v-for="hotel in filteredHotels"
            :key="hotel.id"
            class="hotel-result-card"
          >
            <!-- Card Body: 3-column Layout (Photo | Details | Price & CTA) -->
            <div class="card-horizontal-grid">

              <!-- Column 1: Image & Wishlist -->
              <div class="hotel-photo-col">
                <img :src="hotel.image" :alt="hotel.name" class="hotel-img" loading="lazy" />
                <!-- Favorite / Wishlist Heart Icon -->
                <button
                  class="favorite-circle-btn"
                  :class="{ 'favorite-circle-btn--active': favorites.includes(hotel.id) }"
                  @click.stop="toggleFavorite(hotel.id)"
                  title="Save to favorites"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="favorites.includes(hotel.id) ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>

              <!-- Column 2: Hotel Details -->
              <div class="hotel-details-col">
                <!-- Top Badge (Luxury Collection, etc.) -->
                <div v-if="hotel.badge" class="luxury-badge">
                  {{ hotel.badge }}
                </div>

                <!-- Hotel Name & Stars -->
                <div class="title-stars-row">
                  <h3 class="hotel-name">{{ hotel.name }}</h3>
                  <div class="stars-stars">
                    <span v-for="s in hotel.stars" :key="s" class="star-icon">★</span>
                  </div>
                </div>

                <!-- Location -->
                <div class="location-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span class="location-text">{{ hotel.location }}</span>
                  <a href="#map" class="map-link">View on map</a>
                </div>

                <!-- Promo & Partner Tags -->
                <div class="tags-row">
                  <span
                    v-for="tag in hotel.tags"
                    :key="tag"
                    class="tag-pill"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- Amenities Row with Icons -->
                <div class="amenities-row">
                  <span
                    v-for="(am, aIdx) in hotel.amenities"
                    :key="aIdx"
                    class="amenity-item"
                  >
                    <span class="am-icon">{{ am.icon }}</span>
                    <span>{{ am.label }}</span>
                  </span>
                </div>

                <!-- Reviews Row & Compare -->
                <div class="reviews-bottom-row">
                  <div class="rating-badge-group">
                    <span class="score-pill">{{ hotel.reviewScore }}</span>
                    <span class="review-status">{{ hotel.reviewText }}</span>
                    <span class="review-count">({{ hotel.reviewCount }} verified reviews)</span>
                  </div>
                  <button class="compare-btn" title="Add to comparison">Compare</button>
                </div>
              </div>

              <!-- Column 3: Price Box & CTA Button -->
              <div class="hotel-pricing-col">
                <div class="room-preview-header">
                  <span class="room-type-title">{{ hotel.featuredRoom.name }}</span>
                  <span class="board-type-tag">{{ hotel.featuredRoom.board }}</span>
                </div>

                <div class="price-container">
                  <span class="stay-total-label">3 nights total (incl. taxes)</span>
                  <div class="price-figures">
                    <span class="curr">{{ hotel.featuredRoom.currency }}</span>
                    <span class="amount">{{ formatPrice(hotel.featuredRoom.totalPrice) }}</span>
                  </div>
                  <span class="price-per-night">
                    LYD {{ formatPrice(hotel.featuredRoom.pricePerNight) }} / night
                  </span>
                </div>

                <div class="cancellation-info">
                  <span
                    class="cancellation-text"
                    :class="{ 'cancellation-text--green': hotel.featuredRoom.isFreeCancellation }"
                  >
                    {{ hotel.featuredRoom.isFreeCancellation ? '✓ ' : 'ⓘ ' }}
                    {{ hotel.featuredRoom.cancellation }}
                  </span>
                </div>

                <!-- View Rooms Accordion Button -->
                <button
                  class="view-rooms-btn"
                  @click="toggleRooms(hotel.id)"
                >
                  <span>{{ expandedHotelId === hotel.id ? 'Hide rooms ▴' : 'View rooms ▾' }}</span>
                </button>
              </div>

            </div>

            <!-- Expanded Room Selection Table (When clicked) -->
            <div v-if="expandedHotelId === hotel.id" class="rooms-expand-section">
              <h4 class="rooms-table-title">Available Contracted Rooms & Rates</h4>
              <div class="rooms-table">
                <div
                  v-for="room in hotel.rooms"
                  :key="room.id"
                  class="room-row"
                >
                  <div class="room-col-name">
                    <span class="r-name">{{ room.name }}</span>
                    <span class="r-board">{{ room.board }}</span>
                    <span class="r-avail">Only {{ room.availableRooms }} rooms left</span>
                  </div>
                  <div class="room-col-policy">
                    <span
                      class="r-cancel"
                      :class="{ 'r-cancel--green': room.isFreeCancellation }"
                    >
                      {{ room.cancellation }}
                    </span>
                  </div>
                  <div class="room-col-price">
                    <span class="r-total">LYD {{ formatPrice(room.totalPrice) }}</span>
                    <span class="r-sub">LYD {{ formatPrice(room.pricePerNight) }} / night</span>
                  </div>
                  <div class="room-col-action">
                    <button class="book-now-btn">Book Now</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>

  </div>
</template>

<style scoped>
.results-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Top Summary / Modify Bar ──────────────────────────── */
.search-summary-bar {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(31, 43, 56, 0.04);
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.dest-strong {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
}

.modify-btn {
  padding: 6px 14px;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}
.modify-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.ai-assistant-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fdf4ff;
  border: 1px solid #f0abfc;
  color: #a21caf;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ai-assistant-btn:hover {
  background: #fae8ff;
}

/* ── Layout ────────────────────────────────────────────── */
.results-layout {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

/* ── Sidebar Filters ───────────────────────────────────── */
.filters-sidebar {
  width: 270px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: 0 2px 8px rgba(31, 43, 56, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  position: sticky;
  top: 90px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.hotels-count {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.export-excel-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.filter-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
}
.filter-box:last-child {
  border-bottom: none;
}

.filter-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* Search input */
.search-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}
.filter-input {
  border: none;
  outline: none;
  padding: 8px 10px;
  font-size: 0.85rem;
  width: 100%;
}
.filter-search-icon-btn {
  background: #f8fafc;
  border: none;
  border-left: 1px solid var(--color-border);
  padding: 8px 10px;
  cursor: pointer;
  color: var(--color-text-muted);
}

/* Checkbox list */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.84rem;
  color: var(--color-text);
  cursor: pointer;
}
.check-item input {
  accent-color: var(--color-primary);
  width: 15px;
  height: 15px;
  cursor: pointer;
}
.check-label {
  flex: 1;
}
.check-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Star Buttons */
.star-rating-buttons {
  display: flex;
  gap: 6px;
}
.star-toggle-btn {
  flex: 1;
  padding: 6px 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s ease;
}
.star-toggle-btn:hover {
  border-color: var(--color-primary);
}
.star-toggle-btn--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Right Results Main ────────────────────────────────── */
.results-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* Toolbar */
.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 20px;
}

.results-count-text {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sort-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.sort-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text);
  background: #ffffff;
  cursor: pointer;
  outline: none;
}

.map-view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s ease;
}
.map-view-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* AI Destination Summary */
.ai-summary-card {
  background: #fdfaf5;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ai-badge-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  color: #92400e;
}
.ai-tag {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
}
.ai-dismiss-btn {
  background: none;
  border: none;
  color: #92400e;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.ai-text {
  font-size: 0.88rem;
  color: #78350f;
  line-height: 1.5;
  margin: 0;
}

/* ── Hotel Result Card ─────────────────────────────────── */
.hotels-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-result-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(31, 43, 56, 0.05);
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.hotel-result-card:hover {
  box-shadow: 0 8px 24px rgba(31, 43, 56, 0.1);
}

/* Horizontal 3-column Grid matching the screenshot */
.card-horizontal-grid {
  display: grid;
  grid-template-columns: 240px 1fr 240px;
  min-height: 220px;
}

/* Column 1: Image */
.hotel-photo-col {
  position: relative;
  overflow: hidden;
  background: #1f2b38;
}
.hotel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.hotel-result-card:hover .hotel-img {
  transform: scale(1.03);
}

.favorite-circle-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}
.favorite-circle-btn:hover {
  transform: scale(1.1);
  color: #ef4444;
}
.favorite-circle-btn--active {
  color: #ef4444 !important;
}

/* Column 2: Details */
.hotel-details-col {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--color-border);
}

.luxury-badge {
  align-self: flex-start;
  background: #1f2b38;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.title-stars-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hotel-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
}

.stars-stars {
  color: #f59e0b;
  font-size: 1rem;
  letter-spacing: 2px;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.map-link {
  color: var(--color-primary);
  margin-left: 6px;
  font-weight: 500;
}

.tags-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag-pill {
  padding: 3px 10px;
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-secondary);
  background: #f8fafc;
}

.amenities-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 4px 0;
}
.amenity-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reviews-bottom-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}

.rating-badge-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.score-pill {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 3px 8px;
  border-radius: 6px;
}
.review-status {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
}
.review-count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.compare-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: #ffffff;
  font-size: 0.75rem;
  color: var(--color-text);
  cursor: pointer;
}

/* Column 3: Pricing & Booking Action */
.hotel-pricing-col {
  padding: 20px 18px;
  background: #fbfcfe;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.room-preview-header {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.room-type-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}
.board-type-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
}

.price-container {
  display: flex;
  flex-direction: column;
  margin: 8px 0;
}
.stay-total-label {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
.price-figures {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.curr {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}
.amount {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: -0.02em;
}
.price-per-night {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.cancellation-info {
  margin-bottom: 8px;
}
.cancellation-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #dc2626;
}
.cancellation-text--green {
  color: #059669;
}

.view-rooms-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--color-navy);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}
.view-rooms-btn:hover {
  background: var(--color-navy-hover);
}

/* ── Expanded Rooms Accordion ───────────────────────────── */
.rooms-expand-section {
  border-top: 1px solid var(--color-border);
  background: #f8fafc;
  padding: 18px 24px;
}

.rooms-table-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.rooms-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-row {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 18px;
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 120px;
  align-items: center;
  gap: 16px;
}

.room-col-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.r-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}
.r-board {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 600;
}
.r-avail {
  font-size: 0.72rem;
  color: #b45309;
}

.room-col-policy {
  font-size: 0.8rem;
}
.r-cancel {
  color: #dc2626;
  font-weight: 500;
}
.r-cancel--green {
  color: #059669;
}

.room-col-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.r-total {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text);
}
.r-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.book-now-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.book-now-btn:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 992px) {
  .results-layout {
    flex-direction: column;
  }
  .filters-sidebar {
    width: 100%;
    position: static;
  }
  .card-horizontal-grid {
    grid-template-columns: 1fr;
  }
  .hotel-photo-col {
    height: 200px;
  }
}
</style>

