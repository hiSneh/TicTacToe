import { StyleSheet, View } from 'react-native';
import { adUnitIds, BannerAd, BannerAdSize } from './adMob';

export const BannerAdSlot = () => (
  <View style={styles.container}>
    <BannerAd unitId={adUnitIds.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
