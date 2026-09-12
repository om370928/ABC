'use client';

import { useState, useCallback } from 'react';
import {
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Type,
  Image as ImageIcon,
  FileText,
  Trophy,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CalendarEvent = {
  name: string;
  date: string;
  url?: string;
  description?: string;
};

type EventsApiResponse = {
  success: boolean;
  source?: string;
  currentDate?: string;
  targetDate?: string;
  timezone?: string;
  events?: CalendarEvent[];
  error?: string;
  debug?: {
    sourceUrl?: string;
    httpStatus?: number;
    title?: string | null;
    eventCount?: number;
    weeksCount?: number;
    monthsCount?: number;
  };
};

type SocialPost = {
  headline: string;
  tagline: string;
  supportingText: string;
  visualDirection: string;
  designPrompt: string;
};

type FreezeCrowdResult = {
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

type SocialApiResponse = {
  success: boolean;
  error?: string;
  targetDate?: string;
} & Partial<FreezeCrowdResult> & {
  debug?: {
    totalEvents?: number;
    rankedEvents?: number;
    rankScore?: number;
    allRanked?: Array<{ name: string; rank: number; score: number; reason: string }>;
    promptValidation?: { valid: boolean; issues: string[] };
    sourceUrl?: string;
    httpStatus?: number;
  };
};

type Tab = 'events' | 'prompt';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('events');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [eventsData, setEventsData] = useState<EventsApiResponse | null>(null);
  const [socialData, setSocialData] = useState<SocialApiResponse | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    setEventsData(null);

    try {
      const res = await fetch('/api/events/tomorrow');
      const json: EventsApiResponse = await res.json();

      if (!json.success) {
        setEventsError(json.error || 'Failed to fetch events');
      } else {
        setEventsData(json);
      }
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchSocialPrompt = useCallback(async () => {
    setSocialLoading(true);
    setSocialError(null);
    setSocialData(null);
    setCopied(false);

    try {
      const res = await fetch('/api/social/today');
      const json: SocialApiResponse = await res.json();

      if (!json.success) {
        setSocialError(json.error || 'Failed to generate social post');
      } else {
        setSocialData(json);
        setActiveTab('prompt');
      }
    } catch (err) {
      setSocialError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setSocialLoading(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const prompt = socialData?.socialPost?.designPrompt;
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setSocialError('Unable to copy to clipboard. Please select and copy manually.');
      }
      document.body.removeChild(textarea);
    }
  }, [socialData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 p-3">
            <Calendar className="h-7 w-7 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            FreezeCrowd Event Automation
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            National Day Calendar event retrieval and social post prompt generation
          </p>
        </div>

        {/* Action Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-slate-500" />
                Event Dashboard
              </CardTitle>
              <CardDescription>
                Fetch all U.S. national days and observances for tomorrow from National Day Calendar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  fetchEvents();
                  setActiveTab('events');
                }}
                disabled={eventsLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {eventsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch Tomorrow&apos;s Events
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-slate-500" />
                Generate Social Post
              </CardTitle>
              <CardDescription>
                Automatically select the best event and generate a Twitter/X design prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={fetchSocialPrompt}
                disabled={socialLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {socialLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate FreezeCrowd Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        {(eventsData || socialData || eventsError || socialError) && (
          <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'border-b-2 border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'prompt'
                  ? 'border-b-2 border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Twitter/X Design Prompt
            </button>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {eventsError && (
              <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{eventsError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {eventsData && eventsData.success && (
              <>
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Current Date
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {eventsData.currentDate}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Target Date
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {eventsData.targetDate}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Timezone
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {eventsData.timezone}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Source:</span>
                  <Badge variant="secondary">{eventsData.source}</Badge>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Events Found: {eventsData.events?.length ?? 0}
                  </h2>
                  {eventsData.debug && process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-slate-400 space-y-0.5 text-right">
                      {eventsData.debug.sourceUrl && (
                        <div>Source URL: {eventsData.debug.sourceUrl}</div>
                      )}
                      {eventsData.debug.httpStatus && (
                        <div>HTTP Status: {eventsData.debug.httpStatus}</div>
                      )}
                      <div>
                        Day events: {eventsData.debug.eventCount ?? 0} | Weeks:{' '}
                        {eventsData.debug.weeksCount ?? 0} | Months:{' '}
                        {eventsData.debug.monthsCount ?? 0}
                      </div>
                    </div>
                  )}
                </div>

                {eventsData.events && eventsData.events.length > 0 ? (
                  <div className="space-y-3">
                    {eventsData.events.map((event, idx) => (
                      <Card
                        key={`${event.name}-${idx}`}
                        className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-slate-400">
                                  #{idx + 1}
                                </span>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                                  {event.name}
                                </h3>
                              </div>
                              {event.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                <span>{event.date}</span>
                              </div>
                            </div>
                            {event.url && (
                              <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                aria-label={`View ${event.name} on National Day Calendar`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6 pb-6 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No events were found for this date.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!eventsData && !eventsError && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Click &quot;Fetch Tomorrow&apos;s Events&quot; to retrieve national day calendar data.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Prompt Tab */}
        {activeTab === 'prompt' && (
          <>
            {socialError && (
              <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{socialError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {socialData && socialData.success && socialData.event && socialData.selection && socialData.socialPost && (
              <>
                {/* Selected Event */}
                <Card className="mb-6 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Selected Event
                    </CardTitle>
                    <CardDescription>
                      Automatically selected as the highest-ranked event from National Day Calendar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {socialData.event.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {socialData.event.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-slate-400" />
                          <Badge variant="secondary">
                            Rank #{socialData.selection.rank}
                          </Badge>
                        </div>
                        {socialData.event.sourceUrl && (
                          <a
                            href={socialData.event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Source
                          </a>
                        )}
                      </div>
                      {socialData.event.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {socialData.event.description}
                        </p>
                      )}
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Selection reason:</span>{' '}
                          {socialData.selection.reason}
                        </p>
                      </div>
                      {socialData.debug && process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-slate-400 space-y-1 mt-2">
                          <div>Total events ranked: {socialData.debug.totalEvents}</div>
                          <div>Rank score: {socialData.debug.rankScore}</div>
                          {socialData.debug.allRanked && socialData.debug.allRanked.length > 1 && (
                            <div className="mt-2 space-y-1">
                              <span className="font-semibold">All ranked:</span>
                              {socialData.debug.allRanked.map((r) => (
                                <div key={r.name} className="pl-3">
                                  #{r.rank} {r.name} (score: {r.score})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Content */}
                <Card className="mb-6 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Type className="h-5 w-5 text-slate-500" />
                      Generated Content
                    </CardTitle>
                    <CardDescription>
                      Headline, tagline, supporting text, and visual direction for the selected event.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Headline
                        </label>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {socialData.socialPost.headline}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Tagline
                        </label>
                        <p className="mt-1 text-base text-slate-700 dark:text-slate-300 italic">
                          &ldquo;{socialData.socialPost.tagline}&rdquo;
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Supporting Text
                        </label>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {socialData.socialPost.supportingText}
                        </p>
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          <ImageIcon className="h-3 w-3" />
                          Visual Direction
                        </label>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {socialData.socialPost.visualDirection}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Design Prompt */}
                <Card className="mb-6 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-slate-500" />
                          Final Design Prompt
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                            Twitter/X — 1200 × 675 px
                          </Badge>
                          <span className="text-xs">16:9 aspect ratio</span>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant={copied ? 'secondary' : 'default'}
                        size="sm"
                        className="shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="whitespace-pre-wrap rounded-md bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-200 text-sm leading-relaxed p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono">
                        {socialData.socialPost.designPrompt}
                      </pre>
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded">
                        <Eye className="h-3 w-3" />
                        <span>{socialData.socialPost.designPrompt.length} chars</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!socialData && !socialError && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Click &quot;Generate FreezeCrowd Post&quot; to automatically select the best event
                    and create a Twitter/X design prompt.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-400">
          <p>FreezeCrowd Event Automation — Event Retrieval &amp; Social Post Prompt Generation</p>
        </div>
      </div>
    </div>
  );
}
