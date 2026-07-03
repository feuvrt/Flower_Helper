import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { CollectionForm } from './components/CollectionForm';
import { CustomPlantForm } from './components/CustomPlantForm';
import { Layout } from './components/Layout';
import { Modal } from './components/Modal';
import type { ToastMessage } from './components/Toast';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import {
  addSupabaseFavorite,
  deleteSupabaseUserPlant,
  loadSupabaseCollection,
  loadSupabaseFavorites,
  loadSupabasePlants,
  loadSupabaseSettings,
  migrateLocalDataToSupabase,
  removeSupabaseFavorite,
  saveSupabaseSettings,
  saveSupabaseUserPlant,
} from './services/supabaseData';
import { getPlants, getUserPlantDisplay } from './utils/plants';
import { getCareTasks, getNotificationKey, getNotificationTasks } from './utils/reminders';
import { normalizeCollection, storage } from './utils/storage';
import type { Plant, UserPlant } from './types/plant';
import { todayIso } from './utils/dates';
import { AuthPage } from './pages/AuthPage';
import { CatalogPage } from './pages/CatalogPage';
import { CollectionPage } from './pages/CollectionPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { IdentifyPage } from './pages/IdentifyPage';
import { PlantPage } from './pages/PlantPage';
import { RecommendationsPage } from './pages/RecommendationsPage';

export type StorageMode = 'guest' | 'account';

export type AppContextValue = {
  plants: Plant[];
  plantsSource: 'local' | 'supabase';
  favoritePlantIds: string[];
  collection: UserPlant[];
  careTasks: ReturnType<typeof getCareTasks>;
  notificationPermission: NotificationPermission | 'unsupported';
  storageMode: StorageMode;
  syncMessage: string;
  hasLocalDataToMigrate: boolean;
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
  migrateLocalData: () => Promise<void>;
  dismissLocalMigration: () => void;
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
  requestNotificationPermission: () => Promise<void>;
  checkNotifications: (manual?: boolean) => void;
  notify: (text: string, type?: ToastMessage['type']) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

const AppContent = () => {
  const [plants, setPlants] = useState<Plant[]>(() => getPlants());
  const [plantsSource, setPlantsSource] = useState<'local' | 'supabase'>('local');
  const [favoritePlantIds, setFavoritePlantIds] = useState<string[]>(() => storage.getFavorites());
  const [collection, setCollection] = useState<UserPlant[]>(() => storage.getCollection());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (storage.getTheme() === 'dark' ? 'dark' : 'light'));
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState(
    isSupabaseConfigured ? 'Гостевой режим: данные хранятся только на этом устройстве.' : 'Supabase не настроен, используется локальное хранилище.',
  );
  const [hasLocalDataToMigrate, setHasLocalDataToMigrate] = useState(false);
  const [isCollectionFormOpen, setCollectionFormOpen] = useState(false);
  const [isCustomPlantFormOpen, setCustomPlantFormOpen] = useState(false);
  const [formPlantId, setFormPlantId] = useState<string | undefined>();
  const [editingCatalogPlant, setEditingCatalogPlant] = useState<UserPlant | undefined>();
  const [editingCustomPlant, setEditingCustomPlant] = useState<UserPlant | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported ? Notification.permission : 'unsupported',
  );
  const navigate = useNavigate();

  const storageMode: StorageMode = user && supabase ? 'account' : 'guest';
  const careTasks = useMemo(() => getCareTasks(collection), [collection]);

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, text, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPlants = async () => {
      if (!supabase) {
        setPlants(getPlants());
        setPlantsSource('local');
        return;
      }

      try {
        const remotePlants = await loadSupabasePlants();
        if (!isMounted) return;

        if (remotePlants.length > 0) {
          setPlants(remotePlants);
          setPlantsSource('supabase');
        } else {
          setPlants(getPlants());
          setPlantsSource('local');
          setSyncMessage('Таблица plants пока пустая, используется локальный справочник.');
        }
      } catch (error) {
        console.error('Supabase plants load failed:', error);
        if (!isMounted) return;
        setPlants(getPlants());
        setPlantsSource('local');
        setSyncMessage('Ошибка загрузки справочника из Supabase, используется локальный справочник.');
      }
    };

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAccountData = async () => {
      if (!user || !supabase) {
        setSyncMessage(
          isSupabaseConfigured ? 'Гостевой режим: данные хранятся только на этом устройстве.' : 'Supabase не настроен, используется локальное хранилище.',
        );
        setFavoritePlantIds(storage.getFavorites());
        setCollection(storage.getCollection());
        setHasLocalDataToMigrate(false);
        return;
      }

      try {
        const [remoteFavorites, remoteCollection, settings] = await Promise.all([
          loadSupabaseFavorites(user.id),
          loadSupabaseCollection(user.id),
          loadSupabaseSettings(user.id).catch((error) => {
            console.error('Supabase settings load failed:', error);
            return null;
          }),
        ]);

        if (!isMounted) return;

        setFavoritePlantIds(remoteFavorites);
        setCollection(remoteCollection);
        if (settings?.theme === 'dark' || settings?.theme === 'light') setTheme(settings.theme);
        setSyncMessage('Данные синхронизируются с аккаунтом.');

        const localFavorites = storage.getFavorites();
        const localCollection = storage.getCollection();
        setHasLocalDataToMigrate(localFavorites.length > 0 || localCollection.length > 0);
      } catch (error) {
        console.error('Supabase account data load failed:', error);
        if (!isMounted) return;
        setSyncMessage('Ошибка синхронизации. Данные временно сохранены локально.');
        setFavoritePlantIds(storage.getFavorites());
        setCollection(storage.getCollection());
      }
    };

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (storageMode === 'guest') storage.setFavorites(favoritePlantIds);
  }, [favoritePlantIds, storageMode]);

  useEffect(() => {
    if (storageMode === 'guest') storage.setCollection(collection);
  }, [collection, storageMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.setTheme(theme);
    if (storageMode === 'account' && user) {
      saveSupabaseSettings(user.id, { theme }).catch((error) => {
        console.error('Supabase settings save failed:', error);
        setSyncMessage('Ошибка синхронизации настроек. Тема сохранена локально.');
      });
    }
  }, [theme, storageMode, user]);

  const closeForms = () => {
    setFormPlantId(undefined);
    setEditingCatalogPlant(undefined);
    setEditingCustomPlant(undefined);
    setCollectionFormOpen(false);
    setCustomPlantFormOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase не настроен. Проверьте .env.');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    notify('Вы вошли в аккаунт.');
    navigate('/');
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase не настроен. Проверьте .env.');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    notify('Регистрация выполнена.');
    return data.session ? undefined : 'Проверьте почту: Supabase может запросить подтверждение email.';
  };

  const signOut = async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      notify('Не удалось выйти из аккаунта.', 'warning');
      return;
    }

    setSession(null);
    setUser(null);
    notify('Вы вышли из аккаунта.');
    navigate('/');
  };

  const migrateLocalData = async () => {
    if (!user || !supabase) return;

    try {
      await migrateLocalDataToSupabase(user.id, storage.getCollection(), storage.getFavorites());
      const [remoteFavorites, remoteCollection] = await Promise.all([loadSupabaseFavorites(user.id), loadSupabaseCollection(user.id)]);
      setFavoritePlantIds(remoteFavorites);
      setCollection(remoteCollection);
      setHasLocalDataToMigrate(false);
      notify('Локальные данные перенесены в аккаунт.');
    } catch (error) {
      console.error('Supabase local data migration failed:', error);
      notify('Не удалось перенести локальные данные. Попробуйте позже.', 'warning');
    }
  };

  const dismissLocalMigration = () => setHasLocalDataToMigrate(false);

  const checkNotifications = useCallback(
    (manual = false) => {
      const tasksForNotification = getNotificationTasks(careTasks, collection);
      const shownKeys = storage.getShownNotifications();
      const newTasks = tasksForNotification.filter((task) => !shownKeys.includes(getNotificationKey(task)));

      if (newTasks.length === 0) {
        if (manual) notify('Сейчас нет задач для уведомления.', 'warning');
        return;
      }

      if (notificationsSupported && notificationPermission === 'granted') {
        new Notification('Помощник по уходу за растениями', {
          body: `Актуальных задач: ${newTasks.length}. Проверьте полив и пересадку.`,
        });
      }

      notify(`Актуальных задач для уведомления: ${newTasks.length}.`);
      storage.setShownNotifications([...shownKeys, ...newTasks.map(getNotificationKey)]);
    },
    [careTasks, collection, notificationPermission, notificationsSupported, notify],
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!notificationsSupported) {
      setNotificationPermission('unsupported');
      notify('Браузерные уведомления не поддерживаются. Задачи останутся внутри приложения.', 'warning');
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      notify('Уведомления разрешены.');
      window.setTimeout(() => checkNotifications(false), 0);
    } else {
      notify('Браузерные уведомления не разрешены. Задачи будут видны в приложении.', 'warning');
    }
  }, [checkNotifications, notificationsSupported, notify]);

  useEffect(() => {
    checkNotifications(false);
    const timer = window.setInterval(() => checkNotifications(false), 60_000);
    return () => window.clearInterval(timer);
  }, [checkNotifications]);

  const toggleFavorite = (plantId: string) => {
    const exists = favoritePlantIds.includes(plantId);
    const nextIds = exists ? favoritePlantIds.filter((id) => id !== plantId) : [...favoritePlantIds, plantId];
    setFavoritePlantIds(nextIds);
    notify(exists ? 'Растение удалено из избранного.' : 'Растение добавлено в избранное.');

    if (storageMode === 'account' && user) {
      const action = exists ? removeSupabaseFavorite(user.id, plantId) : addSupabaseFavorite(user.id, plantId);
      action.catch((error) => {
        console.error('Supabase favorite sync failed:', error);
        setSyncMessage('Ошибка синхронизации. Данные временно сохранены локально.');
        notify('Не удалось синхронизировать избранное.', 'warning');
      });
    }
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

  const savePlantToCurrentStorage = async (plant: UserPlant) => {
    if (storageMode === 'account' && user) await saveSupabaseUserPlant(user.id, plant);
  };

  const handleSavePlant = async (plant: UserPlant) => {
    const isEditing = collection.some((item) => item.id === plant.id);
    setCollection((items) => (isEditing ? items.map((item) => (item.id === plant.id ? plant : item)) : [...items, plant]));

    try {
      await savePlantToCurrentStorage(plant);
      closeForms();
      notify(
        isEditing
          ? 'Изменения сохранены.'
          : plant.source === 'custom'
            ? 'Собственное растение добавлено в коллекцию.'
            : 'Растение добавлено в мою коллекцию.',
      );
      navigate('/collection');
    } catch (error) {
      console.error('Supabase plant save failed:', error);
      setSyncMessage('Ошибка синхронизации. Данные временно сохранены локально.');
      notify('Не удалось синхронизировать растение с аккаунтом.', 'warning');
    }
  };

  const markWatered = (id: string) => {
    const plant = collection.find((item) => item.id === id);
    if (!plant) return;
    const updated = { ...plant, lastWateredAt: todayIso() };
    setCollection((items) => items.map((item) => (item.id === id ? updated : item)));
    if (storageMode === 'account' && user) {
      saveSupabaseUserPlant(user.id, updated).catch((error) => {
        console.error('Supabase watering sync failed:', error);
        notify('Не удалось синхронизировать полив.', 'warning');
      });
    }
    notify('Полив отмечен выполненным.');
  };

  const markRepotted = (id: string) => {
    const plant = collection.find((item) => item.id === id);
    if (!plant) return;
    const updated = { ...plant, lastRepottedAt: todayIso() };
    setCollection((items) => items.map((item) => (item.id === id ? updated : item)));
    if (storageMode === 'account' && user) {
      saveSupabaseUserPlant(user.id, updated).catch((error) => {
        console.error('Supabase repotting sync failed:', error);
        notify('Не удалось синхронизировать пересадку.', 'warning');
      });
    }
    notify('Пересадка отмечена выполненной.');
  };

  const deleteUserPlant = (id: string) => {
    const userPlant = collection.find((item) => item.id === id);
    const name = userPlant ? getUserPlantDisplay(userPlant, plants)?.name ?? 'растение' : 'растение';
    if (!window.confirm(`Удалить ${name} из коллекции?`)) return;

    setCollection((items) => items.filter((item) => item.id !== id));
    if (storageMode === 'account' && user) {
      deleteSupabaseUserPlant(user.id, id).catch((error) => {
        console.error('Supabase plant delete failed:', error);
        notify('Не удалось синхронизировать удаление.', 'warning');
      });
    }
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
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { favoritePlantIds?: string[]; collection?: UserPlant[] };
        if (!Array.isArray(parsed.collection)) throw new Error('Wrong format');
        const nextCollection = normalizeCollection(parsed.collection);
        setCollection(nextCollection);
        if (Array.isArray(parsed.favoritePlantIds)) setFavoritePlantIds(parsed.favoritePlantIds);
        if (storageMode === 'account' && user) {
          for (const plant of nextCollection) await saveSupabaseUserPlant(user.id, plant);
        }
        notify('Коллекция импортирована.');
      } catch (error) {
        console.error('Collection import failed:', error);
        notify('Не удалось импортировать файл. Проверьте формат JSON.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const resetUserData = () => {
    if (!window.confirm('Сбросить избранное и коллекцию на этом устройстве? Это действие нельзя отменить.')) return;
    storage.resetUserData();
    setFavoritePlantIds([]);
    setCollection([]);
    notify('Пользовательские данные сброшены.', 'warning');
  };

  const duplicateWarning = Boolean(formPlantId && collection.some((item) => item.source === 'catalog' && item.plantId === formPlantId));

  const contextValue: AppContextValue = {
    plants,
    plantsSource,
    favoritePlantIds,
    collection,
    careTasks,
    notificationPermission,
    storageMode,
    syncMessage,
    hasLocalDataToMigrate,
    user,
    session,
    authLoading,
    signIn,
    signUp,
    signOut,
    migrateLocalData,
    dismissLocalMigration,
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
    requestNotificationPermission,
    checkNotifications,
    notify,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Layout
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        userEmail={user?.email}
        onSignOut={signOut}
        toasts={toasts}
      />
      {(isCollectionFormOpen || editingCatalogPlant) && (
        <Modal title={editingCatalogPlant ? 'Редактировать растение' : 'Добавить растение в коллекцию'} onClose={closeForms}>
          <CollectionForm
            plants={plants}
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
  <HashRouter>
    <Routes>
      <Route element={<AppContent />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/plants/:id" element={<PlantPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/identify" element={<IdentifyPage />} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
