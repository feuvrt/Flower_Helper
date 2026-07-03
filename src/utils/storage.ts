import type { UserPlant } from '../types/plant';

const FAVORITES_KEY = 'plant-care.favoritePlantIds';
const COLLECTION_KEY = 'plant-care.userPlants';
const THEME_KEY = 'plant-care.theme';

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

export const normalizeUserPlant = (plant: UserPlant | (Partial<UserPlant> & { plantId?: string })): UserPlant | null => {
  if (!plant || typeof plant !== 'object' || !plant.id) return null;

  const source = plant.source ?? 'catalog';

  if (source === 'custom') {
    if (!plant.customPlant) return null;
    return {
      ...plant,
      source: 'custom',
      plantId: undefined,
      customPlant: plant.customPlant,
      notes: plant.notes ?? '',
      wateringReminderEnabled: plant.wateringReminderEnabled ?? true,
      repottingReminderEnabled: plant.repottingReminderEnabled ?? true,
    } as UserPlant;
  }

  if (!plant.plantId) return null;
  return {
    ...plant,
    source: 'catalog',
    plantId: plant.plantId,
    customPlant: undefined,
    notes: plant.notes ?? '',
    wateringReminderEnabled: plant.wateringReminderEnabled ?? true,
    repottingReminderEnabled: plant.repottingReminderEnabled ?? true,
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
  resetUserData: () => {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(COLLECTION_KEY);
  },
};
