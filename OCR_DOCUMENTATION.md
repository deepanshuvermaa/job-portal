# OCR Implementation Documentation

## Overview
The job portal platform uses Optical Character Recognition (OCR) to extract data from uploaded resumes and identity documents. This feature helps streamline the signup process by auto-filling forms with extracted information.

## Technology Stack
- **Tesseract.js**: JavaScript OCR engine for image text extraction
- **PDF.js**: PDF parsing and text extraction
- **Languages Supported**: English (`eng`) and Hindi (`hin`)

## File Location
[src/utils/ocr.ts](local-jobs-platform/src/utils/ocr.ts)

---

## Current Implementation

### 1. Resume Processing
**Function:** `processResume(file: File)`

**Supported Formats:**
- PDF documents
- Image files (JPG, PNG, etc.)

**Extracted Data:**
```typescript
interface ExtractedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  rawText: string;
}
```

**Extraction Patterns:**

#### Name Detection
1. Searches for "Name" or "नाम" followed by text
2. Falls back to first non-empty line if pattern not found

#### Email Detection
- Regex: `/[\w.-]+@[\w.-]+\.\w+/gi`
- Extracts standard email format

#### Phone Number Detection
- Regex: `/(?:\+91|91)?[\s-]?[6-9]\d{9}/g`
- Extracts Indian mobile numbers (10 digits)
- Strips country code and formatting

#### Experience Detection
- Regex: `/(\d+[\s-]+(?:years?|yrs?|साल))(?:\s+(?:of\s+)?experience)?/gi`
- Detects patterns like "5 years", "3 yrs", "2 साल"

#### Skills Detection
Keyword matching against predefined skill list:
- **Tech Skills**: javascript, python, java, react, node, sql, html, css
- **Blue-Collar Skills**: driving, cooking, plumbing, electrical, mechanic, delivery, sales, cleaning, security, helper
- **Hindi Equivalents**: ड्राइविंग, खाना बनाना, मैकेनिक, डिलीवरी, सेल्स, सफाई, सुरक्षा, हेल्पर

#### Education Detection
Keyword matching: b.tech, b.e, mca, mba, bca, bsc, msc, 10th, 12th, graduation

---

### 2. Document Verification Processing
**Function:** `processDocument(file: File)`

**Supported Documents:**
- Aadhaar Card
- PAN Card
- GST Certificate
- Driving License

**Extracted Data:**
```typescript
interface ExtractedDocumentData {
  name?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  licenseNumber?: string;
  businessName?: string;
  rawText: string;
  documentType?: 'aadhaar' | 'pan' | 'gst' | 'license' | 'unknown';
}
```

**Extraction Patterns:**

#### Aadhaar Number
- Regex: `/(\d{4}[\s-]?\d{4}[\s-]?\d{4})/g`
- 12 digits, may have spaces/hyphens
- Auto-strips formatting

#### PAN Number
- Regex: `/([A-Z]{5}[0-9]{4}[A-Z]{1})/g`
- Format: AAAAA9999A (5 letters, 4 digits, 1 letter)

#### GST Number
- Regex: `/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/g`
- 15 characters following GST format

#### Driving License Number
- Regex: `/([A-Z]{2}[-\s]?\d{2}[\s]?\d{11,}|[A-Z]{2}\d{13,})/g`
- Various formats supported (state-specific)

#### Name Extraction
Searches for multiple patterns:
- "NAME" or "नाम" followed by text
- "HOLDER'S NAME"
- "CARDHOLDER" or "APPLICANT"
- Falls back to first all-caps line

#### Business Name (GST documents)
Searches for:
- "LEGAL NAME"
- "BUSINESS NAME"
- "TRADE NAME"
- "FIRM/COMPANY/ENTERPRISE"

---

## Accuracy Limitations

### Known Issues

#### 1. **Image Quality Dependency**
- **Problem**: OCR accuracy heavily depends on image quality
- **Impact**: Blurry, rotated, or low-resolution images produce poor results
- **Mitigation**: UI guidance to users for clear, well-lit photos

#### 2. **Handwritten Text**
- **Problem**: Tesseract.js struggles with handwritten documents
- **Impact**: Cannot extract data from handwritten resumes
- **Mitigation**: None currently - digital/typed documents only

#### 3. **Complex Layouts**
- **Problem**: Multi-column resumes or complex formatting confuse text ordering
- **Impact**: Text may be extracted out of order, affecting name detection
- **Mitigation**: Regex patterns with multiple fallbacks

#### 4. **Language Mixing**
- **Problem**: Documents with mixed English/Hindi text may have reduced accuracy
- **Impact**: Partial data extraction
- **Status**: Both languages configured in Tesseract, but accuracy varies

#### 5. **Skill Detection Limitations**
- **Problem**: Relies on predefined keyword list
- **Impact**: Only detects skills that are hardcoded in the array
- **Improvement Needed**:
  - Expand skill keyword database
  - Implement fuzzy matching
  - Add industry-specific skill categories

#### 6. **False Positives**
- **Problem**: Regex patterns may match incorrect data
  - Phone numbers in reference sections
  - Random number sequences matching Aadhaar pattern
  - Email addresses in headers/footers
- **Impact**: Incorrect auto-fill suggestions
- **Mitigation**: Manual user verification required

#### 7. **PDF Extraction Issues**
- **Problem**: Scanned PDFs (images embedded in PDF) require OCR
- **Impact**: PDF.js extracts selectable text only, not images
- **Current Behavior**:
  - Works: Digital PDFs with selectable text
  - Fails: Scanned/image-based PDFs
- **Improvement Needed**: Detect scanned PDFs and run OCR on embedded images

#### 8. **Document Type Auto-Detection**
- **Problem**: Relies on finding specific patterns (Aadhaar number → Aadhaar card)
- **Impact**: May misidentify documents if patterns overlap
- **Example**: A document with both PAN and GST may be classified as PAN

---

## Performance Considerations

### Processing Time
- **Image OCR**: 5-15 seconds (depending on image size and complexity)
- **PDF Text Extraction**: 1-3 seconds (for digital PDFs)
- **PDF OCR**: 10-30 seconds (for scanned PDFs, if implemented)

### Resource Usage
- Tesseract.js runs in browser (client-side processing)
- Large files (>5MB) may cause browser slowdown
- Mobile devices may experience significant delay

---

## Potential Improvements

### High Priority
1. **Image Quality Validation**
   - Check image resolution before processing
   - Warn users about blurry/dark images
   - Auto-rotate skewed documents

2. **Enhanced Skill Extraction**
   - Expand skill keyword database (100+ skills)
   - Add synonym matching (e.g., "driver" = "driving")
   - Category-based skill detection

3. **Better Name Extraction**
   - Machine learning model for name detection
   - Position-based heuristics (top 20% of document)
   - Name validation against common patterns

### Medium Priority
4. **Scanned PDF Support**
   - Detect if PDF contains images
   - Extract images and run OCR
   - Combine text and OCR results

5. **Multi-Language Enhancement**
   - Better Hindi character recognition
   - Support for regional languages (Tamil, Telugu, etc.)
   - Language auto-detection

6. **Confidence Scoring**
   - Return confidence levels for each extracted field
   - Highlight low-confidence fields for user review
   - Allow users to confirm/reject extractions

### Low Priority
7. **Advanced Document Analysis**
   - Layout analysis to identify sections
   - Table extraction for structured data
   - Work history timeline extraction

8. **Progressive Enhancement**
   - Show partial results as extraction progresses
   - Background processing with web workers
   - Caching of processed documents

---

## Usage in Application

### Worker Signup
**File:** [WorkerSignup.tsx](local-jobs-platform/src/pages/WorkerSignup.tsx)

**Workflow:**
1. User uploads resume (PDF or image)
2. `processResume()` extracts data
3. Form auto-fills with extracted values
4. User reviews and corrects any errors
5. Form submission proceeds with corrected data

**User Experience:**
- Optional feature (users can skip resume upload)
- Loading indicator during processing
- Clear error messages on failure
- All fields remain editable after auto-fill

### Document Verification
**Usage:** Currently NOT implemented in UI, but OCR functions are ready

**Potential Use Cases:**
- Auto-fill Aadhaar number during verification
- Extract PAN for employer signup
- Validate GST certificate uploads
- Verify driving license for driver jobs

---

## Testing Recommendations

### Test Cases

#### Resume Testing
- [ ] Test with clear, high-quality PDF resume
- [ ] Test with scanned image resume
- [ ] Test with multi-column layout
- [ ] Test with Hindi resume
- [ ] Test with mixed English/Hindi
- [ ] Test with handwritten resume (expected to fail)
- [ ] Test with very long resume (10+ pages)
- [ ] Test with resume in landscape orientation

#### Document Testing
- [ ] Test with real Aadhaar card image
- [ ] Test with PAN card PDF
- [ ] Test with GST certificate
- [ ] Test with driving license (multiple states)
- [ ] Test with blurry document photos
- [ ] Test with rotated documents

#### Edge Cases
- [ ] Extremely large files (>10MB)
- [ ] Corrupted files
- [ ] Non-English/Hindi languages
- [ ] Documents with watermarks
- [ ] Black and white scans
- [ ] Low-contrast images

---

## Code Quality Assessment

### Strengths
- ✅ Well-structured and modular functions
- ✅ TypeScript interfaces for type safety
- ✅ Comprehensive regex patterns for Indian documents
- ✅ Both English and Hindi language support
- ✅ Error handling with try-catch blocks
- ✅ Support for both PDF and image formats

### Areas for Improvement
- ⚠️ No confidence scoring for extracted data
- ⚠️ Limited skill keyword database (hardcoded array)
- ⚠️ No validation of extracted data (e.g., phone number format check)
- ⚠️ No caching mechanism for repeated file processing
- ⚠️ Console.log in production code (Tesseract logger)

---

## Configuration

### Tesseract.js Settings
```typescript
Tesseract.recognize(file, 'eng+hin', {
  logger: (m) => console.log(m), // Consider removing in production
});
```

### PDF.js Worker Configuration
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

**Note:** Using CDN for worker. Consider self-hosting for production.

---

## Conclusion

The current OCR implementation provides a **basic but functional** text extraction system suitable for:
- ✅ Digital/typed resumes (PDF and images)
- ✅ Clear, high-quality document photos
- ✅ Standard Indian identity documents

**Not suitable for:**
- ❌ Handwritten documents
- ❌ Very poor quality images
- ❌ Complex multi-column layouts
- ❌ Advanced data extraction (work history, projects, etc.)

**Recommended Action:**
- Keep current implementation for MVP
- Add image quality validation
- Expand skill keyword database
- Implement confidence scoring
- Consider ML-based extraction for v2.0

---

*Last Updated: 2026-03-09*
*Status: Production-ready with known limitations*
