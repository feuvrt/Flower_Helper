import { getUserPlantDisplay } from './plants';
import { addDays, addMonths, daysUntil, todayIso } from './dates';
import type { CareTask, CareTaskStatus, UserPlant } from '../types/plant';

export const DEFAULT_REMINDER_TIME = '09:00';

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

const getTaskTitle = (type: CareTask['type'], status: CareTaskStatus) => {
  if (type === 'watering') {
    if (status === 'overdue') return 'Полив просрочен';
    if (status === 'today') return 'Нужно полить сегодня';
    if (status === 'soon') return 'Полив скоро';
    return 'Полив не требуется';
  }

  if (status === 'overdue') return 'Пересадка просрочена';
  if (status === 'today') return 'Пора пересадить сегодня';
  if (status === 'soon') return 'Пересадка скоро';
  return 'Пересадка не требуется';
};

export const getCareTasks = (collection: UserPlant[], includeOk = false): CareTask[] =>
  collection.flatMap((userPlant) => {
    const plant = getUserPlantDisplay(userPlant);
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
        plantId: userPlant.plantId,
        plantName: plant.name,
        type: 'watering',
        dueDate: wateringDate,
        status: wateringStatus,
        title: getTaskTitle('watering', wateringStatus),
        description: `Следующий полив: ${wateringDate}`,
      });
    }

    if (includeOk || (userPlant.repottingReminderEnabled && repottingStatus !== 'ok')) {
      tasks.push({
        id: `${userPlant.id}-repotting`,
        userPlantId: userPlant.id,
        plantId: userPlant.plantId,
        plantName: plant.name,
        type: 'repotting',
        dueDate: repottingDate,
        status: repottingStatus,
        title: getTaskTitle('repotting', repottingStatus),
        description: `Следующая пересадка: ${repottingDate}`,
      });
    }

    return tasks;
  }).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

export const getReminderTimeForTask = (task: CareTask, collection: UserPlant[]) => {
  const userPlant = collection.find((plant) => plant.id === task.userPlantId);
  if (!userPlant) return DEFAULT_REMINDER_TIME;
  return task.type === 'watering'
    ? userPlant.wateringReminderTime ?? DEFAULT_REMINDER_TIME
    : userPlant.repottingReminderTime ?? DEFAULT_REMINDER_TIME;
};

export const isReminderTimeReached = (time: string, now = new Date()) => {
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= time;
};

export const getNotificationTasks = (tasks: CareTask[], collection: UserPlant[]) =>
  tasks.filter((task) => {
    if (task.status !== 'overdue' && task.status !== 'today') return false;
    return isReminderTimeReached(getReminderTimeForTask(task, collection));
  });

export const getNotificationKey = (task: CareTask) => `${task.userPlantId}-${task.type}-${todayIso()}`;
