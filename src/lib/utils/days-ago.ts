/**
 * Returns the date string for a given number of days ago
 * @param days Number of days ago
 * @returns Date string in ISO format (YYYY-MM-DD)
 */
export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
