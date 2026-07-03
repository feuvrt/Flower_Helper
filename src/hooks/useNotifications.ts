import { useEffect, useMemo, useState } from 'react';
import type { CareTask } from '../types/plant';

export const useNotifications = (tasks: CareTask[]) => {
  const supported = 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(supported ? Notification.permission : 'unsupported');
  const importantTasks = useMemo(() => tasks.filter((task) => task.status === 'overdue' || task.status === 'today'), [tasks]);

  const requestPermission = async () => {
    if (!supported) return setPermission('unsupported');
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  useEffect(() => {
    if (!supported || permission !== 'granted' || importantTasks.length === 0) return;
    const key = `plant-care-notified-${new Date().toISOString().slice(0, 10)}`;
    const alreadyNotified = sessionStorage.getItem(key);
    if (alreadyNotified) return;

    new Notification('Помощник по уходу за растениями', {
      body: `Актуальных задач: ${importantTasks.length}. Проверьте полив и пересадку.`,
    });
    sessionStorage.setItem(key, 'true');
  }, [importantTasks, permission, supported]);

  return { supported, permission, requestPermission };
};
