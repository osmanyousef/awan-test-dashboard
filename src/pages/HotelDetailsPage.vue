<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { show } = useToast()

// ── Tab Navigation ─────────────────────────────────────────
const activeTab = ref<'overview' | 'amenities' | 'rooms'>('overview')

function scrollToSection(sectionId: string, tab: 'overview' | 'amenities' | 'rooms') {
  activeTab.value = tab
  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ── Curated High-Resolution Hotel Photos ───────────────────
// Uniform aspect-ratio images to eliminate layout distortion
const photos = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80',
    title: 'Hotel Exterior & Facade',
    tag: 'Exterior',
  },
  {
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=80',
    title: 'Grand Welcome Lobby',
    tag: 'Lobby',
  },
  {
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&auto=format&fit=crop&q=80',
    title: 'Superior Queen Bedroom',
    tag: 'Rooms',
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&auto=format&fit=crop&q=80',
    title: 'Skyline Pool & Sun Deck',
    tag: 'Amenities',
  },
  {
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&auto=format&fit=crop&q=80',
    title: 'Jamek Artisan Cafe & Restaurant',
    tag: 'Dining',
  },
  {
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&auto=format&fit=crop&q=80',
    title: 'Deluxe King City View',
    tag: 'Rooms',
  },
  {
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&auto=format&fit=crop&q=80',
    title: 'Executive Suite Lounge',
    tag: 'Suites',
  },
  {
    url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=900&auto=format&fit=crop&q=80',
    title: 'Family Twin Deluxe',
    tag: 'Rooms',
  },
]

// ── Lightbox Container State ───────────────────────────────
const isLightboxOpen = ref(false)
const activePhotoIndex = ref(0)

function openLightbox(index = 0) {
  activePhotoIndex.value = index
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  isLightboxOpen.value = false
  document.body.style.overflow = ''
}

function nextPhoto() {
  activePhotoIndex.value = (activePhotoIndex.value + 1) % photos.length
}

function prevPhoto() {
  activePhotoIndex.value = (activePhotoIndex.value - 1 + photos.length) % photos.length
}

function onKeydown(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextPhoto()
  if (e.key === 'ArrowLeft') prevPhoto()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// ── Expanded Sections State ────────────────────────────────
const overviewExpanded = ref(false)
const allAmenitiesExpanded = ref(false)

// ── 4 Distinct Rooms Data with Fixed Container Imagery ────
interface RoomOption {
  id: string
  title: string
  subtitle: string
  image: string
  photoIndex: number
  bed: string
  capacity: string
  size: string
  refundable: boolean
  breakfast: boolean
  tag: string
  tagColor: 'green' | 'blue' | 'purple' | 'amber'
  pricePerNight: number
  totalPrice: number
  optionsCount: number
}

const rooms = ref<RoomOption[]>([
  {
    id: 'room-1',
    title: 'Superior Queen (No Window)',
    subtitle: 'SUPERIOR QUEEN ROOM · COMPACT & QUIET',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
    photoIndex: 2,
    bed: '1 Large Queen Bed',
    capacity: '3 Adults (Max)',
    size: '22 m²',
    refundable: true,
    breakfast: false,
    tag: 'Cheapest Rate',
    tagColor: 'green',
    pricePerNight: 84.0,
    totalPrice: 252.0,
    optionsCount: 2,
  },
  {
    id: 'room-2',
    title: 'Deluxe King City View',
    subtitle: 'DELUXE KING ROOM · HIGH FLOOR PANORAMIC',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80',
    photoIndex: 5,
    bed: '1 Extra-Large King Bed',
    capacity: '3 Adults (Max)',
    size: '28 m²',
    refundable: true,
    breakfast: true,
    tag: 'Most Popular',
    tagColor: 'blue',
    pricePerNight: 105.0,
    totalPrice: 315.0,
    optionsCount: 3,
  },
  {
    id: 'room-3',
    title: 'Executive Suite with Balcony',
    subtitle: 'EXECUTIVE SUITE · PRIVATE TERRACE & LIVING AREA',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80',
    photoIndex: 6,
    bed: '1 King Bed + 1 Sofa Bed',
    capacity: '4 Adults (Max)',
    size: '38 m²',
    refundable: true,
    breakfast: true,
    tag: 'Luxury Pick',
    tagColor: 'purple',
    pricePerNight: 145.0,
    totalPrice: 435.0,
    optionsCount: 2,
  },
  {
    id: 'room-4',
    title: 'Family Twin Deluxe',
    subtitle: 'FAMILY CONNECTING ROOM · 2 QUEEN BEDS',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
    photoIndex: 7,
    bed: '2 Queen Beds',
    capacity: '6 Guests (4 Adults, 2 Children)',
    size: '45 m²',
    refundable: false,
    breakfast: true,
    tag: 'Best for Groups',
    tagColor: 'amber',
    pricePerNight: 170.0,
    totalPrice: 510.0,
    optionsCount: 2,
  },
])

// ── Room Filter Chips ──────────────────────────────────────
const activeRoomFilter = ref<'all' | 'breakfast' | 'room-only' | 'refundable' | 'non-refundable'>('all')

const filteredRooms = computed(() => {
  if (activeRoomFilter.value === 'breakfast') return rooms.value.filter(r => r.breakfast)
  if (activeRoomFilter.value === 'room-only') return rooms.value.filter(r => !r.breakfast)
  if (activeRoomFilter.value === 'refundable') return rooms.value.filter(r => r.refundable)
  if (activeRoomFilter.value === 'non-refundable') return rooms.value.filter(r => !r.refundable)
  return rooms.value
})

function selectRoom(room: RoomOption) {
  try {
    sessionStorage.setItem(
      'awan_selected_room',
      JSON.stringify({
        hotel: 'Silka Maytower Kuala Lumpur',
        room: room.title,
        price: room.totalPrice,
        nightly: room.pricePerNight,
        refundable: room.refundable,
        breakfast: room.breakfast,
      })
    )
  } catch {}
  show(`Selected ${room.title}! Proceeding to guest details...`)
  router.push('/hotels/guests')
}
</script>

<template>
  <div class="min-h-screen bg-transparent text-[#101828]">
    <div class="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 py-5 pb-16 flex flex-col gap-6">

      <!-- ── Back Button ──────────────────────────────────────── -->
      <button type="button"
        class="inline-flex items-center gap-2.5 self-start h-11 px-4.5 bg-white border border-[#c9d5ea] rounded-xl text-[#101828] text-[15px] font-semibold hover:bg-[#eef3fc] hover:border-[#aebfe0] transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3f66c4]"
        @click="router.push('/hotels/results')">
        <svg class="w-5 h-5 text-[#2b4fa8] stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        <span>Back to search results</span>
      </button>

      <!-- ── Photo Mosaic Grid (Fixed Aspect-Ratio Containers) ──── -->
      <div
        class="grid grid-cols-1 sm:grid-cols-4 sm:grid-rows-2 gap-2.5 h-[320px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden relative shadow-xs bg-slate-200">
        <!-- Big Hero Photo (Spans 2 cols & 2 rows) -->
        <div class="sm:col-span-2 sm:row-span-2 relative group overflow-hidden cursor-pointer bg-slate-300"
          @click="openLightbox(0)">
          <img :src="photos[0].url" :alt="photos[0].title"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
          <span
            class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#101828]/70 text-white backdrop-blur-xs">
            {{ photos[0].tag }}
          </span>
        </div>

        <!-- Thumbnail 1 -->
        <div class="hidden sm:block relative group overflow-hidden cursor-pointer bg-slate-300"
          @click="openLightbox(1)">
          <img :src="photos[1].url" :alt="photos[1].title"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
        </div>

        <!-- Thumbnail 2 -->
        <div class="hidden sm:block relative group overflow-hidden cursor-pointer bg-slate-300"
          @click="openLightbox(2)">
          <img :src="photos[2].url" :alt="photos[2].title"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
        </div>

        <!-- Thumbnail 3 -->
        <div class="hidden sm:block relative group overflow-hidden cursor-pointer bg-slate-300"
          @click="openLightbox(3)">
          <img :src="photos[3].url" :alt="photos[3].title"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
        </div>

        <!-- Thumbnail 4 with "+15 More" Badge -->
        <div class="hidden sm:block relative group overflow-hidden cursor-pointer bg-slate-300"
          @click="openLightbox(4)">
          <img :src="photos[4].url" :alt="photos[4].title"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
          <div
            class="absolute inset-0 bg-black/55 text-white flex items-center justify-center font-bold text-2xl group-hover:bg-black/65 transition-colors">
            +15
          </div>
        </div>

        <!-- Floating "All Photos (20)" Button -->
        <button type="button"
          class="absolute right-4 bottom-4 inline-flex items-center gap-2 h-10 px-4.5 rounded-xl bg-white hover:bg-[#f1f4fa] text-[#101828] text-sm font-bold shadow-md transition-all cursor-pointer border border-[#dfe5f0]"
          @click.stop="openLightbox(0)">
          <svg class="w-4.5 h-4.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
          <span>All Photos (20)</span>
        </button>
      </div>

      <!-- ── Sticky Navigation Bar ────────────────────────────── -->
      <nav class="sticky top-0 z-20 bg-[#f4f6fa]/95 backdrop-blur-xs flex gap-1 border-b border-[#e3e8f2]">
        <button type="button" class="h-12 px-4.5 font-semibold text-sm cursor-pointer transition-colors border-b-2"
          :class="activeTab === 'overview' ? 'text-[#101828] border-[#3f66c4]' : 'text-[#5a6577] border-transparent hover:text-[#101828]'"
          @click="scrollToSection('sec-overview', 'overview')">
          Overview
        </button>
        <button type="button" class="h-12 px-4.5 font-semibold text-sm cursor-pointer transition-colors border-b-2"
          :class="activeTab === 'amenities' ? 'text-[#101828] border-[#3f66c4]' : 'text-[#5a6577] border-transparent hover:text-[#101828]'"
          @click="scrollToSection('sec-amenities', 'amenities')">
          Amenities
        </button>
        <button type="button" class="h-12 px-4.5 font-semibold text-sm cursor-pointer transition-colors border-b-2"
          :class="activeTab === 'rooms' ? 'text-[#101828] border-[#3f66c4]' : 'text-[#5a6577] border-transparent hover:text-[#101828]'"
          @click="scrollToSection('sec-rooms', 'rooms')">
          Rooms (4)
        </button>
      </nav>

      <!-- ── Two-Column Main Content & Sticky Sidebar ─────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 sm:gap-8 items-start">

        <!-- ── Left Column: Hotel Info Cards ──────────────────── -->
        <div class="bg-white border border-[#e3e8f2] rounded-2xl shadow-xs overflow-hidden divide-y divide-[#eef1f7]">

          <!-- Header Section -->
          <div id="sec-overview" class="p-6 sm:p-7">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight m-0">
              Citin Masjid Jamek
            </h1>

            <!-- Stars -->
            <div class="flex items-center gap-1 mt-2 text-[#e8a500]">
              <svg v-for="s in 3" :key="s" class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
              </svg>
            </div>

            <!-- Address -->
            <div class="flex items-start gap-2 mt-3 text-sm text-[#5a6577] leading-relaxed">
              <svg class="w-4.5 h-4.5 shrink-0 mt-0.5 text-[#2b4fa8] stroke-current stroke-2 fill-none"
                viewBox="0 0 24 24">
                <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <span>No. 7 Seksyen 33, Jalan Melayu, Jalan Masjid India, Off Jalan Masjid India, Kuala Lumpur</span>
            </div>

            <!-- Phone / Contact Tag -->
            <div class="flex flex-wrap gap-2 mt-4">
              <span
                class="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
                </svg>
                +60 3-2693 2999
              </span>
            </div>

            <!-- Check-in / Check-out Cards -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 border border-[#dbe4f3] rounded-xl mt-5 overflow-hidden bg-[#f8faff] divide-y sm:divide-y-0 sm:divide-x divide-[#dbe4f3]">
              <div class="flex items-center gap-3 p-3.5 sm:px-4.5">
                <div
                  class="w-10.5 h-10.5 rounded-xl bg-[#e3f6ec] text-[#0a6b46] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4M10 8l4 4-4 4M14 12H4" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs text-[#5a6577] font-medium">Check-in</div>
                  <div class="text-base font-bold text-[#101828]">From 2:00 PM</div>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3.5 sm:px-4.5">
                <div
                  class="w-10.5 h-10.5 rounded-xl bg-[#fff0d2] text-[#8a5200] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4M16 8l4 4-4 4M20 12H9" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs text-[#5a6577] font-medium">Check-out</div>
                  <div class="text-base font-bold text-[#101828]">Until 12:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview Narrative -->
          <div class="p-6 sm:p-7">
            <h2
              class="text-base font-bold text-[#101828] mb-3 flex items-center gap-2.5 before:content-[''] before:w-1 before:h-4.5 before:rounded-full before:bg-[#3f66c4]">
              Overview
            </h2>
            <p class="text-sm leading-relaxed text-[#344054] m-0 mb-3" :class="{ 'line-clamp-3': !overviewExpanded }">
              Citin Hotel Masjid Jamek stands out for its commitment to eco-friendly hospitality practices and stunning
              architectural design that blends modern aesthetics with local Malaysian cultural heritage. Its prime
              location in the vibrant historic center of Kuala Lumpur makes it an ideal choice for both business
              travelers and holidaymakers seeking exceptional comfort, high accessibility, and premium agency support.
            </p>
            <button type="button"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-[#2b4fa8] hover:underline cursor-pointer bg-transparent border-0 p-0"
              @click="overviewExpanded = !overviewExpanded">
              {{ overviewExpanded ? 'Show less' : 'Read more' }}
            </button>
          </div>

          <!-- Nearby Points of Interest -->
          <div class="p-6 sm:p-7">
            <h2
              class="text-base font-bold text-[#101828] mb-3 flex items-center gap-2.5 before:content-[''] before:w-1 before:h-4.5 before:rounded-full before:bg-[#3f66c4]">
              Nearby Landmarks &amp; Transit
            </h2>
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                📍 Merdeka Square (400 m)
              </span>
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                🕌 Masjid Jamek LRT Station (100 m)
              </span>
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                🌳 KL Forest Eco Park
              </span>
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                🛍️ SOGO Shopping Mall
              </span>
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                🏮 Petaling Street Chinatown
              </span>
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f7] text-[#475467] text-xs font-semibold">
                ✈️ KUL Airport Express (35 mins)
              </span>
            </div>
          </div>

          <!-- Amenities Breakdown -->
          <div id="sec-amenities" class="p-6 sm:p-7">
            <h2
              class="text-base font-bold text-[#101828] mb-4 flex items-center gap-2.5 before:content-[''] before:w-1 before:h-4.5 before:rounded-full before:bg-[#3f66c4]">
              Hotel Amenities
            </h2>

            <div class="space-y-6">
              <!-- Food & Drink -->
              <div class="border-t border-[#e3e9f4] pt-4 first:border-0 first:pt-0">
                <h3 class="text-sm font-bold text-[#101828] flex items-center gap-2 mb-3">
                  <span class="w-6 h-6 rounded-md bg-[#e6edfb] text-[#2b4fa8] flex items-center justify-center">
                    <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path d="M6 3v7a2 2 0 002 2v9M10 3v7a2 2 0 01-2 2M17 3c-2 1.5-3 4-3 7h3v11" />
                    </svg>
                  </span>
                  Food &amp; Dining
                </h3>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8 list-none m-0">
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    On-site Restaurant &amp; Breakfast Buffet
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Artisan Coffee House
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Lounge Bar
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Convenience Minimarket
                  </li>
                </ul>
              </div>

              <!-- Room & Comfort -->
              <div class="border-t border-[#e3e9f4] pt-4">
                <h3 class="text-sm font-bold text-[#101828] flex items-center gap-2 mb-3">
                  <span class="w-6 h-6 rounded-md bg-[#e6edfb] text-[#2b4fa8] flex items-center justify-center">
                    <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path d="M3 18V7M3 13h18v5M21 13a3 3 0 00-3-3h-7v3" />
                      <circle cx="7" cy="10.5" r="1.5" />
                    </svg>
                  </span>
                  Room &amp; Comfort
                </h3>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8 list-none m-0">
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Individual Climate Air Conditioning
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Electronic Key Card Access
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    High-speed Passenger Lifts
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Dedicated Non-Smoking Floors
                  </li>
                </ul>
              </div>

              <!-- Front Desk & Services -->
              <div class="border-t border-[#e3e9f4] pt-4">
                <h3 class="text-sm font-bold text-[#101828] flex items-center gap-2 mb-3">
                  <span class="w-6 h-6 rounded-md bg-[#e6edfb] text-[#2b4fa8] flex items-center justify-center">
                    <svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                      <path d="M6 17h12l-1.5-2V10a4.5 4.5 0 00-9 0v5L6 17zM10 20a2 2 0 004 0" />
                    </svg>
                  </span>
                  Front Desk &amp; Services
                </h3>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8 list-none m-0">
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    24-Hour Multilingual Reception
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Secure Luggage Storage
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Express Laundry &amp; Ironing
                  </li>
                  <li class="flex items-center gap-2 text-xs text-[#344054]">
                    <svg class="w-4 h-4 text-[#0a7a50] stroke-current stroke-2 fill-none shrink-0" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Corporate Invoicing Provided
                  </li>
                </ul>
              </div>
            </div>

            <button type="button"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-[#2b4fa8] hover:underline cursor-pointer bg-transparent border-0 p-0 mt-5"
              @click="allAmenitiesExpanded = !allAmenitiesExpanded">
              {{ allAmenitiesExpanded ? 'Hide additional amenities' : 'Show all amenities (33)' }}
            </button>
          </div>
        </div>

        <!-- ── Right Column: Sticky Sidebar ───────────────────── -->
        <div class="flex flex-col gap-5 lg:sticky lg:top-16">

          <!-- Stay Summary Card -->
          <div class="bg-white border border-[#e3e8f2] rounded-2xl p-5.5 shadow-xs">
            <h2 class="text-base font-bold text-[#101828] mb-3.5 m-0">Stay Summary</h2>

            <!-- Check-in & Check-out -->
            <div
              class="grid grid-cols-2 border border-[#e3e8f2] rounded-xl overflow-hidden divide-x divide-[#e3e8f2] bg-[#f8faff]">
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#5a6577]">Check in</div>
                <div class="text-xs font-bold text-[#101828] mt-0.5">Fri, 4 Dec</div>
                <div class="text-[11px] font-bold text-[#0a6b46] mt-0.5">From 2:00 PM</div>
              </div>
              <div class="p-3">
                <div class="text-[11px] font-semibold text-[#5a6577]">Check out</div>
                <div class="text-xs font-bold text-[#101828] mt-0.5">Mon, 7 Dec</div>
                <div class="text-[11px] font-bold text-[#8a5200] mt-0.5">Until 12:00 PM</div>
              </div>
            </div>

            <!-- Key-Value Details -->
            <div class="mt-3.5 divide-y divide-[#eef1f7] text-xs">
              <div class="flex items-center justify-between py-2">
                <span class="text-[#5a6577]">Duration</span>
                <b class="text-[#101828] font-bold">3 nights</b>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-[#5a6577]">Rooms</span>
                <b class="text-[#101828] font-bold">2 rooms</b>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-[#5a6577]">Guests</span>
                <b class="text-[#101828] font-bold">6 guests (3/room)</b>
              </div>
            </div>

            <!-- Total Price Section -->
            <div class="mt-3 pt-3.5 border-t border-[#eef1f7]">
              <div class="text-xs text-[#5a6577]">Starting from</div>
              <div class="text-3xl font-extrabold text-[#101828] tabular-nums tracking-tight mt-0.5">
                $252.00
              </div>
              <div class="text-xs text-[#5a6577] mt-1">
                $84.00 / night · Total stay for 2 rooms
              </div>
            </div>

            <!-- Action Button -->
            <button type="button"
              class="w-full h-11 mt-4 rounded-xl bg-[#3f66c4] hover:bg-[#3254a6] text-white text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              @click="scrollToSection('sec-rooms', 'rooms')">
              <span>View Available Rooms (4)</span>
              <span>↓</span>
            </button>
          </div>

          <!-- Location Map Card -->
          <div class="bg-white border border-[#e3e8f2] rounded-2xl p-4.5 shadow-xs">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-bold text-[#101828] m-0">Location</h2>
              <a href="https://maps.google.com/?q=Citin+Hotel+Masjid+Jamek+Kuala+Lumpur" target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-xs font-semibold text-[#2b4fa8] hover:underline">
                Directions
                <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </div>

            <!-- Stylized Vector Map Preview -->
            <div class="relative w-full h-[180px] rounded-xl overflow-hidden border border-[#dbe4f3] bg-[#e8eef9]">
              <svg viewBox="0 0 336 190" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
                <rect width="336" height="190" fill="#e8eef9" />
                <path d="M0 150L120 120L210 150L336 110" stroke="#cfe0f5" stroke-width="14" fill="none" />
                <polygon points="20,20 110,14 124,62 34,74" fill="#dcefe3" />
                <g stroke="#ffffff" stroke-width="7" fill="none">
                  <path d="M0 60H336M160 0V190M0 110L336 80" />
                </g>
                <g stroke="#ffffff" stroke-width="3" fill="none">
                  <path d="M60 0V190M250 0V190M0 30H336M0 160H336" />
                </g>
                <path d="M196 52c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z" fill="#3f66c4" />
                <circle cx="196" cy="68" r="5.5" fill="#ffffff" />
              </svg>
              <div
                class="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-white/90 text-[#101828] text-[11px] font-semibold backdrop-blur-xs shadow-2xs">
                Kuala Lumpur City Center
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Available Rooms Section (The 4 Options with Fixed Containers) ── -->
      <div id="sec-rooms" class="flex flex-col gap-4 pt-4">
        <!-- Section Header -->
        <h2 class="text-xl sm:text-2xl font-extrabold text-[#101828] tracking-tight m-0 flex items-center gap-2.5">
          <svg class="w-6 h-6 text-[#2b4fa8] stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M3 18V7M3 13h18v5M21 13a3 3 0 00-3-3h-7v3" />
            <circle cx="7" cy="10.5" r="1.5" />
          </svg>
          Available Rooms (4)
        </h2>

        <!-- Booking Specs Bar -->
        <div class="bg-white border border-[#e3e8f2] rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
          <b class="text-sm font-bold text-[#101828]">2 rooms · 3 nights</b>
          <span
            class="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#e6edfb] text-[#2b4fa8] text-xs font-semibold">
            <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0114 0" />
            </svg>
            Room 1 · 3 adults
          </span>
          <span
            class="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#e6edfb] text-[#2b4fa8] text-xs font-semibold">
            <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0114 0" />
            </svg>
            Room 2 · 3 adults
          </span>
          <span class="text-xs text-[#5a6577] sm:ml-auto">
            One single bundled rate for both rooms
          </span>
        </div>

        <!-- Filter Chips -->
        <div class="flex items-center gap-2 flex-wrap">
          <button type="button"
            class="h-8.5 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            :class="activeRoomFilter === 'all' ? 'bg-[#3f66c4] text-white border-[#3f66c4]' : 'bg-white text-[#344054] border-[#dfe5f0] hover:bg-[#f1f4fa]'"
            @click="activeRoomFilter = 'all'">
            All Rooms (4)
          </button>
          <button type="button"
            class="h-8.5 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            :class="activeRoomFilter === 'breakfast' ? 'bg-[#3f66c4] text-white border-[#3f66c4]' : 'bg-white text-[#344054] border-[#dfe5f0] hover:bg-[#f1f4fa]'"
            @click="activeRoomFilter = 'breakfast'">
            Breakfast Included
          </button>
          <button type="button"
            class="h-8.5 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            :class="activeRoomFilter === 'room-only' ? 'bg-[#3f66c4] text-white border-[#3f66c4]' : 'bg-white text-[#344054] border-[#dfe5f0] hover:bg-[#f1f4fa]'"
            @click="activeRoomFilter = 'room-only'">
            Room Only
          </button>
          <button type="button"
            class="h-8.5 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            :class="activeRoomFilter === 'refundable' ? 'bg-[#3f66c4] text-white border-[#3f66c4]' : 'bg-white text-[#344054] border-[#dfe5f0] hover:bg-[#f1f4fa]'"
            @click="activeRoomFilter = 'refundable'">
            Refundable Only
          </button>
        </div>

        <!-- 4 Rooms Cards List -->
        <div class="space-y-4">
          <div v-for="room in filteredRooms" :key="room.id"
            class="bg-white border border-[#e3e8f2] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#b9ccee] transition-all">
            <!-- Room Header Bar -->
            <div class="flex items-baseline justify-between mb-3.5 flex-wrap gap-2">
              <h3 class="text-base sm:text-lg font-bold text-[#101828] m-0">
                {{ room.title }}
              </h3>
              <span class="text-xs text-[#5a6577]">
                {{ room.optionsCount }} rate options available
              </span>
            </div>

            <!-- Room Content Box: Fixed-Ratio Image + Details + Price -->
            <div
              class="border border-[#e3e8f2] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-stretch justify-between bg-[#fbfcfd]">

              <!-- ── Uniform Aspect-Ratio Image Container ──── -->
              <div
                class="relative w-full md:w-60 h-44 md:h-auto rounded-xl overflow-hidden shrink-0 group cursor-pointer bg-slate-200"
                @click="openLightbox(room.photoIndex)">
                <img :src="room.image" :alt="room.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy" />
                <button type="button"
                  class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/65 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  @click.stop="openLightbox(room.photoIndex)">
                  <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <span>View Photos</span>
                </button>
              </div>

              <!-- Room Specifications & Tags -->
              <div class="flex-1 flex flex-col justify-between min-w-[260px]">
                <div>
                  <div class="text-xs font-mono font-bold text-[#5a6577] uppercase tracking-wider">
                    {{ room.subtitle }}
                  </div>

                  <!-- Spec bullets -->
                  <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-[#475467]">
                    <span class="inline-flex items-center gap-1">
                      🛏️ {{ room.bed }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      📐 {{ room.size }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      👥 {{ room.capacity }}
                    </span>
                  </div>

                  <!-- Badges Row -->
                  <div class="flex flex-wrap gap-2 mt-3.5">
                    <span class="inline-flex items-center gap-1 h-6.5 px-2.5 rounded-full text-xs font-semibold" :class="{
                      'bg-[#e3f6ec] text-[#0a6b46]': room.tagColor === 'green',
                      'bg-[#e6edfb] text-[#2b4fa8]': room.tagColor === 'blue',
                      'bg-[#f1e9ff] text-[#6a3fe0]': room.tagColor === 'purple',
                      'bg-[#fff0d2] text-[#8a5200]': room.tagColor === 'amber',
                    }">
                      {{ room.tag }}
                    </span>

                    <span class="inline-flex items-center gap-1 h-6.5 px-2.5 rounded-full text-xs font-semibold"
                      :class="room.breakfast ? 'bg-[#e3f6ec] text-[#0a6b46]' : 'bg-[#eef1f7] text-[#475467]'">
                      {{ room.breakfast ? '✓ Free Breakfast' : 'Room Only' }}
                    </span>

                    <span class="inline-flex items-center gap-1 h-6.5 px-2.5 rounded-full text-xs font-semibold"
                      :class="room.refundable ? 'bg-[#e3f6ec] text-[#0a6b46]' : 'bg-[#fce8e6] text-[#b4332e]'">
                      <svg v-if="room.refundable" class="w-3.5 h-3.5 stroke-current stroke-2 fill-none"
                        viewBox="0 0 24 24">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      {{ room.refundable ? 'Free Cancellation' : 'Non-Refundable' }}
                    </span>
                  </div>
                </div>

                <!-- Policies toggle link -->
                <button type="button"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-[#2b4fa8] hover:underline cursor-pointer bg-transparent border-0 p-0 mt-3 self-start">
                  View rate conditions &amp; cancellation policy
                </button>
              </div>

              <!-- Price Box & Booking Action -->
              <div
                class="flex flex-col justify-between items-start md:items-end md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-[#eef1f7]">
                <div>
                  <div class="text-2xl sm:text-[28px] font-extrabold text-[#101828] tabular-nums tracking-tight">
                    ${{ room.totalPrice.toFixed(2) }}
                  </div>
                  <div class="text-xs text-[#5a6577] mt-0.5">
                    ${{ room.pricePerNight.toFixed(2) }} / night · Total for 2 rooms
                  </div>
                  <div class="text-[11px] text-[#0a6b46] font-medium mt-0.5">
                    Includes all taxes &amp; fees
                  </div>
                </div>

                <button type="button"
                  class="mt-4 w-full md:w-auto h-10 px-6 rounded-xl bg-[#3f66c4] hover:bg-[#3254a6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  @click="selectRoom(room)">
                  Choose for all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Lightbox Container Dialog (Fixed Aspect Ratio Container) ──── -->
    <Teleport to="body">
      <div v-if="isLightboxOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
        role="dialog" aria-modal="true" @click.self="closeLightbox">
        <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col max-h-[95vh]">

          <!-- Header Bar -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#e3e8f2] bg-white">
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-bold text-[#101828] m-0">
                Citin Masjid Jamek — Photo Gallery
              </h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6edfb] text-[#2b4fa8]">
                Photo {{ activePhotoIndex + 1 }} of {{ photos.length }}
              </span>
            </div>
            <button type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close" @click="closeLightbox">
              <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Main Photo Container with Fixed Aspect Ratio (No layout jump) -->
          <div
            class="relative w-full aspect-16/10 max-h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
            <img :src="photos[activePhotoIndex].url" :alt="photos[activePhotoIndex].title"
              class="w-full h-full object-cover select-none" />

            <!-- Prev Arrow Button -->
            <button type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3f66c4]"
              aria-label="Previous photo" @click="prevPhoto">
              <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <!-- Next Arrow Button -->
            <button type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3f66c4]"
              aria-label="Next photo" @click="nextPhoto">
              <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <!-- Bottom Caption Overlay -->
            <div
              class="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center justify-between">
              <div>
                <div class="text-sm font-bold">{{ photos[activePhotoIndex].title }}</div>
                <div class="text-xs text-white/75">{{ photos[activePhotoIndex].tag }}</div>
              </div>
            </div>
          </div>

          <!-- Thumbnail Strip Container -->
          <div class="p-3 bg-slate-50 border-t border-[#e3e8f2] flex gap-2.5 overflow-x-auto">
            <button v-for="(p, idx) in photos" :key="idx" type="button"
              class="w-18 h-13 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer relative"
              :class="activePhotoIndex === idx ? 'border-[#3f66c4] ring-2 ring-[#3f66c4]/40 scale-102' : 'border-transparent opacity-60 hover:opacity-100'"
              @click="activePhotoIndex = idx">
              <img :src="p.url" :alt="p.title" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
