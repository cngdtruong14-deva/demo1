/**
 * Utility Functions
 * Common helper functions
 */

/**
 * Format price in Vietnamese currency
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Format date only
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a simple unique ID (not cryptographically secure)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse query parameters from URL
 */
export function parseQuery(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Class names helper (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep function (for testing/development)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

