import React, { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, TextInput,
  View, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AircraftModel3D from '../../components/AircraftModel3D';

type Part = { name: string; status: 'Correcto' | 'Revisar' | 'Crítico'; note: string };
type Aircraft = {
  id: string;
  registration: string;
  model: string;
  hours: string;
  status: 'Operativo' | 'En mantenimiento' | 'AOG';
  nextReview: string;
  parts: Part[];
};

const detailedParts: Part[] = [
  { name: 'Motor izquierdo', status: 'Correcto', note: 'Motor y góndola: inspección visual de demostración; revisar registros de mantenimiento reales.' },
  { name: 'Motor derecho', status: 'Correcto', note: 'Motor y góndola: inspección visual de demostración; revisar registros de mantenimiento reales.' },
  { name: 'Ala izquierda', status: 'Correcto', note: 'Estructura, paneles y superficies del ala izquierda. Estado ilustrativo, requiere inspección técnica.' },
  { name: 'Ala derecha', status: 'Correcto', note: 'Estructura, paneles y superficies del ala derecha. Estado ilustrativo, requiere inspección técnica.' },
  { name: 'Fuselaje', status: 'Correcto', note: 'Revestimiento y estructura exterior del fuselaje. El modelo 3D no detecta daños reales.' },
  { name: 'Cabina y parabrisas', status: 'Correcto', note: 'Cabina de mando, parabrisas y ventanillas: registro de demostración.' },
  { name: 'Tren de aterrizaje', status: 'Correcto', note: 'Conjunto de tren, amortiguadores y ruedas: verificar con documentación técnica aprobada.' },
  { name: 'Flaps y slats', status: 'Correcto', note: 'Superficies hipersustentadoras del ala; estado ilustrativo sin conexión a sensores.' },
  { name: 'Timón de dirección', status: 'Correcto', note: 'Superficie de control vertical; estado de ejemplo.' },
  { name: 'Elevadores', status: 'Correcto', note: 'Superficies de control horizontal; estado de ejemplo.' },
  { name: 'Estabilizadores', status: 'Correcto', note: 'Estabilizador horizontal y vertical; estado de ejemplo.' },
  { name: 'Sistema hidráulico', status: 'Correcto', note: 'Sistema hidráulico: el estado debe confirmarse mediante inspección y registros reales.' },
  { name: 'Sistema eléctrico', status: 'Correcto', note: 'Generación y distribución eléctrica: dato de demostración.' },
  { name: 'Aviónica', status: 'Correcto', note: 'Equipos electrónicos y navegación: dato de demostración.' },
  { name: 'Frenos y ruedas', status: 'Correcto', note: 'Frenos, neumáticos y ruedas: requiere inspección según manual aplicable.' },
  { name: 'Sistema de combustible', status: 'Correcto', note: 'Depósitos y alimentación de combustible: estado ilustrativo.' },
];

const RAW_AIRCRAFT: Aircraft[] = [
  {
    id: '1', registration: 'N102-YS', model: 'Boeing 737-800', hours: '4,210',
    status: 'Operativo', nextReview: 'C2 · 120 h',
    parts: [
      { name: 'Motor izquierdo', status: 'Correcto', note: 'Sin observaciones registradas en la demo.' },
      { name: 'Tren de aterrizaje', status: 'Correcto', note: 'Inspección visual de ejemplo: sin incidencias.' },
      { name: 'Ala derecha', status: 'Revisar', note: 'Ejemplo de hallazgo: revisar panel de acceso.' },
      { name: 'Sistema hidráulico', status: 'Correcto', note: 'Sin observaciones registradas en la demo.' },
    ],
  },
  {
    id: '2', registration: 'YS-741', model: 'Airbus A320', hours: '6,085',
    status: 'AOG', nextReview: 'C1 · Pendiente',
    parts: [
      { name: 'Motor derecho', status: 'Crítico', note: 'Hallazgo de demostración: requiere inspección técnica.' },
      { name: 'Tren de aterrizaje', status: 'Revisar', note: 'Hallazgo de demostración: verificar desgaste.' },
      { name: 'Ala izquierda', status: 'Correcto', note: 'Sin observaciones registradas en la demo.' },
      { name: 'Sistema hidráulico', status: 'Revisar', note: 'Hallazgo de demostración: revisar presión del sistema.' },
    ],
  },
  {
    id: '3', registration: 'YS-302', model: 'Embraer E190', hours: '2,730',
    status: 'En mantenimiento', nextReview: 'Inspección · 35 h',
    parts: [
      { name: 'Motor izquierdo', status: 'Correcto', note: 'Sin observaciones registradas en la demo.' },
      { name: 'Tren de aterrizaje', status: 'Revisar', note: 'Ejemplo de hallazgo: inspeccionar frenos.' },
      { name: 'Fuselaje', status: 'Correcto', note: 'Sin observaciones registradas en la demo.' },
    ],
  },
];

const initialAircraft: Aircraft[] = RAW_AIRCRAFT.map(plane => {
  const recorded = new Map(plane.parts.map(p => [p.name, p]));
  return {
    ...plane,
    parts: detailedParts.map(p => recorded.get(p.name) ?? { ...p }),
  };
});

const statusColor = (status: Part['status'] | Aircraft['status']) =>
  status === 'Crítico' || status === 'AOG' ? '#DC2626'
    : status === 'Revisar' || status === 'En mantenimiento' ? '#D97706' : '#15803D';

export default function FleetScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft);
  const [selected, setSelected] = useState<Aircraft | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const [registration, setRegistration] = useState('');
  const [model, setModel] = useState('');
  const [hours, setHours] = useState('');
  const [formError, setFormError] = useState('');

  const totals = useMemo(() => ({
    total: aircraft.length,
    operational: aircraft.filter(a => a.status === 'Operativo').length,
    maintenance: aircraft.filter(a => a.status === 'En mantenimiento').length,
    aog: aircraft.filter(a => a.status === 'AOG').length,
  }), [aircraft]);

  const openDetails = (plane: Aircraft) => {
    setSelected(plane);
    setSelectedPart(null);
    setShow3D(false);
  };

  const addAircraft = () => {
    if (!registration.trim() || !model.trim()) {
      setFormError('Escribe la matrícula y el modelo del avión.');
      return;
    }
    if (aircraft.some(a => a.registration.toLowerCase() === registration.trim().toLowerCase())) {
      setFormError('Ya existe una aeronave con esa matrícula.');
      return;
    }

    const newPlane: Aircraft = {
      id: String(Date.now()),
      registration: registration.trim().toUpperCase(),
      model: model.trim(),
      hours: hours.trim() || '0',
      status: 'Operativo',
      nextReview: 'Por programar',
      parts: detailedParts.map(p => ({ ...p })),
    };

    setAircraft(current => [newPlane, ...current]);
    setRegistration('');
    setModel('');
    setHours('');
    setFormError('');
    setShowAdd(false);
  };

  const updatePartStatus = (part: Part, next: Part['status']) => {
    if (!selected) return;
    const updatedParts = selected.parts.map(p => p.name === part.name ? { ...p, status: next } : p);
    const updatedPlane = { ...selected, parts: updatedParts };
    setAircraft(current => current.map(a => a.id === selected.id ? updatedPlane : a));
    setSelected(updatedPlane);
    setSelectedPart(updatedParts.find(p => p.name === part.name) || null);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.container, { paddingHorizontal: wide ? 28 : 16 }]}>
      <View style={[styles.header, wide && styles.headerWide]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>OPERACIONES · OMA</Text>
          <Text style={styles.title}>Gestión de flota</Text>
          <Text style={styles.subtitle}>Administra aeronaves, consulta sus componentes y registra hallazgos de inspección.</Text>
        </View>
        <Pressable onPress={() => setShowAdd(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar avión</Text>
        </Pressable>
      </View>

      <View style={[styles.stats, wide && styles.statsWide]}>
        {[
          { label: 'Aeronaves', value: totals.total, icon: 'airplane-outline', color: '#0284C7' },
          { label: 'Operativas', value: totals.operational, icon: 'checkmark-circle-outline', color: '#15803D' },
          { label: 'Mantenimiento', value: totals.maintenance, icon: 'construct-outline', color: '#D97706' },
          { label: 'AOG', value: totals.aog, icon: 'alert-circle-outline', color: '#DC2626' },
        ].map(item => (
          <View key={item.label} style={[styles.statCard, { width: wide ? '23.5%' : '48.2%' }]}>
            <Ionicons name={item.icon as any} size={21} color={item.color} />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Aeronaves registradas</Text>
          <Text style={styles.sectionHint}>Selecciona una aeronave para ver su ficha y vista 3D.</Text>
        </View>
        <View style={styles.demoTag}><Text style={styles.demoTagText}>Datos de demostración</Text></View>
      </View>

      <View style={[styles.list, wide && styles.listWide]}>
        {aircraft.map(plane => {
          const issues = plane.parts.filter(p => p.status !== 'Correcto').length;
          return (
            <View key={plane.id} style={[styles.aircraftCard, wide && styles.aircraftCardWide]}>
              <View style={styles.planeIcon}>
                <Ionicons name="airplane" size={25} color="#0284C7" />
              </View>
              <View style={styles.planeInfo}>
                <Text style={styles.registration}>{plane.registration}</Text>
                <Text style={styles.model}>{plane.model}</Text>
                <Text style={styles.meta}>{plane.hours} h de vuelo · Próxima revisión: {plane.nextReview}</Text>
                <View style={styles.cardBottom}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(plane.status) + '18' }]}>
                    <View style={[styles.dot, { backgroundColor: statusColor(plane.status) }]} />
                    <Text style={[styles.statusText, { color: statusColor(plane.status) }]}>{plane.status}</Text>
                  </View>
                  {issues > 0 && <Text style={styles.issueText}>{issues} componente(s) por revisar</Text>}
                </View>
              </View>
              <Pressable onPress={() => openDetails(plane)} style={styles.viewButton}>
                <Text style={styles.viewButtonText}>Ver avión</Text>
                <Ionicons name="chevron-forward" size={16} color="#0369A1" />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={19} color="#0369A1" />
        <Text style={styles.noteText}>Los aviones y fallos precargados son ejemplos de interfaz. Los cambios se mantienen en memoria mientras la pantalla siga abierta.</Text>
      </View>

      {/* MODAL AGREGAR AVIÓN */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.formModal}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>Agregar aeronave</Text><Text style={styles.modalSubtitle}>Completa los datos básicos de la flota.</Text></View>
              <Pressable onPress={() => setShowAdd(false)}><Ionicons name="close" size={24} color="#64748B" /></Pressable>
            </View>
            <Text style={styles.inputLabel}>Matrícula *</Text>
            <TextInput value={registration} onChangeText={setRegistration} placeholder="Ej. YS-815" autoCapitalize="characters" style={styles.input} />
            <Text style={styles.inputLabel}>Modelo de aeronave *</Text>
            <TextInput value={model} onChangeText={setModel} placeholder="Ej. Airbus A320" style={styles.input} />
            <Text style={styles.inputLabel}>Horas de vuelo</Text>
            <TextInput value={hours} onChangeText={setHours} placeholder="Ej. 1200" keyboardType="numeric" style={styles.input} />
            {!!formError && <Text style={styles.errorText}>{formError}</Text>}
            <Pressable onPress={addAircraft} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Guardar avión</Text></Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL DETALLE DE AERONAVE */}
      <Modal visible={!!selected && !show3D} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}><Text style={styles.modalTitle}>{selected?.registration}</Text><Text style={styles.modalSubtitle}>{selected?.model} · {selected?.hours} horas</Text></View>
                <Pressable onPress={() => setSelected(null)}><Ionicons name="close" size={24} color="#64748B" /></Pressable>
              </View>
              <View style={styles.detailBanner}>
                <Ionicons name="airplane" size={34} color="#FFFFFF" />
                <View style={{ flex: 1 }}><Text style={styles.detailBannerTitle}>Ficha de aeronave</Text><Text style={styles.detailBannerSub}>Estado: {selected?.status}</Text></View>
              </View>
              <Text style={styles.sectionTitle}>Componentes e inspección</Text>
              {selected?.parts.map(part => (
                <View key={part.name} style={styles.partRow}>
                  <View style={[styles.partIcon, { backgroundColor: statusColor(part.status) + '18' }]}><Ionicons name={part.status === 'Correcto' ? 'checkmark-circle-outline' : 'warning-outline'} size={21} color={statusColor(part.status)} /></View>
                  <View style={{ flex: 1 }}><Text style={styles.partName}>{part.name}</Text><Text style={[styles.partStatus, { color: statusColor(part.status) }]}>{part.status}</Text></View>
                  <Pressable onPress={() => { setSelectedPart(part); setShow3D(true); }} style={styles.smallButton}><Text style={styles.smallButtonText}>Ubicar</Text></Pressable>
                </View>
              ))}
              <Pressable onPress={() => { setSelectedPart(selected?.parts[0] || null); setShow3D(true); }} style={styles.primaryButton}>
                <Ionicons name="cube-outline" size={19} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Ver avión en 3D</Text>
              </Pressable>
              <Text style={styles.disclaimer}>Los hallazgos mostrados son datos de ejemplo y no sustituyen una inspección de mantenimiento aeronáutico.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL VISOR 3D */}
      <Modal visible={show3D && !!selected} transparent animationType="slide" onRequestClose={() => setShow3D(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}><Text style={styles.modalTitle}>Vista 3D · {selected?.registration}</Text><Text style={styles.modalSubtitle}>Modelo exterior 3D y detalle de componentes</Text></View>
              <Pressable onPress={() => setShow3D(false)}><Ionicons name="close" size={24} color="#64748B" /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.viewer}>
                <View style={styles.viewerTop}>
                  <Text style={styles.viewerLabel}>MODELO 3D INTERACTIVO</Text>
                  <View style={styles.viewerPill}><View style={styles.viewerDot} /><Text style={styles.viewerPillText}>Gira y acerca libremente</Text></View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <AircraftModel3D height={290} parts={selected?.parts ?? []} />
                </View>
              </View>

              <View style={styles.partsContainer}>
                {selected?.parts.map((part, index) => (
                  <Pressable key={part.name} onPress={() => setSelectedPart(part)} style={[styles.partPick, selectedPart?.name === part.name && styles.partPickActive]}>
                    <View style={[styles.partNumber, { backgroundColor: statusColor(part.status) }]}><Text style={styles.partNumberText}>{index + 1}</Text></View>
                    <View style={{ flex: 1 }}><Text style={styles.partName}>{part.name}</Text><Text style={[styles.partStatus, { color: statusColor(part.status) }]}>{part.status}</Text></View>
                    <Ionicons name="chevron-forward" size={17} color="#64748B" />
                  </Pressable>
                ))}
              </View>

              {selectedPart && (
                <View style={styles.finding}>
                  <Text style={styles.findingTitle}>{selectedPart.name} · {selectedPart.status}</Text>
                  <Text style={styles.findingText}>{selectedPart.note}</Text>
                  <Text style={styles.inputLabel}>Actualizar estado (demo)</Text>
                  <View style={styles.statusChoices}>
                    {(['Correcto', 'Revisar', 'Crítico'] as Part['status'][]).map(status => (
                      <Pressable key={status} onPress={() => updatePartStatus(selectedPart, status)} style={[styles.statusChoice, selectedPart.status === status && { backgroundColor: statusColor(status) + '20', borderColor: statusColor(status) }]}>
                        <Text style={[styles.statusChoiceText, { color: statusColor(status) }]}>{status}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <Text style={styles.disclaimer}>Los estados y observaciones son datos de demostración para gestión de mantenimiento OMA.</Text>
              <Pressable onPress={() => setShow3D(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Volver a la ficha</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7FB' },
  container: { paddingTop: 24, paddingBottom: 36, width: '100%', maxWidth: 1160, alignSelf: 'center' },
  header: { flexDirection: 'column', gap: 16, marginBottom: 22 },
  headerWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, letterSpacing: 1.6, color: '#0284C7', fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, lineHeight: 21, color: '#64748B', marginTop: 6, maxWidth: 660 },
  addButton: { backgroundColor: '#0369A1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start' },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 28 },
  statsWide: { gap: 12 },
  statCard: { minHeight: 112, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 2 },
  statValue: { color: '#0F172A', fontSize: 27, fontWeight: '800', marginTop: 8 },
  statLabel: { color: '#64748B', fontSize: 12, marginTop: 2 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  sectionTitle: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
  sectionHint: { color: '#64748B', fontSize: 12, marginTop: 4 },
  demoTag: { backgroundColor: '#E0F2FE', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  demoTagText: { color: '#075985', fontSize: 10, fontWeight: '800' },
  list: { gap: 12 },
  listWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  aircraftCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  aircraftCardWide: { width: '49.2%', minHeight: 150 },
  planeIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  planeInfo: { flex: 1, minWidth: 0 },
  registration: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  model: { color: '#334155', fontSize: 13, marginTop: 3 },
  meta: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 7 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },
  issueText: { color: '#B45309', fontSize: 10, fontWeight: '700' },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 8, paddingLeft: 2 },
  viewButtonText: { color: '#0369A1', fontSize: 12, fontWeight: '800' },
  note: { marginTop: 22, padding: 13, borderRadius: 12, backgroundColor: '#E0F2FE', flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  noteText: { flex: 1, color: '#075985', fontSize: 11, lineHeight: 17 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  formModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, width: '100%', maxWidth: 480 },
  detailModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '100%', maxWidth: 700, maxHeight: '94%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  modalTitle: { color: '#0F172A', fontSize: 21, fontWeight: '800' },
  modalSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4, lineHeight: 18 },
  inputLabel: { color: '#334155', fontSize: 12, fontWeight: '800', marginTop: 12, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#0F172A', backgroundColor: '#FFFFFF' },
  errorText: { color: '#B91C1C', fontSize: 12, marginTop: 9 },
  primaryButton: { backgroundColor: '#0369A1', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, marginTop: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  detailBanner: { backgroundColor: '#0F2942', borderRadius: 15, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 22 },
  detailBannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  detailBannerSub: { color: '#BAE6FD', fontSize: 12, marginTop: 4 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  partIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  partName: { color: '#1E293B', fontSize: 13, fontWeight: '800' },
  partStatus: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  smallButton: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 9, backgroundColor: '#E0F2FE' },
  smallButtonText: { color: '#075985', fontSize: 11, fontWeight: '800' },
  disclaimer: { color: '#64748B', fontSize: 10, lineHeight: 15, marginTop: 14 },
  viewer: { backgroundColor: '#0F2942', borderRadius: 16, padding: 14, overflow: 'hidden' },
  viewerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  viewerLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  viewerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1E405C', borderRadius: 18, paddingHorizontal: 9, paddingVertical: 6 },
  viewerDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#38BDF8' },
  viewerPillText: { color: '#E0F2FE', fontSize: 9, fontWeight: '700' },
  partsContainer: { marginTop: 12, gap: 6 },
  partPick: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 11, padding: 9, marginBottom: 6 },
  partPickActive: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  partNumber: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  partNumberText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  finding: { marginTop: 12, padding: 13, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  findingTitle: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  findingText: { color: '#475569', fontSize: 12, lineHeight: 18, marginTop: 5 },
  statusChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  statusChoice: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10, marginTop: 3 },
  statusChoiceText: { fontSize: 11, fontWeight: '800' },
  secondaryButton: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 13 },
  secondaryButtonText: { color: '#334155', fontSize: 12, fontWeight: '800' },
});