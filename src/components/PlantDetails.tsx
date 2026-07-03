import { lightLabels } from '../utils/plants';
import type { Plant } from '../types/plant';

type PlantDetailsProps = {
  plant: Plant;
  isFavorite: boolean;
  onToggleFavorite: (plantId: string) => void;
  onAddToCollection: (plantId: string) => void;
};

export const PlantDetails = ({ plant, isFavorite, onToggleFavorite, onAddToCollection }: PlantDetailsProps) => (
  <article className="details">
    <div className="details__hero">
      <div>
        <p className="eyebrow">🌿 карточка растения</p>
        <h1>{plant.name}</h1>
        <p>{plant.description}</p>
      </div>
      {plant.image ? (
        <img className="details-image" src={plant.image} alt={plant.name} />
      ) : (
        <div className="plant-visual" aria-hidden="true">🌿</div>
      )}
    </div>

    <div className="details__actions">
      <button className={`button ${isFavorite ? 'button--warning' : ''}`} type="button" onClick={() => onToggleFavorite(plant.id)}>
        {isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      </button>
      <button className="button" type="button" onClick={() => onAddToCollection(plant.id)}>
        Добавить в мою коллекцию
      </button>
    </div>

    <div className="info-grid">
      <section>
        <h2>💧 Полив</h2>
        <p>{plant.watering.text}</p>
        <strong>Ориентир: раз в {plant.watering.intervalDays} дней.</strong>
      </section>
      <section>
        <h2>☀️ Освещение</h2>
        <p>{plant.light.text}</p>
        <strong>{lightLabels[plant.light.type]}</strong>
      </section>
      <section>
        <h2>🌱 Пересадка</h2>
        <p>{plant.repotting.text}</p>
        <strong>Ориентир: раз в {plant.repotting.intervalMonths} мес.</strong>
      </section>
      <section>
        <h2>⚠️ Ядовитость</h2>
        <p>{plant.toxicity.text}</p>
        <strong>{plant.toxicity.isToxic ? 'Требует осторожности' : 'Подходит для спокойного дома'}</strong>
      </section>
    </div>

    <section className="feature-panel">
      <h2>Особенности ухода</h2>
      <ul>
        {plant.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  </article>
);
