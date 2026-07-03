import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dates';
import type { CareTask } from '../types/plant';

type ReminderListProps = {
  tasks: CareTask[];
  compact?: boolean;
};

const statusIcon = {
  overdue: '⚠️',
  today: '💧',
  soon: '⏳',
  ok: '✅',
  done: '✅',
};

export const ReminderList = ({ tasks, compact = false }: ReminderListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="soft-panel">
        <h2>Актуальные задачи</h2>
        <p>На сегодня всё спокойно. Можно просто полюбоваться зеленью.</p>
      </div>
    );
  }

  return (
    <section className="reminders">
      <div className="section-heading">
        <div>
          <p className="eyebrow">актуальный уход</p>
          <h2>{compact ? 'Ближайшие напоминания' : 'Актуальные задачи'}</h2>
        </div>
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
            <Link className="button button--ghost" to="/collection">
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
