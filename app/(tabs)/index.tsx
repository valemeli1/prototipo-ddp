import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getActiveUser,
  logoutUser,
  UserAccount,
} from '../../services/historyStorage';
import {
  getStoredFleet,
  Aircraft,
} from '../../services/fleetStorage';

const COLORS = {
  background: '#F3F6FB',
  surface: '#FFFFFF',
  navy: '#10233F',
  navyLight: '#1C3658',
  muted: '#687991',
  border: '#E2E8F0',
  blue: '#2878E5',
  blueSoft: '#EAF2FF',
  green: '#16865B',
  greenSoft: '#E7F7EF',
  amber: '#B96B0B',
  amberSoft: '#FFF3DA',
  red: '#C2414B',
  redSoft: '#FDEBED',
  white: '#FFFFFF',
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
};

type Maintenance = {
  tail: string;
  model: string;
  task: string;
  due: string;
  status: string;
  tone: 'amber' | 'blue' | 'green' | 'red';
};

const upcoming: Maintenance[] = [
  {
    tail: 'N102-YS',
    model: 'Boeing 737-800',
    task: 'Revisión C1',
    due: '145 h de vuelo',
    status: 'Prioridad alta',
    tone: 'amber',
  },
  {
    tail: 'YS-741',
    model: 'Airbus A320',
    task: 'Inspección de tren de aterrizaje',
    due: '22 días',
    status: 'Programado',
    tone: 'blue',
  },
  {
    tail: 'N508-YS',
    model: 'Embraer 190',
    task: 'Revisión de componente APU',
    due: '28 días',
    status: 'Planificado',
    tone: 'green',
  },
];

function SectionTitle({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
          <Text style={styles.textActionLabel}>{action}</Text>
          <Ionicons name="chevron-forward" size={15} color={COLORS.blue} />
        </Pressable>
      ) : null}
    </View>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: Maintenance['tone'];
}) {
  const palette = {
    amber: { bg: COLORS.amberSoft, fg: COLORS.amber },
    blue: { bg: COLORS.blueSoft, fg: COLORS.blue },
    green: { bg: COLORS.greenSoft, fg: COLORS.green },
    red: { bg: COLORS.redSoft, fg: COLORS.red },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.badgeText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWide = width >= 1050;
  const isCompact = width < 620;
  const isTablet = width >= 620 && width < 1050;

  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);
  const [fleetList, setFleetList] = useState<Aircraft[]>([]);

  useFocusEffect(
    useCallback(() => {
      setActiveUser(getActiveUser());

      let isMounted = true;
      const loadData = async () => {
        const storedFleet = await getStoredFleet();
        if (isMounted) {
          setFleetList(storedFleet);
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const totalFleet = fleetList.length;
  const operationalCount = fleetList.filter((a) => a.status === 'Operativo').length;
  const aogCount = fleetList.filter((a) => a.status === 'AOG').length;
  const operationalPercent = totalFleet ? Math.round((operationalCount / totalFleet) * 100) : 0;

  // CÁLCULO DE COMPONENTES GLOBALES PARA LA GRÁFICA DE DONA
  const componentStats = useMemo(() => {
    let correct = 0;
    let review = 0;
    let critical = 0;

    fleetList.forEach((plane) => {
      plane.parts?.forEach((part) => {
        if (part.status === 'Correcto') correct++;
        else if (part.status === 'Revisar') review++;
        else if (part.status === 'Crítico') critical++;
      });
    });

    const total = correct + review + critical;
    return {
      correct,
      review,
      critical,
      total,
      correctPct: total ? Math.round((correct / total) * 100) : 100,
      reviewPct: total ? Math.round((review / total) * 100) : 0,
      criticalPct: total ? Math.round((critical / total) * 100) : 0,
    };
  }, [fleetList]);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString('es-SV', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const metrics: Metric[] = [
    {
      label: 'Aeronaves operativas',
      value: String(operationalCount).padStart(2, '0'),
      detail: `${operationalPercent}% de la flota registrada`,
      icon: 'airplane-outline',
      color: COLORS.green,
      tint: COLORS.greenSoft,
    },
    {
      label: 'Aeronaves en AOG',
      value: String(aogCount).padStart(2, '0'),
      detail: 'Fuera de servicio',
      icon: 'construct-outline',
      color: COLORS.red,
      tint: COLORS.redSoft,
    },
    {
      label: 'Inspecciones al día',
      value: '86%',
      detail: 'Cumplimiento programado',
      icon: 'shield-checkmark-outline',
      color: COLORS.blue,
      tint: COLORS.blueSoft,
    },
  ];

  const handleLogout = () => {
    logoutUser();
    router.replace('/login');
  };

  const openFleet = () => router.push('/(tabs)/fleet');
  const openAlerts = () => router.push('/(tabs)/alerts');
  const openChecklist = () => router.push('/(tabs)/checklist');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.page,
        {
          paddingHorizontal: isCompact ? 14 : isTablet ? 22 : 30,
          maxWidth: 1440,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <View style={[styles.topRow, isCompact && styles.topRowCompact]}>
        <View style={styles.headingBlock}>
          <View style={styles.breadcrumbRow}>
            <View style={styles.brandMark}>
              <Ionicons name="airplane" size={17} color={COLORS.white} />
            </View>
            <Text style={styles.eyebrow}>OMA / OPERACIONES</Text>
          </View>
          <Text style={[styles.mainTitle, isCompact && styles.mainTitleCompact]}>
            Panel de operaciones
          </Text>
          <Text style={styles.subtitle}>
            Control de flota y mantenimiento aeronáutico
          </Text>
          <Text style={styles.dateText}>
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </Text>
        </View>

        <View style={[styles.topRightActions, isCompact && styles.actionsCompact]}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>Sesión activa</Text>
          </View>
          <View style={styles.userChip}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={17} color={COLORS.navy} />
            </View>
            <View style={styles.userDetails}>
              <Text numberOfLines={1} style={styles.userName}>
                {activeUser?.name || 'Valeria Hernández'}
              </Text>
              <Text style={styles.userLicense}>
                {activeUser?.license || 'TMA #402'}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
            onPress={handleLogout}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={17} color={COLORS.red} />
            {!isCompact ? <Text style={styles.logoutText}>Salir</Text> : null}
          </Pressable>
        </View>
      </View>

      {/* Banner principal */}
      <View style={[styles.welcomeBanner, isCompact && styles.bannerCompact]}>
        <View style={styles.bannerTextBlock}>
          <View style={styles.bannerLabelRow}>
            <View style={styles.bannerLabelDot} />
            <Text style={styles.bannerEyebrow}>RESUMEN DE LA OPERACIÓN</Text>
          </View>
          <Text style={[styles.bannerTitle, isCompact && styles.bannerTitleCompact]}>
            Tu flota, bajo control.
          </Text>
          <Text style={styles.bannerText}>
            Consulta la disponibilidad de las aeronaves, identifica tareas prioritarias
            y da seguimiento al mantenimiento desde un solo lugar.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.bannerButton, pressed && styles.buttonPressed]}
            onPress={openFleet}
            accessibilityRole="button"
          >
            <Text style={styles.bannerButtonText}>Consultar flota</Text>
            <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
          </Pressable>
        </View>
        {!isCompact ? (
          <View style={styles.bannerVisual}>
            <View style={styles.bannerOrbitOuter} />
            <View style={styles.bannerOrbitInner} />
            <View style={styles.bannerPlane}>
              <Ionicons name="airplane" size={64} color="#FFFFFF" />
            </View>
            <View style={styles.bannerVisualTag}>
              <View style={styles.statusDot} />
              <Text style={styles.bannerVisualTagText}>Panel de control</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Métricas dinámicas */}
      <SectionTitle
        title="Indicadores principales"
        subtitle="Resumen del estado actual de la flota"
      />
      <View style={[styles.metricsGrid, { gap: 14 }]}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricCard,
              {
                width: isWide ? '31.5%' : isCompact ? '100%' : '48%',
              },
              metric.label === 'Aeronaves en AOG' && styles.metricCardAlert,
            ]}
          >
            <View style={styles.metricTop}>
              <View style={[styles.metricIcon, { backgroundColor: metric.tint }]}>
                <Ionicons name={metric.icon} size={21} color={metric.color} />
              </View>
              <View style={[styles.metricStatus, { backgroundColor: metric.tint }]}>
                <View style={[styles.metricIndicatorDot, { backgroundColor: metric.color }]} />
                <Text style={[styles.metricIndicatorText, { color: metric.color }]}>
                  {metric.label === 'Aeronaves en AOG' && aogCount > 0
                    ? 'Atención'
                    : 'Actual'}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      {/* Contenido central */}
      <View style={[styles.contentGrid, isWide ? styles.contentGridWide : styles.contentGridStack]}>
        <View style={[styles.panel, isWide && styles.panelMain]}>
          <SectionTitle
            title="Mantenimientos próximos"
            subtitle="Planificación y seguimiento de tareas"
            action="Ver flota"
            onAction={openFleet}
          />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableAircraftColumn]}>
              AERONAVE / TAREA
            </Text>
            {!isCompact ? <Text style={styles.tableHeaderText}>VENCIMIENTO</Text> : null}
          </View>

          {upcoming.map((item, index) => (
            <View
              key={item.tail}
              style={[
                styles.maintenanceRow,
                index === upcoming.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.aircraftIcon}>
                <Ionicons name="airplane-outline" size={20} color={COLORS.blue} />
              </View>
              <View style={styles.maintenanceInfo}>
                <Text style={styles.aircraftTail}>{item.tail}</Text>
                <Text style={styles.aircraftModel}>{item.model}</Text>
                <Text style={styles.maintenanceTask}>{item.task}</Text>
                <View style={styles.dueRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                  <Text style={styles.dueText}>
                    {isCompact ? `Vence en ${item.due}` : item.due}
                  </Text>
                </View>
                {isCompact ? <StatusBadge label={item.status} tone={item.tone} /> : null}
              </View>
              {!isCompact ? (
                <View style={styles.maintenanceMeta}>
                  <Text style={styles.dueValue}>{item.due}</Text>
                  <StatusBadge label={item.status} tone={item.tone} />
                </View>
              ) : null}
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.panelFooterLink, pressed && styles.pressed]}
            onPress={openFleet}
            accessibilityRole="button"
          >
            <Text style={styles.panelFooterLinkText}>Consultar todas las aeronaves</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.blue} />
          </Pressable>
        </View>

        {/* COLUMNA DERECHA CON GRÁFICA DE DONA DE COMPONENTES */}
        <View style={styles.sideColumn}>
          <View style={styles.panel}>
            <SectionTitle
              title="Salud de Componentes"
              subtitle="Desglose global de piezas de la flota"
              action="Detalles"
              onAction={openFleet}
            />

            {/* GRÁFICA TIPO DONA VISUAL (PURA Y ESTILIZADA) */}
            <View style={styles.donutContainer}>
              <View style={styles.donutOuterRing}>
                <View style={styles.donutInnerHole}>
                  <Text style={styles.donutCenterValue}>{componentStats.total}</Text>
                  <Text style={styles.donutCenterLabel}>Componentes</Text>
                </View>
              </View>
            </View>

            {/* Barra de proporción segmentada estilo analítico */}
            <View style={styles.donutSegmentBar}>
              {componentStats.correct > 0 && (
                <View style={[styles.segGreen, { flex: componentStats.correct }]} />
              )}
              {componentStats.review > 0 && (
                <View style={[styles.segAmber, { flex: componentStats.review }]} />
              )}
              {componentStats.critical > 0 && (
                <View style={[styles.segRed, { flex: componentStats.critical }]} />
              )}
            </View>

            {/* Leyenda interactiva con conteos y porcentajes reales */}
            <View style={styles.legendList}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.legendLabel}>Correctos</Text>
                <Text style={styles.legendPercent}>{componentStats.correctPct}%</Text>
                <Text style={styles.legendValue}>{componentStats.correct}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.amber }]} />
                <Text style={styles.legendLabel}>En revisión</Text>
                <Text style={styles.legendPercent}>{componentStats.reviewPct}%</Text>
                <Text style={styles.legendValue}>{componentStats.review}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
                <Text style={styles.legendLabel}>Críticos</Text>
                <Text style={styles.legendPercent}>{componentStats.criticalPct}%</Text>
                <Text style={styles.legendValue}>{componentStats.critical}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Accesos rápidos */}
      <SectionTitle
        title="Accesos rápidos"
        subtitle="Accede directamente a las tareas más utilizadas"
      />
      <View style={[styles.quickGrid, isCompact && styles.quickGridCompact]}>
        <Pressable
          style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
          onPress={openFleet}
          accessibilityRole="button"
        >
          <View style={[styles.quickIcon, { backgroundColor: COLORS.blueSoft }]}>
            <Ionicons name="airplane-outline" size={22} color={COLORS.blue} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Gestión de flota</Text>
            <Text style={styles.quickSubtitle}>Consultar aeronaves y estados</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
          onPress={openChecklist}
          accessibilityRole="button"
        >
          <View style={[styles.quickIcon, { backgroundColor: COLORS.greenSoft }]}>
            <Ionicons name="clipboard-outline" size={22} color={COLORS.green} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Inspecciones</Text>
            <Text style={styles.quickSubtitle}>Completar lista de control</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
          onPress={openAlerts}
          accessibilityRole="button"
        >
          <View style={[styles.quickIcon, { backgroundColor: COLORS.amberSoft }]}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.amber} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Centro de alertas</Text>
            <Text style={styles.quickSubtitle}>Revisar incidencias y vencimientos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRule} />
        <Text style={styles.footerNote}>OMA · Sistema de gestión de mantenimiento aeronáutico</Text>
        <Text style={styles.footerSubnote}>Panel de control operativo</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 25,
    paddingBottom: 42,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 24,
  },
  topRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 15,
  },
  headingBlock: {
    flex: 1,
    minWidth: 0,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 9,
  },
  brandMark: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
  },
  eyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  mainTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.8,
  },
  mainTitleCompact: {
    fontSize: 25,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
    lineHeight: 19,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionsCompact: {
    width: '100%',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  statusPillText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 6,
    paddingRight: 12,
    borderRadius: 13,
    maxWidth: 220,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flexShrink: 1,
  },
  userName: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '800',
  },
  userLicense: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.redSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#F6D4D8',
    minHeight: 38,
  },
  logoutText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: '800',
  },
  welcomeBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: 22,
    paddingVertical: 25,
    paddingHorizontal: 27,
    marginBottom: 29,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 208,
  },
  bannerCompact: {
    paddingHorizontal: 20,
    paddingVertical: 23,
    minHeight: 0,
  },
  bannerTextBlock: {
    flex: 1,
    maxWidth: 690,
    zIndex: 1,
  },
  bannerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bannerLabelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#72B4FF',
  },
  bannerEyebrow: {
    color: '#A9CCFF',
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: '800',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 36,
  },
  bannerTitleCompact: {
    fontSize: 25,
    lineHeight: 31,
  },
  bannerText: {
    color: '#C6D3E5',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 590,
  },
  bannerButton: {
    marginTop: 19,
    backgroundColor: COLORS.blue,
    borderRadius: 11,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  bannerButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  bannerVisual: {
    width: 220,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  bannerOrbitOuter: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#49617F',
    backgroundColor: '#FFFFFF05',
  },
  bannerOrbitInner: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: '#49617F',
  },
  bannerPlane: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF0D',
  },
  bannerVisualTag: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#203A5C',
    borderColor: '#49617F',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bannerVisualTagText: {
    color: '#E2EAF5',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sectionHeading: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    color: COLORS.navy,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 16,
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingLeft: 8,
  },
  textActionLabel: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 29,
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 17,
    minHeight: 158,
    marginBottom: 0,
    ...Platform.select({
      web: { boxShadow: '0px 4px 14px rgba(16, 35, 63, 0.04)' } as any,
      default: {
        shadowColor: '#10233F',
        shadowOpacity: 0.035,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      },
    }),
  },
  metricCardAlert: {
    borderColor: '#F0D5D8',
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    marginBottom: 13,
  },
  metricIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metricIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  metricIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
  },
  metricValue: {
    color: COLORS.navy,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  metricLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  metricDetail: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },
  contentGrid: {
    gap: 17,
    marginBottom: 29,
  },
  contentGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentGridStack: {
    flexDirection: 'column',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 19,
    ...Platform.select({
      web: { boxShadow: '0px 4px 14px rgba(16, 35, 63, 0.035)' } as any,
      default: {
        shadowColor: '#10233F',
        shadowOpacity: 0.025,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      },
    }),
  },
  panelMain: {
    flex: 1.45,
    minWidth: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 4,
  },
  tableHeaderText: {
    color: '#7B899D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  tableAircraftColumn: {
    flex: 1,
  },
  maintenanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F6',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 5,
  },
  aircraftIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  aircraftTail: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  aircraftModel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  maintenanceTask: {
    color: '#33445D',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
    lineHeight: 16,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  dueText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  maintenanceMeta: {
    minWidth: 112,
    alignItems: 'flex-end',
    gap: 8,
  },
  dueValue: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  panelFooterLink: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
    paddingTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelFooterLinkText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '800',
  },
  sideColumn: {
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  /* ESTILOS DE LA GRÁFICA DE DONA Y SEGMENTOS */
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  donutOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  donutInnerHole: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },
  donutCenterLabel: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  donutSegmentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 3,
    marginBottom: 16,
  },
  segGreen: {
    backgroundColor: COLORS.green,
    borderRadius: 3,
  },
  segAmber: {
    backgroundColor: COLORS.amber,
    borderRadius: 3,
  },
  segRed: {
    backgroundColor: COLORS.red,
    borderRadius: 3,
  },
  legendList: {
    gap: 13,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: COLORS.muted,
    fontSize: 11,
    flex: 1,
  },
  legendPercent: {
    color: COLORS.muted,
    fontSize: 10,
    width: 37,
    textAlign: 'right',
  },
  legendValue: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '800',
    width: 17,
    textAlign: 'right',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickGridCompact: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  quickCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickCardPressed: {
    opacity: 0.9,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    flex: 1,
  },
  quickTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  quickSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  footer: {
    marginTop: 35,
    alignItems: 'center',
  },
  footerRule: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  footerSubnote: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});