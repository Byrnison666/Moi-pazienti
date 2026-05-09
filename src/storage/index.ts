import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, AppSettings } from '../types';

const KEY_DATA = 'dental:data:v1';
const KEY_SETTINGS = 'dental:settings:v1';

const EMPTY_DATA: AppData = {
  patients: [],
  templates: [],
  demoIds: { patients: [], templates: [] },
};

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
};

export async function loadData(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_DATA);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    return {
      patients: parsed.patients ?? [],
      templates: parsed.templates ?? [],
      demoIds: parsed.demoIds ?? { patients: [], templates: [] },
    };
  } catch (e) {
    console.warn('loadData failed', e);
    return null;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_DATA, JSON.stringify(data));
  } catch (e) {
    console.warn('saveData failed', e);
  }
}

export async function clearData(): Promise<void> {
  await AsyncStorage.removeItem(KEY_DATA);
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
  } catch (e) {
    console.warn('saveSettings failed', e);
  }
}

export const STORAGE_EMPTY: AppData = EMPTY_DATA;
