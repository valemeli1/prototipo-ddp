import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addHistoryRecord, getActiveUser } from '../../services/historyStorage';

type AircraftOption = {
  id: string;
  tail: string;
  model: string;
};

const FLEET_OPTIONS: AircraftOption[] = [
  { id: '1', tail: 'N102-YS', model: 'Boeing 737-800' },
  { id: '2', tail: 'YS-741', model: 'Airbus A320' },
  { id: '3', tail: 'N508-YS', model: 'Embraer 190' },
  { id: '4', tail: 'YS-209', model: 'Boeing 787-9' },
];

type InspectionType = 'PRE_FLIGHT' | 'DAILY_CHECK' | 'POST_FLIGHT';

type ControlStatus = 'SAT' | 'FAIL' | 'NA';

interface ControlPoint {
  id: string;
  ata: string;
  title: string;
  description: string;
  hasMeasurement?: boolean;
  unit?: string;
  placeholder?: string;
}

const CONTROL_POINTS: ControlPoint[] = [
  {
    id: '1',
    ata: 'ATA 32 - Landing Gear',
    title: 'Presión de Neumáticos (Tren Principal)',
    description: 'Verificación visual de desgaste, cortes y presión operativa en PSI.',
    hasMeasurement: true,
    unit: 'PSI',
    placeholder: 'Ej. 205',
  },
  {
    id: '2',
    ata: 'ATA 32 - Landing Gear',
    title: 'Pines de Desgaste de Frenos (Brake Wear Pins)',
    description: 'Inspección del margen de desgaste de paquetes de frenos izq/der.',
    hasMeasurement: true,
    unit: 'mm',
    placeholder: 'Ej. 12.5',
  },
  {
    id: '3',
    ata: 'ATA 29 - Hydraulic Power',
    title: 'Nivel y Presión de Sistemas Hidráulicos (A/B)',
    description: 'Comprobación de acumuladores, fugas en actuadores y nivel de depósito.',
    hasMeasurement: true,
    unit: 'PSI',
    placeholder: 'Ej. 3000',
  },
  {
    id: '4',
    ata: 'ATA 71/79 - Powerplant & Oil',
    title: 'Nivel de Aceite en Motores Principales (ENG 1 / ENG 2)',
    description: 'Verificación de nivel de aceite en visores antes de 30 min de apagado.',
    hasMeasurement: true,
    unit: 'Quarts',
    placeholder: 'Ej. 16.5',
  },
  {
    id: '5',
    ata: 'ATA 28 - Fuel System',
    title: 'Drenaje y Verificación de Tanques de Combustible',
    description: 'Inspección de muestras en sumideros para detectar agua o contaminación.',
  },
  {
    id: '6',
    ata: 'ATA 27 - Flight Controls',
    title: 'Integridad y Libertad de Movimiento de Superficies',
    description: 'Inspección visual de alerones, flaps, spoilers y timón de dirección.',
  },
];

export default function ChecklistScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [selectedAircraft, setSelectedAircraft] = useState<AircraftOption>(FLEET_OPTIONS[0]);
  const [inspectionType, setInspectionType] = useState<InspectionType>('DAILY_CHECK');
  const [stationCode, setStationCode] = useState('MSLP / SAL');
  const [toolCalibNumber, setToolCalibNumber] = useState('TL-MAN-2026-884');

  const [statuses, setStatuses] = useState<Record<string, ControlStatus>>({});
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [isMelDeferred, setIsMelDeferred] = useState(false);

  const [isAircraftModalOpen, setIsAircraftModalOpen] = useState(false);

  const activeUser = getActiveUser();

  const handleSetStatus = (id: string, status: ControlStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const handleSetMeasurement = (id: string, val: string) => {
    setMeasurements(prev => ({ ...prev, [id]: val }));
  };

  const totalPoints = CONTROL_POINTS.length;
  const evaluatedCount = Object.keys(statuses).length;
  const failCount = Object.values(statuses).filter(s => s === 'FAIL').length;
  const isFormComplete = evaluatedCount === totalPoints;

  const handleValidateAndSign = () => {
    if (!isFormComplete) {
      const msg = `Por favor evalúa todos los puntos de control (${evaluatedCount}/${totalPoints} evaluados).`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Inspección Incompleta', msg);
      return;
    }

    if (failCount > 0 && !discrepancyNotes.trim()) {
      const msg = 'Se han detectado fallos (FAIL). Debes redactar el reporte de la novedad técnica.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Novedad no documentada', msg);
      return;
    }

    const now = new Date();
    const utcTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`;
    
    const inspectorName = activeUser
      ? `${activeUser.name} (${activeUser.license})`
      : 'Técnico TMA (Valeria Hernández - TMA #402)';

    let statusText = 'Aprobado y Transmitido';
    if (failCount > 0) {
      statusText = isMelDeferred ? 'Diferido bajo MEL' : 'AOG / Inoperativo';
    }

    let inspectionTypeName = 'Rutina Diaria (Daily Check)';
    if (inspectionType === 'PRE_FLIGHT') inspectionTypeName = 'Pre-Vuelo (PFC)';
    if (inspectionType === 'POST_FLIGHT') inspectionTypeName = 'Post-Vuelo (Transit Check)';

    let summaryNotes = `[${inspectionTypeName} - Estación: ${stationCode} - ${utcTime}]\n`;
    summaryNotes += `Herramienta Calibrada: ${toolCalibNumber}\n`;

    CONTROL_POINTS.forEach(item => {
      const st = statuses[item.id] || 'N/A';
      const meas = measurements[item.id] ? ` [Lectura: ${measurements[item.id]} ${item.unit || ''}]` : '';
      summaryNotes += `• ${item.title}: ${st}${meas}\n`;
    });

    if (failCount > 0) {
      summaryNotes += `\n⚠️ NOVEDAD REGISTRADA: ${discrepancyNotes.trim()}`;
      if (isMelDeferred) summaryNotes += ' (Diferido bajo procedimiento MEL)';
    }

    addHistoryRecord({
      registration: selectedAircraft.tail,
      model: selectedAircraft.model,
      status: statusText,
      inspector: inspectorName,
      tasksCompleted: `${evaluatedCount - failCount}/${totalPoints} SAT (${failCount} FAIL)`,
      notes: summaryNotes,
    });

    const successMsg = `Inspección de ${selectedAircraft.tail} firmada e incorporada a la bitácora técnica con éxito.`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Inspección Registrada', successMsg);

    // Reiniciar formulario
    setStatuses({});
    setMeasurements({});
    setDiscrepancyNotes('');
    setIsMelDeferred(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: isMobile ? 12 : 24 }]}>
      {/* CABECERA */}
      <View style={styles.headerBox}>
        <Text style={styles.eyebrow}>SISTEMA DE MANTENIMIENTO RAC-145 / EASA</Text>
        <Text style={styles.title}>Inspección y Lista de Verificación</Text>
        <Text style={styles.subtitle}>
          Formulario de control técnico oficial con trazabilidad de mediciones y firma TMA.
        </Text>
      </View>

      {/* SELECCIÓN DE AERONAVE Y TIPO DE INSPECCIÓN */}
      <View style={styles.topCard}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardEyebrow}>AERONAVE SELECCIONADA</Text>

            <View style={styles.aircraftContentRow}>
              <Text style={styles.aircraftTail}>{selectedAircraft.tail}</Text>
              <Text style={styles.aircraftModel}>({selectedAircraft.model})</Text>

              <Pressable style={styles.changeBtn} onPress={() => setIsAircraftModalOpen(true)}>
                <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
                <Text style={styles.changeBtnText}>Cambiar</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* SELECTOR DE TIPO DE INSPECCIÓN */}
        <Text style={styles.inputLabel}>Tipo de Inspección:</Text>
        <View style={styles.inspectionTypeRow}>
          <Pressable
            style={[styles.typeChip, inspectionType === 'PRE_FLIGHT' && styles.typeChipActive]}
            onPress={() => setInspectionType('PRE_FLIGHT')}
          >
            <Text style={[styles.typeChipText, inspectionType === 'PRE_FLIGHT' && styles.typeChipTextActive]}>
              Pre-Vuelo (PFC)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.typeChip, inspectionType === 'DAILY_CHECK' && styles.typeChipActive]}
            onPress={() => setInspectionType('DAILY_CHECK')}
          >
            <Text style={[styles.typeChipText, inspectionType === 'DAILY_CHECK' && styles.typeChipTextActive]}>
              Rutina Diaria
            </Text>
          </Pressable>

          <Pressable
            style={[styles.typeChip, inspectionType === 'POST_FLIGHT' && styles.typeChipActive]}
            onPress={() => setInspectionType('POST_FLIGHT')}
          >
            <Text style={[styles.typeChipText, inspectionType === 'POST_FLIGHT' && styles.typeChipTextActive]}>
              Post-Vuelo
            </Text>
          </Pressable>
        </View>

        {/* DATOS DE AUDITORÍA Y HERRAMIENTA */}
        <View style={[styles.gridRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Estación / Base ICAO:</Text>
            <TextInput
              style={styles.textInputSmall}
              value={stationCode}
              onChangeText={setStationCode}
              placeholder="Ej. MSLP / SAL"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>S/N Herramienta Calibrada:</Text>
            <TextInput
              style={styles.textInputSmall}
              value={toolCalibNumber}
              onChangeText={setToolCalibNumber}
              placeholder="Ej. TL-MAN-884"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Puntos de Control por Capítulos ATA Spec 100</Text>

      {/* LISTA DE PUNTOS DE CONTROL */}
      {CONTROL_POINTS.map(item => {
        const currentStatus = statuses[item.id];
        return (
          <View key={item.id} style={[styles.controlCard, currentStatus === 'FAIL' && styles.controlCardFail]}>
            <View style={styles.controlCardHeader}>
              <Text style={styles.ataTag}>{item.ata}</Text>
              <Text style={styles.controlTitle}>{item.title}</Text>
              <Text style={styles.controlDesc}>{item.description}</Text>
            </View>

            {/* BOTONES DE EVALUACIÓN SAT / FAIL / NA */}
            <View style={styles.evalRow}>
              <Pressable
                style={[styles.evalBtn, currentStatus === 'SAT' && styles.evalBtnSat]}
                onPress={() => handleSetStatus(item.id, 'SAT')}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={currentStatus === 'SAT' ? '#FFFFFF' : '#059669'}
                />
                <Text style={[styles.evalBtnText, currentStatus === 'SAT' && styles.evalBtnTextActive]}>
                  SAT (Conforme)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.evalBtn, currentStatus === 'FAIL' && styles.evalBtnFail]}
                onPress={() => handleSetStatus(item.id, 'FAIL')}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={currentStatus === 'FAIL' ? '#FFFFFF' : '#DC2626'}
                />
                <Text style={[styles.evalBtnText, currentStatus === 'FAIL' && styles.evalBtnTextActive]}>
                  FAIL (Novedad)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.evalBtn, currentStatus === 'NA' && styles.evalBtnNa]}
                onPress={() => handleSetStatus(item.id, 'NA')}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={16}
                  color={currentStatus === 'NA' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.evalBtnText, currentStatus === 'NA' && styles.evalBtnTextActive]}>
                  N/A
                </Text>
              </Pressable>
            </View>

            {/* CAMPO DE MEDICIÓN CUANTITATIVA */}
            {item.hasMeasurement && (
              <View style={styles.measurementBox}>
                <Ionicons name="speedometer-outline" size={16} color="#0284C7" />
                <Text style={styles.measurementLabel}>Lectura Numérica ({item.unit}):</Text>
                <TextInput
                  style={styles.measurementInput}
                  placeholder={item.placeholder}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={measurements[item.id] || ''}
                  onChangeText={val => handleSetMeasurement(item.id, val)}
                />
              </View>
            )}
          </View>
        );
      })}

      {/* SECCIÓN DE DOCUMENTACIÓN DE NOVEDAD SI HAY FALLAS */}
      {failCount > 0 && (
        <View style={styles.discrepancyCard}>
          <View style={styles.discrepancyHeader}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.discrepancyTitle}>Reporte de Novedad Técnica ({failCount} FAIL)</Text>
          </View>

          <Text style={styles.inputLabel}>Observaciones y Acción Correctiva / Código de Falla:</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe el fallo detectado (ej. Presión de neumático bajo tolerancia en 160 PSI. Se detecta pequeña fuga en válvula...)"
            placeholderTextColor="#94A3B8"
            value={discrepancyNotes}
            onChangeText={setDiscrepancyNotes}
          />

          <Pressable
            style={styles.melToggleRow}
            onPress={() => setIsMelDeferred(!isMelDeferred)}
          >
            <View style={[styles.melCheckbox, isMelDeferred && styles.melCheckboxActive]}>
              {isMelDeferred && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.melTitle}>Diferir Novedad bajo Lista de Equipamiento Mínimo (MEL)</Text>
              <Text style={styles.melSubtitle}>Permite el vuelo con restricciones operativas (Categoría A/B/C/D).</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* BOTÓN DE FIRMA Y TRANSMISIÓN */}
      <Pressable
        style={[styles.submitBtn, !isFormComplete && styles.submitBtnDisabled]}
        onPress={handleValidateAndSign}
      >
        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>Validar, Firmar y Transmitir Bitácora</Text>
      </Pressable>

      {/* MODAL DE SELECCIÓN DE AERONAVE */}
      <Modal
        visible={isAircraftModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAircraftModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Aeronave</Text>
              <Pressable onPress={() => setIsAircraftModalOpen(false)}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </Pressable>
            </View>

            {FLEET_OPTIONS.map(ac => (
              <Pressable
                key={ac.id}
                style={[
                  styles.optionRow,
                  selectedAircraft.id === ac.id && styles.optionRowSelected,
                ]}
                onPress={() => {
                  setSelectedAircraft(ac);
                  setIsAircraftModalOpen(false);
                }}
              >
                <Ionicons
                  name="airplane-outline"
                  size={18}
                  color={selectedAircraft.id === ac.id ? '#0284C7' : '#64748B'}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={[
                      styles.optionTail,
                      selectedAircraft.id === ac.id && styles.optionTailSelected,
                    ]}
                  >
                    {ac.tail}
                  </Text>
                  <Text style={styles.optionModel}>{ac.model}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', maxWidth: 900, alignSelf: 'center', width: '100%' },
  headerBox: { backgroundColor: '#0F172A', padding: 16, borderRadius: 14, marginBottom: 16 },
  eyebrow: { fontSize: 9, fontWeight: '800', color: '#0284C7', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  topCard: { backgroundColor: '#0F172A', borderRadius: 14, padding: 16, marginBottom: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardEyebrow: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 4 },
  aircraftContentRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  aircraftTail: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  aircraftModel: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0284C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  changeBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  inputLabel: { fontSize: 11, fontWeight: '700', color: '#CBD5E1', marginBottom: 4, marginTop: 4 },
  inspectionTypeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeChip: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  typeChipActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  typeChipText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  typeChipTextActive: { color: '#FFFFFF' },

  gridRow: { flexDirection: 'row', gap: 10 },
  textInputSmall: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: '#FFFFFF', fontSize: 12 },

  sectionHeading: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 },

  controlCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  controlCardFail: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  controlCardHeader: { marginBottom: 10 },
  ataTag: { fontSize: 9, fontWeight: '800', color: '#0284C7', marginBottom: 2 },
  controlTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  controlDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },

  evalRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  evalBtn: { flex: 1, minWidth: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  evalBtnSat: { backgroundColor: '#059669', borderColor: '#059669' },
  evalBtnFail: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  evalBtnNa: { backgroundColor: '#64748B', borderColor: '#64748B' },
  evalBtnText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  evalBtnTextActive: { color: '#FFFFFF' },

  measurementBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: '#F0F9FF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BAE6FD' },
  measurementLabel: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  measurementInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#7DD3FC', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, color: '#0F172A', width: 90, textAlign: 'center', fontWeight: 'bold' },

  discrepancyCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, padding: 14, marginBottom: 16 },
  discrepancyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  discrepancyTitle: { fontSize: 13, fontWeight: '800', color: '#991B1B' },
  textArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, padding: 10, fontSize: 12, color: '#0F172A', textAlignVertical: 'top', minHeight: 70 },

  melToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },
  melCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#D97706', justifyContent: 'center', alignItems: 'center' },
  melCheckboxActive: { backgroundColor: '#D97706' },
  melTitle: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  melSubtitle: { fontSize: 10, color: '#B45309' },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0284C7', paddingVertical: 14, borderRadius: 12, marginTop: 8, marginBottom: 24 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 18, width: '100%', maxWidth: 380, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  optionRowSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  optionTail: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  optionTailSelected: { color: '#0284C7' },
  optionModel: { fontSize: 10, color: '#64748B' },
});