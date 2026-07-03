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
  // TODO: replace localStorage with backend API when server is added.
  localStorage.setItem(key, JSON.stringify(value));
};

export const storageService = {
  getFavorites: () => readJson<string[]>(FAVORITES_KEY, []),
  setFavorites: (ids: string[]) => writeJson(FAVORITES_KEY, ids),
  getCollection: () => readJson<UserPlant[]>(COLLECTION_KEY, []),
  setCollection: (plants: UserPlant[]) => writeJson(COLLECTION_KEY, plants),
  getTheme: () => localStorage.getItem(THEME_KEY) ?? 'light',
  setTheme: (theme: 'light' | 'dark') => localStorage.setItem(THEME_KEY, theme),
  resetUserData: () => {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(COLLECTION_KEY);
  },
};
