import Tesseract from 'tesseract.js';
import { ExtractedDocumentData } from '../types';
import { validateAadhaar, validatePAN, validateGST } from '../utils/helpers';

export class OCRService {
  /**
   * Process document and extract text using Tesseract
   */
  static async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageBuffer, 'eng+hin', {
        logger: (m) => console.log(m),
      });
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Parse extracted text and identify document type
   */
  static parseDocumentText(text: string): ExtractedDocumentData {
    const normalizedText = text.replace(/\s+/g, ' ').toUpperCase();
    const data: ExtractedDocumentData = {
      rawText: text,
      confidence: 0,
    };

    // Extract Aadhaar Number (12 digits)
    const aadhaarRegex = /(\d{4}[\s-]?\d{4}[\s-]?\d{4})/g;
    const aadhaarMatch = normalizedText.match(aadhaarRegex);
    if (aadhaarMatch) {
      const aadhaarNumber = aadhaarMatch[0].replace(/[\s-]/g, '');
      if (validateAadhaar(aadhaarNumber)) {
        data.aadhaarNumber = aadhaarNumber;
        data.documentType = 'aadhaar';
        data.confidence = 85;
      }
    }

    // Extract PAN Number
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const panMatch = normalizedText.match(panRegex);
    if (panMatch) {
      const panNumber = panMatch[0];
      if (validatePAN(panNumber)) {
        data.panNumber = panNumber;
        data.documentType = 'pan';
        data.confidence = 90;
      }
    }

    // Extract GST Number
    const gstRegex = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g;
    const gstMatch = normalizedText.match(gstRegex);
    if (gstMatch) {
      const gstNumber = gstMatch[0];
      if (validateGST(gstNumber)) {
        data.gstNumber = gstNumber;
        data.documentType = 'gst';
        data.confidence = 88;
      }
    }

    // Extract Name (common patterns)
    if (data.documentType === 'aadhaar') {
      // Aadhaar cards typically have name after specific keywords
      const namePatterns = [
        /NAME[:\s]+([A-Z\s]{3,50})/,
        /नाम[:\s]+([A-Z\s]{3,50})/,
      ];

      for (const pattern of namePatterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
          data.name = match[1].trim();
          break;
        }
      }
    } else if (data.documentType === 'pan') {
      // PAN cards have name in a specific format
      const nameMatch = normalizedText.match(/NAME[:\s]+([A-Z\s]{3,50})/);
      if (nameMatch && nameMatch[1]) {
        data.name = nameMatch[1].trim();
      }
    }

    // Extract Business Name (for GST)
    if (data.documentType === 'gst') {
      const businessPatterns = [
        /LEGAL NAME[:\s]+([A-Z0-9\s&.,]{3,100})/,
        /TRADE NAME[:\s]+([A-Z0-9\s&.,]{3,100})/,
      ];

      for (const pattern of businessPatterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
          data.businessName = match[1].trim();
          break;
        }
      }
    }

    // If no specific document type detected
    if (!data.documentType) {
      data.documentType = 'unknown';
      data.confidence = 30;
    }

    return data;
  }

  /**
   * Main function to process document
   */
  static async processDocument(imageBuffer: Buffer): Promise<ExtractedDocumentData> {
    try {
      const text = await this.extractTextFromImage(imageBuffer);
      const parsedData = this.parseDocumentText(text);
      return parsedData;
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error('Failed to process document');
    }
  }
}

export default OCRService;
