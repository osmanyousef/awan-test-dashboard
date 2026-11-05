<script setup lang="ts">
import { ref } from 'vue'
import { parseTd3Mrz, type ParsedPassport } from '../../utils/mrzParser'
import { processPassportImageWithOcr } from '../../utils/passportOcr'

const emit = defineEmits<{
  (e: 'scan-complete', data: ParsedPassport & { passportImage?: string }): void
}>()

// ── Scanning State ─────────────────────────────────────────
const isDragging = ref(false)
const isScanning = ref(false)
const scanProgress = ref(0)
const scanStepText = ref('')
const activePassportImage = ref<string | null>(null)
const lastScannedData = ref<ParsedPassport | null>(null)
const scanError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// ── Sample Test Passports (Instant 1-Click Demo) ───────────
const samplePassports = [
  {
    label: '🇱🇾 Sample Libya',
    subtitle: 'IBRAHIM BADER',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    mrzLine1: 'P<LBA<<BADER<<IBRAHIM<<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'B1240467<8LBA9511204M3111208<<<<<<<<<<<<<<02',
  },
  {
    label: '🇦🇪 Sample UAE',
    subtitle: 'AHMED AL MANSOORI',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    mrzLine1: 'P<ARE<<AL<MANSOORI<<AHMED<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'A8941203<4ARE9204153M3004159<<<<<<<<<<<<<<04',
  },
  {
    label: '🇲🇾 Sample Malaysia',
    subtitle: 'NURUL AISYAH',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    mrzLine1: 'P<MYS<<ZAINAL<<NURUL<AISYAH<<<<<<<<<<<<<<<<<',
    mrzLine2: 'K4920158<1MYS9808037F2908034<<<<<<<<<<<<<<06',
  },
]

// ── Real OCR Scan Execution ────────────────────────────────
async function runRealOcr(imageUri: string) {
  isScanning.value = true
  scanError.value = null
  activePassportImage.value = imageUri
  scanProgress.value = 10
  scanStepText.value = 'Preparing image for OCR...'

  try {
    const result = await processPassportImageWithOcr(imageUri, (progress, status) => {
      scanProgress.value = progress
      scanStepText.value = status
    })

    if (result && (result.firstName || result.lastName || result.passportNumber)) {
      lastScannedData.value = result
      emit('scan-complete', { ...result, passportImage: imageUri })
    } else {
      // Fallback: If OCR could not find standard MRZ (e.g. low-res/handwritten), inform user
      scanError.value = 'Could not clearly detect passport text. Please ensure the full photo page is visible and well-lit.'
    }
  } catch (err) {
    console.warn('OCR error:', err)
    scanError.value = 'Failed to analyze passport image. Please check your image or enter details manually.'
  } finally {
    isScanning.value = false
  }
}

// ── Instant Demo for Sample Passports ──────────────────────
async function loadSample(sample: typeof samplePassports[0]) {
  isScanning.value = true
  scanError.value = null
  activePassportImage.value = sample.image
  scanProgress.value = 20
  scanStepText.value = 'Reading sample passport...'

  await delay(250)
  scanProgress.value = 60
  scanStepText.value = 'Parsing ICAO 9303 MRZ data...'

  await delay(250)
  scanProgress.value = 100
  scanStepText.value = 'Passport verified!'

  const parsed = parseTd3Mrz(sample.mrzLine1, sample.mrzLine2)
  if (parsed) {
    lastScannedData.value = parsed
    emit('scan-complete', { ...parsed, passportImage: sample.image })
  }

  await delay(200)
  isScanning.value = false
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── File Selection & Drag Drop ─────────────────────────────
function onFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  processFile(files[0])
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  processFile(files[0])
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (JPEG, PNG, or WEBP).')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    const dataUrl = event.target?.result as string
    runRealOcr(dataUrl)
  }
  reader.readAsDataURL(file)
}

function triggerFilePicker() {
  fileInputRef.value?.click()
}

function clearScanned() {
  lastScannedData.value = null
  activePassportImage.value = null
  scanError.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="ocr-widget-container">

    <!-- Case A: Active Scanning Animation Overlay -->
    <div v-if="isScanning" class="ocr-scanning-card">
      <div class="relative w-full h-36 bg-[#0c1f44] rounded-xl overflow-hidden flex items-center justify-center border border-[#3b5998]">
        <img
          v-if="activePassportImage"
          :src="activePassportImage"
          alt="Scanning preview"
          class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[1px]"
        />

        <!-- Glowing laser beam animation -->
        <div class="laser-scanner"></div>

        <!-- Scanning info badge -->
        <div class="relative z-10 text-center px-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/80 text-white text-xs font-semibold backdrop-blur-sm mb-2 shadow-sm">
            <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>AI Passport OCR Processing</span>
          </div>
          <div class="text-sm font-bold text-white tracking-wide">{{ scanStepText }}</div>
          <div class="w-48 h-1.5 bg-white/20 rounded-full mx-auto mt-2.5 overflow-hidden">
            <div class="h-full bg-cyan-400 transition-all duration-300 rounded-full" :style="{ width: `${scanProgress}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Case B: Scanned & Verified State -->
    <div v-else-if="lastScannedData" class="ocr-success-card">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            ✓
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Passport Verified
              </span>
              <span class="text-xs text-slate-500 font-medium">Fields Auto-filled</span>
            </div>
            <div class="text-sm font-bold text-slate-800 mt-0.5">
              {{ lastScannedData.firstName || '—' }} {{ lastScannedData.lastName || '—' }}
              <span class="text-xs font-normal text-slate-500">
                ({{ lastScannedData.nationality || 'Unknown' }} · P# {{ lastScannedData.passportNumber || 'N/A' }})
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            @click="triggerFilePicker"
          >
            Scan Different Photo
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            @click="clearScanned"
            title="Remove scan"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Case C: Idle Dropzone with 1-Click Samples -->
    <div v-else class="ocr-dropzone-wrapper">
      <div
        class="ocr-dropzone"
        :class="{ 'ocr-dropzone--dragging': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFilePicker"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="onFileSelect"
        />

        <div class="flex items-center gap-4">
          <!-- Icon box -->
          <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
            📷
          </div>

          <!-- Description -->
          <div class="text-left flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-800">
                Auto-fill from Passport Photo
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                Client OCR
              </span>
            </div>
            <p class="text-xs text-slate-500 m-0 mt-0.5 truncate">
              Upload or drop a passport picture (JPG / PNG) to read names and dates
            </p>
          </div>

          <!-- Upload button CTA -->
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shrink-0 shadow-xs cursor-pointer"
          >
            Browse Photo
          </button>
        </div>
      </div>

      <!-- Error notice if scan failed -->
      <div v-if="scanError" class="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
        <span>⚠️ {{ scanError }}</span>
        <button type="button" class="text-amber-900 font-bold hover:underline" @click="scanError = null">Dismiss</button>
      </div>

      <!-- Quick 1-Click Test Samples -->
      <div class="mt-2.5 flex items-center gap-2 flex-wrap">
        <span class="text-[11px] font-semibold text-slate-500">Or test with 1-click samples:</span>
        <button
          v-for="sample in samplePassports"
          :key="sample.label"
          type="button"
          class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
          @click.stop="loadSample(sample)"
        >
          <span>{{ sample.label }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ocr-widget-container {
  margin-bottom: 18px;
}

.ocr-dropzone {
  border: 1.5px dashed #bfdbfe;
  border-radius: 14px;
  background: #f8faff;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ocr-dropzone:hover {
  border-color: #3b82f6;
  background: #f0f6ff;
}

.ocr-dropzone--dragging {
  border-color: #2563eb;
  background: #eff6ff;
  transform: scale(0.995);
}

.ocr-scanning-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(12, 31, 68, 0.12);
}

.ocr-success-card {
  background: #ffffff;
  border: 1.5px solid #a7f3d0;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);
}

/* High-tech laser sweep animation */
.laser-scanner {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #22d3ee;
  box-shadow: 0 0 15px 4px #22d3ee, 0 0 30px 8px rgba(34, 211, 238, 0.5);
  animation: laserSweep 1.2s ease-in-out infinite alternate;
}

@keyframes laserSweep {
  0% {
    top: 5%;
  }
  100% {
    top: 95%;
  }
}
</style>
