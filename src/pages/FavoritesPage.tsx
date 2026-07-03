import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { PlantCard } from '../components/PlantCard';
import { useAppContext } from '../App';
import { getPlants } from '../utils/plants';

export const FavoritesPage = () => {
  const { favoritePlantIds, toggleFavorite, openCollectionForm } = useAppContext();
  const favorites = getPlants().filter((plant) => favoritePlantIds.includes(plant.id));

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">⭐ быстрый доступ</p>
        <h1>Избранное</h1>
      </div>

      {favorites.length > 0 ? (
        <section className="card-grid">
          {favorites.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              isFavorite
              onToggleFavorite={toggleFavorite}
              onAddToCollection={openCollectionForm}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="⭐"
          title="Пока нет избранных растений"
          text="Добавьте растения из справочника, чтобы не потерять!"
          action={<Link className="button" to="/catalog">Открыть справочник</Link>}
        />
      )}
    </div>
  );
};
