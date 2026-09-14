import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertItem {
  id: string;
  title: string;
  aircraft: string;
  daysRemaining: number;
  type: string;
}

const ALERTS: AlertItem[] = [
  { id: '1', title: 'Vencimiento Revisión C (3000 hrs)', aircraft: 'N102-YS', daysRemaining: 15, type: 'Preventivo' },
  { id: '2', title: 'Inspección por Directiva AD-2026-04', aircraft: 'YS-741', daysRemaining: 22, type: 'Directiva' },
  { id: '3', title: 'Reemplazo programado de componente APU', aircraft: 'N508-YS', daysRemaining: 28, type: 'Correctivo' },
];

export default function AlertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motor de Alertas Tempranas (AOG)</Text>
      <Text style={styles.subtitle}>Avisos programados con 30 días de anticipación</Text>

      <FlatList
        data={ALERTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <Ionicons name="warning" size={26} color="#D97706" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{item.title}</Text>
              <Text style={styles.alertSub}>Aeronave: {item.aircraft} • Tipo: {item.type}</Text>
            </View>
            <View style={styles.daysBox}>
              <Text style={styles.daysText}>{item.daysRemaining}d</Text>
              <Text style={styles.daysLabel}>restantes</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  alertSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  daysBox: { alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  daysText: { fontSize: 14, fontWeight: 'bold', color: '#B45309' },
  daysLabel: { fontSize: 9, color: '#B45309' },
});