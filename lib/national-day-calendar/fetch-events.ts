import { parseNationalDayCalendarHtml } from './parser';
import type { CalendarEvent } from './types';

export type FetchResult = {
  events: CalendarEvent[];
  sourceUrl: string;
  httpStatus: number;
  debug: {
    title: string | null;
    eventCount: number;
    weeksCount: number;
    monthsCount: number;
  };
};

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; FreezeCrowdBot/1.0; +https://freezecrowd.com/bot)';

export async function fetchEventsFromNationalDayCalendar(
  url: string,
  targetDate: string
): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request to National Day Calendar timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw new Error(
      `Network error fetching National Day Calendar: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(
      `National Day Calendar returned HTTP ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();

  if (!html || html.length < 500) {
    throw new Error('National Day Calendar returned an empty or suspiciously short response');
  }

  const parsed = parseNationalDayCalendarHtml(html, targetDate);

  return {
    events: parsed.events,
    sourceUrl: url,
    httpStatus: response.status,
    debug: parsed.debug,
  };
}
