import { useCallback, useEffect, useMemo, useState } from 'react';
import { createInterstitial, createRewarded, getAdEventTypes, getRewardedAdEventTypes, isAdMobAvailable } from './adMob';
import { useAdsStore } from '../store/adsStore';
import { trackEvent } from '../services/analytics';

export const useInterstitialAd = (placement = 'game_complete') => {
  const [loaded, setLoaded] = useState(false);
  const interstitial = useMemo(() => createInterstitial(), []);
  const canShowInterstitial = useAdsStore((state) => state.canShowInterstitial);
  const markInterstitialShown = useAdsStore((state) => state.markInterstitialShown);

  useEffect(() => {
    if (!isAdMobAvailable()) return undefined;

    const adEventTypes = getAdEventTypes();
    const loadedListener = interstitial.addAdEventListener(adEventTypes.LOADED, () => setLoaded(true));
    const closedListener = interstitial.addAdEventListener(adEventTypes.CLOSED, () => {
      setLoaded(false);
      interstitial.load();
    });
    const errorListener = interstitial.addAdEventListener(adEventTypes.ERROR, () => {
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
    if (!isAdMobAvailable()) return undefined;

    const adEventTypes = getAdEventTypes();
    const rewardedAdEventTypes = getRewardedAdEventTypes();
    const loadedListener = rewarded.addAdEventListener(rewardedAdEventTypes.LOADED, () => setLoaded(true));
    const earnedListener = rewarded.addAdEventListener(rewardedAdEventTypes.EARNED_REWARD, () => markRewardEarned(reward));
    const closedListener = rewarded.addAdEventListener(adEventTypes.CLOSED, () => {
      setLoaded(false);
      rewarded.load();
    });
    const errorListener = rewarded.addAdEventListener(adEventTypes.ERROR, () => {
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
