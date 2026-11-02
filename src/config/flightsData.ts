export interface RawFlight {
  id: number
  al: string
  ini: string
  c: string
  nos: string[]
  dep: string
  route: string[]
  sd: number[]
  lay: number[]
  price: number
  fare: string
  bags: number
  seat: number
  cf: number | null
  chf: number | null
}

export interface FlightSegment {
  a: string
  b: string
  d: number
  r: number
  m: number
  no: string
}

export interface ProcessedFlight extends RawFlight {
  segs: FlightSegment[]
  dur: number
  via: string[]
  max: number
}

export const TIMEZONES: Record<string, number> = {
  TUN: 1,
  DOH: 3,
  AMM: 3,
  BKK: 7,
  IST: 3,
  DXB: 4,
  JED: 3,
  KUL: 8,
  TIP: 2,
}

export const AIRPORT_NAMES: Record<string, [string, string]> = {
  TUN: ['Tunis', 'Tunis–Carthage'],
  DOH: ['Doha', 'Hamad International'],
  AMM: ['Amman', 'Queen Alia'],
  BKK: ['Bangkok', 'Suvarnabhumi'],
  IST: ['Istanbul', 'Istanbul Airport'],
  DXB: ['Dubai', 'Dubai International'],
  JED: ['Jeddah', 'King Abdulaziz'],
  KUL: ['Kuala Lumpur', 'KLIA'],
  TIP: ['Tripoli', 'Mitiga International'],
}

export const FLIGHTS: RawFlight[] = [
  { id: 1, al: 'Qatar Airways', ini: 'QR', c: '#5c0632', nos: ['QR 1400', 'QR 846'], dep: '16:00', route: ['TUN', 'DOH', 'KUL'], sd: [345, 420], lay: [160], price: 537.30, fare: 'Economy Classic', bags: 2, seat: 1, cf: 195, chf: 105 },
  { id: 2, al: 'Qatar Airways', ini: 'QR', c: '#5c0632', nos: ['QR 1402', 'QR 840'], dep: '12:15', route: ['TUN', 'DOH', 'KUL'], sd: [345, 420], lay: [235], price: 537.30, fare: 'Economy Classic', bags: 2, seat: 1, cf: 195, chf: 105 },
  { id: 3, al: 'Turkish Airlines', ini: 'TK', c: '#c8102e', nos: ['TK 886', 'TK 64'], dep: '07:45', route: ['TUN', 'IST', 'KUL'], sd: [170, 630], lay: [190], price: 489.00, fare: 'Economy Light', bags: 1, seat: 0, cf: null, chf: 150 },
  { id: 4, al: 'Emirates', ini: 'EK', c: '#d71921', nos: ['EK 748', 'EK 346'], dep: '23:10', route: ['TUN', 'DXB', 'KUL'], sd: [395, 435], lay: [110], price: 598.00, fare: 'Economy Saver', bags: 2, seat: 1, cf: 180, chf: 90 },
  { id: 5, al: 'Royal Jordanian', ini: 'RJ', c: '#8a6d1d', nos: ['RJ 598', 'RJ 62', 'TG 413'], dep: '06:30', route: ['TUN', 'AMM', 'BKK', 'KUL'], sd: [250, 540, 120], lay: [135, 110], price: 468.00, fare: 'Economy Light', bags: 1, seat: 0, cf: null, chf: 150 },
  { id: 6, al: 'Saudia', ini: 'SV', c: '#0b6b3a', nos: ['SV 214', 'SV 842'], dep: '09:00', route: ['TUN', 'JED', 'KUL'], sd: [285, 525], lay: [260], price: 561.00, fare: 'Economy Classic', bags: 2, seat: 1, cf: 150, chf: 120 },
  { id: 7, al: 'Qatar Airways', ini: 'QR', c: '#5c0632', nos: ['QR 1404', 'QR 850'], dep: '18:30', route: ['TUN', 'DOH', 'KUL'], sd: [345, 420], lay: [185], price: 574.00, fare: 'Economy Classic', bags: 2, seat: 1, cf: 195, chf: 105 },
]

