import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getStoredHistory, loadHistoryAsync, HistoryRecord, getActiveUser } from '../../services/historyStorage';
import * as Print from 'expo-print';

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  
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

  const openDownloadOptions = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setIsDownloadModalOpen(true);
  };

  const handleDownload = async (format: 'PDF' | 'CSV' | 'JSON') => {
    if (!selectedRecord) return;

    const record = selectedRecord;
    const filename = `Reporte_${record.registration}_${record.id}`;

    // Evita que caracteres de los datos rompan el HTML del reporte.
    const escapeHtml = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    try {
      if (format === 'PDF') {
        // El mismo HTML sirve para imprimir en navegador o generar el PDF nativo.
        const html = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>${escapeHtml(filename)}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 28px; color: #0F172A; line-height: 1.6; }
                h1 { color: #0284C7; border-bottom: 2px solid #0284C7; padding-bottom: 10px; font-size: 22px; }
                h2 { margin-top: 26px; font-size: 16px; }
                .details { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 16px; border-radius: 8px; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              <h1>BITÁCORA TÉCNICA DE INSPECCIÓN · OMA</h1>
              <div class="details">
                <p><strong>Folio:</strong> ${escapeHtml(record.id)}</p>
                <p><strong>Aeronave:</strong> ${escapeHtml(record.registration)}</p>
                <p><strong>Modelo:</strong> ${escapeHtml(record.model)}</p>
                <p><strong>Fecha/Hora:</strong> ${escapeHtml(record.date)}</p>
                <p><strong>Inspector TMA:</strong> ${escapeHtml(record.inspector)}</p>
                <p><strong>Estatus:</strong> ${escapeHtml(record.status)}</p>
              </div>
              <h2>Observaciones del técnico</h2>
              <p>${escapeHtml(record.notes || 'Sin observaciones registradas.')}</p>
              <h2>Verificación de tareas</h2>
              <p>${escapeHtml(record.tasksCompleted || 'Sin información disponible.')}</p>
            </body>
          </html>
        `;

        if (Platform.OS === 'web') {
          // No usamos jsPDF: su require dinámico provoca el error de Metro.
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            Alert.alert('Permitir ventana emergente', 'Tu navegador bloqueó el reporte. Permite las ventanas emergentes e inténtalo de nuevo.');
            return;
          }
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.onload = () => printWindow.print();
        } else {
          // En Android/Expo Go, compartir o copiar el URI temporal que devuelve
          // printToFileAsync puede fallar por permisos de lectura. Abrimos el
          // diálogo nativo de impresión directamente; desde allí se puede elegir
          // "Guardar como PDF" sin copiar el archivo a mano.
          await Print.printAsync({ html });
        }

        setIsDownloadModalOpen(false);
        return;
      }

      // Exportación CSV/JSON en navegador.
      if (Platform.OS === 'web') {
        let content = '';
        let mimeType = 'text/plain';
        let extension = 'txt';

        if (format === 'JSON') {
          content = JSON.stringify(record, null, 2);
          mimeType = 'application/json';
          extension = 'json';
        } else {
          const csvEscape = (value: unknown) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`;

          content = [
            ['ID', 'Matricula', 'Modelo', 'Fecha', 'Estatus', 'Inspector', 'Notas']
              .map(csvEscape).join(','),
            [
              record.id,
              record.registration,
              record.model,
              record.date,
              record.status,
              record.inspector,
              record.notes,
            ].map(csvEscape).join(','),
          ].join('\r\n');
          mimeType = 'text/csv;charset=utf-8;';
          extension = 'csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        Alert.alert(
          'Formato no disponible',
          'Por ahora, la exportación móvil de CSV y JSON no está implementada. Puedes descargar la bitácora en PDF.'
        );
      }

      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error('Error al exportar el documento:', error);
      Alert.alert(
        'No se pudo exportar',
        'Ocurrió un problema al generar el archivo. Inténtalo de nuevo.'
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: isMobile ? 12 : 24 }]}>
      <View style={styles.headerBox}>
        <Text style={styles.eyebrow}>CONTROL DE CALIDAD · OMA</Text>
        <Text style={styles.title}>Historial de Bitácoras ({records.length})</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          Sesión activa: <Text style={{fontWeight: 'bold', color: '#38BDF8'}}>{activeUser?.name || 'Técnico TMA'}</Text>
        </Text>
      </View>

      {records.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
              <View style={styles.iconBox}>
                <Ionicons name="document-text" size={20} color="#0284C7" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.regText}>{item.registration} <Text style={styles.folioText}>({item.id})</Text></Text>
                <Text style={styles.modelText}>{item.model}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText} numberOfLines={1}>{item.status}</Text>
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
                Selecciona el formato para <Text style={{ fontWeight: 'bold' }}>{selectedRecord.registration}</Text> ({selectedRecord.id}):
              </Text>
            )}

            <View style={styles.formatOptions}>
              <Pressable style={styles.formatCard} onPress={() => handleDownload('PDF')}>
                <Ionicons name="document-text-outline" size={24} color="#DC2626" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.formatTitle}>Documento PDF (.pdf)</Text>
                  <Text style={styles.formatDesc}>Formato imprimible TMA/OMA.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.formatCard} onPress={() => handleDownload('CSV')}>
                <Ionicons name="grid-outline" size={24} color="#059669" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.formatTitle}>Excel CSV (.csv)</Text>
                  <Text style={styles.formatDesc}>Datos para auditorías.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.formatCard} onPress={() => handleDownload('JSON')}>
                <Ionicons name="code-slash-outline" size={24} color="#0284C7" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.formatTitle}>Estructura JSON (.json)</Text>
                  <Text style={styles.formatDesc}>Integración con ERPs.</Text>
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
  container: { backgroundColor: '#F8FAFC', maxWidth: 1000, alignSelf: 'center', width: '100%' },
  headerBox: { backgroundColor: '#0F172A', padding: 16, borderRadius: 14, marginBottom: 16 },
  eyebrow: { fontSize: 9, fontWeight: '800', color: '#0284C7', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10, flexWrap: 'wrap' },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  regText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  folioText: { fontSize: 11, color: '#64748B', fontWeight: '400' },
  modelText: { fontSize: 11, color: '#64748B' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0', maxWidth: '100%' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  cardBody: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { fontSize: 11, color: '#334155', fontWeight: '500' },
  notesText: { fontSize: 11, color: '#475569', marginTop: 6, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  cardFooter: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, alignItems: 'flex-end' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  downloadBtnText: { color: '#0284C7', fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 400, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginBottom: 14 },
  formatOptions: { gap: 8 },
  formatCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  formatTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  formatDesc: { fontSize: 9, color: '#64748B', marginTop: 1 },
});