// ICAO Doc 9303 MRZ (Machine Readable Zone) Parser and Validator

export interface ParsedPassport {
  documentType: string
  issuingCountry: string // 2-letter ISO
  issuingCountryIcao: string // 3-letter ICAO
  lastName: string
  firstName: string
  passportNumber: string
  nationality: string // 2-letter ISO
  nationalityIcao: string // 3-letter ICAO
  dateOfBirth: string // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other'
  expiryDate: string // YYYY-MM-DD
  title: 'Mr' | 'Mrs' | 'Ms'
  confidence: number
}

// 3-letter ICAO to 2-letter ISO country mapping
export const icaoToIsoMap: Record<string, string> = {
  LBA: 'LY', // Libya
  ARE: 'AE', // United Arab Emirates
  SAU: 'SA', // Saudi Arabia
  EGY: 'EG', // Egypt
  TUN: 'TN', // Tunisia
  DZA: 'DZ', // Algeria
  MAR: 'MA', // Morocco
  TUR: 'TR', // Turkey
  MYS: 'MY', // Malaysia
  GBR: 'GB', // United Kingdom
  USA: 'US', // United States
  CAN: 'CA', // Canada
  FRA: 'FR', // France
  DEU: 'DE', // Germany
  ITA: 'IT', // Italy
  ESP: 'ES', // Spain
  JOR: 'JO', // Jordan
  LBN: 'LB', // Lebanon
  IRQ: 'IQ', // Iraq
  QAT: 'QA', // Qatar
  KWT: 'KW', // Kuwait
  BHR: 'BH', // Bahrain
  OMN: 'OM', // Oman
  IND: 'IN', // India
  PAK: 'PK', // Pakistan
}

// Weight multipliers defined by ICAO 9303 for check digits
const WEIGHTS = [7, 3, 1]

export function calculateCheckDigit(str: string): number {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    let val = 0
    if (char >= '0' && char <= '9') {
      val = parseInt(char, 10)
    } else if (char >= 'A' && char <= 'Z') {
      val = char.charCodeAt(0) - 55
    } else if (char === '<') {
      val = 0
    }
    sum += val * WEIGHTS[i % 3]
  }
  return sum % 10
}

/**
 * Format YYMMDD into YYYY-MM-DD with century heuristic
 */
export function formatMrzDate(yymmdd: string, isExpiry = false): string {
  if (!yymmdd || yymmdd.length !== 6) return ''
  const yy = parseInt(yymmdd.slice(0, 2), 10)
  const mm = yymmdd.slice(2, 4)
  const dd = yymmdd.slice(4, 6)

  const currentYearTwoDigits = new Date().getFullYear() % 100

  let century = 1900
  if (isExpiry) {
    // Expiry date: usually in the future or recent past
    century = 2000
  } else {
    // DOB: if YY <= currentYearTwoDigits, could be 2000s, otherwise 1900s
    century = yy <= currentYearTwoDigits ? 2000 : 1900
  }

  const yyyy = century + yy
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Parse standard TD3 2-line ICAO 9303 MRZ string
 */
export function parseTd3Mrz(line1: string, line2: string): ParsedPassport | null {
  const l1 = line1.replace(/[^A-Z0-9<]/g, '').padEnd(44, '<')
  const l2 = line2.replace(/[^A-Z0-9<]/g, '').padEnd(44, '<')

  if (l1.length < 44 || l2.length < 44) return null

  // Line 1: P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
  const documentType = l1.slice(0, 2).replace(/</g, '')
  const issuingCountryIcao = l1.slice(2, 5).replace(/</g, '')
  const issuingCountry = icaoToIsoMap[issuingCountryIcao] || issuingCountryIcao.slice(0, 2)

  const namesPart = l1.slice(5)
  const nameSegments = namesPart.split('<<')
  const lastName = (nameSegments[0] || '').replace(/</g, ' ').trim()
  const firstName = (nameSegments[1] || '').replace(/</g, ' ').trim()

  // Line 2: L8988901C4UTO7408122F1204159ZE184226B<<<<<10
  const passportNumber = l2.slice(0, 9).replace(/</g, '').trim()
  const nationalityIcao = l2.slice(10, 13).replace(/</g, '')
  const nationality = icaoToIsoMap[nationalityIcao] || nationalityIcao.slice(0, 2)

  const dobRaw = l2.slice(13, 19)
  const dateOfBirth = formatMrzDate(dobRaw, false)

  const genderChar = l2.charAt(20)
  const gender: 'Male' | 'Female' | 'Other' =
    genderChar === 'M' ? 'Male' : genderChar === 'F' ? 'Female' : 'Other'

  const expiryRaw = l2.slice(21, 27)
  const expiryDate = formatMrzDate(expiryRaw, true)

  const title = gender === 'Female' ? 'Ms' : 'Mr'

  return {
    documentType: documentType || 'P',
    issuingCountry,
    issuingCountryIcao,
    lastName,
    firstName,
    passportNumber,
    nationality,
    nationalityIcao,
    dateOfBirth,
    gender,
    expiryDate,
    title,
    confidence: 0.99,
  }
}

