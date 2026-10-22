import AsyncStorage from '@react-native-async-storage/async-storage';

export type Part = { name: string; status: 'Correcto' | 'Revisar' | 'Crítico'; note: string };
export type AircraftStatus = 'Operativo' | 'En mantenimiento' | 'AOG';

export type Aircraft = {
  id: string;
  registration: string;
  model: string;
  hours: string;
  maxHours: number;
  status: AircraftStatus;
  nextReview: string;
  parts: Part[];
};

export type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity: 'Alta' | 'Media' | 'Baja';
  date: string;
};

const FLEET_STORAGE_KEY = '@oma_fleet_data_v2';
const ALERTS_STORAGE_KEY = '@oma_alerts_data_v2';

const initialFleet: Aircraft[] = [
  {
    id: '1',
    registration: 'N102-YS',
    model: 'Boeing 737-800',
    hours: '4,210',
    maxHours: 5000,
    status: 'Operativo',
    nextReview: 'C2 · 120 h',
    parts: [{ name: 'Ala derecha', status: 'Revisar', note: 'Revisar panel de acceso.' }],
  },
  {
    id: '2',
    registration: 'YS-741',
    model: 'Airbus A320',
    hours: '6,085',
    maxHours: 6200,
    status: 'AOG',
    nextReview: 'C1 · Pendiente',
    parts: [{ name: 'Motor derecho', status: 'Crítico', note: 'Temperatura anormal.' }],
  },
];

export const getStoredFleet = async (): Promise<Aircraft[]> => {
  try {
    const json = await AsyncStorage.getItem(FLEET_STORAGE_KEY);
    if (!json) {
      await AsyncStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(initialFleet));
      return initialFleet;
    }
    return JSON.parse(json);
  } catch (e) {
    console.error('Error leyendo flota', e);
    return initialFleet;
  }
};

export const saveStoredFleet = async (fleet: Aircraft[]) => {
  try {
    await AsyncStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
  } catch (e) {
    console.error('Error guardando flota', e);
  }
};

export const getStoredAlerts = async (): Promise<AlertItem[]> => {
  try {
    const json = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
    if (!json) {
      const defaultAlerts: AlertItem[] = [
        { id: '1', title: 'Revisión C1', description: 'Revisión preventiva N102-YS', severity: 'Alta', date: 'Hoy' },
      ];
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(defaultAlerts));
      return defaultAlerts;
    }
    return JSON.parse(json);
  } catch (e) {
    return [];
  }
};