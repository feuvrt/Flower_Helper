import { Link } from 'react-router-dom';
import { lightLabels } from '../services/plantService';
import type { Plant } from '../types/plant';

type PlantCardProps = {
  plant: Plant;
  isFavorite: boolean;
  onToggleFavorite: (plantId: string) => void;
  onAddToCollection: (plantId: string) => void;
};

export const PlantCard = ({ plant, isFavorite, onToggleFavorite, onAddToCollection }: PlantCardProps) => (
  <article className="plant-card">
    <div className="plant-card__top">
      <div>
        <p className="eyebrow">🪴 комнатное растение</p>
        <h3>{plant.name}</h3>
      </div>
      <button className={`favorite-button ${isFavorite ? 'is-active' : ''}`} type="button" onClick={() => onToggleFavorite(plant.id)}>
        {isFavorite ? '⭐ В избранном' : '☆ В избранное'}
      </button>
    </div>
    <p>{plant.shortDescription}</p>
    <div className="tag-list">
      <span>💧 раз в {plant.watering.intervalDays} дн.</span>
      <span>☀️ {lightLabels[plant.light.type]}</span>
      <span>{plant.toxicity.isToxic ? '⚠️ ядовитое' : '✅ безопасное'}</span>
    </div>
    <div className="card-actions">
      <Link className="button button--ghost" to={`/plants/${plant.id}`}>
        Подробнее
      </Link>
      <button className="button" type="button" onClick={() => onAddToCollection(plant.id)}>
        Добавить в мою коллекцию
      </button>
    </div>
  </article>
);
