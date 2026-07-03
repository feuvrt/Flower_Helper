import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { PlantDetails } from '../components/PlantDetails';
import { useAppContext } from '../App';

export const PlantPage = () => {
  const { id } = useParams();
  const { plants, favoritePlantIds, toggleFavorite, openCollectionForm } = useAppContext();
  const plant = id ? plants.find((item) => item.id === id) : undefined;

  if (!plant) {
    return (
      <EmptyState
        title="Растение не найдено"
        text="Возможно, ссылка устарела или растение пока не добавлено в справочник."
        action={<Link className="button" to="/catalog">Вернуться в справочник</Link>}
      />
    );
  }

  return (
    <PlantDetails
      plant={plant}
      isFavorite={favoritePlantIds.includes(plant.id)}
      onToggleFavorite={toggleFavorite}
      onAddToCollection={openCollectionForm}
    />
  );
};
