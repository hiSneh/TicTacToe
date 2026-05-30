import { trackEvent } from '../services/analytics';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

export const isAdSenseConfigured = Boolean(clientId);

let scriptRequested = false;

export const loadAdSense = () => {
  if (!isAdSenseConfigured || scriptRequested || typeof document === 'undefined') return;
  scriptRequested = true;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.onload = () => trackEvent('ad_sdk_ready', { provider: 'adsense', platform: 'web' });
  script.onerror = () => trackEvent('ad_sdk_error', { provider: 'adsense', platform: 'web' });
  document.head.appendChild(script);
};

export const requestAdSenseFill = (placement: string) => {
  if (!isAdSenseConfigured) return;
  try {
    window.adsbygoogle = window.adsbygoogle ?? [];
    window.adsbygoogle.push({});
    trackEvent('ad_impression_requested', { provider: 'adsense', placement, platform: 'web' });
  } catch {
    trackEvent('ad_request_failed', { provider: 'adsense', placement, platform: 'web' });
  }
};

export const getAdSenseClientId = () => clientId;
