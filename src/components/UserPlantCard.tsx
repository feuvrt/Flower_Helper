import { lightLabels } from '../utils/plants';
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

const statusText = {
  overdue: 'просрочено',
  today: 'сегодня',
  soon: 'скоро',
  ok: 'в порядке',
  done: 'выполнено',
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
    <article className="user-card">
      <div className="user-card__media">
        {plant.image ? (
          <img className="user-card__image" src={plant.image} alt={plant.name} />
        ) : (
          <div className="plant-image-placeholder plant-image-placeholder--wide" aria-hidden="true">🌿</div>
        )}
      </div>

      <div className="user-card__header">
        <div>
          <p className="eyebrow">добавлено {formatDate(userPlant.addedAt)}</p>
          <div className="title-line">
            <h3>{plant.name}</h3>
            {isCustom && <span className="badge">Собственное растение</span>}
          </div>
          <p>{plant.shortDescription}</p>
        </div>
        <div className="status-pills">
          <span className={`status status--${wateringStatus}`}>💧 {statusText[wateringStatus]}</span>
          <span className={`status status--${repottingStatus}`}>🪴 {statusText[repottingStatus]}</span>
        </div>
      </div>

      <div className="care-description-grid">
        <section>
          <h4>Описание</h4>
          <p>{plant.description}</p>
        </section>
        <section>
          <h4>Освещение</h4>
          <p>{plant.light.text}</p>
          <strong>{lightLabels[plant.light.type]}</strong>
        </section>
        <section>
          <h4>Ядовитость</h4>
          <p>{plant.toxicity.text}</p>
          <strong>{plant.toxicity.isToxic ? 'Ядовито' : 'Безопасно'}</strong>
        </section>
        <section>
          <h4>Особенности</h4>
          <p>{plant.features.length > 0 ? plant.features.join('; ') : 'Особенности не указаны.'}</p>
        </section>
      </div>

      <p className="note">{userPlant.notes || 'Заметок пока нет.'}</p>

      <div className="care-grid">
        <div>
          <h4>{wateringLabel[wateringStatus]}</h4>
          <p>{plant.watering.text}</p>
          <p>Частота: раз в {userPlant.wateringIntervalDays} дн.</p>
          <p>Последний полив: {formatDate(userPlant.lastWateredAt)}</p>
          <p>Следующий полив: {formatDate(nextWatering)}</p>
        </div>
        <div>
          <h4>{repottingLabel[repottingStatus]}</h4>
          <p>{plant.repotting.text}</p>
          <p>Частота: раз в {userPlant.repottingIntervalMonths} мес.</p>
          <p>Последняя пересадка: {formatDate(userPlant.lastRepottedAt)}</p>
          <p>Следующая пересадка: {formatDate(nextRepotting)}</p>
        </div>
      </div>

      <div className="card-actions">
        <button className="button" type="button" onClick={() => onWatered(userPlant.id)}>
          Полив выполнен
        </button>
        <button className="button button--ghost" type="button" onClick={() => onRepotted(userPlant.id)}>
          Пересадка выполнена
        </button>
        <button className="button button--ghost" type="button" onClick={() => onEdit(userPlant)}>
          Редактировать
        </button>
        <button className="button button--danger" type="button" onClick={() => onDelete(userPlant.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
};
