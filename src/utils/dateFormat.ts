/**
 * Utility functions for date and time formatting
 */

/**
 * Format a date as YYYY-MM-DD
 *
 * @param date Date to format
 * @returns Formatted date string as YYYY-MM-DD
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date and time as YYYY-MM-DD HH:MM:SS
 *
 * @param date Date to format
 * @returns Formatted date and time string as YYYY-MM-DD HH:MM:SS
 */
export function formatDateTimeYYYYMMDDHHMMSS(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date as "Day of week, Day Month Year" (e.g., "Monday, 12th May 2025")
 *
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Formatted date string in a readable format
 */
export function formatDateForDisplay(dateStr: string): string {
  // Parse the date string into a Date object
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

  // Get day of week
  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

  // Get day with ordinal suffix
  const dayNum = date.getDate();
  let daySuffix = 'th';
  if (dayNum === 1 || dayNum === 21 || dayNum === 31) daySuffix = 'st';
  else if (dayNum === 2 || dayNum === 22) daySuffix = 'nd';
  else if (dayNum === 3 || dayNum === 23) daySuffix = 'rd';

  // Get month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);

  // Return formatted string
  return `${dayOfWeek}, ${dayNum}${daySuffix} ${monthName} ${year}`;
}
