import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function CouponsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>My Coupons</Text>
      <View style={styles.card}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🎟️</Text>
        <Text style={styles.cardTitle}>No coupons yet</Text>
        <Text style={styles.cardDesc}>
          Partake in our campaigns to start earning coupons.
        </Text>
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDesc: { fontSize: 13, color: '#999', textAlign: 'center' },
});
