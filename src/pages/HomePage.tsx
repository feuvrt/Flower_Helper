import { Link } from 'react-router-dom';
import { ReminderList } from '../components/ReminderList';
import { useNotifications } from '../hooks/useNotifications';
import { useAppContext } from '../app/App';

export const HomePage = () => {
  const { favoritePlantIds, collection, careTasks } = useAppContext();
  const { permission, requestPermission } = useNotifications(careTasks);
  const urgentTasks = careTasks.filter((task) => task.status === 'overdue' || task.status === 'today' || task.status === 'soon');

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

      {permission !== 'granted' && (
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
