import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryRecord {
  id: string;
  registration: string;
  model: string;
  date: string;
  status: string;
  inspector: string;
  tasksCompleted: string;
  notes: string;
}

export interface UserAccount {
  email: string;
  name: string;
  license: string;
}

const STORAGE_KEY = '@oma_maintenance_history_v1';
const USERS_KEY = '@oma_users_db_v1';
const SESSION_KEY = '@oma_active_session_v1';

export const INITIAL_RECORDS: HistoryRecord[] = [
  {
    id: 'BIT-2026-001',
    registration: 'N102-YS',
    model: 'Boeing 737-800',
    date: '2026-10-20 08:30',
    status: 'Aprobado y Transmitido',
    inspector: 'Valeria Hernández (TMA #402)',
    tasksCompleted: '4/4 Puntos verificados',
    notes: 'Inspección pre-vuelo completada sin novedades estructurales ni fugas de fluido.',
  },
];

let memoryHistory: HistoryRecord[] = [...INITIAL_RECORDS];
let activeUserMemory: UserAccount | null = null;
let usersMemory: UserAccount[] = [];
let listeners: Array<() => void> = [];

// --- ALMACENAMIENTO DE HISTORIAL ---

export const getStoredHistory = (): HistoryRecord[] => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
  }
  return memoryHistory;
};

export const loadHistoryAsync = async (): Promise<HistoryRecord[]> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      memoryHistory = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error cargando historial nativo:', e);
  }
  return memoryHistory;
};

export const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'date'>): HistoryRecord => {
  const current = getStoredHistory();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newRecord: HistoryRecord = {
    ...record,
    id: `BIT-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: formattedDate,
  };

  const updated = [newRecord, ...current];
  memoryHistory = updated;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } else {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
  }

  listeners.forEach(fn => fn());
  return newRecord;
};

// --- GESTIÓN DE USUARIOS Y SESIÓN ---

export const getActiveUser = (): UserAccount | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const active = localStorage.getItem(SESSION_KEY);
    if (active) {
      try { return JSON.parse(active); } catch (e) { return null; }
    }
  }
  return activeUserMemory;
};

export const loadActiveUserAsync = async (): Promise<UserAccount | null> => {
  try {
    const active = await AsyncStorage.getItem(SESSION_KEY);
    if (active) {
      activeUserMemory = JSON.parse(active);
    }
  } catch (e) {
    console.error('Error cargando sesión nativa:', e);
  }
  return activeUserMemory;
};

export const saveActiveUser = (user: UserAccount) => {
  activeUserMemory = user;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user)).catch(console.error);
  }
};

export const logoutUser = () => {
  activeUserMemory = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  } else {
    AsyncStorage.removeItem(SESSION_KEY).catch(console.error);
  }
};

export const getAllUsers = (): UserAccount[] => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
  }
  return usersMemory;
};