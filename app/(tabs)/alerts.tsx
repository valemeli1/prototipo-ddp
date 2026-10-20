import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertItem {
  id: string;
  title: string;
  aircraft: string;
  daysRemaining: number;
  flightHoursLeft: number;
  type: 'Preventivo' | 'Directiva AD' | 'AOG Crítico';
  status: 'Pendiente' | 'En Proceso' | 'Mitigado';
}

const INITIAL_ALERTS: AlertItem[] = [
  { id: '1', title: 'Vencimiento Revisión C (Control Estructural)', aircraft: 'N102-YS', daysRemaining: 15, flightHoursLeft: 120, type: 'Preventivo', status: 'Pendiente' },
  { id: '2', title: 'Inspección Mandatoria por Directiva AD-2026-04', aircraft: 'YS-741', daysRemaining: 5, flightHoursLeft: 25, type: 'Directiva AD', status: 'Pendiente' },
  { id: '3', title: 'Anomalía Térmica en Motor - Alerta de Inmovilización', aircraft: 'YS-741', daysRemaining: 0, flightHoursLeft: 0, type: 'AOG Crítico', status: 'En Proceso' },
];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'AOG Crítico': return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'alert-circle' };
      case 'Directiva AD': return { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: 'shield-alert' };
      default: return { bg: '#F0F9FF', border: '#BAE6FD', color: '#0284C7', icon: 'time' };
    }
  };

  const handleMitigate = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Mitigado' } : a));
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <View>
          <Text style={styles.eyebrow}>CONTROL DE AERONAVEGABILIDAD · OMA</Text>
          <Text style={styles.title}>Motor de Alertas Tempranas y AOG</Text>
          <Text style={styles.subtitle}>Monitoreo preventivo basado en umbrales de tiempo, horas de vuelo y normativas.</Text>
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const badge = getBadgeStyle(item.type);
          const isAOG = item.type === 'AOG Crítico';

          return (
            <Pressable 
              style={[styles.alertCard, isAOG && styles.aogCard]} 
              onPress={() => { setSelectedAlert(item); setIsModalOpen(true); }}
            >
              <View style={[styles.iconContainer, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                <Ionicons name={badge.icon as any} size={22} color={badge.color} />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.aircraftTag}>{item.aircraft}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                    <Text style={[styles.typeBadgeText, { color: badge.color }]}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertSub}>
                  Límite operacional: <Text style={{ fontWeight: 'bold' }}>{item.flightHoursLeft} FH</Text> restantes
                </Text>
              </View>

              <View style={styles.daysBox}>
                <Text style={styles.daysText}>{item.daysRemaining}d</Text>
                <Text style={styles.daysLabel}>plazo</Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Modal de Gestión de Alerta / Orden de Trabajo */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selectedAlert && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Gestión de Alerta Técnica</Text>
                  <Pressable onPress={() => setIsModalOpen(false)}>
                    <Ionicons name="close" size={20} color="#1E293B" />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Aeronave Afectada:</Text>
                  <Text style={styles.modalValue}>{selectedAlert.aircraft}</Text>

                  <Text style={[styles.modalLabel, { marginTop: 10 }]}>Descripción del Hallazgo:</Text>
                  <Text style={styles.modalValue}>{selectedAlert.title}</Text>

                  <Text style={[styles.modalLabel, { marginTop: 10 }]}>Estatus Actual:</Text>
                  <Text style={[styles.modalValue, { color: selectedAlert.status === 'Mitigado' ? '#059669' : '#D97706', fontWeight: 'bold' }]}>
                    {selectedAlert.status}
                  </Text>
                </View>

                <View style={styles.modalFooter}>
                  <Pressable style={styles.secondaryBtn} onPress={() => setIsModalOpen(false)}>
                    <Text style={styles.secondaryBtnText}>Cerrar</Text>
                  </Pressable>
                  {selectedAlert.status !== 'Mitigado' && (
                    <Pressable style={styles.primaryBtn} onPress={() => handleMitigate(selectedAlert.id)}>
                      <Text style={styles.primaryBtnText}>Emitir Orden de Trabajo</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: '#0284C7', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0px 2px 6px rgba(0,0,0,0.03)' },
  aogCard: { borderColor: '#FECACA', backgroundColor: '#FFFDFD' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aircraftTag: { fontSize: 12, fontWeight: '800', color: '#0F172A', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  alertSub: { fontSize: 11, color: '#64748B' },
  daysBox: { alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, minWidth: 55 },
  daysText: { fontSize: 15, fontWeight: '800', color: '#334155' },
  daysLabel: { fontSize: 9, color: '#64748B', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 450, padding: 20, boxShadow: '0px 10px 25px rgba(0,0,0,0.2)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalBody: { marginBottom: 20 },
  modalLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  modalValue: { fontSize: 14, color: '#1E293B', marginTop: 2 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  primaryBtn: { backgroundColor: '#0284C7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  secondaryBtnText: { color: '#475569', fontSize: 12, fontWeight: '700' },
});