import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { colors, severityColor, severityLabel, parseSeverity } from '../theme';
import type { Alert } from '../types/models';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
    });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>All clear right now 💧 — we'll let you know the moment that changes.</Text>}
        renderItem={({ item }) => {
          const severity = parseSeverity(item.severity);
          return (
            <View style={[styles.card, { borderLeftColor: severityColor(severity) }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: severityColor(severity) }]}>
                  <Text style={styles.badgeText}>{severityLabel(severity)}</Text>
                </View>
              </View>
              <Text style={styles.area}>{item.area}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloud },
  empty: { textAlign: 'center', marginTop: 48, color: colors.slate, fontSize: 15 },
  card: { backgroundColor: colors.white, borderRadius: 12, borderLeftWidth: 5, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.ink, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  area: { color: colors.current700, fontSize: 13, marginTop: 4, fontWeight: '500' },
  description: { color: colors.slate, fontSize: 14, marginTop: 6, lineHeight: 20 },
});
