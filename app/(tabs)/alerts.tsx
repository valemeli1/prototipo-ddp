import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'Preventivo' | 'Directiva AD' | 'AOG Crítico';
type AlertStatus = 'Pendiente' | 'En Proceso' | 'Mitigado';

interface AlertItem {
  id: string;
  title: string;
  aircraft: string;
  daysRemaining: number;
  flightHoursLeft: number;
  type: AlertType;
  status: AlertStatus;
}

const INITIAL_ALERTS: AlertItem[] = [
  { id: '1', title: 'Vencimiento Revisión C (Control Estructural)', aircraft: 'N102-YS', daysRemaining: 15, flightHoursLeft: 120, type: 'Preventivo', status: 'Pendiente' },
  { id: '2', title: 'Inspección Mandatoria por Directiva AD-2026-04', aircraft: 'YS-741', daysRemaining: 5, flightHoursLeft: 25, type: 'Directiva AD', status: 'Pendiente' },
  { id: '3', title: 'Anomalía Térmica en Motor - Alerta de Inmovilización', aircraft: 'YS-741', daysRemaining: 0, flightHoursLeft: 0, type: 'AOG Crítico', status: 'En Proceso' },
];

const AIRCRAFT_OPTIONS = ['N102-YS', 'YS-741', 'N508-YS', 'YS-209'];

export default function AlertsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<'TODAS' | 'PENDIENTES' | 'MITIGADAS'>('TODAS');

  // Modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Estado para creación/edición
  const [editingAlert, setEditingAlert] = useState<AlertItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAircraft, setFormAircraft] = useState(AIRCRAFT_OPTIONS[0]);
  const [formDays, setFormDays] = useState('15');
  const [formHours, setFormHours] = useState('100');
  const [formType, setFormType] = useState<AlertType>('Preventivo');

  const getBadgeStyle = (type: AlertType) => {
    switch (type) {
      case 'AOG Crítico': return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'alert-circle' };
      case 'Directiva AD': return { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: 'shield-alert' };
      default: return { bg: '#F0F9FF', border: '#BAE6FD', color: '#0284C7', icon: 'time' };
    }
  };

  // Abrir Modal de Creación
  const openCreateModal = () => {
    setEditingAlert(null);
    setFormTitle('');
    setFormAircraft(AIRCRAFT_OPTIONS[0]);
    setFormDays('15');
    setFormHours('100');
    setFormType('Preventivo');
    setIsFormModalOpen(true);
  };

  // Abrir Modal de Edición
  const openEditModal = (item: AlertItem) => {
    setEditingAlert(item);
    setFormTitle(item.title);
    setFormAircraft(item.aircraft);
    setFormDays(item.daysRemaining.toString());
    setFormHours(item.flightHoursLeft.toString());
    setFormType(item.type);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSaveAlert = () => {
    if (!formTitle.trim()) {
      const msg = 'Ingresa el título o descripción de la alerta.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Campo Obligatorio', msg);
      return;
    }

    const daysNum = parseInt(formDays, 10) || 0;
    const hoursNum = parseInt(formHours, 10) || 0;

    if (editingAlert) {
      // Modificar
      setAlerts(alerts.map(a => a.id === editingAlert.id ? {
        ...a,
        title: formTitle.trim(),
        aircraft: formAircraft,
        daysRemaining: daysNum,
        flightHoursLeft: hoursNum,
        type: formType,
      } : a));
    } else {
      // Crear nueva
      const newAlert: AlertItem = {
        id: Date.now().toString(),
        title: formTitle.trim(),
        aircraft: formAircraft,
        daysRemaining: daysNum,
        flightHoursLeft: hoursNum,
        type: formType,
        status: 'Pendiente',
      };
      setAlerts([newAlert, ...alerts]);
    }

    setIsFormModalOpen(false);
  };

  // Confirmar / Mitigar Alerta
  const handleMitigate = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Mitigado' } : a));
    setIsDetailModalOpen(false);
  };

  // Eliminar Alerta
  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    setIsDetailModalOpen(false);
  };

  // Filtrado de la lista
  const filteredAlerts = alerts.filter(a => {
    if (filter === 'PENDIENTES') return a.status !== 'Mitigado';
    if (filter === 'MITIGADAS') return a.status === 'Mitigado';
    return true;
  });

  return (
    <View style={[styles.container, { padding: isMobile ? 12 : 24 }]}>
      {/* CABECERA */}
      <View style={styles.headerBox}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>CONTROL DE AERONAVEGABILIDAD · OMA</Text>
            <Text style={styles.title}>Centro de Alertas y AOG</Text>
            <Text style={styles.subtitle}>Monitoreo preventivo basado en horas de vuelo y normativas.</Text>
          </View>

          <Pressable style={styles.createBtn} onPress={openCreateModal}>
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Nueva Alerta</Text>
          </Pressable>
        </View>

        {/* PESTAÑAS DE FILTRO */}
        <View style={styles.filterRow}>
          <Pressable style={[styles.filterChip, filter === 'TODAS' && styles.filterChipActive]} onPress={() => setFilter('TODAS')}>
            <Text style={[styles.filterText, filter === 'TODAS' && styles.filterTextActive]}>Todas ({alerts.length})</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, filter === 'PENDIENTES' && styles.filterChipActive]} onPress={() => setFilter('PENDIENTES')}>
            <Text style={[styles.filterText, filter === 'PENDIENTES' && styles.filterTextActive]}>
              Pendientes ({alerts.filter(a => a.status !== 'Mitigado').length})
            </Text>
          </Pressable>
          <Pressable style={[styles.filterChip, filter === 'MITIGADAS' && styles.filterChipActive]} onPress={() => setFilter('MITIGADAS')}>
            <Text style={[styles.filterText, filter === 'MITIGADAS' && styles.filterTextActive]}>
              Mitigadas ({alerts.filter(a => a.status === 'Mitigado').length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* LISTADO DE ALERTAS */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const badge = getBadgeStyle(item.type);
          const isAOG = item.type === 'AOG Crítico';
          const isMitigated = item.status === 'Mitigado';

          return (
            <Pressable
              style={[styles.alertCard, isAOG && styles.aogCard, isMitigated && styles.mitigatedCard]}
              onPress={() => { setEditingAlert(item); setIsDetailModalOpen(true); }}
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
                  {isMitigated && (
                    <View style={styles.mitigatedBadge}>
                      <Text style={styles.mitigatedText}>✓ Mitigado</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.alertTitle, isMitigated && styles.textStrikethrough]}>{item.title}</Text>
                <Text style={styles.alertSub}>
                  Límite: <Text style={{ fontWeight: 'bold' }}>{item.flightHoursLeft} FH</Text> restantes
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

      {/* MODAL 1: DETALLES Y ACCIONES (CONFIRMAR / EDITAR / ELIMINAR) */}
      <Modal visible={isDetailModalOpen} transparent animationType="fade" onRequestClose={() => setIsDetailModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {editingAlert && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Gestión de Alerta Técnica</Text>
                  <Pressable onPress={() => setIsDetailModalOpen(false)}>
                    <Ionicons name="close" size={20} color="#1E293B" />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Aeronave Afectada:</Text>
                  <Text style={styles.modalValue}>{editingAlert.aircraft}</Text>

                  <Text style={[styles.modalLabel, { marginTop: 10 }]}>Descripción del Hallazgo:</Text>
                  <Text style={styles.modalValue}>{editingAlert.title}</Text>

                  <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                    <View>
                      <Text style={styles.modalLabel}>Días Restantes:</Text>
                      <Text style={styles.modalValue}>{editingAlert.daysRemaining} días</Text>
                    </View>
                    <View>
                      <Text style={styles.modalLabel}>Horas de Vuelo (FH):</Text>
                      <Text style={styles.modalValue}>{editingAlert.flightHoursLeft} FH</Text>
                    </View>
                  </View>

                  <Text style={[styles.modalLabel, { marginTop: 10 }]}>Estatus Actual:</Text>
                  <Text style={[styles.modalValue, { color: editingAlert.status === 'Mitigado' ? '#059669' : '#D97706', fontWeight: 'bold' }]}>
                    {editingAlert.status}
                  </Text>
                </View>

                <View style={styles.modalFooter}>
                  <Pressable style={styles.deleteBtn} onPress={() => handleDeleteAlert(editingAlert.id)}>
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </Pressable>

                  <Pressable style={styles.secondaryBtn} onPress={() => openEditModal(editingAlert)}>
                    <Ionicons name="create-outline" size={15} color="#334155" />
                    <Text style={styles.secondaryBtnText}>Editar</Text>
                  </Pressable>

                  {editingAlert.status !== 'Mitigado' && (
                    <Pressable style={styles.primaryBtn} onPress={() => handleMitigate(editingAlert.id)}>
                      <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Atender / Mitigar</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CREAR / EDITAR ALERTA */}
      <Modal visible={isFormModalOpen} transparent animationType="fade" onRequestClose={() => setIsFormModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAlert ? 'Editar Alerta' : 'Nueva Alerta Técnica'}</Text>
              <Pressable onPress={() => setIsFormModalOpen(false)}>
                <Ionicons name="close" size={20} color="#1E293B" />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Aeronave *</Text>
            <View style={styles.aircraftOptionRow}>
              {AIRCRAFT_OPTIONS.map(ac => (
                <Pressable
                  key={ac}
                  style={[styles.aircraftChip, formAircraft === ac && styles.aircraftChipActive]}
                  onPress={() => setFormAircraft(ac)}
                >
                  <Text style={[styles.aircraftChipText, formAircraft === ac && styles.aircraftChipTextActive]}>{ac}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Título / Descripción de la Alerta *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. Inspección por Directiva AD..."
              placeholderTextColor="#94A3B8"
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Días Restantes</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={formDays}
                  onChangeText={setFormDays}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Horas de Vuelo (FH)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={formHours}
                  onChangeText={setFormHours}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Tipo de Alerta</Text>
            <View style={styles.typeOptionRow}>
              {(['Preventivo', 'Directiva AD', 'AOG Crítico'] as AlertType[]).map(t => (
                <Pressable
                  key={t}
                  style={[styles.typeOptionChip, formType === t && styles.typeOptionChipActive]}
                  onPress={() => setFormType(t)}
                >
                  <Text style={[styles.typeOptionText, formType === t && styles.typeOptionTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.modalFooter, { marginTop: 18 }]}>
              <Pressable style={styles.secondaryBtn} onPress={() => setIsFormModalOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleSaveAlert}>
                <Text style={styles.primaryBtnText}>Guardar Alerta</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { marginBottom: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 },
  eyebrow: { fontSize: 9, fontWeight: '800', color: '#0284C7', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#0284C7' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  filterTextActive: { color: '#FFFFFF' },

  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  aogCard: { borderColor: '#FECACA', backgroundColor: '#FFFDFD' },
  mitigatedCard: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  aircraftTag: { fontSize: 11, fontWeight: '800', color: '#0F172A', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  typeBadgeText: { fontSize: 9, fontWeight: '700' },
  mitigatedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  mitigatedText: { fontSize: 9, fontWeight: '800', color: '#059669' },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  textStrikethrough: { textDecorationLine: 'line-through' },
  alertSub: { fontSize: 11, color: '#64748B' },
  daysBox: { alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 50 },
  daysText: { fontSize: 14, fontWeight: '800', color: '#334155' },
  daysLabel: { fontSize: 8, color: '#64748B', fontWeight: '600' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 440, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  modalBody: { marginBottom: 16 },
  modalLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  modalValue: { fontSize: 13, color: '#1E293B', marginTop: 2 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },

  inputLabel: { fontSize: 11, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 4 },
  textInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: '#0F172A', backgroundColor: '#F8FAFC' },

  aircraftOptionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  aircraftChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  aircraftChipActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  aircraftChipText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  aircraftChipTextActive: { color: '#FFFFFF' },

  typeOptionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeOptionChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  typeOptionChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  typeOptionText: { fontSize: 10, fontWeight: '700', color: '#334155' },
  typeOptionTextActive: { color: '#FFFFFF' },

  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0284C7', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
  secondaryBtnText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
});