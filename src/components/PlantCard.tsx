import { Link } from 'react-router-dom';
import { lightLabels } from '../utils/plants';
import type { Plant } from '../types/plant';

type PlantCardProps = {
  plant: Plant;
  isFavorite: boolean;
  onToggleFavorite: (plantId: string) => void;
  onAddToCollection: (plantId: string) => void;
};

export const PlantCard = ({ plant, isFavorite, onToggleFavorite, onAddToCollection }: PlantCardProps) => (
  <article className="plant-card">
    <div className="plant-card__media">
      {plant.image ? (
        <img className="plant-image" src={plant.image} alt={plant.name} />
      ) : (
        <div className="plant-image-placeholder" aria-hidden="true">🌿</div>
      )}
    </div>

    <div className="plant-card__content">
      <div className="plant-card__top">
        <div>
          <p className="eyebrow">комнатное растение</p>
          <h3>{plant.name}</h3>
        </div>
        <button className={`favorite-button ${isFavorite ? 'is-active' : ''}`} type="button" onClick={() => onToggleFavorite(plant.id)}>
          {isFavorite ? '⭐ В избранном' : '☆ В избранное'}
        </button>
      </div>

      <p className="plant-card__description">{plant.shortDescription}</p>

      <div className="tag-list" aria-label="Характеристики растения">
        <span>💧 Полив: раз в {plant.watering.intervalDays} дн.</span>
        <span>☀️ {lightLabels[plant.light.type]}</span>
        <span>{plant.toxicity.isToxic ? '⚠️ Ядовито' : '✅ Безопасно'}</span>
      </div>

      <div className="card-actions">
        <Link className="button button--secondary" to={`/plants/${plant.id}`}>
          Подробнее
        </Link>
        <button className="button button--primary" type="button" onClick={() => onAddToCollection(plant.id)}>
          В коллекцию
        </button>
      </div>
    </div>
  </article>
);
