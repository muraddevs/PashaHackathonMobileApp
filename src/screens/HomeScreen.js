import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DARK_GREEN,
  MID_GREEN,
  ACCENT_GREEN,
  LIGHT_GREEN,
  BRIGHT_GREEN,
} from '../constants/colors';

const TIERS = [
  { label: 'BASIC', color: '#3a8a5a' },
  { label: 'BRONZE', color: '#cd7f32' },
  { label: 'SILVER', color: '#9e9e9e' },
  { label: 'GOLD', color: '#c9a832' },
  { label: 'ELITE', color: '#1a1a1a' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={[DARK_GREEN, MID_GREEN]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroCircleTopRight} />
        <View style={styles.heroCircleBottomLeft} />
        <Text style={styles.heroTitle}>Welcome</Text>
        <Text style={styles.heroSubtitle}>
          Join the Bravo App and unlock exclusive perks!{'\n'}
          Sign in or sign up with your Bir ID to get started.
        </Text>
        <TouchableOpacity style={styles.heroButton} activeOpacity={0.8}>
          <Text style={styles.heroButtonText}>Log in with Bir ID</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Customer Tiers */}
      <View style={styles.sectionWrap}>
        <LinearGradient
          colors={['#1e3a28', '#2d5a3d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tiersCard}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tiersRow}
          >
            {TIERS.map(({ label, color }) => (
              <View
                key={label}
                style={[styles.tierItem, { backgroundColor: color }]}
              >
                <Text style={styles.tierLabel}>⬡ {label}</Text>
                <View style={styles.tierBar} />
                <Text style={styles.tierProgress}>0/1500</Text>
                <Text style={styles.tierCoin}>HexaCoin</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.tiersFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tiersTitle}>Customer Tiers</Text>
              <Text style={styles.tiersDesc}>
                Learn about the advantages of each tier
              </Text>
            </View>
            <TouchableOpacity style={styles.circleArrow}>
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* 50% Banner */}
      <View style={styles.sectionWrap}>
        <LinearGradient
          colors={['#cc0000', '#990000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerLogoBox}>
              <View style={styles.bannerTagOrange}>
                <Text style={styles.bannerTagText}>yalnız</Text>
              </View>
              <View style={styles.bannerLogoInner}>
                <Text style={{ fontSize: 18, color: '#fff' }}>⬡</Text>
              </View>
              <Text style={styles.bannerLogoText}>Bravo</Text>
              <View style={styles.bannerTagGreen}>
                <Text style={styles.bannerTagText}>tətbiqlə</Text>
              </View>
            </View>
            <View>
              <Text style={styles.bannerPercent}>50%</Text>
              <Text style={styles.bannerDiscount}>-dək endirim!</Text>
              <Text style={styles.bannerValid}>Offers are valid until 26 may.</Text>
            </View>
          </View>
          <View style={styles.bannerCircleArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </View>

      {/* My Campaigns */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Campaigns</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <View style={styles.emptyCardSmall}>
          <Text style={styles.emptyCardSmallText}>Campaigns</Text>
        </View>
      </View>

      {/* Brand of Azerbaijan */}
      <View style={styles.sectionWrap}>
        <LinearGradient
          colors={['#c8e6c9', '#a5d6a7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandCard}
        >
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 32 }}>🏺</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.brandTopText}>Yurdumuzdan qürurla</Text>
            <Text style={styles.brandTitle}>BRAND OF{'\n'}AZERBAIJAN</Text>
            <Text style={styles.brandLink}>Click to view all discounts</Text>
          </View>
          <View style={[styles.circleArrow, { backgroundColor: BRIGHT_GREEN }]}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </View>

      {/* My Coupons */}
      <View style={[styles.sectionWrap, { marginBottom: 24 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My coupons</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎟️</Text>
          <Text style={styles.emptyTitle}>No coupons yet</Text>
          <Text style={styles.emptyDesc}>
            Partake in our campaigns to start earning coupons.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },

  hero: {
    padding: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroCircleTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroCircleBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  heroButtonText: {
    color: DARK_GREEN,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  sectionWrap: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: ACCENT_GREEN, fontWeight: '600' },

  tiersCard: { borderRadius: 20, padding: 18, paddingBottom: 0, overflow: 'hidden' },
  tiersRow: { gap: 8, paddingBottom: 12 },
  tierItem: {
    minWidth: 72,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  tierLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tierBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginBottom: 4,
  },
  tierProgress: { fontSize: 8, color: 'rgba(255,255,255,0.6)' },
  tierCoin: { fontSize: 7, color: 'rgba(255,255,255,0.5)' },
  tiersFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 16,
  },
  tiersTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  tiersDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  circleArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#fff', fontSize: 16 },

  bannerCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  bannerLogoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  bannerTagOrange: {
    position: 'absolute',
    top: -6,
    left: 6,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  bannerTagGreen: {
    position: 'absolute',
    bottom: -6,
    right: 6,
    backgroundColor: ACCENT_GREEN,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  bannerTagText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  bannerLogoInner: {
    width: 36,
    height: 36,
    backgroundColor: DARK_GREEN,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogoText: {
    fontSize: 9,
    fontWeight: '700',
    color: DARK_GREEN,
    textAlign: 'center',
    marginTop: 2,
  },
  bannerPercent: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFD700',
    lineHeight: 44,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  bannerDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    fontStyle: 'italic',
  },
  bannerValid: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bannerCircleArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCardSmall: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  emptyCardSmallText: { color: '#999', fontSize: 14, fontWeight: '500' },

  brandCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  brandIcon: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTopText: { fontSize: 10, color: '#2d5a3d', marginBottom: 2 },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a3a2a',
    letterSpacing: 0.5,
    lineHeight: 19,
  },
  brandLink: { fontSize: 10, color: '#52b788', marginTop: 4 },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  emptyTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDesc: { color: '#999', fontSize: 13, textAlign: 'center' },
});
