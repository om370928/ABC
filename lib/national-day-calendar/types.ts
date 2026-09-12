export type CalendarEvent = {
  name: string;
  date: string;
  url?: string;
  description?: string;
};

export type RankedEvent = CalendarEvent & {
  rank: number;
  rankScore: number;
  rankReason: string;
};

export type TomorrowEventsResponse = {
  success: boolean;
  source: string;
  currentDate: string;
  targetDate: string;
  timezone: string;
  events: CalendarEvent[];
};

export type ErrorResponse = {
  success: false;
  error: string;
  targetDate: string;
};

export type SocialPost = {
  headline: string;
  tagline: string;
  supportingText: string;
  visualDirection: string;
  designPrompt: string;
};

export type FreezeCrowdResult = {
  event: {
    name: string;
    date: string;
    sourceUrl: string;
    description: string;
  };
  selection: {
    rank: number;
    reason: string;
  };
  socialPost: SocialPost;
};
