import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  FLIGHTS,
  AIRPORT_NAMES,
  type RawFlight,
} from '../config/flightsData'

export interface FlightSegmentDetail {
  from: string
  fromName: string
  to: string
  toName: string
  no: string
  depDate: string
  depTime: string
  arrDate: string
  arrTime: string
  durationMin: number
}

export function useFlightBooking() {
  const route = useRoute()

  // ── Selected Flight Resolution ───────────────────────────
  const flightId = computed(() => Number(route.query.id) || 1)
  const selectedTierIndex = computed(() => Number(route.query.tier) || 0)
  const extraBagsCount = computed(() => Number(route.query.bags) || 0)

  const rawFlight = computed<RawFlight>(() => {
    return FLIGHTS.find(f => f.id === flightId.value) || FLIGHTS[0]
  })

  // ── Airport Codes & City Names ───────────────────────────
  const originCode = computed(() => {
    const q = (route.query.from as string) || ''
    return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[0]
  })

  const destCode = computed(() => {
    const q = (route.query.to as string) || ''
    return q ? q.slice(0, 3).toUpperCase() : rawFlight.value.route[rawFlight.value.route.length - 1]
  })

  const originName = computed(() => AIRPORT_NAMES[originCode.value]?.[0] || originCode.value)
  const destName = computed(() => AIRPORT_NAMES[destCode.value]?.[0] || destCode.value)

  // Aliases for compatibility
  const fromCode = originCode
  const toCode = destCode
  const fromName = originName
  const toName = destName

  // ── Cabin Class, Trip Type, Dates ─────────────────────────
  const tripType = computed(() => (route.query.trip as string) || 'One way')
  const cabinClass = computed(() => (route.query.cabin as string) || 'Economy')

  const tripDate = new Date(2026, 11, 2)
  const dtf = computed(() => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(tripDate)
  })

  const dateText = computed(() => (route.query.date as string) || dtf.value)

  // ── Fare Tiers & Pricing ─────────────────────────────────
  const tierNames = ['Economy Classic', 'Economy Flex', 'Premium Economy', 'Business']
  const tierDiffs = [0, 85, 310, 880]
  const tierDiff = computed(() => tierDiffs[selectedTierIndex.value] || 0)

  const currentFareName = computed(() => {
    const idx = selectedTierIndex.value
    if (idx === 0) return rawFlight.value.fare
    return tierNames[idx] || rawFlight.value.fare
  })

  const baseFare = computed(() => {
    if (rawFlight.value.id === 1 && selectedTierIndex.value === 0) return 251.14
    return Math.round((rawFlight.value.price * 0.48 + tierDiff.value) * 100) / 100
  })

  const taxesAndFees = computed(() => {
    if (rawFlight.value.id === 1 && selectedTierIndex.value === 0) return 268.34
    return Math.round((rawFlight.value.price * 0.52) * 100) / 100
  })

  const extraBagsPrice = computed(() => extraBagsCount.value * 50)

  const totalPrice = computed(() => {
    if (rawFlight.value.id === 1 && selectedTierIndex.value === 0 && extraBagsCount.value === 0) {
      return 519.48
    }
    return Math.round((baseFare.value + taxesAndFees.value + extraBagsPrice.value) * 100) / 100
  })

  // ── Currency Helpers ─────────────────────────────────────
  const exchangeRate = 5.45 // LYD per USD
  const walletSpendingPower = 88823.24
  const chargedLyd = computed(() => Math.round(totalPrice.value * exchangeRate * 100) / 100)

  function num(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function money(n: number): string {
    return num(n)
  }

  // ── Segments Timeline Builder ─────────────────────────────
  const segments = computed<FlightSegmentDetail[]>(() => {
    const f = rawFlight.value
    if (f.id === 1) {
      return [
        {
          from: 'TUN',
          fromName: 'Tunis',
          to: 'DOH',
          toName: 'Doha',
          no: 'QR 1400',
          depDate: '2026-12-02',
          depTime: '16:00',
          arrDate: '2026-12-02',
          arrTime: '23:15',
          durationMin: 315,
        },
        {
          from: 'DOH',
          fromName: 'Doha',
          to: 'KUL',
          toName: 'Kuala Lumpur',
          no: 'QR 852',
          depDate: '2026-12-03',
          depTime: '02:20',
          arrDate: '2026-12-03',
          arrTime: '14:40',
          durationMin: 440,
        },
      ]
    }

    const segs: FlightSegmentDetail[] = []
    let dayOffset = 0
    let curHour = parseInt(f.dep.slice(0, 2), 10)
    let curMin = parseInt(f.dep.slice(3), 10)

    f.route.slice(0, -1).forEach((from, j) => {
      const to = f.route[j + 1]
      const durMins = f.sd[j] || 300
      const depStr = `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`

      const d1 = new Date(2026, 11, 2 + dayOffset)
      const depDateStr = d1.toISOString().slice(0, 10)

      let totalMins = curHour * 60 + curMin + durMins
      if (totalMins >= 1440) {
        dayOffset += Math.floor(totalMins / 1440)
        totalMins = totalMins % 1440
      }
      const arrHour = Math.floor(totalMins / 60)
      const arrMin = totalMins % 60
      const arrStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`

      const d2 = new Date(2026, 11, 2 + dayOffset)
      const arrDateStr = d2.toISOString().slice(0, 10)

      segs.push({
        from,
        fromName: AIRPORT_NAMES[from]?.[0] || from,
        to,
        toName: AIRPORT_NAMES[to]?.[0] || to,
        no: f.nos[j] || `${f.ini} ${100 + j}`,
        depDate: depDateStr,
        depTime: depStr,
        arrDate: arrDateStr,
        arrTime: arrStr,
        durationMin: durMins,
      })

      if (j < f.lay.length) {
        const layMins = f.lay[j] || 120
        let nextTotal = arrHour * 60 + arrMin + layMins
        if (nextTotal >= 1440) {
          dayOffset += Math.floor(nextTotal / 1440)
          nextTotal = nextTotal % 1440
        }
        curHour = Math.floor(nextTotal / 60)
        curMin = nextTotal % 60
      }
    })

    return segs
  })

  const firstSeg = computed(() => segments.value[0])
  const lastSeg = computed(() => segments.value[segments.value.length - 1])

  function parseUtc(dateStr: string, timeStr = '00:00'): number {
    const [y, m, d] = dateStr.split('-').map(Number)
    const [h, min] = timeStr.split(':').map(Number)
    return Date.UTC(y, m - 1, d, h, min)
  }

  const dayDifference = computed(() => {
    if (!firstSeg.value || !lastSeg.value) return 0
    const d1 = parseUtc(firstSeg.value.depDate)
    const d2 = parseUtc(lastSeg.value.arrDate)
    return Math.round((d2 - d1) / 864e5)
  })

  // ── Policy Information ───────────────────────────────────
  const cancelFee = computed(() => rawFlight.value.cf ?? 130)
  const changeFee = computed(() => rawFlight.value.chf ?? 70)
  const isCancellable = computed(() => cancelFee.value !== null)
  const isChangeable = computed(() => changeFee.value !== null)
  const isRefundable = isCancellable

  return {
    route,
    flightId,
    selectedTierIndex,
    extraBagsCount,
    rawFlight,
    originCode,
    destCode,
    originName,
    destName,
    fromCode,
    toCode,
    fromName,
    toName,
    tripType,
    cabinClass,
    dateText,
    dtf,
    currentFareName,
    baseFare,
    taxesAndFees,
    extraBagsPrice,
    totalPrice,
    exchangeRate,
    walletSpendingPower,
    chargedLyd,
    num,
    money,
    segments,
    firstSeg,
    lastSeg,
    dayDifference,
    cancelFee,
    changeFee,
    isCancellable,
    isChangeable,
    isRefundable,
  }
}

