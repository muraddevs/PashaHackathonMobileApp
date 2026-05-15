import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ACCENT_GREEN } from '../constants/colors';

const CAMPAIGNS = [
  { name: 'Summer Sale', emoji: '🌞', hue: 140 },
  { name: 'Brand of Azerbaijan', emoji: '🏺', hue: 200 },
  { name: 'HexaCoin Bonus', emoji: '🪙', hue: 260 },
  { name: 'Weekly Deals', emoji: '🛒', hue: 320 },
];

function hsl(h, s, l) {
  // approximate HSL → simple pastel mapping; using a tint per index
  const lookups = ['#e1efe3', '#e0e9f1', '#ece1f1', '#f1e1e9'];
  return lookups[h % lookups.length];
}

export default function CampaignsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Campaigns</Text>
      {CAMPAIGNS.map((c, i) => (
        <TouchableOpacity key={i} style={styles.card} activeOpacity={0.85}>
          <View style={[styles.iconBox, { backgroundColor: hsl(i) }]}>
            <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{c.name}</Text>
            <Text style={styles.cardDate}>Valid until 26 May</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontWeight: '600', fontSize: 15, color: '#1a1a1a' },
  cardDate: { fontSize: 12, color: '#999', marginTop: 2 },
  chevron: { color: ACCENT_GREEN, fontSize: 22, fontWeight: '600' },
});
