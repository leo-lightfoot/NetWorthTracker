import { Currency } from '../types';

/**
 * Format a number as currency based on the provided currency code
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
} 