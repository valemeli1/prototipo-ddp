import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

export default function ChecklistScreen() {
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
    Alert.alert(
      'Firma Electrónica TMA',
      `Progreso: ${completedCount}/${tasks.length}. ¿Desea transmitir el reporte de inspección al departamento de Control de Calidad?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Firmar y Enviar', onPress: () => Alert.alert('Éxito', 'Reporte registrado bajo normativas RAC.') }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerAircraft}>Aeronave Seleccionada: N102-YS</Text>
        <Text style={styles.headerSub}>Inspección Pre-Vuelo / Rutina Diaria</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 12, marginBottom: 20 },
  headerAircraft: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  taskText: { marginLeft: 14, fontSize: 15, color: '#334155', flex: 1 },
  taskCompletedText: { textDecorationLine: 'line-through', color: '#94A3B8' },
  submitButton: { flexDirection: 'row', backgroundColor: '#0284C7', padding: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});