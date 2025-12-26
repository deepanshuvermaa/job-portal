/**
 * SEO Utilities for LocalJobs Platform
 * Optimized for Indian job market and regional languages
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://example.com';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  lang?: 'en' | 'hi';
}

/**
 * Generate structured data (JSON-LD) for JobPosting
 */
export function generateJobPostingSchema(job: {
  title: string;
  description: string;
  company: string;
  location: { city: string; area: string };
  salary: { min: number; max: number; type: string };
  datePosted: string;
  employmentType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.area,
        addressRegion: job.location.city,
        addressCountry: 'IN',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: job.salary.type,
      },
    },
    datePosted: job.datePosted,
    employmentType: job.employmentType.toUpperCase(),
  };
}

/**
 * Generate structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LocalJobs',
    alternateName: 'LocalJobs India',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Hyperlocal job marketplace connecting local employers with workers in Tier 2 & 3 cities across India. Find delivery, driver, helper, mechanic, and other local jobs near you.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

/**
 * Update document head with SEO metadata
 */
export function updateSEO(metadata: SEOMetadata) {
  document.title = metadata.title;

  const metaTags: Record<string, string> = {
    description: metadata.description,
    keywords: metadata.keywords.join(', '),
    'og:title': metadata.ogTitle || metadata.title,
    'og:description': metadata.ogDescription || metadata.description,
    'og:type': 'website',
    'twitter:card': metadata.twitterCard || 'summary',
    'twitter:title': metadata.ogTitle || metadata.title,
    'twitter:description': metadata.ogDescription || metadata.description,
  };

  if (metadata.ogImage) {
    metaTags['og:image'] = metadata.ogImage;
    metaTags['twitter:image'] = metadata.ogImage;
  }

  Object.entries(metaTags).forEach(([name, content]) => {
    const property = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
    let element = document.querySelector(`meta[${property}="${name}"]`) as HTMLMetaElement;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(property, name);
      document.head.appendChild(element);
    }

    element.content = content;
  });

  if (metadata.canonical) {
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.rel = 'canonical';
      document.head.appendChild(linkElement);
    }
    linkElement.href = metadata.canonical;
  }

  if (metadata.lang) {
    document.documentElement.lang = metadata.lang;
  }
}

/**
 * SEO Metadata presets for different pages
 */
export const SEO_PRESETS = {
  home: (lang: 'en' | 'hi'): SEOMetadata => ({
    title: lang === 'hi'
      ? 'LocalJobs - स्थानीय नौकरी खोजें | लोकल रोजगार'
      : 'LocalJobs - Find Jobs Near You | Local Employment Opportunities',
    description: lang === 'hi'
      ? 'भारत के टियर 2 और 3 शहरों में स्थानीय नौकरियां खोजें. डिलीवरी, ड्राइवर, हेल्पर और अधिक.'
      : 'Find local jobs in Tier 2 & 3 cities. Delivery, driver, mechanic, helper and more. Apply without resume. Direct employer contact.',
    keywords: [
      'local jobs',
      'jobs near me',
      'delivery jobs',
      'driver jobs',
      'mechanic jobs',
      'helper jobs',
      'tier 2 city jobs',
      'tier 3 city jobs',
      'local employment',
      'स्थानीय नौकरी',
      'लोकल रोजगार',
    ],
    lang,
  }),

  jobSearch: (city: string, lang: 'en' | 'hi'): SEOMetadata => ({
    title: lang === 'hi'
      ? `${city} में स्थानीय नौकरियां | LocalJobs`
      : `Jobs in ${city} | LocalJobs`,
    description: lang === 'hi'
      ? `${city} में डिलीवरी, ड्राइवर, हेल्पर और अन्य स्थानीय नौकरियां खोजें.`
      : `Find local jobs in ${city}. Delivery, driver, helper, mechanic and more. Direct employer contact available.`,
    keywords: [
      `jobs in ${city}`,
      `${city} jobs`,
      `delivery jobs ${city}`,
      `driver jobs ${city}`,
      `${city} स्थानीय नौकरी`,
      'local employment',
    ],
    lang,
  }),

  jobPosting: (jobTitle: string, location: string, lang: 'en' | 'hi'): SEOMetadata => ({
    title: lang === 'hi'
      ? `${jobTitle} - ${location} | LocalJobs`
      : `${jobTitle} in ${location} | LocalJobs`,
    description: lang === 'hi'
      ? `${location} में ${jobTitle} की नौकरी उपलब्ध है. अभी आवेदन करें.`
      : `${jobTitle} position available in ${location}. Apply now. Direct employer contact.`,
    keywords: [
      jobTitle,
      `${jobTitle} ${location}`,
      `${jobTitle} jobs`,
      'jobs near me',
      'local jobs',
    ],
    lang,
  }),

  employer: (lang: 'en' | 'hi'): SEOMetadata => ({
    title: lang === 'hi'
      ? 'नियोक्ताओं के लिए | LocalJobs'
      : 'For Employers | Post Jobs | LocalJobs',
    description: lang === 'hi'
      ? 'अपने बिजनेस के लिए स्थानीय वर्कर खोजें और जॉब पोस्ट करें.'
      : 'Find local workers for your business. Post jobs for free. Verified candidates available.',
    keywords: [
      'post jobs',
      'hire workers',
      'find employees',
      'local hiring',
      'employer platform',
      'स्थानीय वर्कर',
      'भर्ती',
    ],
    lang,
  }),

  worker: (lang: 'en' | 'hi'): SEOMetadata => ({
    title: lang === 'hi'
      ? 'नौकरी खोजें | LocalJobs'
      : 'Find Jobs | For Workers | LocalJobs',
    description: lang === 'hi'
      ? 'अपने पास की नौकरी खोजें. बिना रिज्यूमे के आवेदन करें.'
      : 'Find jobs near you. Apply without resume. Talk directly to employers.',
    keywords: [
      'find jobs',
      'job search',
      'apply for jobs',
      'worker jobs',
      'स्थानीय नौकरी',
      'रोजगार',
    ],
    lang,
  }),
};

/**
 * Generate sitemap URLs
 */
export function generateSitemapUrls(baseUrl: string) {
  const urls = [
    { loc: baseUrl, priority: 1.0, changefreq: 'daily' },
    { loc: `${baseUrl}/auth/phone`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${baseUrl}/employer/signup`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${baseUrl}/worker/signup`, priority: 0.9, changefreq: 'weekly' },
  ];

  return urls;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(baseUrl: string) {
  return `User-agent: *
Allow: /
Allow: /auth/*
Allow: /employer/signup
Allow: /worker/signup

Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
}

/**
 * Track page view for analytics
 */
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: pageName,
      ...properties,
    });
  }

  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
}

/**
 * Track conversion event
 */
export function trackConversion(eventName: string, value?: number, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      event_category: eventName,
      value: value,
      ...properties,
    });
  }

  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, { value, ...properties });
  }
}

export const SITE_BASE_URL = SITE_URL;
