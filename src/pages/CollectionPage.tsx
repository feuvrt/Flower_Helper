import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { ReminderList } from '../components/ReminderList';
import { UserPlantCard } from '../components/UserPlantCard';
import { useAppContext } from '../App';
import { getUserPlantDisplay } from '../utils/plants';

export const CollectionPage = () => {
  const {
    collection,
    careTasks,
    openCollectionForm,
    openCustomPlantForm,
    editUserPlant,
    markWatered,
    markRepotted,
    deleteUserPlant,
    exportCollection,
    importCollection,
    resetUserData,
    checkNotifications,
  } = useAppContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="page-stack">
      <div className="page-title page-title--with-actions">
        <div>
          <p className="eyebrow">🪴 домашние растения</p>
          <h1>Моя коллекция</h1>
          <p>Здесь хранятся заметки, даты ухода и напоминания для ваших растений.</p>
        </div>
        <div className="toolbar">
          <button className="button button--primary" type="button" onClick={() => openCollectionForm()}>
            Добавить из справочника
          </button>
          <button className="button button--custom" type="button" onClick={openCustomPlantForm}>
            + Добавить собственное растение
          </button>
          <button className="button button--secondary" type="button" onClick={exportCollection}>
            Экспорт JSON
          </button>
          <button className="button button--secondary" type="button" onClick={() => inputRef.current?.click()}>
            Импорт JSON
          </button>
          <button className="button button--danger" type="button" onClick={resetUserData}>
            Сбросить данные
          </button>
          <input
            hidden
            ref={inputRef}
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importCollection(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
      </div>

      <ReminderList tasks={careTasks} onCheckNotifications={() => checkNotifications(true)} />

      {collection.length > 0 ? (
        <section className="collection-list">
          {collection.map((userPlant) => {
            const plant = getUserPlantDisplay(userPlant);
            if (!plant) return null;
            return (
              <UserPlantCard
                key={userPlant.id}
                userPlant={userPlant}
                plant={plant}
                onWatered={markWatered}
                onRepotted={markRepotted}
                onEdit={editUserPlant}
                onDelete={deleteUserPlant}
              />
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="Коллекция пока пустая"
          text="Добавьте первое растение из справочника или создайте собственное растение вручную."
          action={
            <div className="hero__actions">
              <Link className="button button--primary" to="/catalog">Открыть справочник</Link>
              <button className="button button--custom" type="button" onClick={openCustomPlantForm}>
                + Добавить собственное растение
              </button>
            </div>
          }
        />
      )}
    </div>
  );
};
