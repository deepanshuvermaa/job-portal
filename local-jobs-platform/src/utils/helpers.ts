import type { Location } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format salary range
 */
export function formatSalary(
  min: number,
  max: number,
  type: 'monthly' | 'daily' | 'hourly' | 'per-delivery'
): string {
  const formatNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const typeLabel = {
    monthly: '/month',
    daily: '/day',
    hourly: '/hour',
    'per-delivery': '/delivery',
  };

  return `â‚¹${formatNumber(min)} - â‚¹${formatNumber(max)}${typeLabel[type]}`;
}

/**
 * Format distance
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km}km away`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}

/**
 * Generate OTP (for demo purposes)
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get location display text
 */
export function getLocationDisplay(location: Location): string {
  return `${location.locality}, ${location.area}, ${location.city}`;
}

/**
 * Check if job is expired
 */
export function isJobExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(expiresAt?: string): number {
  if (!expiresAt) return 0;
  const diffMs = new Date(expiresAt).getTime() - new Date().getTime();
  return Math.ceil(diffMs / 86400000);
}

/**
 * Format working hours
 */
export function formatWorkingHours(hours?: string): string {
  if (!hours) return 'Not specified';
  return hours;
}

/**
 * Combine class names
 */
export function cn(...classes: (string | number | bigint | undefined | null | false)[]): string {
  return classes.filter((value) => value !== undefined && value !== null && value !== false && value !== 0 && value !== "").join(" ");
}



