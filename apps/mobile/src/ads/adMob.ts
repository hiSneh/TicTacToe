import mobileAds, {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { trackEvent } from '../services/analytics';

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const androidInterstitialId = env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID;
const iosInterstitialId = env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS;
const androidRewardedId = env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID;
const iosRewardedId = env.EXPO_PUBLIC_ADMOB_REWARDED_IOS;
const androidBannerId = env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID;
const iosBannerId = env.EXPO_PUBLIC_ADMOB_BANNER_IOS;

const selectByPlatform = (androidValue: string | undefined, iosValue: string | undefined, fallback: string) => {
  if (__DEV__) return fallback;
  return Platform.select({ android: androidValue, ios: iosValue }) ?? fallback;
};

export const adUnitIds = {
  banner: selectByPlatform(androidBannerId, iosBannerId, TestIds.BANNER),
  interstitial: selectByPlatform(androidInterstitialId, iosInterstitialId, TestIds.INTERSTITIAL),
  rewarded: selectByPlatform(androidRewardedId, iosRewardedId, TestIds.REWARDED),
};

export const initializeAds = async () => {
  try {
    await mobileAds().initialize();
    trackEvent('ad_sdk_ready', { provider: 'admob', platform: 'mobile' });
  } catch {
    trackEvent('ad_sdk_error', { provider: 'admob', platform: 'mobile' });
  }
};

export const createInterstitial = () =>
  InterstitialAd.createForAdRequest(adUnitIds.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  });

export const createRewarded = () =>
  RewardedAd.createForAdRequest(adUnitIds.rewarded, {
    requestNonPersonalizedAdsOnly: true,
  });

export { AdEventType, BannerAd, BannerAdSize, RewardedAdEventType };
