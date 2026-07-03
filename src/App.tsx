import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { CollectionForm } from './components/CollectionForm';
import { CustomPlantForm } from './components/CustomPlantForm';
import { Layout } from './components/Layout';
import { Modal } from './components/Modal';
import type { ToastMessage } from './components/Toast';
import { getUserPlantDisplay } from './utils/plants';
import { getCareTasks } from './utils/reminders';
import { normalizeCollection, storage } from './utils/storage';
import type { UserPlant } from './types/plant';
import { todayIso } from './utils/dates';
import { CatalogPage } from './pages/CatalogPage';
import { CollectionPage } from './pages/CollectionPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { PlantPage } from './pages/PlantPage';
import { RecommendationsPage } from './pages/RecommendationsPage';

export type AppContextValue = {
  favoritePlantIds: string[];
  collection: UserPlant[];
  careTasks: ReturnType<typeof getCareTasks>;
  toggleFavorite: (plantId: string) => void;
  openCollectionForm: (plantId?: string) => void;
  openCustomPlantForm: () => void;
  editUserPlant: (plant: UserPlant) => void;
  markWatered: (id: string) => void;
  markRepotted: (id: string) => void;
  deleteUserPlant: (id: string) => void;
  exportCollection: () => void;
  importCollection: (file: File) => void;
  resetUserData: () => void;
  notify: (text: string, type?: ToastMessage['type']) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

const AppContent = () => {
  const [favoritePlantIds, setFavoritePlantIds] = useState<string[]>(() => storage.getFavorites());
  const [collection, setCollection] = useState<UserPlant[]>(() => storage.getCollection());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (storage.getTheme() === 'dark' ? 'dark' : 'light'));
  const [isCollectionFormOpen, setCollectionFormOpen] = useState(false);
  const [isCustomPlantFormOpen, setCustomPlantFormOpen] = useState(false);
  const [formPlantId, setFormPlantId] = useState<string | undefined>();
  const [editingCatalogPlant, setEditingCatalogPlant] = useState<UserPlant | undefined>();
  const [editingCustomPlant, setEditingCustomPlant] = useState<UserPlant | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();

  const careTasks = useMemo(() => getCareTasks(collection), [collection]);

  useEffect(() => storage.setFavorites(favoritePlantIds), [favoritePlantIds]);
  useEffect(() => storage.setCollection(collection), [collection]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.setTheme(theme);
  }, [theme]);

  const closeForms = () => {
    setFormPlantId(undefined);
    setEditingCatalogPlant(undefined);
    setEditingCustomPlant(undefined);
    setCollectionFormOpen(false);
    setCustomPlantFormOpen(false);
  };

  const notify = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, text, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  };

  const toggleFavorite = (plantId: string) => {
    setFavoritePlantIds((ids) => {
      const exists = ids.includes(plantId);
      notify(exists ? 'Растение удалено из избранного.' : 'Растение добавлено в избранное.');
      return exists ? ids.filter((id) => id !== plantId) : [...ids, plantId];
    });
  };

  const openCollectionForm = (plantId?: string) => {
    closeForms();
    setFormPlantId(plantId);
    setCollectionFormOpen(true);
  };

  const openCustomPlantForm = () => {
    closeForms();
    setCustomPlantFormOpen(true);
  };

  const handleSavePlant = (plant: UserPlant) => {
    const isEditing = collection.some((item) => item.id === plant.id);
    setCollection((items) => (isEditing ? items.map((item) => (item.id === plant.id ? plant : item)) : [...items, plant]));
    closeForms();
    notify(isEditing ? 'Изменения сохранены.' : plant.source === 'custom' ? 'Собственное растение добавлено в коллекцию.' : 'Растение добавлено в мою коллекцию.');
    navigate('/collection');
  };

  const markWatered = (id: string) => {
    setCollection((items) => items.map((item) => (item.id === id ? { ...item, lastWateredAt: todayIso() } : item)));
    notify('Полив отмечен выполненным.');
  };

  const markRepotted = (id: string) => {
    setCollection((items) => items.map((item) => (item.id === id ? { ...item, lastRepottedAt: todayIso() } : item)));
    notify('Пересадка отмечена выполненной.');
  };

  const deleteUserPlant = (id: string) => {
    const userPlant = collection.find((item) => item.id === id);
    const name = userPlant ? getUserPlantDisplay(userPlant)?.name ?? 'растение' : 'растение';
    if (!window.confirm(`Удалить ${name} из коллекции?`)) return;
    setCollection((items) => items.filter((item) => item.id !== id));
    notify('Растение удалено из коллекции.', 'warning');
  };

  const exportCollection = () => {
    const blob = new Blob([JSON.stringify({ favoritePlantIds, collection }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plant-care-collection.json';
    link.click();
    URL.revokeObjectURL(url);
    notify('Коллекция экспортирована.');
  };

  const importCollection = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { favoritePlantIds?: string[]; collection?: UserPlant[] };
        if (!Array.isArray(parsed.collection)) throw new Error('Wrong format');
        setCollection(normalizeCollection(parsed.collection));
        if (Array.isArray(parsed.favoritePlantIds)) setFavoritePlantIds(parsed.favoritePlantIds);
        notify('Коллекция импортирована.');
      } catch {
        notify('Не удалось импортировать файл. Проверьте формат JSON.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const resetUserData = () => {
    if (!window.confirm('Сбросить избранное и коллекцию? Это действие нельзя отменить.')) return;
    storage.resetUserData();
    setFavoritePlantIds([]);
    setCollection([]);
    notify('Пользовательские данные сброшены.', 'warning');
  };

  const duplicateWarning = Boolean(formPlantId && collection.some((item) => item.source === 'catalog' && item.plantId === formPlantId));

  const contextValue: AppContextValue = {
    favoritePlantIds,
    collection,
    careTasks,
    toggleFavorite,
    openCollectionForm,
    openCustomPlantForm,
    editUserPlant: (plant) => {
      closeForms();
      if (plant.source === 'custom') {
        setEditingCustomPlant(plant);
        setCustomPlantFormOpen(true);
      } else {
        setEditingCatalogPlant(plant);
        setCollectionFormOpen(true);
      }
    },
    markWatered,
    markRepotted,
    deleteUserPlant,
    exportCollection,
    importCollection,
    resetUserData,
    notify,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Layout theme={theme} onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))} toasts={toasts} />
      {(isCollectionFormOpen || editingCatalogPlant) && (
        <Modal title={editingCatalogPlant ? 'Редактировать растение' : 'Добавить растение в коллекцию'} onClose={closeForms}>
          <CollectionForm
            initialPlantId={formPlantId}
            existingPlant={editingCatalogPlant}
            duplicateWarning={duplicateWarning}
            onSubmit={handleSavePlant}
            onCancel={closeForms}
          />
        </Modal>
      )}
      {(isCustomPlantFormOpen || editingCustomPlant) && (
        <Modal title={editingCustomPlant ? 'Редактировать собственное растение' : 'Добавить собственное растение'} onClose={closeForms}>
          <CustomPlantForm existingPlant={editingCustomPlant} onSubmit={handleSavePlant} onCancel={closeForms} />
        </Modal>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppContext must be used inside AppContext');
  return value;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppContent />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/plants/:id" element={<PlantPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
