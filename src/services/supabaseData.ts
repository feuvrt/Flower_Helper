import type { Plant, UserPlant } from '../types/plant';
import type { RecommendationTags } from '../types/recommendation';
import { plants as fallbackPlants } from '../data/plants';
import { parseIsoDate, todayIso, toIsoDate } from '../utils/dates';
import { supabase } from './supabaseClient';

type PlantRow = {
  id: string;
  image_key?: string | null;
  name: string;
  short_description?: string | null;
  description: string;
  watering_interval_days: number;
  watering_text: string;
  light_type: Plant['light']['type'];
  light_text: string;
  repotting_interval_months: number;
  repotting_text: string;
  is_toxic: boolean;
  toxicity_text: string;
  features?: string[] | null;
  difficulty?: RecommendationTags['difficulty'] | null;
  size?: RecommendationTags['size'] | null;
  decorative_level?: RecommendationTags['decorativeLevel'] | null;
  is_pet_friendly?: boolean | null;
  temperature_preferred?: RecommendationTags['temperature']['preferred'] | null;
  temperature_tolerated?: RecommendationTags['temperature']['tolerated'] | null;
};

type UserPlantRow = {
  id: string;
  source: 'catalog' | 'custom';
  plant_id?: string | null;
  custom_name?: string | null;
  custom_description?: string | null;
  custom_image_data_url?: string | null;
  notes?: string | null;
  added_at?: string | null;
  last_watered_at?: string | null;
  watering_interval_days: number;
  watering_reminder_enabled: boolean;
  watering_reminder_time?: string | null;
  last_repotted_at?: string | null;
  repotting_interval_months: number;
  repotting_reminder_enabled: boolean;
  repotting_reminder_time?: string | null;
};

const imageByKey = new Map<string, string>();

fallbackPlants.forEach((plant) => {
  imageByKey.set(plant.id, plant.image);
});

[
  ['ficus', 'ficus-benjamina'],
  ['zamiokulkas', 'zamioculcas'],
  ['spaifillium', 'spathiphyllum'],
  ['chlorofitum', 'chlorophytum'],
  ['orchidea', 'phalaenopsis'],
  ['dracena', 'dracaena'],
  ['aloe', 'aloe-vera'],
  ['anturium', 'anthurium'],
].forEach(([alias, id]) => {
  const image = fallbackPlants.find((plant) => plant.id === id)?.image;
  if (image) imageByKey.set(alias, image);
});

const localPlantById = new Map(fallbackPlants.map((plant) => [plant.id, plant]));

const safeDateValue = (value?: string | null) => {
  const date = parseIsoDate(value);
  return date ? toIsoDate(date) : undefined;
};

const mapPlantRow = (row: PlantRow): Plant => {
  const localPlant = localPlantById.get(row.id);
  const image = imageByKey.get(row.image_key ?? '') ?? localPlant?.image ?? '';

  return {
    id: row.id,
    image,
    name: row.name,
    shortDescription: row.short_description ?? localPlant?.shortDescription ?? row.description,
    description: row.description,
    watering: {
      intervalDays: row.watering_interval_days,
      text: row.watering_text,
    },
    light: {
      type: row.light_type,
      text: row.light_text,
    },
    repotting: {
      intervalMonths: row.repotting_interval_months,
      text: row.repotting_text,
    },
    toxicity: {
      isToxic: row.is_toxic,
      text: row.toxicity_text,
    },
    features: row.features ?? localPlant?.features ?? [],
    recommendationTags: {
      difficulty: row.difficulty ?? localPlant?.recommendationTags?.difficulty ?? 'medium',
      size: row.size ?? localPlant?.recommendationTags?.size ?? 'medium',
      decorativeLevel: row.decorative_level ?? localPlant?.recommendationTags?.decorativeLevel ?? 2,
      isPetFriendly: row.is_pet_friendly ?? localPlant?.recommendationTags?.isPetFriendly ?? !row.is_toxic,
      temperature: {
        preferred: row.temperature_preferred ?? localPlant?.recommendationTags?.temperature.preferred ?? 'medium',
        tolerated: row.temperature_tolerated ?? localPlant?.recommendationTags?.temperature.tolerated ?? ['medium'],
      },
    },
  };
};

export const loadSupabasePlants = async (): Promise<Plant[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.from('plants').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map((row) => mapPlantRow(row as PlantRow));
};

export const loadSupabaseFavorites = async (userId: string): Promise<string[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.from('user_favorites').select('plant_id').eq('user_id', userId);
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.plant_id as string).filter(Boolean))];
};

export const addSupabaseFavorite = async (userId: string, plantId: string) => {
  if (!supabase) return;

  const { data: existing, error: selectError } = await supabase
    .from('user_favorites')
    .select('plant_id')
    .eq('user_id', userId)
    .eq('plant_id', plantId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  const { error } = await supabase.from('user_favorites').insert({ user_id: userId, plant_id: plantId });
  if (error) throw error;
};

export const removeSupabaseFavorite = async (userId: string, plantId: string) => {
  if (!supabase) return;

  const { error } = await supabase.from('user_favorites').delete().eq('user_id', userId).eq('plant_id', plantId);
  if (error) throw error;
};

const rowToUserPlant = (row: UserPlantRow): UserPlant => {
  const addedAt = safeDateValue(row.added_at) ?? todayIso();
  const lastWateredAt = safeDateValue(row.last_watered_at) ?? '';
  const lastRepottedAt = safeDateValue(row.last_repotted_at) ?? '';
  const customPlant =
    row.source === 'custom'
      ? {
          name: row.custom_name ?? 'Собственное растение',
          shortDescription: row.custom_description ?? 'Собственное растение пользователя',
          description: row.custom_description ?? 'Собственное растение пользователя',
          image: row.custom_image_data_url ?? undefined,
          watering: {
            intervalDays: row.watering_interval_days,
            text: 'Пользовательские рекомендации по поливу.',
          },
          light: {
            type: 'partial_shade' as const,
            text: 'Условия освещения указаны пользователем.',
          },
          repotting: {
            intervalMonths: row.repotting_interval_months,
            text: 'Пользовательские рекомендации по пересадке.',
          },
          toxicity: {
            isToxic: false,
            text: 'Информация о ядовитости не указана.',
          },
          features: ['Собственное растение'],
        }
      : undefined;

  return {
    id: row.id,
    source: row.source,
    plantId: row.source === 'catalog' ? row.plant_id ?? undefined : undefined,
    customPlant,
    addedAt,
    notes: row.notes ?? '',
    lastWateredAt,
    wateringIntervalDays: row.watering_interval_days,
    wateringReminderEnabled: row.watering_reminder_enabled,
    wateringReminderTime: row.watering_reminder_time ?? '09:00',
    lastRepottedAt,
    repottingIntervalMonths: row.repotting_interval_months,
    repottingReminderEnabled: row.repotting_reminder_enabled,
    repottingReminderTime: row.repotting_reminder_time ?? '09:00',
  };
};

const userPlantToRow = (userId: string, plant: UserPlant) => ({
  id: plant.id,
  user_id: userId,
  source: plant.source,
  plant_id: plant.source === 'catalog' ? plant.plantId ?? null : null,
  custom_name: plant.source === 'custom' ? plant.customPlant?.name ?? null : null,
  custom_description: plant.source === 'custom' ? plant.customPlant?.description ?? plant.customPlant?.shortDescription ?? null : null,
  custom_image_data_url: plant.source === 'custom' ? plant.customPlant?.image ?? null : null,
  notes: plant.notes,
  added_at: safeDateValue(plant.addedAt) ?? todayIso(),
  last_watered_at: safeDateValue(plant.lastWateredAt) ?? null,
  watering_interval_days: plant.wateringIntervalDays,
  watering_reminder_enabled: plant.wateringReminderEnabled,
  watering_reminder_time: plant.wateringReminderTime ?? '09:00',
  last_repotted_at: safeDateValue(plant.lastRepottedAt) ?? null,
  repotting_interval_months: plant.repottingIntervalMonths,
  repotting_reminder_enabled: plant.repottingReminderEnabled,
  repotting_reminder_time: plant.repottingReminderTime ?? '09:00',
});

export const loadSupabaseCollection = async (userId: string): Promise<UserPlant[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase.from('user_plants').select('*').eq('user_id', userId).order('added_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToUserPlant(row as UserPlantRow));
};

export const saveSupabaseUserPlant = async (userId: string, plant: UserPlant) => {
  if (!supabase) return;

  const { error } = await supabase.from('user_plants').upsert(userPlantToRow(userId, plant));
  if (error) throw error;
};

export const deleteSupabaseUserPlant = async (userId: string, plantId: string) => {
  if (!supabase) return;

  const { error } = await supabase.from('user_plants').delete().eq('user_id', userId).eq('id', plantId);
  if (error) throw error;
};

export const loadSupabaseSettings = async (userId: string): Promise<{ theme?: 'light' | 'dark' } | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as { theme?: 'light' | 'dark' } | null;
};

export const saveSupabaseSettings = async (userId: string, settings: { theme: 'light' | 'dark' }) => {
  if (!supabase) return;

  const { error } = await supabase.from('user_settings').upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });
  if (error) throw error;
};

export const migrateLocalDataToSupabase = async (userId: string, collection: UserPlant[], favoriteIds: string[]) => {
  const [existingCollection, existingFavorites] = await Promise.all([
    loadSupabaseCollection(userId),
    loadSupabaseFavorites(userId),
  ]);

  const existingCatalogIds = new Set(existingCollection.filter((plant) => plant.source === 'catalog').map((plant) => plant.plantId));
  const existingCustomNames = new Set(
    existingCollection
      .filter((plant) => plant.source === 'custom')
      .map((plant) => plant.customPlant?.name.trim().toLocaleLowerCase('ru-RU'))
      .filter(Boolean),
  );

  for (const plant of collection) {
    if (plant.source === 'catalog' && plant.plantId && existingCatalogIds.has(plant.plantId)) continue;
    if (plant.source === 'custom') {
      const name = plant.customPlant?.name.trim().toLocaleLowerCase('ru-RU');
      if (name && existingCustomNames.has(name)) continue;
    }
    await saveSupabaseUserPlant(userId, plant);
  }

  for (const plantId of favoriteIds) {
    if (!existingFavorites.includes(plantId)) await addSupabaseFavorite(userId, plantId);
  }
};
