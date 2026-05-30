import { useCallback, useEffect } from 'react';
import { loadAdSense } from './adSense';
import { useAdsStore } from '../store/adsStore';
import { trackEvent } from '../services/analytics';

export const useBannerAd = () => {
  useEffect(() => {
    loadAdSense();
  }, []);
};

export const useInterstitialAd = (placement = 'game_complete') => {
  const canShowInterstitial = useAdsStore((state) => state.canShowInterstitial);
  const markInterstitialShown = useAdsStore((state) => state.markInterstitialShown);

  return useCallback(() => {
    if (!canShowInterstitial()) return false;
    markInterstitialShown(placement);
    return true;
  }, [canShowInterstitial, markInterstitialShown, placement]);
};

export const useRewardedAd = (reward = 'hint') => {
  const markRewardEarned = useAdsStore((state) => state.markRewardEarned);

  return useCallback(async () => {
    trackEvent('ad_rewarded_requested', { provider: 'adsense', reward, platform: 'web' });
    markRewardEarned(reward);
    return true;
  }, [markRewardEarned, reward]);
};
