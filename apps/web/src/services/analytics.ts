export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const cacheKey = 'tictactoe.localAnalytics.v1';

const sanitizeParams = (params: AnalyticsParams) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null));

const cacheEvent = (eventName: string, params: Record<string, string | number | boolean>) => {
  try {
    const cached = window.localStorage.getItem(cacheKey);
    const events = cached ? (JSON.parse(cached) as unknown[]) : [];
    const nextEvents = [...events, { name: eventName, params, createdAt: Date.now() }].slice(-100);
    window.localStorage.setItem(cacheKey, JSON.stringify(nextEvents));
  } catch {
    // Local analytics is best effort only.
  }
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  const safeParams = sanitizeParams(params) as Record<string, string | number | boolean>;
  cacheEvent(eventName, safeParams);

  if (import.meta.env.DEV) {
    console.info('[analytics:local]', eventName, safeParams);
  }
};

export const trackScreenView = (screenName: string) => {
  trackEvent('screen_view', { screen_name: screenName, platform: 'web' });
};
