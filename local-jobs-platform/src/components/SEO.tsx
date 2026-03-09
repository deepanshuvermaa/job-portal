import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  schema
}) => {
  const location = useLocation();
  const baseUrl = 'https://deepanshuverma.site/local-job-portal';
  const fullUrl = `${baseUrl}${location.pathname}`;

  const defaultTitle = 'LocalJobs - Find Jobs Near You | Local Employment in India';
  const defaultDescription = 'Hyperlocal job marketplace for Tier 2 & 3 cities in India. Find delivery, driver, mechanic, helper and local jobs near you. Apply without resume.';
  const defaultKeywords = 'local jobs, jobs near me, delivery jobs, driver jobs, mechanic jobs, helper jobs, tier 2 city jobs, tier 3 city jobs, local employment, स्थानीय नौकरियां, मेरे पास नौकरी, इंडिया जॉब्स';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalOgImage = ogImage || `${baseUrl}/og-image.jpg`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update meta tags
    updateMetaTag('name', 'description', finalDescription);
    updateMetaTag('name', 'keywords', finalKeywords);
    updateMetaTag('property', 'og:title', finalTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:url', fullUrl);
    updateMetaTag('property', 'og:image', finalOgImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'twitter:title', finalTitle);
    updateMetaTag('property', 'twitter:description', finalDescription);
    updateMetaTag('property', 'twitter:image', finalOgImage);
    updateMetaTag('property', 'twitter:url', fullUrl);

    // Update canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // Add schema if provided
    if (schema) {
      let schemaScript = document.getElementById('dynamic-schema') as HTMLScriptElement | null;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }
  }, [finalTitle, finalDescription, finalKeywords, fullUrl, finalOgImage, ogType, schema]);

  return null;
};

function updateMetaTag(attr: string, attrValue: string, content: string) {
  let tag = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
