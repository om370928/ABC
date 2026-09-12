export const TIMEZONE = 'America/New_York';

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentDateInET(): Date {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  const [datePart] = etString.split(', ');
  const [month, day, year] = datePart.split('/');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function getTomorrowInET(): Date {
  const current = getCurrentDateInET();
  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function formatDateISO(date: Date): string {
  return formatDate(date);
}

export function getMonthName(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function getDayNumber(date: Date): number {
  return date.getDate();
}

export function buildNationalDayCalendarUrl(date: Date): string {
  const month = getMonthName(date);
  const day = getDayNumber(date);
  return `https://nationaldaycalendar.com/${month}/${day}`;
}
