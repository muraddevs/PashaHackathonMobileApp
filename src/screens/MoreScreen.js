import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const ITEMS = [
  { icon: '👤', label: 'My Account' },
  { icon: '📍', label: 'Addresses' },
  { icon: '📦', label: 'My Orders' },
  { icon: '⭐', label: 'Favorites' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '⚙️', label: 'Settings' },
];

export default function MoreScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>More</Text>
      <View style={styles.card}>
        {ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.row,
              i < ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
            ]}
            activeOpacity={0.6}
          >
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  chevron: { color: '#ccc', fontSize: 22, fontWeight: '600' },
});
