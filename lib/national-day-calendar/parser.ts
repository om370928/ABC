import type { CalendarEvent } from './types';

type ParseResult = {
  events: CalendarEvent[];
  debug: {
    title: string | null;
    eventCount: number;
    weeksCount: number;
    monthsCount: number;
  };
};

type RawEvent = {
  name: string;
  url: string;
  description: string | null;
  section: 'day' | 'week' | 'month';
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8230;/g, '...')
    .replace(/&#x2192;/g, '→')
    .replace(/&[a-z]+;/g, ' ');
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (!titleMatch) return null;
  return cleanText(decodeHtmlEntities(titleMatch[1]));
}

function extractCelebrationLinks(html: string): Array<{ url: string; name: string }> {
  const links: Array<{ url: string; name: string }> = [];
  const linkRegex = /<a\s+[^>]*href=["']\/celebrations\/([^"'#]+)["'][^>]*>(.*?)<\/a>/gis;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const slug = match[1];
    const innerHtml = match[2];
    const name = cleanText(decodeHtmlEntities(innerHtml.replace(/<[^>]+>/g, '')));
    if (name && name.length > 1) {
      links.push({
        url: `https://nationaldaycalendar.com/celebrations/${slug}`,
        name,
      });
    }
  }

  return links;
}

function extractHeadingEvents(html: string): RawEvent[] {
  const events: RawEvent[] = [];
  const headingRegex = /<h[23][^>]*>(.*?)<\/h[23]>/gis;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const headingInner = match[1];
    const linkMatch = headingInner.match(/<a\s+[^>]*href=["']\/celebrations\/([^"'#]+)["'][^>]*>(.*?)<\/a>/is);
    if (!linkMatch) continue;

    const slug = linkMatch[1];
    const name = cleanText(decodeHtmlEntities(linkMatch[2].replace(/<[^>]+>/g, '')));
    if (!name || name.length < 2) continue;

    const headingEnd = headingRegex.lastIndex;
    const nextHeadingMatch = html.slice(headingEnd).match(/<h[23][^>]*>/i);
    const sectionEnd = nextHeadingMatch
      ? headingEnd + (nextHeadingMatch.index ?? 0)
      : Math.min(headingEnd + 1000, html.length);
    const sectionHtml = html.slice(headingEnd, sectionEnd);

    let description: string | null = null;
    const descMatch = sectionHtml.match(/<p[^>]*>(.*?)<\/p>/is);
    if (descMatch) {
      const descText = cleanText(decodeHtmlEntities(descMatch[1].replace(/<[^>]+>/g, '')));
      if (descText && descText.length > 10 && !descText.toLowerCase().startsWith('read the full story')) {
        description = descText;
      }
    }

    events.push({
      name,
      url: `https://nationaldaycalendar.com/celebrations/${slug}`,
      description,
      section: 'day' as const,
    });
  }

  return events;
}

function extractListItemEvents(html: string, sectionMarker: string, sectionType: 'week' | 'month'): RawEvent[] {
  const events: RawEvent[] = [];
  const markerIdx = html.indexOf(sectionMarker);
  if (markerIdx === -1) return events;

  const afterMarker = html.slice(markerIdx);
  const listMatch = afterMarker.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!listMatch) return events;

  const listHtml = listMatch[1];
  const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gis;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(listHtml)) !== null) {
    const itemHtml = itemMatch[1];
    const linkMatch = itemHtml.match(/<a\s+[^>]*href=["']\/celebrations\/([^"'#]+)["'][^>]*>(.*?)<\/a>/is);
    if (!linkMatch) continue;

    const slug = linkMatch[1];
    const name = cleanText(decodeHtmlEntities(linkMatch[2].replace(/<[^>]+>/g, '')));
    if (!name || name.length < 2) continue;

    events.push({
      name,
      url: `https://nationaldaycalendar.com/celebrations/${slug}`,
      description: null,
      section: sectionType,
    });
  }

  return events;
}

function deduplicateEvents(events: RawEvent[]): RawEvent[] {
  const seen = new Set<string>();
  const result: RawEvent[] = [];

  for (const event of events) {
    const key = event.url;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(event);
    }
  }

  return result;
}

export function parseNationalDayCalendarHtml(html: string, targetDate: string): ParseResult {
  const title = extractTitle(html);

  const dayEvents = extractHeadingEvents(html);
  const weekEvents = extractListItemEvents(html, 'National Weeks', 'week');
  const monthEvents = extractListItemEvents(html, 'National Months', 'month');

  const allRawEvents = deduplicateEvents([...dayEvents, ...weekEvents, ...monthEvents]);

  const events: CalendarEvent[] = allRawEvents.map((raw) => ({
    name: raw.name,
    date: targetDate,
    url: raw.url,
    description: raw.description ?? undefined,
  }));

  return {
    events,
    debug: {
      title,
      eventCount: dayEvents.length,
      weeksCount: weekEvents.length,
      monthsCount: monthEvents.length,
    },
  };
}
