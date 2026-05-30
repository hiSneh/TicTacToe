import { StyleSheet, Text, View } from 'react-native';
import { adUnitIds, getGoogleMobileAdsModule } from './adMob';
import { theme } from '../theme';

export const BannerAdSlot = () => {
  const ads = getGoogleMobileAdsModule();
  const BannerAd = ads?.BannerAd;
  const bannerSize = ads?.BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  return (
    <View style={styles.container}>
      {BannerAd && bannerSize ? (
        <BannerAd unitId={adUnitIds.banner} size={bannerSize} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
      ) : (
        <Text style={styles.placeholder}>Ads disabled for mobile testing.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    color: theme.colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
});
