import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  navy: '#10233F',
  muted: '#6B7A90',
  border: '#E5EBF3',
  blue: '#2878E5',
  blueSoft: '#EAF2FF',
  green: '#16865B',
  greenSoft: '#E7F7EF',
  amber: '#B96B0B',
  amberSoft: '#FFF3DA',
  red: '#C2414B',
  redSoft: '#FDEBED',
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
};

const metrics: Metric[] = [
  { label: 'Aeronaves operativas', value: '12', detail: 'Disponibles para servicio', icon: 'airplane-outline', color: COLORS.green, tint: COLORS.greenSoft },
  { label: 'Alertas preventivas', value: '03', detail: 'Requieren seguimiento', icon: 'notifications-outline', color: COLORS.amber, tint: COLORS.amberSoft },
  { label: 'En mantenimiento', value: '01', detail: 'Estado AOG', icon: 'construct-outline', color: COLORS.red, tint: COLORS.redSoft },
  { label: 'Inspecciones al día', value: '86%', detail: 'Cumplimiento programado', icon: 'shield-checkmark-outline', color: COLORS.blue, tint: COLORS.blueSoft },
];

const upcoming = [
  { tail: 'N102-YS', model: 'Boeing 737-800', task: 'Revisión C1', due: '145 h de vuelo', status: 'Prioridad alta', tone: 'amber' as const },
  { tail: 'YS-741', model: 'Airbus A320', task: 'Inspección de tren de aterrizaje', due: '22 días', status: 'Programado', tone: 'blue' as const },
  { tail: 'N508-YS', model: 'Embraer 190', task: 'Revisión de componente APU', due: '28 días', status: 'Planificado', tone: 'green' as const },
];

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} style={styles.textAction} accessibilityRole="button">
          <Text style={styles.textActionLabel}>{action}</Text>
          <Ionicons name="chevron-forward" size={15} color={COLORS.blue} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;
  const isCompact = width < 620;
  const router = useRouter();

  const openFleet = () => router.push('/(tabs)/fleet');
  const openAlerts = () => router.push('/(tabs)/alerts');
  const openChecklist = () => router.push('/(tabs)/checklist');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.page, { paddingHorizontal: isCompact ? 16 : 28, maxWidth: 1320 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.topRow, isCompact && styles.topRowCompact]}>
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>OPERACIONES / RESUMEN</Text>
          <Text style={styles.mainTitle}>Centro de Control OMA</Text>
          <Text style={styles.subtitle}>Sistema de gestión de mantenimiento aeronáutico</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>Sistema operativo</Text>
        </View>
      </View>

      <View style={styles.welcomeBanner}>
        <View style={styles.bannerTextBlock}>
          <Text style={styles.bannerEyebrow}>VISTA GENERAL DE LA OPERACIÓN</Text>
          <Text style={styles.bannerTitle}>Mantén tu flota lista para volar.</Text>
          <Text style={styles.bannerText}>Consulta el estado de las aeronaves y da seguimiento a las tareas de mantenimiento desde un solo lugar.</Text>
          <Pressable style={styles.bannerButton} onPress={openFleet} accessibilityRole="button">
            <Text style={styles.bannerButtonText}>Ver flota</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.bannerIconWrap}>
          <Ionicons name="airplane" size={isCompact ? 48 : 68} color="#FFFFFF" />
          <View style={styles.bannerIconCircle} />
        </View>
      </View>

      <SectionTitle title="Indicadores principales" />
      <View style={[styles.metricsGrid, { gap: 14 }]}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricCard,
              { width: isWide ? '23.8%' : isCompact ? '100%' : '48.2%' },
            ]}
          >
            <View style={styles.metricTop}>
              <View style={[styles.metricIcon, { backgroundColor: metric.tint }]}>
                <Ionicons name={metric.icon} size={21} color={metric.color} />
              </View>
              <View style={[styles.metricIndicator, { backgroundColor: metric.tint }]}>
                <View style={[styles.metricIndicatorDot, { backgroundColor: metric.color }]} />
                <Text style={[styles.metricIndicatorText, { color: metric.color }]}>Actual</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.contentGrid, isWide ? styles.contentGridWide : styles.contentGridStack]}>
        <View style={[styles.panel, isWide && styles.panelMain]}>
          <SectionTitle title="Próximos mantenimientos" action="Ver flota" onAction={openFleet} />
          <Text style={styles.panelDescription}>Tareas que requieren planificación y seguimiento.</Text>
          {upcoming.map((item, index) => {
            const tone = item.tone === 'amber'
              ? { bg: COLORS.amberSoft, fg: COLORS.amber }
              : item.tone === 'green'
                ? { bg: COLORS.greenSoft, fg: COLORS.green }
                : { bg: COLORS.blueSoft, fg: COLORS.blue };
            return (
              <View key={item.tail} style={[styles.maintenanceRow, index === upcoming.length - 1 && styles.lastRow]}>
                <View style={styles.aircraftIcon}>
                  <Ionicons name="airplane-outline" size={20} color={COLORS.blue} />
                </View>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.aircraftTail}>{item.tail} <Text style={styles.aircraftModel}>· {item.model}</Text></Text>
                  <Text style={styles.maintenanceTask}>{item.task}</Text>
                  <View style={styles.dueRow}>
                    <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.dueText}>Vence en {item.due}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                  <Text style={[styles.badgeText, { color: tone.fg }]}>{item.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sideColumn}>
          <View style={styles.panel}>
            <SectionTitle title="Estado de la flota" action="Detalles" onAction={openFleet} />
            <Text style={styles.panelDescription}>Distribución de las aeronaves registradas.</Text>
            <View style={styles.fleetSummary}>
              <View style={styles.fleetSummaryTop}>
                <Text style={styles.fleetSummaryNumber}>16</Text>
                <Text style={styles.fleetSummaryLabel}>aeronaves registradas</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressGreen} />
                <View style={styles.progressAmber} />
                <View style={styles.progressRed} />
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.green }]} /><Text style={styles.legendLabel}>Operativas</Text><Text style={styles.legendValue}>12</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.amber }]} /><Text style={styles.legendLabel}>Programadas</Text><Text style={styles.legendValue}>3</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.red }]} /><Text style={styles.legendLabel}>AOG</Text><Text style={styles.legendValue}>1</Text></View>
              </View>
            </View>
          </View>

          <View style={styles.alertPanel}>
            <View style={styles.alertPanelHeader}>
              <View style={styles.alertIcon}><Ionicons name="warning-outline" size={20} color={COLORS.amber} /></View>
              <View style={styles.alertHeaderText}>
                <Text style={styles.alertPanelTitle}>Alertas por atender</Text>
                <Text style={styles.alertPanelSubtitle}>Revisa las próximas fechas límite.</Text>
              </View>
              <View style={styles.alertCount}><Text style={styles.alertCountText}>3</Text></View>
            </View>
            <Pressable style={styles.alertLink} onPress={openAlerts} accessibilityRole="button">
              <Text style={styles.alertLinkText}>Consultar alertas</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.blue} />
            </Pressable>
          </View>
        </View>
      </View>

      <SectionTitle title="Accesos rápidos" />
      <View style={[styles.quickGrid, isCompact && styles.quickGridCompact]}>
        <Pressable style={styles.quickCard} onPress={openFleet} accessibilityRole="button">
          <View style={[styles.quickIcon, { backgroundColor: COLORS.blueSoft }]}><Ionicons name="airplane-outline" size={22} color={COLORS.blue} /></View>
          <View style={styles.quickText}><Text style={styles.quickTitle}>Gestión de flota</Text><Text style={styles.quickSubtitle}>Consultar aeronaves</Text></View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
        <Pressable style={styles.quickCard} onPress={openChecklist} accessibilityRole="button">
          <View style={[styles.quickIcon, { backgroundColor: COLORS.greenSoft }]}><Ionicons name="clipboard-outline" size={22} color={COLORS.green} /></View>
          <View style={styles.quickText}><Text style={styles.quickTitle}>Inspecciones</Text><Text style={styles.quickSubtitle}>Completar lista de control</Text></View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
        <Pressable style={styles.quickCard} onPress={openAlerts} accessibilityRole="button">
          <View style={[styles.quickIcon, { backgroundColor: COLORS.amberSoft }]}><Ionicons name="notifications-outline" size={22} color={COLORS.amber} /></View>
          <View style={styles.quickText}><Text style={styles.quickTitle}>Centro de alertas</Text><Text style={styles.quickSubtitle}>Revisar vencimientos</Text></View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
      </View>

      <Text style={styles.footerNote}>OMA · Panel de demostración · Los indicadores mostrados son datos de ejemplo.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  page: { width: '100%', alignSelf: 'center', paddingTop: 28, paddingBottom: 36 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 },
  topRowCompact: { alignItems: 'flex-start', flexDirection: 'column' },
  headingBlock: { flex: 1 },
  eyebrow: { color: COLORS.blue, fontSize: 10, letterSpacing: 1.5, fontWeight: '800', marginBottom: 7 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: COLORS.navy, letterSpacing: -0.7 },
  subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 6, lineHeight: 19 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.greenSoft, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 24, gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  statusPillText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  welcomeBanner: { backgroundColor: COLORS.navy, borderRadius: 20, padding: 25, marginBottom: 28, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 205 },
  bannerTextBlock: { flex: 1, maxWidth: 650, zIndex: 1 },
  bannerEyebrow: { color: '#9DC4FF', fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginBottom: 10 },
  bannerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.4, lineHeight: 31, maxWidth: 460 },
  bannerText: { color: '#C3D0E3', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 520 },
  bannerButton: { marginTop: 18, backgroundColor: COLORS.blue, borderRadius: 10, alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  bannerIconWrap: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginLeft: 14 },
  bannerIconCircle: { position: 'absolute', width: 122, height: 122, borderRadius: 61, borderWidth: 1, borderColor: '#49617F', backgroundColor: '#FFFFFF08' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 17, color: COLORS.navy, fontWeight: '800', letterSpacing: -0.2 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  textActionLabel: { fontSize: 12, color: COLORS.blue, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 28 },
  metricCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 17, minHeight: 164, marginBottom: 0 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  metricIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metricIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  metricIndicatorDot: { width: 5, height: 5, borderRadius: 3 },
  metricIndicatorText: { fontSize: 10, fontWeight: '700' },
  metricValue: { color: COLORS.navy, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  metricLabel: { color: COLORS.navy, fontSize: 12, fontWeight: '700', marginTop: 3 },
  metricDetail: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  contentGrid: { gap: 18, marginBottom: 28 },
  contentGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  contentGridStack: { flexDirection: 'column' },
  panel: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 19, marginBottom: 0 },
  panelMain: { flex: 1.45 },
  panelDescription: { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginTop: -7, marginBottom: 9 },
  maintenanceRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EDF1F6' },
  lastRow: { borderBottomWidth: 0, paddingBottom: 2 },
  aircraftIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center' },
  maintenanceInfo: { flex: 1, minWidth: 0 },
  aircraftTail: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  aircraftModel: { color: COLORS.muted, fontWeight: '500' },
  maintenanceTask: { color: '#33445D', fontSize: 12, marginTop: 5, lineHeight: 17 },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  dueText: { color: COLORS.muted, fontSize: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 7, maxWidth: 105 },
  badgeText: { fontSize: 9, fontWeight: '800', textAlign: 'center' },
  sideColumn: { flex: 1, gap: 18 },
  fleetSummary: { marginTop: 4 },
  fleetSummaryTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  fleetSummaryNumber: { color: COLORS.navy, fontSize: 27, fontWeight: '800' },
  fleetSummaryLabel: { color: COLORS.muted, fontSize: 11 },
  progressTrack: { flexDirection: 'row', height: 9, borderRadius: 8, overflow: 'hidden', gap: 3, marginBottom: 17 },
  progressGreen: { flex: 12, backgroundColor: COLORS.green, borderRadius: 5 },
  progressAmber: { flex: 3, backgroundColor: '#E9A23B', borderRadius: 5 },
  progressRed: { flex: 1, backgroundColor: COLORS.red, borderRadius: 5 },
  legendRow: { gap: 11 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: COLORS.muted, fontSize: 11, flex: 1 },
  legendValue: { color: COLORS.navy, fontSize: 11, fontWeight: '800' },
  alertPanel: { backgroundColor: '#FFFCF5', borderWidth: 1, borderColor: '#F5E5C3', borderRadius: 16, padding: 17 },
  alertPanelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: COLORS.amberSoft, alignItems: 'center', justifyContent: 'center' },
  alertHeaderText: { flex: 1 },
  alertPanelTitle: { color: COLORS.navy, fontSize: 13, fontWeight: '800' },
  alertPanelSubtitle: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  alertCount: { width: 28, height: 28, borderRadius: 9, backgroundColor: COLORS.amberSoft, alignItems: 'center', justifyContent: 'center' },
  alertCountText: { color: COLORS.amber, fontWeight: '800', fontSize: 12 },
  alertLink: { borderTopWidth: 1, borderTopColor: '#F2E7D0', marginTop: 14, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertLinkText: { color: COLORS.blue, fontSize: 11, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  quickGridCompact: { flexDirection: 'column' },
  quickCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, minHeight: 76 },
  quickIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1 },
  quickTitle: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  quickSubtitle: { color: COLORS.muted, fontSize: 10, marginTop: 5, lineHeight: 14 },
  footerNote: { color: '#8A97A9', fontSize: 10, textAlign: 'center', marginTop: 4 },
});
