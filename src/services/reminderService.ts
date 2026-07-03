import { getPlantById } from './plantService';
import { addDays, addMonths, daysUntil } from '../utils/dateUtils';
import type { CareTask, CareTaskStatus, UserPlant } from '../types/plant';

export const getNextWateringDate = (plant: UserPlant) => addDays(plant.lastWateredAt || plant.addedAt, plant.wateringIntervalDays);

export const getNextRepottingDate = (plant: UserPlant) => addMonths(plant.lastRepottedAt || plant.addedAt, plant.repottingIntervalMonths);

export const getWateringStatus = (dateIso: string): CareTaskStatus => {
  const diff = daysUntil(dateIso);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 2) return 'soon';
  return 'ok';
};

export const getRepottingStatus = (dateIso: string): CareTaskStatus => {
  const diff = daysUntil(dateIso);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 14) return 'soon';
  return 'ok';
};

export const getCareTasks = (collection: UserPlant[], includeOk = false): CareTask[] =>
  collection.flatMap((userPlant) => {
    const plant = getPlantById(userPlant.plantId);
    if (!plant) return [];

    const wateringDate = getNextWateringDate(userPlant);
    const repottingDate = getNextRepottingDate(userPlant);
    const wateringStatus = getWateringStatus(wateringDate);
    const repottingStatus = getRepottingStatus(repottingDate);

    const tasks: CareTask[] = [];

    if (includeOk || (userPlant.wateringReminderEnabled && wateringStatus !== 'ok')) {
      tasks.push({
        id: `${userPlant.id}-watering`,
        userPlantId: userPlant.id,
        plantId: plant.id,
        plantName: plant.name,
        type: 'watering',
        dueDate: wateringDate,
        status: wateringStatus,
        title: wateringStatus === 'overdue' ? 'Полив просрочен' : wateringStatus === 'today' ? 'Нужно полить сегодня' : wateringStatus === 'soon' ? 'Полив скоро' : 'Полив не требуется',
        description: `Следующий полив: ${wateringDate}`,
      });
    }

    if (includeOk || (userPlant.repottingReminderEnabled && repottingStatus !== 'ok')) {
      tasks.push({
        id: `${userPlant.id}-repotting`,
        userPlantId: userPlant.id,
        plantId: plant.id,
        plantName: plant.name,
        type: 'repotting',
        dueDate: repottingDate,
        status: repottingStatus,
        title: repottingStatus === 'overdue' ? 'Пересадка просрочена' : repottingStatus === 'today' ? 'Пора пересадить сегодня' : repottingStatus === 'soon' ? 'Пересадка скоро' : 'Пересадка не требуется',
        description: `Следующая пересадка: ${repottingDate}`,
      });
    }

    return tasks;
  }).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
