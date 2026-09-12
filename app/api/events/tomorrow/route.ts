import { NextResponse } from 'next/server';
import {
  TIMEZONE,
  getCurrentDateInET,
  getTomorrowInET,
  formatDateISO,
  buildNationalDayCalendarUrl,
} from '@/lib/national-day-calendar/date-utils';
import { fetchEventsFromNationalDayCalendar } from '@/lib/national-day-calendar/fetch-events';
import type { TomorrowEventsResponse, ErrorResponse } from '@/lib/national-day-calendar/types';

const isDev = process.env.NODE_ENV === 'development';

export async function GET() {
  try {
    const currentDate = getCurrentDateInET();
    const tomorrow = getTomorrowInET();
    const currentDateStr = formatDateISO(currentDate);
    const targetDateStr = formatDateISO(tomorrow);
    const sourceUrl = buildNationalDayCalendarUrl(tomorrow);

    let fetchResult;
    try {
      fetchResult = await fetchEventsFromNationalDayCalendar(sourceUrl, targetDateStr);
    } catch (err) {
      const errorResponse: ErrorResponse = {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Unable to retrieve National Day Calendar events',
        targetDate: targetDateStr,
      };
      return NextResponse.json(errorResponse, { status: 502 });
    }

    if (fetchResult.events.length === 0) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: `No events found on National Day Calendar for ${targetDateStr}. The page may not exist yet or the website structure may have changed.`,
        targetDate: targetDateStr,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: TomorrowEventsResponse = {
      success: true,
      source: 'National Day Calendar',
      currentDate: currentDateStr,
      targetDate: targetDateStr,
      timezone: TIMEZONE,
      events: fetchResult.events,
    };

    const body = isDev
      ? { ...response, debug: { sourceUrl: fetchResult.sourceUrl, httpStatus: fetchResult.httpStatus, ...fetchResult.debug } }
      : response;

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const errorResponse: ErrorResponse = {
      success: false,
      error:
        err instanceof Error
          ? `Unexpected error: ${err.message}`
          : 'An unexpected error occurred',
      targetDate: 'unknown',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
