import { plants } from '../data/plants';
import type { LightType, Plant } from '../types/plant';

export const lightLabels: Record<LightType, string> = {
  bright_indirect: 'яркий рассеянный свет',
  partial_shade: 'полутень',
  shade: 'тень',
};

export const getPlants = () => plants;

export const getPlantById = (id: string) => plants.find((plant) => plant.id === id);

export const filterPlants = (
  query: string,
  toxicity: 'all' | 'safe' | 'toxic',
  light: 'all' | LightType,
  sort: 'name' | 'watering',
): Plant[] => {
  const normalized = query.trim().toLocaleLowerCase('ru-RU');

  return plants
    .filter((plant) => {
      const matchesQuery =
        !normalized ||
        plant.name.toLocaleLowerCase('ru-RU').includes(normalized) ||
        plant.shortDescription.toLocaleLowerCase('ru-RU').includes(normalized);
      const matchesToxicity =
        toxicity === 'all' || (toxicity === 'safe' ? !plant.toxicity.isToxic : plant.toxicity.isToxic);
      const matchesLight = light === 'all' || plant.light.type === light;
      return matchesQuery && matchesToxicity && matchesLight;
    })
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'ru') : a.watering.intervalDays - b.watering.intervalDays));
};
