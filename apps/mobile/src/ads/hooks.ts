import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdEventType, createInterstitial, createRewarded, RewardedAdEventType } from './adMob';
import { useAdsStore } from '../store/adsStore';
import { trackEvent } from '../services/analytics';

export const useInterstitialAd = (placement = 'game_complete') => {
  const [loaded, setLoaded] = useState(false);
  const interstitial = useMemo(() => createInterstitial(), []);
  const canShowInterstitial = useAdsStore((state) => state.canShowInterstitial);
  const markInterstitialShown = useAdsStore((state) => state.markInterstitialShown);

  useEffect(() => {
    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load();
    });
    const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
      trackEvent('ad_request_failed', { provider: 'admob', placement, platform: 'mobile' });
    });
    interstitial.load();

    return () => {
      loadedListener();
      closedListener();
      errorListener();
    };
  }, [interstitial, placement]);

  return useCallback(() => {
    if (!loaded || !canShowInterstitial()) return false;
    interstitial.show();
    markInterstitialShown(placement);
    return true;
  }, [canShowInterstitial, interstitial, loaded, markInterstitialShown, placement]);
};

export const useRewardedAd = (reward = 'hint') => {
  const [loaded, setLoaded] = useState(false);
  const rewarded = useMemo(() => createRewarded(), []);
  const markRewardEarned = useAdsStore((state) => state.markRewardEarned);

  useEffect(() => {
    const loadedListener = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
    const earnedListener = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => markRewardEarned(reward));
    const closedListener = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      rewarded.load();
    });
    const errorListener = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
      trackEvent('ad_request_failed', { provider: 'admob', reward, platform: 'mobile' });
    });
    rewarded.load();

    return () => {
      loadedListener();
      earnedListener();
      closedListener();
      errorListener();
    };
  }, [markRewardEarned, rewarded, reward]);

  return useCallback(() => {
    if (!loaded) return false;
    rewarded.show();
    trackEvent('ad_rewarded_requested', { provider: 'admob', reward, platform: 'mobile' });
    return true;
  }, [loaded, rewarded, reward]);
};
