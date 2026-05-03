import type { JobCategory } from '../types';

export const JOB_CATEGORIES: { value: JobCategory; label: string; labelHi: string }[] = [
  { value: 'delivery', label: 'Delivery', labelHi: 'डिलीवरी' },
  { value: 'driver', label: 'Driver', labelHi: 'ड्राइवर' },
  { value: 'helper', label: 'Helper', labelHi: 'हेल्पर' },
  { value: 'mechanic', label: 'Mechanic', labelHi: 'मैकेनिक' },
  { value: 'electrician', label: 'Electrician', labelHi: 'इलेक्ट्रीशियन' },
  { value: 'plumber', label: 'Plumber', labelHi: 'प्लंबर' },
  { value: 'cook', label: 'Cook', labelHi: 'रसोइया' },
  { value: 'waiter', label: 'Waiter', labelHi: 'वेटर' },
  { value: 'cleaner', label: 'Cleaner', labelHi: 'सफाई कर्मचारी' },
  { value: 'security', label: 'Security', labelHi: 'सिक्योरिटी गार्ड' },
  { value: 'sales', label: 'Sales', labelHi: 'सेल्स' },
  { value: 'factory-worker', label: 'Factory Worker', labelHi: 'फैक्ट्री वर्कर' },
];

export const BUSINESS_TYPES = [
  { value: 'shop', label: 'Shop / Kirana', labelHi: 'दुकान / किराना' },
  { value: 'restaurant', label: 'Restaurant / Cafe', labelHi: 'रेस्टोरेंट / कैफे' },
  { value: 'garage', label: 'Garage / Workshop', labelHi: 'गैरेज / वर्कशॉप' },
  { value: 'contractor', label: 'Contractor', labelHi: 'ठेकेदार' },
  { value: 'factory', label: 'Factory', labelHi: 'फैक्ट्री' },
  { value: 'office', label: 'Office', labelHi: 'ऑफिस' },
  { value: 'hospital', label: 'Hospital / Clinic', labelHi: 'अस्पताल / क्लिनिक' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export const WORK_TYPES = [
  { value: 'full-time', label: 'Full Time', labelHi: 'फुल टाइम' },
  { value: 'part-time', label: 'Part Time', labelHi: 'पार्ट टाइम' },
  { value: 'daily-wage', label: 'Daily Wage', labelHi: 'दैनिक मजदूरी' },
];

export const SALARY_TYPES = [
  { value: 'monthly', label: 'Per Month', labelHi: 'महीने के हिसाब से' },
  { value: 'daily', label: 'Per Day', labelHi: 'दिन के हिसाब से' },
  { value: 'hourly', label: 'Per Hour', labelHi: 'घंटे के हिसाब से' },
  { value: 'per-delivery', label: 'Per Delivery', labelHi: 'प्रति डिलीवरी' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher / No Experience', labelHi: 'फ्रेशर / बिना अनुभव' },
  { value: '1-2', label: '1-2 years', labelHi: '1-2 वर्ष' },
  { value: '3-5', label: '3-5 years', labelHi: '3-5 वर्ष' },
  { value: '5+', label: '5+ years', labelHi: '5+ वर्ष' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Full Time', labelHi: 'फुल टाइम' },
  { value: 'part-time', label: 'Part Time', labelHi: 'पार्ट टाइम' },
  { value: 'night-shift', label: 'Night Shift', labelHi: 'नाइट शिफ्ट' },
  { value: 'weekends', label: 'Weekends Only', labelHi: 'केवल वीकेंड' },
];

export const LANGUAGES = [
  { value: 'hindi', label: 'Hindi', labelHi: 'हिंदी' },
  { value: 'english', label: 'English', labelHi: 'अंग्रेज़ी' },
  { value: 'marathi', label: 'Marathi', labelHi: 'मराठी' },
  { value: 'gujarati', label: 'Gujarati', labelHi: 'गुजराती' },
  { value: 'tamil', label: 'Tamil', labelHi: 'तमिल' },
  { value: 'telugu', label: 'Telugu', labelHi: 'तेलुगु' },
  { value: 'kannada', label: 'Kannada', labelHi: 'कन्नड़' },
  { value: 'bengali', label: 'Bengali', labelHi: 'बंगाली' },
  { value: 'punjabi', label: 'Punjabi', labelHi: 'पंजाबी' },
];

export const DISTANCE_OPTIONS = [
  { value: 2, label: '2 km', labelHi: '2 किमी' },
  { value: 5, label: '5 km', labelHi: '5 किमी' },
  { value: 10, label: '10 km', labelHi: '10 किमी' },
  { value: 20, label: '20 km', labelHi: '20 किमी' },
];

export const REPORT_REASONS = [
  { value: 'fake-job', label: 'Fake Job', labelHi: 'फर्जी नौकरी' },
  { value: 'misleading-salary', label: 'Misleading Salary', labelHi: 'भ्रामक वेतन' },
  { value: 'scam', label: 'Scam / Fraud', labelHi: 'ठगी / धोखाधड़ी' },
  { value: 'inappropriate', label: 'Inappropriate Content', labelHi: 'अशोभनीय सामग्री' },
  { value: 'no-response', label: 'No Response', labelHi: 'कोई जवाब नहीं' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export const DEPARTMENTS = [
  { value: 'sales', label: 'Sales & Business Development', labelHi: 'सेल्स और बिजनेस डेवलपमेंट' },
  { value: 'delivery', label: 'Delivery & Logistics', labelHi: 'डिलीवरी और लॉजिस्टिक्स' },
  { value: 'production', label: 'Production & Manufacturing', labelHi: 'प्रोडक्शन और मैन्युफैक्चरिंग' },
  { value: 'maintenance', label: 'Maintenance & Repair', labelHi: 'रखरखाव और मरम्मत' },
  { value: 'hospitality', label: 'Hospitality & Food Service', labelHi: 'हॉस्पिटैलिटी और फूड सर्विस' },
  { value: 'retail', label: 'Retail / Counter Sales / B2C', labelHi: 'रिटेल / काउंटर सेल्स' },
  { value: 'security', label: 'Security & Facility', labelHi: 'सुरक्षा और फैसिलिटी' },
  { value: 'healthcare', label: 'Healthcare & Medical', labelHi: 'हेल्थकेयर और मेडिकल' },
  { value: 'construction', label: 'Construction & Civil', labelHi: 'कंस्ट्रक्शन और सिविल' },
  { value: 'transport', label: 'Transport & Driving', labelHi: 'ट्रांसपोर्ट और ड्राइविंग' },
  { value: 'cleaning', label: 'Cleaning & Housekeeping', labelHi: 'सफाई और हाउसकीपिंग' },
  { value: 'admin', label: 'Admin & Back Office', labelHi: 'एडमिन और बैक ऑफिस' },
  { value: 'telecalling', label: 'Telecalling & BPO', labelHi: 'टेलीकॉलिंग और BPO' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export const PERKS_BENEFITS = [
  { value: 'paid_leaves', label: 'Paid Leaves', labelHi: 'सवेतन छुट्टी', icon: '🌴' },
  { value: 'flexible_hours', label: 'Flexible Work Hours', labelHi: 'फ्लेक्सिबल टाइम', icon: '⏰' },
  { value: 'sales_incentives', label: 'Sales Incentives', labelHi: 'सेल्स इन्सेंटिव', icon: '🎯' },
  { value: 'joining_bonus', label: 'Joining Bonus', labelHi: 'ज्वाइनिंग बोनस', icon: '💰' },
  { value: 'travel_allowance', label: 'Travel Allowance', labelHi: 'यात्रा भत्ता', icon: '✈️' },
  { value: 'shift_allowance', label: 'Shift Allowance', labelHi: 'शिफ्ट भत्ता', icon: '🌙' },
  { value: 'weekly_payout', label: 'Weekly Payout', labelHi: 'साप्ताहिक भुगतान', icon: '💵' },
  { value: 'petrol_allowance', label: 'Petrol Allowance', labelHi: 'पेट्रोल भत्ता', icon: '⛽' },
  { value: 'mobile_allowance', label: 'Mobile Allowance', labelHi: 'मोबाइल भत्ता', icon: '📱' },
  { value: 'food_provided', label: 'Food Provided', labelHi: 'खाना मिलेगा', icon: '🍛' },
  { value: 'accommodation', label: 'Accommodation', labelHi: 'रहने की व्यवस्था', icon: '🏠' },
  { value: 'pf_esi', label: 'PF / ESI', labelHi: 'PF / ESI', icon: '🏦' },
  { value: 'medical_insurance', label: 'Medical Insurance', labelHi: 'मेडिकल बीमा', icon: '🏥' },
  { value: 'overtime_pay', label: 'Overtime Pay', labelHi: 'ओवरटाइम पे', icon: '💪' },
];

export const QUALIFICATION_OPTIONS = [
  { value: 'below_10th', label: '< 10th Pass', labelHi: '10वीं से कम' },
  { value: '10th_pass', label: '10th Pass', labelHi: '10वीं पास' },
  { value: '12th_pass', label: '12th Pass', labelHi: '12वीं पास' },
  { value: 'graduate', label: 'Graduate', labelHi: 'ग्रेजुएट' },
  { value: 'any', label: 'Any / No Requirement', labelHi: 'कोई भी' },
];

export const GENDER_OPTIONS = [
  { value: 'any', label: 'Any', labelHi: 'कोई भी' },
  { value: 'male', label: 'Male Only', labelHi: 'केवल पुरुष' },
  { value: 'female', label: 'Female Only', labelHi: 'केवल महिला' },
];

export const MAX_APPLICATIONS_PER_DAY = 10;
export const JOB_EXPIRY_DAYS = 30;
export const DEFAULT_MAX_DISTANCE_KM = 10;
