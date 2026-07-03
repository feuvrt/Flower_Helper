import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReminderList } from '../components/ReminderList';
import { useAppContext } from '../App';

export const HomePage = () => {
  const { favoritePlantIds, collection, careTasks } = useAppContext();
  const urgentTasks = careTasks.filter((task) => task.status === 'overdue' || task.status === 'today' || task.status === 'soon');
  const importantTasks = useMemo(() => urgentTasks.filter((task) => task.status === 'overdue' || task.status === 'today'), [urgentTasks]);
  const notificationsSupported = 'Notification' in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported ? Notification.permission : 'unsupported',
  );

  const requestPermission = async () => {
    if (!notificationsSupported) {
      setNotificationPermission('unsupported');
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationPermission(result);
  };

  useEffect(() => {
    if (!notificationsSupported || notificationPermission !== 'granted' || importantTasks.length === 0) return;

    const key = `plant-care-notified-${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) return;

    new Notification('Помощник по уходу за растениями', {
      body: `Актуальных задач: ${importantTasks.length}. Проверьте полив и пересадку.`,
    });
    sessionStorage.setItem(key, 'true');
  }, [importantTasks, notificationPermission, notificationsSupported]);

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">🌿 локальный помощник</p>
          <h1>Уход за растениями без лишней суеты</h1>
          <p>
            Справочник, личная коллекция, избранное и напоминания о поливе и пересадке. Данные остаются в вашем браузере, аккаунт не нужен.
          </p>
          <div className="hero__actions">
            <Link className="button" to="/catalog">Открыть справочник</Link>
            <Link className="button button--custom" to="/recommendations">Подобрать растение</Link>
            <Link className="button button--ghost" to="/collection">Моя коллекция</Link>
            <Link className="button button--ghost" to="/favorites">Избранное</Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <span>🪴</span>
          <strong>PlantCare</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Статистика">
        <article><span>🪴</span><strong>{collection.length}</strong><p>растений в коллекции</p></article>
        <article><span>⭐</span><strong>{favoritePlantIds.length}</strong><p>в избранном</p></article>
        <article><span>💧</span><strong>{urgentTasks.length}</strong><p>актуальных задач</p></article>
      </section>

      {notificationPermission !== 'granted' && (
        <section className="notification-banner">
          <div>
            <h2>Разрешить уведомления</h2>
            <p>Браузер сможет показать напоминание при открытом приложении, если есть срочные задачи.</p>
          </div>
          <button className="button" type="button" onClick={requestPermission}>
            Разрешить уведомления
          </button>
        </section>
      )}

      <ReminderList tasks={urgentTasks.slice(0, 6)} compact />
    </div>
  );
};
