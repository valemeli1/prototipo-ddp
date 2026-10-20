import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addHistoryRecord, getActiveUser } from '../../services/historyStorage';

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

const FLEET_AIRCRAFT = [
  { registration: 'N102-YS', model: 'Boeing 737-800', type: 'Pre-Vuelo / Rutina Diaria' },
  { registration: 'YS-741', model: 'Airbus A320', type: 'Inspección AOG / Térmica' },
  { registration: 'YS-302', model: 'Embraer E190', type: 'Mantenimiento Preventivo 35h' },
];

export default function ChecklistScreen() {
  const [selectedAircraft, setSelectedAircraft] = useState(FLEET_AIRCRAFT[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastSavedFolio, setLastSavedFolio] = useState('');

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', label: 'Verificación de presión y estado de neumáticos del tren principal', completed: false },
    { id: '2', label: 'Inspección visual de fugas en actuadores hidráulicos', completed: false },
    { id: '3', label: 'Comprobación de niveles de aceite en motores principales', completed: false },
    { id: '4', label: 'Verificación de integridad estructural en revestimiento de alas', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSignAndSubmit = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    const activeUser = getActiveUser();
    const inspectorName = `${activeUser.name} (${activeUser.license})`;
    
    const newRecord = addHistoryRecord({
      registration: selectedAircraft.registration,
      model: selectedAircraft.model,
      status: completedCount === tasks.length ? 'Aprobado y Transmitido' : 'Pendiente / Observaciones',
      inspector: inspectorName,
      tasksCompleted: `${completedCount}/${tasks.length} Puntos verificados`,
      notes: `Inspección realizada sobre ${selectedAircraft.type}. ${completedCount} de ${tasks.length} tareas validadas.`,
    });

    setLastSavedFolio(newRecord.id);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    setTasks(tasks.map(t => ({ ...t, completed: false })));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerLabel}>Aeronave Activa:</Text>
            <Text style={styles.headerAircraft}>{selectedAircraft.registration} ({selectedAircraft.model})</Text>
            <Text style={styles.headerSub}>{selectedAircraft.type}</Text>
          </View>
          <Pressable style={styles.changePlaneBtn} onPress={() => setIsSelectorOpen(true)}>
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.changePlaneText}>Cambiar</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>Puntos de Control Obligatorios</Text>

      {tasks.map(task => (
        <TouchableOpacity 
          key={task.id} 
          style={styles.taskCard} 
          onPress={() => toggleTask(task.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={task.completed ? "checkbox" : "square-outline"} 
            size={24} 
            color={task.completed ? "#0284C7" : "#94A3B8"} 
          />
          <Text style={[styles.taskText, task.completed && styles.taskCompletedText]}>
            {task.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSignAndSubmit}>
        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
        <Text style={styles.submitButtonText}>Validar y Firmar Inspección</Text>
      </TouchableOpacity>

      <Modal visible={isSelectorOpen} transparent animationType="fade" onRequestClose={() => setIsSelectorOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Aeronave</Text>
              <Pressable onPress={() => setIsSelectorOpen(false)}>
                <Ionicons name="close" size={20} color="#1E293B" />
              </Pressable>
            </View>

            {FLEET_AIRCRAFT.map((plane, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.planeOption,
                  selectedAircraft.registration === plane.registration && styles.planeOptionSelected
                ]}
                onPress={() => {
                  setSelectedAircraft(plane);
                  setIsSelectorOpen(false);
                }}
              >
                <Ionicons name="airplane" size={18} color="#0284C7" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.planeOptionReg}>{plane.registration}</Text>
                  <Text style={styles.planeOptionModel}>{plane.model}</Text>
                </View>
                {selectedAircraft.registration === plane.registration && (
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={isSuccessModalOpen} transparent animationType="fade" onRequestClose={handleCloseSuccess}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={48} color="#059669" />
              <Text style={[styles.modalTitle, { marginTop: 10, textAlign: 'center' }]}>Firma Registrada y Guardada</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 16 }}>
              Folio Asignado: <Text style={{ fontWeight: 'bold', color: '#0284C7' }}>{lastSavedFolio}</Text>{'\n'}
              Aeronave: <Text style={{ fontWeight: 'bold' }}>{selectedAircraft.registration}</Text>{'\n'}
              Progreso: <Text style={{ fontWeight: 'bold' }}>{completedCount} de {tasks.length} puntos</Text>{'\n\n'}
              El reporte se ha guardado en el Historial vinculado a tu cuenta.
            </Text>
            <Pressable style={[styles.submitButton, { marginTop: 0 }]} onPress={handleCloseSuccess}>
              <Text style={styles.submitButtonText}>Aceptar y Limpiar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 14, marginBottom: 20 },
  headerLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  headerAircraft: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  headerSub: { color: '#38BDF8', fontSize: 12, marginTop: 4, fontWeight: '600' },
  changePlaneBtn: { backgroundColor: '#0284C7', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  changePlaneText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  taskText: { marginLeft: 14, fontSize: 15, color: '#334155', flex: 1 },
  taskCompletedText: { textDecorationLine: 'line-through', color: '#94A3B8' },
  submitButton: { flexDirection: 'row', backgroundColor: '#0284C7', padding: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  planeOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8, backgroundColor: '#F8FAFC' },
  planeOptionSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  planeOptionReg: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  planeOptionModel: { fontSize: 11, color: '#64748B' },
});