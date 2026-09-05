import { DateFilterType } from '../types/transaction';

/**
 * Formats an ISO date string into a concise human-readable string (e.g. "Aug 17, 26").
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);

  return `${month} ${day}, ${year}`;
}

/**
 * Calculates the start ISO date boundary for a given DateFilterType.
 * Returns null if filter is 'all'.
 */
export function getDateFilterBoundary(dateFilter: DateFilterType): string | null {
  const now = new Date();
  if (dateFilter === 'today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return startOfDay.toISOString();
  }
  if (dateFilter === 'yesterday') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return startOfYesterday.toISOString();
  }
  if (dateFilter === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfMonth.toISOString();
  }
  if (dateFilter === 'this_year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return startOfYear.toISOString();
  }
  return null;
}
