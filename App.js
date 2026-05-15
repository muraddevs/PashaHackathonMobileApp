import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CampaignsScreen from './src/screens/CampaignsScreen';
import BravoOnlineScreen from './src/screens/BravoOnlineScreen';
import CouponsScreen from './src/screens/CouponsScreen';
import MoreScreen from './src/screens/MoreScreen';
import { DARK_GREEN, LIGHT_GREEN } from './src/constants/colors';

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'campaigns', icon: '📢', label: 'Campaigns' },
  { id: 'online', icon: '🛒', label: 'Bravo Online' },
  { id: 'coupons', icon: '🎟️', label: 'Coupons' },
  { id: 'more', icon: '☰', label: 'More' },
];

export default function App() {
  const [tab, setTab] = useState('home');

  const renderScreen = () => {
    switch (tab) {
      case 'home':
        return <HomeScreen />;
      case 'campaigns':
        return <CampaignsScreen />;
      case 'online':
        return <BravoOnlineScreen />;
      case 'coupons':
        return <CouponsScreen />;
      case 'more':
        return <MoreScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />
      <SafeAreaView style={styles.safeTop} />
      <View style={styles.screen}>{renderScreen()}</View>
      <SafeAreaView style={styles.safeBottom}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => {
            const active = tab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => setTab(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, !active && { opacity: 0.55 }]}>
                  {item.icon}
                </Text>
                <Text
                  style={[
                    styles.navLabel,
                    active
                      ? { color: LIGHT_GREEN, fontWeight: '600' }
                      : { color: 'rgba(255,255,255,0.55)' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  safeTop: {
    backgroundColor: DARK_GREEN,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screen: { flex: 1 },
  safeBottom: { backgroundColor: DARK_GREEN },
  bottomNav: {
    height: 70,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 3,
  },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10 },
});
