import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { colors, severityColor, severityLabel, parseSeverity } from '../theme';
import type { Alert } from '../types/models';

export default function HomeScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(3));
    return onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
    });
  }, []);

  const name = auth.currentUser?.displayName?.split(' ')[0] ?? 'there';
  const activeCount = alerts.filter((a) => a.severity !== 'clear').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.greeting}>Hi {name} 👋</Text>
      <Text style={styles.subGreeting}>
        {activeCount === 0 ? 'All quiet in your area today.' : `${activeCount} thing${activeCount > 1 ? 's' : ''} worth knowing about.`}
      </Text>

      <View style={styles.quickActions}>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Report')}>
          <Text style={styles.actionText}>Report an issue</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.actionText}>Alerts & map</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Latest alerts</Text>
      {alerts.length === 0 && <Text style={styles.empty}>Nothing to report right now 💧</Text>}
      {alerts.map((a) => {
        const severity = parseSeverity(a.severity);
        return (
          <View key={a.id} style={[styles.alertCard, { borderLeftColor: severityColor(severity) }]}>
            <View style={styles.alertHeaderRow}>
              <Text style={styles.alertTitle}>{a.title}</Text>
              <View style={[styles.badge, { backgroundColor: severityColor(severity) }]}>
                <Text style={styles.badgeText}>{severityLabel(severity)}</Text>
              </View>
            </View>
            <Text style={styles.alertArea}>{a.area}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloud },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.ink },
  subGreeting: { color: colors.slate, marginTop: 4, marginBottom: 20, fontSize: 14 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, backgroundColor: colors.foam100, borderRadius: 12, padding: 16, alignItems: 'center' },
  actionText: { color: colors.harbor900, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  empty: { color: colors.slate, fontSize: 14 },
  alertCard: { backgroundColor: '#fff', borderRadius: 10, borderLeftWidth: 5, padding: 12, marginBottom: 10 },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontWeight: '600', color: colors.ink, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  alertArea: { color: colors.current700, fontSize: 12, marginTop: 4 },
});
