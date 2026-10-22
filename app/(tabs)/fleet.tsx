import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AircraftModel3D from '../../components/AircraftModel3D';
import Part2DDiagram from '../../components/Part2DDiagram';
import {
  getStoredFleet,
  saveStoredFleet,
  Aircraft,
  Part,
  AircraftStatus,
} from '../../services/fleetStorage';

const detailedParts: Part[] = [
  { name: 'Motor izquierdo', status: 'Correcto', note: 'Inspección de boroscopia conforme a manual AMM.' },
  { name: 'Motor derecho', status: 'Correcto', note: 'Prueba de parámetros e indicadores dentro de norma.' },
  { name: 'Ala izquierda', status: 'Correcto', note: 'Superficie limpia, sin deformación ni fugas de combustible.' },
  { name: 'Ala derecha', status: 'Correcto', note: 'Estructura y remaches revisados.' },
  { name: 'Fuselaje', status: 'Correcto', note: 'Presurización probada sin pérdida de carga.' },
  { name: 'Cabina y parabrisas', status: 'Correcto', note: 'Vidrios y sellos anti-hielo verificados.' },
  { name: 'Tren de aterrizaje', status: 'Correcto', note: 'Líneas hidráulicas y sensores de posición comprobados.' },
  { name: 'Flaps y slats', status: 'Correcto', note: 'Actuadores probados en rango completo de extensión.' },
  { name: 'Timón de dirección', status: 'Correcto', note: 'Centrado y tensión de cables verificados.' },
  { name: 'Sistema hidráulico', status: 'Correcto', note: 'Presión constante a 3000 PSI.' },
  { name: 'Sistema eléctrico', status: 'Correcto', note: 'Baterías y generadores de IDG comprobados.' },
  { name: 'Aviónica', status: 'Correcto', note: 'Sistemas FMS y radar meteorológico sin fallos.' },
];

const statusColor = (status: Part['status'] | Aircraft['status']) =>
  status === 'Crítico' || status === 'AOG'
    ? '#DC2626'
    : status === 'Revisar' || status === 'En mantenimiento'
    ? '#D97706'
    : '#059669';

export default function FleetScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [selected, setSelected] = useState<Aircraft | null>(null);

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | AircraftStatus>('TODOS');

  // Modales
  const [showAdd, setShowAdd] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [selected2DPart, setSelected2DPart] = useState<Part | null>(null);

  // Formulario Nuevo Avión
  const [registration, setRegistration] = useState('');
  const [model, setModel] = useState('');
  const [hours, setHours] = useState('');
  const [formError, setFormError] = useState('');

  // Cargar datos almacenados localmente al iniciar la pantalla
  useEffect(() => {
    getStoredFleet().then((data) => {
      setAircraft(data);
    });
  }, []);

  // Cálculo de totales
  const totals = useMemo(
    () => ({
      total: aircraft.length,
      operational: aircraft.filter((a) => a.status === 'Operativo').length,
      maintenance: aircraft.filter((a) => a.status === 'En mantenimiento').length,
      aog: aircraft.filter((a) => a.status === 'AOG').length,
      healthRatio: Math.round(
        (aircraft.filter((a) => a.status === 'Operativo').length / (aircraft.length || 1)) * 100
      ),
    }),
    [aircraft]
  );

  // Lista Filtrada
  const filteredAircraft = useMemo(() => {
    return aircraft.filter((plane) => {
      const matchesSearch =
        plane.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plane.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = statusFilter === 'TODOS' || plane.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [aircraft, searchQuery, statusFilter]);

  const openDetails = (plane: Aircraft) => {
    setSelected(plane);
    setSelected2DPart(null);
    setShow3D(false);
  };

  const addAircraft = async () => {
    if (!registration.trim() || !model.trim()) {
      setFormError('Escribe la matrícula y el modelo de la aeronave.');
      return;
    }
    if (
      aircraft.some(
        (a) => a.registration.toLowerCase() === registration.trim().toLowerCase()
      )
    ) {
      setFormError('Ya existe una aeronave con esa matrícula.');
      return;
    }
    const newPlane: Aircraft = {
      id: String(Date.now()),
      registration: registration.trim().toUpperCase(),
      model: model.trim(),
      hours: hours.trim() || '0',
      maxHours: 5000,
      status: 'Operativo',
      nextReview: 'Por programar',
      parts: detailedParts.map((p) => ({ ...p })),
    };

    const updatedList = [newPlane, ...aircraft];
    setAircraft(updatedList);
    await saveStoredFleet(updatedList);

    setRegistration('');
    setModel('');
    setHours('');
    setFormError('');
    setShowAdd(false);
  };

  const updateAircraftStatus = async (newStatus: AircraftStatus) => {
    if (!selected) return;
    const updated = { ...selected, status: newStatus };
    const updatedList = aircraft.map((a) => (a.id === selected.id ? updated : a));
    setAircraft(updatedList);
    setSelected(updated);
    await saveStoredFleet(updatedList);
  };

  const updatePartStatus = async (part: Part, next: Part['status']) => {
    if (!selected) return;
    const updatedParts = selected.parts.map((p) =>
      p.name === part.name ? { ...p, status: next } : p
    );
    const updatedPlane = { ...selected, parts: updatedParts };
    const updatedList = aircraft.map((a) => (a.id === selected.id ? updatedPlane : a));

    setAircraft(updatedList);
    setSelected(updatedPlane);
    setSelected2DPart(updatedParts.find((p) => p.name === part.name) || null);
    await saveStoredFleet(updatedList);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingHorizontal: wide ? 28 : 14 }]}
    >
      {/* CABECERA Y ACCIONES */}
      <View style={[styles.header, wide && styles.headerWide]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>SISTEMA DE GESTIÓN OMA / RAC-145</Text>
          <Text style={styles.title}>Panel de Salud de Flota</Text>
          <Text style={styles.subtitle}>
            Supervisión de disponibilidades, ciclos de mantenimiento e inspección 3D.
          </Text>
        </View>
        <Pressable onPress={() => setShowAdd(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar Aeronave</Text>
        </Pressable>
      </View>

      {/* METRICAS PRINCIPALES CON SALUD GLOBAL */}
      <View style={[styles.stats, wide && styles.statsWide]}>
        <View style={[styles.statCard, { width: wide ? '18%' : '48%' }]}>
          <Text style={styles.statLabel}>Flota Total</Text>
          <Text style={styles.statValue}>{totals.total}</Text>
          <Text style={styles.statDetail}>Aeronaves registradas</Text>
        </View>

        <View style={[styles.statCard, { width: wide ? '18%' : '48%' }]}>
          <Text style={styles.statLabel}>Operativas</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{totals.operational}</Text>
          <Text style={styles.statDetail}>Listas para vuelo</Text>
        </View>

        <View style={[styles.statCard, { width: wide ? '18%' : '48%' }]}>
          <Text style={styles.statLabel}>En Mantenimiento</Text>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{totals.maintenance}</Text>
          <Text style={styles.statDetail}>En taller / revisión</Text>
        </View>

        <View style={[styles.statCard, { width: wide ? '18%' : '48%' }]}>
          <Text style={styles.statLabel}>AOG Crítico</Text>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>{totals.aog}</Text>
          <Text style={styles.statDetail}>Inmovilizadas</Text>
        </View>

        <View style={[styles.statCard, styles.healthCard, { width: wide ? '22%' : '100%' }]}>
          <Text style={styles.healthLabel}>Disponibilidad Operativa</Text>
          <Text style={styles.healthValue}>{totals.healthRatio}%</Text>
          <View style={styles.healthTrack}>
            <View style={[styles.healthBar, { width: `${totals.healthRatio}%` }]} />
          </View>
        </View>
      </View>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por matrícula o modelo..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {(['TODOS', 'Operativo', 'En mantenimiento', 'AOG'] as const).map((st) => (
            <Pressable
              key={st}
              style={[styles.chip, statusFilter === st && styles.chipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>
                {st}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* LISTADO DE AERONAVES CON BARRAS DE HORAS Y ESTADO */}
      <View style={[styles.list, wide && styles.listWide]}>
        {filteredAircraft.map((plane) => {
          const issues = plane.parts.filter((p) => p.status !== 'Correcto').length;
          const hoursNum = parseInt(plane.hours.replace(/,/g, ''), 10) || 0;
          const cyclePercent = Math.min(Math.round((hoursNum / plane.maxHours) * 100), 100);

          return (
            <View key={plane.id} style={[styles.aircraftCard, wide && styles.aircraftCardWide]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.planeIcon}>
                  <Ionicons name="airplane" size={22} color="#0284C7" />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.registration}>{plane.registration}</Text>
                  <Text style={styles.model}>{plane.model}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor(plane.status) + '18' },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: statusColor(plane.status) }]} />
                  <Text style={[styles.statusText, { color: statusColor(plane.status) }]}>
                    {plane.status}
                  </Text>
                </View>
              </View>

              {/* BARRA DE HORAS DE VUELO / CICLO C */}
              <View style={styles.cycleBox}>
                <View style={styles.cycleTop}>
                  <Text style={styles.cycleLabel}>
                    Horas acumuladas:{' '}
                    <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                      {plane.hours} h
                    </Text>
                  </Text>
                  <Text style={styles.cycleLabel}>{cyclePercent}% de ciclo</Text>
                </View>
                <View style={styles.cycleTrack}>
                  <View
                    style={[
                      styles.cycleBar,
                      {
                        width: `${cyclePercent}%`,
                        backgroundColor: cyclePercent > 85 ? '#DC2626' : '#0284C7',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.meta}>
                  Próxima revisión:{' '}
                  <Text style={{ fontWeight: '700', color: '#334155' }}>
                    {plane.nextReview}
                  </Text>
                </Text>
              </View>

              <View style={styles.cardFooter}>
                {issues > 0 ? (
                  <View style={styles.issueTag}>
                    <Ionicons name="warning-outline" size={13} color="#D97706" />
                    <Text style={styles.issueText}>{issues} novedad(es)</Text>
                  </View>
                ) : (
                  <View style={styles.okTag}>
                    <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
                    <Text style={styles.okText}>Sistemas OK</Text>
                  </View>
                )}

                <Pressable onPress={() => openDetails(plane)} style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>Ficha y Partes</Text>
                  <Ionicons name="chevron-forward" size={15} color="#0284C7" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* MODAL CREAR AERONAVE */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.formModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Agregar Aeronave</Text>
                <Text style={styles.modalSubtitle}>Incorpora una nueva unidad a la flota OMA.</Text>
              </View>
              <Pressable onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Matrícula *</Text>
            <TextInput
              value={registration}
              onChangeText={setRegistration}
              placeholder="Ej. YS-815"
              autoCapitalize="characters"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Modelo *</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="Ej. Airbus A320"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Horas Acumuladas</Text>
            <TextInput
              value={hours}
              onChangeText={setHours}
              placeholder="Ej. 1200"
              keyboardType="numeric"
              style={styles.input}
            />

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <Pressable onPress={addAircraft} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Guardar Aeronave</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL FICHA TÉCNICA Y LISTA DE COMPONENTES */}
      <Modal
        visible={!!selected && !selected2DPart}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selected?.registration}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selected?.model} · {selected?.hours} h de vuelo
                  </Text>
                </View>
                <Pressable onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>

              {/* CONTROL DE ESTADO GENERAL */}
              <View style={styles.statusControlCard}>
                <Text style={styles.statusControlLabel}>Cambiar Estatus Operativo:</Text>
                <View style={styles.statusChoiceRow}>
                  {(['Operativo', 'En mantenimiento', 'AOG'] as AircraftStatus[]).map((st) => (
                    <Pressable
                      key={st}
                      style={[
                        styles.statusChoiceChip,
                        selected?.status === st && {
                          backgroundColor: statusColor(st),
                          borderColor: statusColor(st),
                        },
                      ]}
                      onPress={() => updateAircraftStatus(st)}
                    >
                      <Text
                        style={[
                          styles.statusChoiceChipText,
                          selected?.status === st && { color: '#FFFFFF' },
                        ]}
                      >
                        {st}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                Componentes e Inspecciones
              </Text>
              {selected?.parts.map((part) => (
                <View key={part.name} style={styles.partRow}>
                  <View
                    style={[
                      styles.partIcon,
                      { backgroundColor: statusColor(part.status) + '18' },
                    ]}
                  >
                    <Ionicons
                      name={
                        part.status === 'Correcto'
                          ? 'checkmark-circle-outline'
                          : 'warning-outline'
                      }
                      size={20}
                      color={statusColor(part.status)}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.partName}>{part.name}</Text>
                    <Text style={[styles.partStatus, { color: statusColor(part.status) }]}>
                      {part.status}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelected2DPart(part)} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>Ver en 2D</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable onPress={() => setShow3D(true)} style={styles.primaryButton}>
                <Ionicons name="cube-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Abrir Inspección 3D Interactiva</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA EL MODELO 2D INDEPENDIENTE DE CADA PARTE */}
      <Modal
        visible={!!selected2DPart}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected2DPart(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.formModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selected2DPart?.name}</Text>
                <Text style={styles.modalSubtitle}>Matrícula: {selected?.registration}</Text>
              </View>
              <Pressable onPress={() => setSelected2DPart(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {selected2DPart && (
              <Part2DDiagram
                partName={selected2DPart.name}
                status={selected2DPart.status}
                height={200}
              />
            )}

            {selected2DPart && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.statusControlLabel}>Nota Técnica:</Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#475569',
                    backgroundColor: '#F8FAFC',
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  {selected2DPart.note}
                </Text>

                <Text style={[styles.statusControlLabel, { marginTop: 10 }]}>
                  Actualizar condición:
                </Text>
                <View style={styles.statusChoiceRow}>
                  {(['Correcto', 'Revisar', 'Crítico'] as Part['status'][]).map((st) => (
                    <Pressable
                      key={st}
                      onPress={() => updatePartStatus(selected2DPart, st)}
                      style={[
                        styles.statusChoiceChip,
                        selected2DPart.status === st && {
                          backgroundColor: statusColor(st),
                          borderColor: statusColor(st),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChoiceChipText,
                          selected2DPart.status === st && { color: '#FFFFFF' },
                        ]}
                      >
                        {st}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Pressable onPress={() => setSelected2DPart(null)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Volver a Componentes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL VISTA 3D COMPLETA DE LA AERONAVE */}
      <Modal
        visible={show3D && !!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setShow3D(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  Visor 3D Completo · {selected?.registration}
                </Text>
                <Text style={styles.modalSubtitle}>Modelo 3D global de la aeronave</Text>
              </View>
              <Pressable onPress={() => setShow3D(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.viewer}>
              <AircraftModel3D height={300} parts={selected?.parts ?? []} />
            </View>

            <Pressable onPress={() => setShow3D(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cerrar Visor 3D</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingTop: 20, paddingBottom: 36, width: '100%', maxWidth: 1100, alignSelf: 'center' },
  header: { flexDirection: 'column', gap: 12, marginBottom: 16 },
  headerWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 9, letterSpacing: 1.4, color: '#0284C7', fontWeight: '800', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: { backgroundColor: '#0284C7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 16 },
  statsWide: { flexWrap: 'nowrap' },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { color: '#0F172A', fontSize: 22, fontWeight: '800', marginTop: 4 },
  statDetail: { color: '#94A3B8', fontSize: 9, marginTop: 2 },

  healthCard: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  healthLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800' },
  healthValue: { color: '#38BDF8', fontSize: 22, fontWeight: '800', marginTop: 2 },
  healthTrack: { height: 6, backgroundColor: '#1E293B', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  healthBar: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 },

  filterSection: { marginBottom: 16, gap: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 12, color: '#0F172A' },
  chipScroll: { gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#0284C7' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },

  list: { gap: 12 },
  listWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  aircraftCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  aircraftCardWide: { width: '49%' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planeIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  registration: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  model: { fontSize: 11, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },

  cycleBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  cycleTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cycleLabel: { fontSize: 10, color: '#64748B' },
  cycleTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  cycleBar: { height: '100%', borderRadius: 3 },
  meta: { fontSize: 10, color: '#64748B' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  issueTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  issueText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  okTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  okText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewButtonText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  formModal: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, width: '100%', maxWidth: 420 },
  detailModal: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, width: '100%', maxWidth: 650, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },

  statusControlCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  statusControlLabel: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 6 },
  statusChoiceRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusChoiceChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  statusChoiceChipText: { fontSize: 10, fontWeight: '700', color: '#334155' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  partRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  partIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  partName: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  partStatus: { fontSize: 10, fontWeight: '600' },
  smallButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E0F2FE' },
  smallButtonText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },

  inputLabel: { fontSize: 11, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: '#0F172A', backgroundColor: '#F8FAFC' },
  errorText: { color: '#DC2626', fontSize: 11, marginTop: 6 },
  primaryButton: { backgroundColor: '#0284C7', borderRadius: 10, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  viewer: { backgroundColor: '#0F172A', borderRadius: 14, padding: 10, marginBottom: 10 },
  secondaryButton: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  secondaryButtonText: { fontSize: 12, fontWeight: '700', color: '#334155' },
});