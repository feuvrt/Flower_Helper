import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PlantCard } from '../components/PlantCard';
import { useAppContext } from '../app/App';
import { filterPlants } from '../services/plantService';
import type { LightType } from '../types/plant';

export const CatalogPage = () => {
  const { favoritePlantIds, toggleFavorite, openCollectionForm } = useAppContext();
  const [query, setQuery] = useState('');
  const [toxicity, setToxicity] = useState<'all' | 'safe' | 'toxic'>('all');
  const [light, setLight] = useState<'all' | LightType>('all');
  const [sort, setSort] = useState<'name' | 'watering'>('name');
  const visiblePlants = useMemo(() => filterPlants(query, toxicity, light, sort), [query, toxicity, light, sort]);

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">12 растений для старта</p>
        <h1>Справочник растений</h1>
        <p>Найдите растение, изучите базовый уход и добавьте его в личную коллекцию.</p>
      </div>

      <section className="filters">
        <label>
          Поиск
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, монстера" />
        </label>
        <label>
          Ядовитость
          <select value={toxicity} onChange={(event) => setToxicity(event.target.value as typeof toxicity)}>
            <option value="all">все</option>
            <option value="safe">безопасные</option>
            <option value="toxic">ядовитые</option>
          </select>
        </label>
        <label>
          Освещение
          <select value={light} onChange={(event) => setLight(event.target.value as typeof light)}>
            <option value="all">все</option>
            <option value="bright_indirect">яркий рассеянный свет</option>
            <option value="partial_shade">полутень</option>
            <option value="shade">тень</option>
          </select>
        </label>
        <label>
          Сортировка
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
            <option value="name">по названию</option>
            <option value="watering">по частоте полива</option>
          </select>
        </label>
      </section>

      {visiblePlants.length > 0 ? (
        <section className="card-grid">
          {visiblePlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              isFavorite={favoritePlantIds.includes(plant.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCollection={openCollectionForm}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="Ничего не найдено" text="Попробуйте изменить поиск или фильтры." />
      )}
    </div>
  );
};
