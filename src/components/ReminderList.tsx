import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dates';
import type { CareTask } from '../types/plant';

type ReminderListProps = {
  tasks: CareTask[];
  compact?: boolean;
  onCheckNotifications?: () => void;
};

const statusIcon = {
  overdue: '⚠️',
  today: '💧',
  soon: '⏳',
  ok: '✅',
  done: '✅',
};

export const ReminderList = ({ tasks, compact = false, onCheckNotifications }: ReminderListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="soft-panel">
        <div className="section-heading">
          <div>
            <h2>Актуальные задачи</h2>
            <p>На сегодня всё спокойно. Можно просто полюбоваться зеленью.</p>
            <p className="hint-text">Уведомления работают, когда приложение открыто в браузере.</p>
          </div>
          {onCheckNotifications && (
            <button className="button button--secondary" type="button" onClick={onCheckNotifications}>
              Проверить уведомления
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="reminders">
      <div className="section-heading">
        <div>
          <p className="eyebrow">актуальный уход</p>
          <h2>{compact ? 'Ближайшие напоминания' : 'Актуальные задачи'}</h2>
          <p className="hint-text">Уведомления работают, когда приложение открыто в браузере.</p>
        </div>
        {onCheckNotifications && (
          <button className="button button--secondary" type="button" onClick={onCheckNotifications}>
            Проверить уведомления
          </button>
        )}
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <article className={`task task--${task.status}`} key={task.id}>
            <div className="task__icon">{statusIcon[task.status]}</div>
            <div>
              <h3>{task.title}</h3>
              <p>
                {task.plantName} · {task.type === 'watering' ? 'полив' : 'пересадка'} · {formatDate(task.dueDate)}
              </p>
            </div>
            <Link className="button button--secondary" to="/collection">
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
