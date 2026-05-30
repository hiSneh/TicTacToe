import { useEffect } from 'react';
import { getAdSenseClientId, isAdSenseConfigured, requestAdSenseFill } from '../ads/adSense';
import { useBannerAd } from '../ads/hooks';

interface AdPlaceholderProps {
  label?: string;
  placement?: string;
  format?: 'auto' | 'fluid';
}

export const AdPlaceholder = ({ label = 'Sponsored', placement = 'default', format = 'auto' }: AdPlaceholderProps) => {
  useBannerAd();

  useEffect(() => {
    requestAdSenseFill(placement);
  }, [placement]);

  return (
    <aside className="rounded-2xl border border-dashed border-white/18 bg-white/[0.04] px-4 py-5 text-center text-sm text-white/45">
      {isAdSenseConfigured ? (
        <ins
          className="adsbygoogle block"
          data-ad-client={getAdSenseClientId()}
          data-ad-slot={import.meta.env.VITE_ADSENSE_DEFAULT_SLOT_ID || undefined}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        label
      )}
    </aside>
  );
};
