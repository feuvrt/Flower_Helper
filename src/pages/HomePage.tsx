import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReminderList } from '../components/ReminderList';
import { useAppContext } from '../App';
import mainPageImage from '../assets/main_page_image.webp';

export const HomePage = () => {
  const {
    favoritePlantIds,
    collection,
    careTasks,
    notificationPermission,
    requestNotificationPermission,
    checkNotifications,
  } = useAppContext();
  const urgentTasks = careTasks.filter((task) => task.status === 'overdue' || task.status === 'today' || task.status === 'soon');
  const importantTasks = useMemo(() => urgentTasks.filter((task) => task.status === 'overdue' || task.status === 'today'), [urgentTasks]);

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">🌿 локальный помощник</p>
          <h1>Уход за растениями без лишней суеты</h1>
          <p>
            Справочник, личная коллекция, избранное, подбор растений и напоминания о поливе и пересадке. Данные остаются в вашем браузере, аккаунт не нужен.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/catalog">Открыть справочник</Link>
            <Link className="button button--custom" to="/recommendations">Подобрать растение</Link>
            <Link className="button button--secondary" to="/collection">Моя коллекция</Link>
            <Link className="button button--secondary" to="/favorites">Избранное</Link>
          </div>
        </div>
        <div className="hero__visual">
          <img src={mainPageImage} alt="Помощник по уходу за растениями" />
        </div>
      </section>

      <section className="stats-grid" aria-label="Статистика">
        <article><span>🪴</span><strong>{collection.length}</strong><p>растений в коллекции</p></article>
        <article><span>⭐</span><strong>{favoritePlantIds.length}</strong><p>в избранном</p></article>
        <article><span>💧</span><strong>{urgentTasks.length}</strong><p>актуальных задач</p></article>
      </section>

      <section className="notification-banner">
        <div>
          <h2>Уведомления по уходу</h2>
          <p>Уведомления работают, когда приложение открыто в браузере. Если браузерные уведомления запрещены, задачи всё равно будут видны внутри приложения.</p>
          {importantTasks.length > 0 && <p>Сейчас срочных задач: {importantTasks.length}.</p>}
        </div>
        <div className="notification-actions">
          {notificationPermission !== 'granted' && (
            <button className="button button--primary" type="button" onClick={requestNotificationPermission}>
              Разрешить уведомления
            </button>
          )}
          <button className="button button--secondary" type="button" onClick={() => checkNotifications(true)}>
            Проверить уведомления
          </button>
        </div>
      </section>

      <ReminderList tasks={urgentTasks.slice(0, 6)} compact onCheckNotifications={() => checkNotifications(true)} />
    </div>
  );
};
