/**
 * Indian Document Validation Utilities
 * Validates various Indian legal documents
 */

export interface DocumentValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validate Aadhaar number (12 digits)
 */
export function validateAadhaar(aadhaar: string): DocumentValidationResult {
  // Remove spaces and hyphens
  const cleaned = aadhaar.replace(/[\s-]/g, '');

  if (cleaned.length !== 12) {
    return { isValid: false, error: 'Aadhaar must be 12 digits' };
  }

  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'Aadhaar must contain only numbers' };
  }

  // Verhoeff algorithm for Aadhaar checksum validation
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  let c = 0;
  const reversedDigits = cleaned.split('').reverse().map(Number);

  for (let i = 0; i < reversedDigits.length; i++) {
    c = d[c][p[i % 8][reversedDigits[i]]];
  }

  if (c !== 0) {
    return { isValid: false, error: 'Invalid Aadhaar number' };
  }

  // Format: XXXX XXXX XXXX
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;

  return { isValid: true, formatted };
}

/**
 * Validate PAN (Permanent Account Number)
 * Format: AAAAA9999A
 */
export function validatePAN(pan: string): DocumentValidationResult {
  const cleaned = pan.toUpperCase().replace(/\s/g, '');

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'PAN must be 10 characters' };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid PAN format (AAAAA9999A)' };
  }

  // Check fourth character (type of holder)
  const fourthChar = cleaned[3];
  const validFourthChars = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];

  if (!validFourthChars.includes(fourthChar)) {
    return { isValid: false, error: 'Invalid PAN type' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate GST Number (Goods and Services Tax Identification Number)
 * Format: 99AAAAA9999A9Z9
 */
export function validateGST(gst: string): DocumentValidationResult {
  const cleaned = gst.toUpperCase().replace(/\s/g, '');

  if (cleaned.length !== 15) {
    return { isValid: false, error: 'GST number must be 15 characters' };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid GST format' };
  }

  // Extract PAN from GST (characters 3-12)
  const panPart = cleaned.substring(2, 12);
  const panValidation = validatePAN(panPart);

  if (!panValidation.isValid) {
    return { isValid: false, error: 'Invalid PAN in GST number' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate Driving License
 * Format varies by state, but generally: AA99 99999999999
 */
export function validateDrivingLicense(dl: string): DocumentValidationResult {
  const cleaned = dl.toUpperCase().replace(/[\s-]/g, '');

  // General format: 2 letters (state code) + 2 digits (RTO code) + 4 digits (year) + 7 digits (serial)
  const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;

  if (!dlRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid driving license format' };
  }

  // Validate state code (some examples)
  const stateCode = cleaned.substring(0, 2);
  const validStateCodes = [
    'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH',
    'KA', 'KL', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB',
    'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB', 'DL', 'AN',
    'CH', 'DD', 'JK', 'LA', 'LD', 'PY'
  ];

  if (!validStateCodes.includes(stateCode)) {
    return { isValid: false, error: 'Invalid state code in driving license' };
  }

  // Format: AA99 99999999999
  const formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;

  return { isValid: true, formatted };
}

/**
 * Validate Voter ID (EPIC - Electors Photo Identity Card)
 * Format: AAA9999999
 */
export function validateVoterID(voterID: string): DocumentValidationResult {
  const cleaned = voterID.toUpperCase().replace(/\s/g, '');

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Voter ID must be 10 characters' };
  }

  const voterIDRegex = /^[A-Z]{3}[0-9]{7}$/;

  if (!voterIDRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid Voter ID format (AAA9999999)' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate UAN (Universal Account Number) for EPF
 * Format: 12 digits
 */
export function validateUAN(uan: string): DocumentValidationResult {
  const cleaned = uan.replace(/\s/g, '');

  if (cleaned.length !== 12) {
    return { isValid: false, error: 'UAN must be 12 digits' };
  }

  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'UAN must contain only numbers' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate Indian Bank Account Number
 * Format varies (9-18 digits)
 */
export function validateBankAccount(accountNumber: string): DocumentValidationResult {
  const cleaned = accountNumber.replace(/\s/g, '');

  if (cleaned.length < 9 || cleaned.length > 18) {
    return { isValid: false, error: 'Bank account number must be 9-18 digits' };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Bank account number must contain only numbers' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Validate IFSC Code (Indian Financial System Code)
 * Format: AAAA0999999
 */
export function validateIFSC(ifsc: string): DocumentValidationResult {
  const cleaned = ifsc.toUpperCase().replace(/\s/g, '');

  if (cleaned.length !== 11) {
    return { isValid: false, error: 'IFSC code must be 11 characters' };
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!ifscRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid IFSC code format' };
  }

  return { isValid: true, formatted: cleaned };
}

/**
 * Get document type from string
 */
export function detectDocumentType(documentNumber: string): string | null {
  const cleaned = documentNumber.toUpperCase().replace(/[\s-]/g, '');

  if (cleaned.length === 12 && /^\d{12}$/.test(cleaned)) {
    return 'aadhaar';
  }

  if (cleaned.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleaned)) {
    return 'pan';
  }

  if (cleaned.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]/.test(cleaned)) {
    return 'gst';
  }

  if (cleaned.length === 15 && /^[A-Z]{2}[0-9]{2}/.test(cleaned)) {
    return 'driving-license';
  }

  if (cleaned.length === 10 && /^[A-Z]{3}[0-9]{7}$/.test(cleaned)) {
    return 'voter-id';
  }

  if (cleaned.length === 11 && /^[A-Z]{4}0/.test(cleaned)) {
    return 'ifsc';
  }

  return null;
}

/**
 * Validate any Indian document
 */
export function validateDocument(documentNumber: string, type?: string): DocumentValidationResult {
  const detectedType = type || detectDocumentType(documentNumber);

  if (!detectedType) {
    return { isValid: false, error: 'Could not detect document type' };
  }

  switch (detectedType) {
    case 'aadhaar':
      return validateAadhaar(documentNumber);
    case 'pan':
      return validatePAN(documentNumber);
    case 'gst':
      return validateGST(documentNumber);
    case 'driving-license':
      return validateDrivingLicense(documentNumber);
    case 'voter-id':
      return validateVoterID(documentNumber);
    case 'uan':
      return validateUAN(documentNumber);
    case 'ifsc':
      return validateIFSC(documentNumber);
    case 'bank-account':
      return validateBankAccount(documentNumber);
    default:
      return { isValid: false, error: 'Unsupported document type' };
  }
}

/**
 * Mask sensitive document numbers for display
 */
export function maskDocument(documentNumber: string, type: string): string {
  const cleaned = documentNumber.replace(/[\s-]/g, '');

  switch (type) {
    case 'aadhaar':
      // Show only last 4 digits: XXXX XXXX 1234
      return `XXXX XXXX ${cleaned.slice(-4)}`;

    case 'pan':
      // Show first and last characters: AXXXX9999X
      return `${cleaned[0]}XXXX${cleaned.slice(-5)}`;

    case 'bank-account':
      // Show last 4 digits: XXXXXX1234
      return 'X'.repeat(cleaned.length - 4) + cleaned.slice(-4);

    default:
      return cleaned;
  }
}
