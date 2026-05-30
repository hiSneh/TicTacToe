import { Platform } from 'react-native';
import { trackEvent } from '../services/analytics';

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const adsDisabled = env.EXPO_PUBLIC_DISABLE_ADMOB !== 'false';

const androidInterstitialId = env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID;
const iosInterstitialId = env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS;
const androidRewardedId = env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID;
const iosRewardedId = env.EXPO_PUBLIC_ADMOB_REWARDED_IOS;
const androidBannerId = env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID;
const iosBannerId = env.EXPO_PUBLIC_ADMOB_BANNER_IOS;

type ListenerCleanup = () => void;
type AdInstance = {
  addAdEventListener: (type: string, listener: () => void) => ListenerCleanup;
  load: () => void;
  show: () => void;
};

type GoogleMobileAdsModule = {
  default: () => { initialize: () => Promise<void> };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  BannerAd: React.ComponentType<{ unitId: string; size: string; requestOptions?: { requestNonPersonalizedAdsOnly?: boolean } }>;
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: string };
  InterstitialAd: { createForAdRequest: (unitId: string, options?: { requestNonPersonalizedAdsOnly?: boolean }) => AdInstance };
  RewardedAd: { createForAdRequest: (unitId: string, options?: { requestNonPersonalizedAdsOnly?: boolean }) => AdInstance };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
};

const fallbackTestIds = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  rewarded: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

const selectByPlatform = (androidValue: string | undefined, iosValue: string | undefined, fallback: string) => {
  if (__DEV__) return fallback;
  return Platform.select({ android: androidValue, ios: iosValue }) ?? fallback;
};

export const adUnitIds = {
  banner: selectByPlatform(androidBannerId, iosBannerId, fallbackTestIds.banner),
  interstitial: selectByPlatform(androidInterstitialId, iosInterstitialId, fallbackTestIds.interstitial),
  rewarded: selectByPlatform(androidRewardedId, iosRewardedId, fallbackTestIds.rewarded),
};

let cachedModule: GoogleMobileAdsModule | null | undefined;

export const getGoogleMobileAdsModule = () => {
  if (adsDisabled) return null;
  if (cachedModule !== undefined) return cachedModule;

  try {
    // Expo Go does not include this native module. Keep it lazy so development does not crash.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('react-native-google-mobile-ads') as GoogleMobileAdsModule;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
};

export const isAdMobAvailable = () => Boolean(getGoogleMobileAdsModule());

const noopAd: AdInstance = {
  addAdEventListener: () => () => undefined,
  load: () => undefined,
  show: () => undefined,
};

export const initializeAds = async () => {
  const ads = getGoogleMobileAdsModule();
  if (!ads) {
    trackEvent('ad_sdk_unavailable', { provider: 'admob', platform: 'mobile' });
    return;
  }

  try {
    await ads.default().initialize();
    trackEvent('ad_sdk_ready', { provider: 'admob', platform: 'mobile' });
  } catch {
    trackEvent('ad_sdk_error', { provider: 'admob', platform: 'mobile' });
  }
};

export const createInterstitial = () => {
  const ads = getGoogleMobileAdsModule();
  return ads?.InterstitialAd.createForAdRequest(adUnitIds.interstitial, { requestNonPersonalizedAdsOnly: true }) ?? noopAd;
};

export const createRewarded = () => {
  const ads = getGoogleMobileAdsModule();
  return ads?.RewardedAd.createForAdRequest(adUnitIds.rewarded, { requestNonPersonalizedAdsOnly: true }) ?? noopAd;
};

export const getAdEventTypes = () =>
  getGoogleMobileAdsModule()?.AdEventType ?? {
    LOADED: 'loaded',
    CLOSED: 'closed',
    ERROR: 'error',
  };

export const getRewardedAdEventTypes = () =>
  getGoogleMobileAdsModule()?.RewardedAdEventType ?? {
    LOADED: 'rewarded_loaded',
    EARNED_REWARD: 'rewarded_earned_reward',
  };
