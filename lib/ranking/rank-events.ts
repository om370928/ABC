import type { CalendarEvent, RankedEvent } from '@/lib/national-day-calendar/types';

const HIGH_INTEREST_KEYWORDS = [
  'chocolate', 'coffee', 'pizza', 'ice cream', 'donut', 'donut', 'cookie',
  'cheese', 'burger', 'beer', 'wine', 'taco', 'bagel', 'pie', 'cake',
  'bbq', 'steak', 'pancake', 'chicken', 'pasta', 'sandwich', 'nachos',
  'chili', 'salsa', 'guacamole', 'margarita', 'martini', 'whiskey',
  'halloween', 'christmas', 'thanksgiving', 'valentine', 'easter',
  'independence', 'mother', 'father', 'new year',
  'dog', 'cat', 'puppy', 'kitten', 'animal', 'pet',
  'veterans', 'memorial', 'labor', 'earth day',
  'kiss', 'hug', 'smile', 'laugh', 'love',
  'music', 'dance', 'art', 'book', 'reading',
  'football', 'baseball', 'basketball', 'soccer', 'hockey',
  'space', 'moon', 'sun', 'star',
];

const MEDIUM_INTEREST_KEYWORDS = [
  'day', 'national', 'international', 'world',
  'food', 'drink', 'eat', 'cook', 'bake',
  'friend', 'family', 'teacher', 'nurse', 'doctor',
  'police', 'fire', 'military', 'soldier',
  'health', 'awareness', 'mental', 'cancer', 'diabetes',
  'science', 'math', 'history', 'photography',
  'nature', 'environment', 'ocean', 'river', 'mountain',
  'flower', 'tree', 'garden', 'plant',
  'happy', 'celebrate', 'honor', 'remember',
  'wear', 'color', 'blue', 'red', 'green',
  'walk', 'run', 'fitness', 'yoga',
  'small business', 'entrepreneur', 'volunteer',
  'coffee', 'tea', 'water',
];

const LOW_PRIORITY_KEYWORDS = [
  'week', 'month',
];

const SEASONAL_BONUS: Record<string, string[]> = {
  '01': ['new year', 'winter', 'martin luther', 'resolution'],
  '02': ['valentine', 'love', 'heart', 'president', 'groundhog'],
  '03': ['st patrick', 'spring', 'irish', 'women'],
  '04': ['easter', 'spring', 'earth', 'environment', 'fool', 'garden'],
  '05': ['mother', 'memorial', 'military', 'soldier', 'spring', 'flower'],
  '06': ['father', 'summer', 'flag', 'juneteenth'],
  '07': ['independence', 'fourth of july', 'summer', 'freedom', 'firework'],
  '08': ['summer', 'back to school'],
  '09': ['labor', 'fall', 'autumn', 'patriot', '9/11', 'september 11'],
  '10': ['halloween', 'breast cancer', 'autumn', 'fall', 'pumpkin', 'scarecrow'],
  '11': ['thanksgiving', 'veterans', 'turkey', 'gratitude', 'grateful', 'thankful'],
  '12': ['christmas', 'hanukkah', 'kwanzaa', 'winter', 'new year', 'holiday', 'santa'],
};

function scoreEvent(event: CalendarEvent, targetMonth: string): { score: number; reasons: string[] } {
  const name = event.name.toLowerCase();
  const description = (event.description ?? '').toLowerCase();
  const text = `${name} ${description}`;
  const reasons: string[] = [];

  let score = 0;

  const highMatches = HIGH_INTEREST_KEYWORDS.filter((kw) => text.includes(kw));
  score += highMatches.length * 15;
  if (highMatches.length > 0) {
    reasons.push(`high-interest topic: ${highMatches.slice(0, 3).join(', ')}`);
  }

  const mediumMatches = MEDIUM_INTEREST_KEYWORDS.filter((kw) => text.includes(kw));
  score += mediumMatches.length * 5;
  if (mediumMatches.length > 0 && reasons.length === 0) {
    reasons.push(`broadly relevant: ${mediumMatches.slice(0, 2).join(', ')}`);
  }

  const seasonalKeywords = SEASONAL_BONUS[targetMonth] ?? [];
  const seasonalMatches = seasonalKeywords.filter((kw) => text.includes(kw));
  score += seasonalMatches.length * 10;
  if (seasonalMatches.length > 0) {
    reasons.push(`seasonally relevant for ${seasonalMatches.slice(0, 2).join(', ')}`);
  }

  if (event.description && event.description.length > 50) {
    score += 8;
    if (reasons.length === 0) {
      reasons.push('has detailed description');
    }
  }

  if (name.includes('national ')) {
    score += 3;
  }

  const lowPenalty = LOW_PRIORITY_KEYWORDS.filter((kw) => name.includes(kw));
  score -= lowPenalty.length * 2;

  if (reasons.length === 0) {
    reasons.push('general interest observance');
  }

  return { score, reasons };
}

export function rankEvents(events: CalendarEvent[], targetDate: string): RankedEvent[] {
  const targetMonth = targetDate.slice(5, 7);

  const scored = events.map((event) => {
    const { score, reasons } = scoreEvent(event, targetMonth);
    return { event, score, reasons };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aName = a.event.name.toLowerCase();
    const bName = b.event.name.toLowerCase();
    const aNational = aName.startsWith('national ') ? 1 : 0;
    const bNational = bName.startsWith('national ') ? 1 : 0;
    if (bNational !== aNational) return bNational - aNational;
    return a.event.name.localeCompare(b.event.name);
  });

  return scored.map((entry, idx) => ({
    ...entry.event,
    rank: idx + 1,
    rankScore: entry.score,
    rankReason: entry.reasons.join('; '),
  }));
}

export function selectTopEvent(ranked: RankedEvent[]): RankedEvent | null {
  return ranked.length > 0 ? ranked[0] : null;
}
