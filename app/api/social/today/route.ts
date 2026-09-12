import { NextResponse } from 'next/server';
import {
  TIMEZONE,
  getCurrentDateInET,
  getTomorrowInET,
  formatDateISO,
  buildNationalDayCalendarUrl,
} from '@/lib/national-day-calendar/date-utils';
import { fetchEventsFromNationalDayCalendar } from '@/lib/national-day-calendar/fetch-events';
import { rankEvents, selectTopEvent } from '@/lib/ranking/rank-events';
import { generateFreezeCrowdPrompt, validateDesignPrompt } from '@/lib/social/generate-prompt';
import type {
  FreezeCrowdResult,
  ErrorResponse,
  RankedEvent,
} from '@/lib/national-day-calendar/types';

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

    const ranked = rankEvents(fetchResult.events, targetDateStr);
    const selected = selectTopEvent(ranked);

    if (!selected) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Events were found but ranking failed to select a top event.',
        targetDate: targetDateStr,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    let socialPost;
    try {
      socialPost = generateFreezeCrowdPrompt(selected);
    } catch (err) {
      const errorResponse: ErrorResponse = {
        success: false,
        error:
          err instanceof Error
            ? `Prompt generation failed: ${err.message}`
            : 'Prompt generation failed for an unknown reason',
        targetDate: targetDateStr,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const validation = validateDesignPrompt(socialPost.designPrompt);
    if (!validation.valid) {
      console.warn('[FreezeCrowd API] Prompt validation issues:', validation.issues);
    }

    const result: FreezeCrowdResult = {
      event: {
        name: selected.name,
        date: selected.date,
        sourceUrl: selected.url ?? sourceUrl,
        description: selected.description ?? '',
      },
      selection: {
        rank: selected.rank,
        reason: selected.rankReason,
      },
      socialPost,
    };

    const body = isDev
      ? {
          ...result,
          debug: {
            totalEvents: fetchResult.events.length,
            rankedEvents: ranked.length,
            rankScore: selected.rankScore,
            allRanked: ranked.map((r: RankedEvent) => ({
              name: r.name,
              rank: r.rank,
              score: r.rankScore,
              reason: r.rankReason,
            })),
            promptValidation: validation,
            sourceUrl: fetchResult.sourceUrl,
            httpStatus: fetchResult.httpStatus,
          },
        }
      : result;

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
