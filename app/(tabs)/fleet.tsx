import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FleetScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestión de Flota OMA</Text>
      <Text style={styles.subtitle}>Estado actual de aeronaves registradas bajo normativa</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="airplane" size={24} color="#0284C7" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.cardTitle}>N102-YS • Boeing 737-800</Text>
            <Text style={styles.cardSub}>Estado: Operativo • Horas de vuelo: 4,210 hrs</Text>
          </View>
          <Text style={styles.badgeSuccess}>En Línea</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="airplane" size={24} color="#0284C7" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.cardTitle}>YS-741 • Airbus A320</Text>
            <Text style={styles.cardSub}>Estado: En Mantenimiento • Próxima Rev: C1</Text>
          </View>
          <Text style={styles.badgeDanger}>AOG</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badgeSuccess: { backgroundColor: '#DCFCE7', color: '#166534', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  badgeDanger: { backgroundColor: '#FEE2E2', color: '#991B1B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
});