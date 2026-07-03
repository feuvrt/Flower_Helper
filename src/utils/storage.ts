import type { UserPlant } from '../types/plant';
import { parseIsoDate, todayIso, toIsoDate } from './dates';

const FAVORITES_KEY = 'plant-care.favoritePlantIds';
const COLLECTION_KEY = 'plant-care.userPlants';
const THEME_KEY = 'plant-care.theme';
const SHOWN_NOTIFICATIONS_KEY = 'plantCareShownNotifications';

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  // В будущем вместо localStorage можно подключить сервер.
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeDate = (value?: string | null, fallback = '') => {
  const date = parseIsoDate(value);
  return date ? toIsoDate(date) : fallback;
};

const normalizePositiveNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const normalizeReminderTime = (value?: string | null) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '') ? value! : '09:00');

export const normalizeUserPlant = (plant: UserPlant | (Partial<UserPlant> & { plantId?: string })): UserPlant | null => {
  if (!plant || typeof plant !== 'object' || !plant.id) return null;

  const source = plant.source ?? 'catalog';

  if (source === 'custom') {
    if (!plant.customPlant) return null;
    const addedAt = normalizeDate(plant.addedAt, todayIso());
    return {
      ...plant,
      source: 'custom',
      plantId: undefined,
      customPlant: plant.customPlant,
      addedAt,
      notes: plant.notes ?? '',
      lastWateredAt: normalizeDate(plant.lastWateredAt, ''),
      wateringIntervalDays: normalizePositiveNumber(plant.wateringIntervalDays, plant.customPlant.watering.intervalDays || 7),
      wateringReminderEnabled: plant.wateringReminderEnabled ?? true,
      wateringReminderTime: normalizeReminderTime(plant.wateringReminderTime),
      lastRepottedAt: normalizeDate(plant.lastRepottedAt, ''),
      repottingIntervalMonths: normalizePositiveNumber(plant.repottingIntervalMonths, plant.customPlant.repotting.intervalMonths || 12),
      repottingReminderEnabled: plant.repottingReminderEnabled ?? true,
      repottingReminderTime: normalizeReminderTime(plant.repottingReminderTime),
    } as UserPlant;
  }

  if (!plant.plantId) return null;
  const addedAt = normalizeDate(plant.addedAt, todayIso());
  return {
    ...plant,
    source: 'catalog',
    plantId: plant.plantId,
    customPlant: undefined,
    addedAt,
    notes: plant.notes ?? '',
    lastWateredAt: normalizeDate(plant.lastWateredAt, ''),
    wateringIntervalDays: normalizePositiveNumber(plant.wateringIntervalDays, 7),
    wateringReminderEnabled: plant.wateringReminderEnabled ?? true,
    wateringReminderTime: normalizeReminderTime(plant.wateringReminderTime),
    lastRepottedAt: normalizeDate(plant.lastRepottedAt, ''),
    repottingIntervalMonths: normalizePositiveNumber(plant.repottingIntervalMonths, 12),
    repottingReminderEnabled: plant.repottingReminderEnabled ?? true,
    repottingReminderTime: normalizeReminderTime(plant.repottingReminderTime),
  } as UserPlant;
};

export const normalizeCollection = (plants: Array<UserPlant | (Partial<UserPlant> & { plantId?: string })>) =>
  plants.map(normalizeUserPlant).filter(Boolean) as UserPlant[];

export const storage = {
  getFavorites: () => readJson<string[]>(FAVORITES_KEY, []),
  setFavorites: (ids: string[]) => writeJson(FAVORITES_KEY, ids),
  getCollection: () => normalizeCollection(readJson<Array<UserPlant | (Partial<UserPlant> & { plantId?: string })>>(COLLECTION_KEY, [])),
  setCollection: (plants: UserPlant[]) => writeJson(COLLECTION_KEY, plants),
  getTheme: () => localStorage.getItem(THEME_KEY) ?? 'light',
  setTheme: (theme: 'light' | 'dark') => localStorage.setItem(THEME_KEY, theme),
  getShownNotifications: () => readJson<string[]>(SHOWN_NOTIFICATIONS_KEY, []),
  setShownNotifications: (keys: string[]) => writeJson(SHOWN_NOTIFICATIONS_KEY, keys),
  resetUserData: () => {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(COLLECTION_KEY);
    localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
  },
};
