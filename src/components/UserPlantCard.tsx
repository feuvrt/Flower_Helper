import { getNextRepottingDate, getNextWateringDate, getRepottingStatus, getWateringStatus } from '../utils/reminders';
import { formatDate } from '../utils/dates';
import type { DisplayPlant, UserPlant } from '../types/plant';

type UserPlantCardProps = {
  userPlant: UserPlant;
  plant: DisplayPlant;
  onWatered: (id: string) => void;
  onRepotted: (id: string) => void;
  onEdit: (plant: UserPlant) => void;
  onDelete: (id: string) => void;
};

const wateringLabel = {
  overdue: 'Полив просрочен',
  today: 'Нужно полить сегодня',
  soon: 'Полив скоро',
  ok: 'Полив не требуется',
  done: 'Полив выполнен',
};

const repottingLabel = {
  overdue: 'Пересадка просрочена',
  today: 'Пора пересадить сегодня',
  soon: 'Пересадка скоро',
  ok: 'С пересадкой всё в порядке',
  done: 'Пересадка выполнена',
};

export const UserPlantCard = ({ userPlant, plant, onWatered, onRepotted, onEdit, onDelete }: UserPlantCardProps) => {
  const nextWatering = getNextWateringDate(userPlant);
  const nextRepotting = getNextRepottingDate(userPlant);
  const wateringStatus = getWateringStatus(nextWatering);
  const repottingStatus = getRepottingStatus(nextRepotting);
  const isCustom = userPlant.source === 'custom';

  return (
    <article className="user-card user-card--compact">
      <div className="user-card__main">
        <div className="user-card__media">
          {plant.image ? (
            <img className="user-card__image" src={plant.image} alt={plant.name} />
          ) : (
            <div className="user-card__placeholder" aria-hidden="true">🌿</div>
          )}
        </div>

        <div className="user-card__summary">
          <div className="title-line">
            <h3>{plant.name}</h3>
            {isCustom && <span className="badge">Собственное растение</span>}
          </div>
          <p>{plant.shortDescription}</p>
          <div className="status-pills">
            <span className={`status status--${wateringStatus}`}>💧 {wateringLabel[wateringStatus]}</span>
            <span className={`status status--${repottingStatus}`}>🌱 {repottingLabel[repottingStatus]}</span>
          </div>
        </div>
      </div>

      <div className="user-card__details">
        <div>
          <span>Добавлено</span>
          <strong>{formatDate(userPlant.addedAt)}</strong>
        </div>
        <div>
          <span>Полив</span>
          <strong>последний - {formatDate(userPlant.lastWateredAt)}, следующий - {formatDate(nextWatering)}</strong>
        </div>
        <div>
          <span>Пересадка</span>
          <strong>последняя - {formatDate(userPlant.lastRepottedAt)}, следующая - {formatDate(nextRepotting)}</strong>
        </div>
        <div>
          <span>Напоминания</span>
          <strong>
            полив - {userPlant.wateringReminderTime ?? '09:00'}, пересадка - {userPlant.repottingReminderTime ?? '09:00'}
          </strong>
        </div>
      </div>

      {userPlant.notes && <p className="note">{userPlant.notes}</p>}

      <div className="card-actions user-card__actions">
        <button className="button button--primary" type="button" onClick={() => onWatered(userPlant.id)}>
          Полив выполнен
        </button>
        <button className="button button--secondary" type="button" onClick={() => onRepotted(userPlant.id)}>
          Пересадка выполнена
        </button>
        <button className="button button--secondary" type="button" onClick={() => onEdit(userPlant)}>
          Редактировать
        </button>
        <button className="button button--danger" type="button" onClick={() => onDelete(userPlant.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
};
