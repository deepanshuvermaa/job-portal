import Tesseract from 'tesseract.js';

export interface ExtractedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  rawText: string;
}

export interface ExtractedDocumentData {
  name?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  licenseNumber?: string;
  businessName?: string;
  rawText: string;
  documentType?: 'aadhaar' | 'pan' | 'gst' | 'license' | 'unknown';
}

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(file, 'eng+hin', {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from PDF
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Parse resume text and extract structured data
 */
export function parseResumeText(text: string): ExtractedResumeData {
  const data: ExtractedResumeData = {
    rawText: text,
    skills: [],
  };

  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Extract Indian phone number
  const phoneRegex = /(?:\+91|91)?[\s-]?[6-9]\d{9}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    data.phone = phoneMatch[0].replace(/\D/g, '').slice(-10);
  }

  // Extract name (usually first line or after "Name:")
  const nameRegex = /(?:Name|नाम)[\s:]+([A-Za-z\s]+)/i;
  const nameMatch = text.match(nameRegex);
  if (nameMatch) {
    data.name = nameMatch[1].trim();
  } else {
    // Try to get first line as name
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      data.name = lines[0].trim();
    }
  }

  // Extract experience
  const experienceRegex = /(\d+[\s-]+(?:years?|yrs?|साल))(?:\s+(?:of\s+)?experience)?/gi;
  const expMatch = text.match(experienceRegex);
  if (expMatch) {
    data.experience = expMatch[0];
  }

  // Extract skills (common keywords)
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css',
    'driving', 'ड्राइविंग', 'cooking', 'खाना बनाना', 'plumbing', 'electrical',
    'mechanic', 'मैकेनिक', 'delivery', 'डिलीवरी', 'sales', 'सेल्स',
    'cleaning', 'सफाई', 'security', 'सुरक्षा', 'helper', 'हेल्पर'
  ];

  const textLower = text.toLowerCase();
  data.skills = commonSkills.filter(skill =>
    textLower.includes(skill.toLowerCase())
  );

  // Extract education
  const eduKeywords = ['b.tech', 'b.e', 'mca', 'mba', 'bca', 'bsc', 'msc', '10th', '12th', 'graduation'];
  const eduRegex = new RegExp(`(${eduKeywords.join('|')})`, 'gi');
  const eduMatch = text.match(eduRegex);
  if (eduMatch) {
    data.education = eduMatch.join(', ');
  }

  return data;
}

/**
 * Main function to process resume file
 */
export async function processResume(file: File): Promise<ExtractedResumeData> {
  let text = '';

  if (file.type.includes('pdf')) {
    text = await extractTextFromPDF(file);
  } else if (file.type.includes('image')) {
    text = await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or image.');
  }

  return parseResumeText(text);
}

/**
 * Parse document text and extract verification data (Aadhaar, PAN, GST, License)
 */
export function parseDocumentText(text: string): ExtractedDocumentData {
  const data: ExtractedDocumentData = {
    rawText: text,
  };

  // Remove extra spaces and normalize
  const normalizedText = text.replace(/\s+/g, ' ').toUpperCase();

  // Extract Aadhaar Number (12 digits, may have spaces)
  const aadhaarRegex = /(\d{4}[\s-]?\d{4}[\s-]?\d{4})/g;
  const aadhaarMatch = normalizedText.match(aadhaarRegex);
  if (aadhaarMatch) {
    data.aadhaarNumber = aadhaarMatch[0].replace(/[\s-]/g, '');
    data.documentType = 'aadhaar';
  }

  // Extract PAN Number (AAAAA9999A format)
  const panRegex = /([A-Z]{5}[0-9]{4}[A-Z]{1})/g;
  const panMatch = normalizedText.match(panRegex);
  if (panMatch) {
    data.panNumber = panMatch[0];
    if (!data.documentType) data.documentType = 'pan';
  }

  // Extract GST Number (15 characters)
  const gstRegex = /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/g;
  const gstMatch = normalizedText.match(gstRegex);
  if (gstMatch) {
    data.gstNumber = gstMatch[0];
    if (!data.documentType) data.documentType = 'gst';
  }

  // Extract Driving License Number (various formats: HR-06 20160034761, DL-1420110012345, etc.)
  const licenseRegex = /([A-Z]{2}[-\s]?\d{2}[\s]?\d{11,}|[A-Z]{2}\d{13,})/g;
  const licenseMatch = normalizedText.match(licenseRegex);
  if (licenseMatch) {
    data.licenseNumber = licenseMatch[0].replace(/\s/g, '');
    if (!data.documentType) data.documentType = 'license';
  }

  // Extract Name (look for common patterns)
  const namePatterns = [
    /(?:NAME|नाम)[\s:]+([A-Z\s]{3,50})/i,
    /(?:HOLDER['S]*\s+NAME)[\s:]+([A-Z\s]{3,50})/i,
    /(?:CARDHOLDER|APPLICANT)[\s:]+([A-Z\s]{3,50})/i,
  ];

  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
      break;
    }
  }

  // If no name found, try to get first capitaliz ed line
  if (!data.name) {
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (/^[A-Z\s]{3,}$/.test(line.trim())) {
        data.name = line.trim();
        break;
      }
    }
  }

  // Extract Business Name (for GST documents)
  const businessPatterns = [
    /(?:LEGAL\s+NAME|BUSINESS\s+NAME|TRADE\s+NAME)[\s:]+([A-Z\s&.,]{3,100})/i,
    /(?:FIRM|COMPANY|ENTERPRISE)[\s:]+([A-Z\s&.,]{3,100})/i,
  ];

  for (const pattern of businessPatterns) {
    const businessMatch = text.match(pattern);
    if (businessMatch) {
      data.businessName = businessMatch[1].trim();
      break;
    }
  }

  if (!data.documentType) {
    data.documentType = 'unknown';
  }

  return data;
}

/**
 * Main function to process identity/business document and extract verification data
 */
export async function processDocument(file: File): Promise<ExtractedDocumentData> {
  let text = '';

  if (file.type.includes('pdf')) {
    text = await extractTextFromPDF(file);
  } else if (file.type.includes('image')) {
    text = await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or image.');
  }

  return parseDocumentText(text);
}
