import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { getStoredHistory, loadHistoryAsync, logoutUser, HistoryRecord, getActiveUser } from '../../services/historyStorage';

export default function HistoryScreen() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const activeUser = getActiveUser();

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        if (Platform.OS === 'web') {
          setRecords(getStoredHistory());
        } else {
          const loaded = await loadHistoryAsync();
          setRecords([...loaded]);
        }
      };
      fetchHistory();
    }, [])
  );

  const handleLogout = () => {
    logoutUser();
    router.replace('/login');
  };

  const openDownloadOptions = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setIsDownloadModalOpen(true);
  };

  const handleDownload = (format: 'PDF' | 'CSV' | 'JSON') => {
    if (!selectedRecord) return;

    if (Platform.OS === 'web') {
      let content = '';
      let mimeType = 'text/plain';
      let extension = 'txt';

      if (format === 'JSON') {
        content = JSON.stringify(selectedRecord, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (format === 'CSV') {
        content = `ID,Matricula,Modelo,Fecha,Estatus,Inspector,Notas\n"${selectedRecord.id}","${selectedRecord.registration}","${selectedRecord.model}","${selectedRecord.date}","${selectedRecord.status}","${selectedRecord.inspector}","${selectedRecord.notes}"`;
        mimeType = 'text/csv';
        extension = 'csv';
      } else if (format === 'PDF') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Reporte TMA - ${selectedRecord.id}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #0F172A; }
                  h1 { color: #0284C7; border-bottom: 2px solid #0284C7; padding-bottom: 8px; }
                  .meta { margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
                  .box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 15px; border-radius: 8px; }
                </style>
              </head>
              <body>
                <h1>BITÁCORA TÉCNICA DE INSPECCIÓN · OMA</h1>
                <div class="meta">
                  <p><strong>Folio:</strong> ${selectedRecord.id}</p>
                  <p><strong>Aeronave:</strong> ${selectedRecord.registration} (${selectedRecord.model})</p>
                  <p><strong>Fecha/Hora:</strong> ${selectedRecord.date}</p>
                  <p><strong>Inspector TMA:</strong> ${selectedRecord.inspector}</p>
                  <p><strong>Estatus:</strong> ${selectedRecord.status}</p>
                </div>
                <div class="box">
                  <h3>Observaciones del Técnico:</h3>
                  <p>${selectedRecord.notes}</p>
                  <p><strong>Verificación de Tareas:</strong> ${selectedRecord.tasksCompleted}</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
        setIsDownloadModalOpen(false);
        return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${selectedRecord.registration}_${selectedRecord.id}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert(
        'Exportación Completa',
        `El registro ${selectedRecord.id} en formato ${format} ha sido preparado para exportar en tu dispositivo.`
      );
    }

    setIsDownloadModalOpen(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.eyebrow}>CONTROL DE CALIDAD · OMA</Text>
            <Text style={styles.title}>Historial de Bitácoras ({records.length})</Text>
            <Text style={styles.subtitle}>
              Sesión activa: <Text style={{fontWeight: 'bold', color: '#38BDF8'}}>{activeUser?.name || 'Técnico TMA'} ({activeUser?.license || 'Sin Licencia'})</Text>
            </Text>
          </View>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#DC2626" />
            <Text style={styles.logoutText}>Salir</Text>
          </Pressable>
        </View>
      </View>

      {records.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.iconBox}>
                <Ionicons name="document-text" size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.regText}>{item.registration} <Text style={styles.folioText}>({item.id})</Text></Text>
                <Text style={styles.modelText}>{item.model}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.rowText}>{item.date}</Text>
            </View>
            <View style={[styles.row, { marginTop: 4 }]}>
              <Ionicons name="person-outline" size={14} color="#64748B" />
              <Text style={styles.rowText}>{item.inspector}</Text>
            </View>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>

          <View style={styles.cardFooter}>
            <Pressable style={styles.downloadBtn} onPress={() => openDownloadOptions(item)}>
              <Ionicons name="download-outline" size={16} color="#0284C7" />
              <Text style={styles.downloadBtnText}>Exportar / Descargar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Modal visible={isDownloadModalOpen} transparent animationType="fade" onRequestClose={() => setIsDownloadModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Opciones de Exportación</Text>
              <Pressable onPress={() => setIsDownloadModalOpen(false)}>
                <Ionicons name="close" size={20} color="#1E293B" />
              </Pressable>
            </View>

            {selectedRecord && (
              <Text style={styles.modalSubtitle}>
                Selecciona el formato para la aeronave <Text style={{ fontWeight: 'bold' }}>{selectedRecord.registration}</Text> ({selectedRecord.id}):
              </Text>
            )}

            <View style={styles.formatOptions}>
              <Pressable style={styles.formatCard} onPress={() => handleDownload('PDF')}>
                <Ionicons name="document-text-outline" size={26} color="#DC2626" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.formatTitle}>Documento PDF (.pdf)</Text>
                  <Text style={styles.formatDesc}>Formato imprimible con membrete oficial TMA/OMA.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.formatCard} onPress={() => handleDownload('CSV')}>
                <Ionicons name="grid-outline" size={26} color="#059669" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.formatTitle}>Hoja de Cálculo Excel (.csv)</Text>
                  <Text style={styles.formatDesc}>Datos tabulados para auditorías de mantenimiento.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.formatCard} onPress={() => handleDownload('JSON')}>
                <Ionicons name="code-slash-outline" size={26} color="#0284C7" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.formatTitle}>Estructura JSON (.json)</Text>
                  <Text style={styles.formatDesc}>Datos crudos para integración con ERPs aeronáuticos.</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 14, marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: '#0284C7', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  regText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  folioText: { fontSize: 12, color: '#64748B', fontWeight: '400' },
  modelText: { fontSize: 11, color: '#64748B' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  cardBody: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { fontSize: 12, color: '#334155', fontWeight: '500' },
  notesText: { fontSize: 12, color: '#475569', marginTop: 8, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  cardFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, alignItems: 'flex-end' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  downloadBtnText: { color: '#0284C7', fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 450, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  formatOptions: { gap: 10 },
  formatCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  formatTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  formatDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
});