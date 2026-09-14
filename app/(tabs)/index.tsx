import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { isMobile } = useResponsive();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Centro de Control OMA</Text>
      <Text style={styles.subtitle}>Sistema de Gestión de Mantenimiento Aeronáutico</Text>
      
      {/* KPIs Dinámicos */}
      <View style={[styles.kpiContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
        <View style={[styles.kpiCard, { borderLeftColor: '#22C55E' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiNumber}>12</Text>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          <Text style={styles.kpiLabel}>Aeronaves Operativas</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiNumber}>3</Text>
            <Ionicons name="time" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.kpiLabel}>Alertas Preventivas</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#EF4444' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiNumber}>1</Text>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
          </View>
          <Text style={styles.kpiLabel}>En Mantenimiento (AOG)</Text>
        </View>
      </View>

      {/* Sección de Tareas Críticas */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Próximos Vencimientos y Órdenes de Trabajo</Text>
        
        <View style={styles.rowItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>N102-YS (Boeing 737)</Text>
            <Text style={styles.rowSub}>Revisión C1 • Faltan 145 horas de vuelo</Text>
          </View>
          <View style={styles.badgeWarning}>
            <Text style={styles.badgeWarningText}>Prioridad Alta</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>YS-741 (Airbus A320)</Text>
            <Text style={styles.rowSub}>Inspección de Tren de Aterrizaje • Vence en 22 días</Text>
          </View>
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeInfoText}>Programado</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8FAFC', maxWidth: 1200, alignSelf: 'center', width: '100%' },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  kpiContainer: { gap: 16, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderLeftWidth: 5, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiNumber: { fontSize: 32, fontWeight: 'bold', color: '#0F172A' },
  kpiLabel: { fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: '500' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  rowSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badgeWarning: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  badgeWarningText: { color: '#B45309', fontSize: 12, fontWeight: 'bold' },
  badgeInfo: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  badgeInfoText: { color: '#0369A1', fontSize: 12, fontWeight: 'bold' },
});