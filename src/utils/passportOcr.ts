import { parseTd3Mrz, type ParsedPassport } from './mrzParser'

/**
 * Clean OCR text line by line to locate MRZ lines
 */
export function extractMrzLines(rawText: string): { line1: string; line2: string } | null {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim().replace(/\s+/g, ''))
    .filter(l => l.length >= 30)

  // Look for line starting with P< or P followed by letters/<
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^P[<A-Z0-9]/i.test(line) && line.length >= 35) {
      // The next long line is almost certainly line 2
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j]
        if (nextLine.length >= 35 && /[0-9]/.test(nextLine)) {
          return {
            line1: line.toUpperCase(),
            line2: nextLine.toUpperCase(),
          }
        }
      }
    }
  }

  // Alternative: check if any two consecutive lines look like MRZ
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i].toUpperCase()
    const l2 = lines[i + 1].toUpperCase()
    if (l1.includes('<<') && /[0-9]/.test(l2)) {
      return { line1: l1, line2: l2 }
    }
  }

  return null
}

/**
 * Fallback: extract fields from visual text if MRZ is not found or blurry
 */
export function extractVisualFields(rawText: string): Partial<ParsedPassport> {
  const text = rawText.toUpperCase()
  const result: Partial<ParsedPassport> = {
    confidence: 0.75,
  }

  // 1. Passport Number regex (e.g. B1240467, A8941203, 124046)
  const pnoMatch = text.match(/(?:PASSPORT|DOC|NUMBER|NO|N°)[.:\s]*([A-Z0-9]{6,10})/i) ||
                   text.match(/\b([A-Z][0-9]{7,9})\b/)
  if (pnoMatch) {
    result.passportNumber = pnoMatch[1].trim()
  }

  // 2. Surname / Last name
  const surnameMatch = text.match(/(?:SURNAME|LAST\s*NAME|NOM)[.:\s]+([A-Z\s]{2,25})/i)
  if (surnameMatch) {
    result.lastName = surnameMatch[1].trim().split(/\n/)[0].trim()
  }

  // 3. Given names / First name
  const givenMatch = text.match(/(?:GIVEN\s*NAMES?|FIRST\s*NAME|PRENOMS?)[.:\s]+([A-Z\s]{2,30})/i)
  if (givenMatch) {
    result.firstName = givenMatch[1].trim().split(/\n/)[0].trim()
  }

  // 4. Nationality
  const natMatch = text.match(/(?:NATIONALITY|NATIONALITE)[.:\s]+([A-Z\s]{3,20})/i)
  if (natMatch) {
    const rawNat = natMatch[1].trim()
    if (rawNat.includes('LIBY') || rawNat.includes('LBA')) result.nationality = 'LY'
    else if (rawNat.includes('EMIRAT') || rawNat.includes('ARE') || rawNat.includes('UAE')) result.nationality = 'AE'
    else if (rawNat.includes('SAUDI') || rawNat.includes('SAU')) result.nationality = 'SA'
    else if (rawNat.includes('EGYPT') || rawNat.includes('EGY')) result.nationality = 'EG'
    else if (rawNat.includes('TURK') || rawNat.includes('TUR')) result.nationality = 'TR'
    else if (rawNat.includes('MALAYS') || rawNat.includes('MYS')) result.nationality = 'MY'
    else if (rawNat.includes('BRIT') || rawNat.includes('GBR')) result.nationality = 'GB'
    else if (rawNat.includes('AMERIC') || rawNat.includes('USA')) result.nationality = 'US'
    else result.nationality = 'LY'
  }

  // 5. Gender
  const sexMatch = text.match(/(?:SEX|SEXE|GENDER)[.:\s]*([MF])/i)
  if (sexMatch) {
    result.gender = sexMatch[1].toUpperCase() === 'F' ? 'Female' : 'Male'
    result.title = result.gender === 'Female' ? 'Ms' : 'Mr'
  }

  // 6. Date of Birth (DD/MM/YYYY or YYYY-MM-DD)
  const dobMatch = text.match(/(?:BIRTH|NAISSANCE|DOB)[.:\s]*(\d{1,2}[-/. ]\d{1,2}[-/. ]\d{2,4})/i) ||
                   text.match(/\b(\d{2}[-/. ]\d{2}[-/. ]\d{4})\b/)
  if (dobMatch) {
    const rawDob = dobMatch[1].replace(/[/.]/g, '-')
    const parts = rawDob.split('-')
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        result.dateOfBirth = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      } else {
        result.dateOfBirth = rawDob
      }
    }
  }

  return result
}

/**
 * Main OCR recognition and extraction pipeline
 */
export async function processPassportImageWithOcr(
  imageUri: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedPassport | null> {
  const { createWorker } = await import('tesseract.js')

  onProgress?.(15, 'Initializing OCR engine...')
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round(15 + m.progress * 70)
        onProgress?.(pct, `Scanning passport image (${Math.round(m.progress * 100)}%)...`)
      }
    },
  })

  onProgress?.(30, 'Analyzing image contrast and text...')
  const result = await worker.recognize(imageUri)
  const rawText = result.data.text
  await worker.terminate()

  onProgress?.(85, 'Locating Machine Readable Zone (MRZ)...')

  // Step 1: Try parsing MRZ first
  const mrz = extractMrzLines(rawText)
  if (mrz) {
    const parsed = parseTd3Mrz(mrz.line1, mrz.line2)
    if (parsed && (parsed.firstName || parsed.lastName || parsed.passportNumber)) {
      onProgress?.(100, 'Passport parsed successfully via MRZ!')
      return parsed
    }
  }

  // Step 2: Fallback to visual field extraction
  onProgress?.(90, 'Extracting visual inspection fields...')
  const visual = extractVisualFields(rawText)

  if (visual.firstName || visual.lastName || visual.passportNumber) {
    onProgress?.(100, 'Passport parsed successfully!')
    return {
      documentType: 'P',
      issuingCountry: visual.nationality || 'LY',
      issuingCountryIcao: visual.nationality === 'AE' ? 'ARE' : 'LBA',
      lastName: visual.lastName || '',
      firstName: visual.firstName || '',
      passportNumber: visual.passportNumber || '',
      nationality: visual.nationality || 'LY',
      nationalityIcao: visual.nationality === 'AE' ? 'ARE' : 'LBA',
      dateOfBirth: visual.dateOfBirth || '',
      gender: visual.gender || 'Male',
      expiryDate: visual.expiryDate || '',
      title: visual.title || 'Mr',
      confidence: 0.85,
    }
  }

  return null
}
