import { create } from 'zustand';
import { trackEvent } from '../services/analytics';

interface AdsStore {
  gamesSinceInterstitial: number;
  rewardsEarned: number;
  interstitialFrequency: number;
  recordGameCompleted: () => void;
  canShowInterstitial: () => boolean;
  markInterstitialShown: (placement: string) => void;
  markRewardEarned: (reward: string) => void;
}

export const useAdsStore = create<AdsStore>((set, get) => ({
  gamesSinceInterstitial: 0,
  rewardsEarned: 0,
  interstitialFrequency: 4,
  recordGameCompleted: () => set((state) => ({ gamesSinceInterstitial: state.gamesSinceInterstitial + 1 })),
  canShowInterstitial: () => get().gamesSinceInterstitial >= get().interstitialFrequency,
  markInterstitialShown: (placement) => {
    set({ gamesSinceInterstitial: 0 });
    trackEvent('ad_interstitial_shown', { placement, provider: 'admob', platform: 'mobile' });
  },
  markRewardEarned: (reward) => {
    set((state) => ({ rewardsEarned: state.rewardsEarned + 1 }));
    trackEvent('ad_reward_earned', { reward, provider: 'admob', platform: 'mobile' });
  },
}));
