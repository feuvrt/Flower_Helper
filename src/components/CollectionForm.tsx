import { useMemo, useState } from 'react';
import { todayIso } from '../utils/dates';
import { DEFAULT_REMINDER_TIME } from '../utils/reminders';
import type { Plant, UserPlant } from '../types/plant';

type CollectionFormProps = {
  plants: Plant[];
  initialPlantId?: string;
  existingPlant?: UserPlant;
  duplicateWarning?: boolean;
  onSubmit: (plant: UserPlant) => void;
  onCancel: () => void;
};

type FormErrors = Partial<Record<'addedAt' | 'wateringIntervalDays' | 'repottingIntervalMonths', string>>;

export const CollectionForm = ({ plants, initialPlantId, existingPlant, duplicateWarning, onSubmit, onCancel }: CollectionFormProps) => {
  const plantOptions = plants;
  const initialCatalogPlant = plantOptions.find((plant) => plant.id === (existingPlant?.plantId ?? initialPlantId)) ?? plantOptions[0];
  const [plantId, setPlantId] = useState(existingPlant?.plantId ?? initialCatalogPlant.id);
  const selectedPlant = useMemo(() => plantOptions.find((plant) => plant.id === plantId) ?? initialCatalogPlant, [initialCatalogPlant, plantId, plantOptions]);
  const [addedAt, setAddedAt] = useState(existingPlant?.addedAt ?? todayIso());
  const [notes, setNotes] = useState(existingPlant?.notes ?? '');
  const [lastWateredAt, setLastWateredAt] = useState(existingPlant?.lastWateredAt ?? todayIso());
  const [wateringIntervalDays, setWateringIntervalDays] = useState(String(existingPlant?.wateringIntervalDays ?? selectedPlant.watering.intervalDays));
  const [wateringReminderEnabled, setWateringReminderEnabled] = useState(existingPlant?.wateringReminderEnabled ?? true);
  const [wateringReminderTime, setWateringReminderTime] = useState(existingPlant?.wateringReminderTime ?? DEFAULT_REMINDER_TIME);
  const [lastRepottedAt, setLastRepottedAt] = useState(existingPlant?.lastRepottedAt ?? todayIso());
  const [repottingIntervalMonths, setRepottingIntervalMonths] = useState(String(existingPlant?.repottingIntervalMonths ?? selectedPlant.repotting.intervalMonths));
  const [repottingReminderEnabled, setRepottingReminderEnabled] = useState(existingPlant?.repottingReminderEnabled ?? true);
  const [repottingReminderTime, setRepottingReminderTime] = useState(existingPlant?.repottingReminderTime ?? DEFAULT_REMINDER_TIME);
  const [errors, setErrors] = useState<FormErrors>({});

  const handlePlantChange = (newPlantId: string) => {
    const plant = plantOptions.find((item) => item.id === newPlantId);
    setPlantId(newPlantId);
    if (!existingPlant && plant) {
      setWateringIntervalDays(String(plant.watering.intervalDays));
      setRepottingIntervalMonths(String(plant.repotting.intervalMonths));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const wateringDays = Number(wateringIntervalDays);
    const repottingMonths = Number(repottingIntervalMonths);

    if (!addedAt) nextErrors.addedAt = 'Укажите дату добавления.';
    if (!Number.isFinite(wateringDays) || wateringDays <= 0) nextErrors.wateringIntervalDays = 'Интервал полива должен быть больше 0.';
    if (!Number.isFinite(repottingMonths) || repottingMonths <= 0) nextErrors.repottingIntervalMonths = 'Интервал пересадки должен быть больше 0.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      id: existingPlant?.id ?? crypto.randomUUID(),
      source: 'catalog',
      plantId,
      customPlant: undefined,
      addedAt,
      notes,
      lastWateredAt: lastWateredAt || addedAt,
      wateringIntervalDays: wateringDays,
      wateringReminderEnabled,
      wateringReminderTime,
      lastRepottedAt: lastRepottedAt || addedAt,
      repottingIntervalMonths: repottingMonths,
      repottingReminderEnabled,
      repottingReminderTime,
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {duplicateWarning && (
        <div className="warning-box">
          Это растение уже есть в коллекции. Можно добавить ещё один экземпляр, если дома их несколько.
        </div>
      )}

      <label>
        Растение из справочника
        <select value={plantId} onChange={(event) => handlePlantChange(event.target.value)} disabled={Boolean(existingPlant)}>
          {plantOptions.map((plant) => (
            <option value={plant.id} key={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label>
          Дата добавления
          <input type="date" value={addedAt} onInput={(event) => setAddedAt(event.currentTarget.value)} onChange={(event) => setAddedAt(event.target.value)} />
          {errors.addedAt && <span className="field-error">{errors.addedAt}</span>}
        </label>
        <label>
          Дата последнего полива
          <input type="date" value={lastWateredAt} onInput={(event) => setLastWateredAt(event.currentTarget.value)} onChange={(event) => setLastWateredAt(event.target.value)} />
        </label>
        <label>
          Интервал полива, дней
          <input min="1" type="number" value={wateringIntervalDays} onChange={(event) => setWateringIntervalDays(event.target.value)} />
          {errors.wateringIntervalDays && <span className="field-error">{errors.wateringIntervalDays}</span>}
        </label>
        <label>
          Напоминать о поливе
          <select value={wateringReminderEnabled ? 'yes' : 'no'} onChange={(event) => setWateringReminderEnabled(event.target.value === 'yes')}>
            <option value="yes">Включено</option>
            <option value="no">Выключено</option>
          </select>
        </label>
        <label>
          Время напоминания о поливе
          <input type="time" value={wateringReminderTime} onChange={(event) => setWateringReminderTime(event.target.value)} />
        </label>
        <label>
          Дата последней пересадки
          <input type="date" value={lastRepottedAt} onInput={(event) => setLastRepottedAt(event.currentTarget.value)} onChange={(event) => setLastRepottedAt(event.target.value)} />
        </label>
        <label>
          Интервал пересадки, месяцев
          <input min="1" type="number" value={repottingIntervalMonths} onChange={(event) => setRepottingIntervalMonths(event.target.value)} />
          {errors.repottingIntervalMonths && <span className="field-error">{errors.repottingIntervalMonths}</span>}
        </label>
        <label>
          Время напоминания о пересадке
          <input type="time" value={repottingReminderTime} onChange={(event) => setRepottingReminderTime(event.target.value)} />
        </label>
      </div>

      <label className="checkbox-line">
        <input type="checkbox" checked={repottingReminderEnabled} onChange={(event) => setRepottingReminderEnabled(event.target.checked)} />
        Включить напоминания о пересадке
      </label>

      <label>
        Заметки
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Например: стоит на восточном окне, любит душ раз в месяц" />
      </label>

      <div className="form-actions">
        <button className="button button--secondary" type="button" onClick={onCancel}>
          Отмена
        </button>
        <button className="button button--primary" type="submit">
          {existingPlant ? 'Сохранить изменения' : 'Добавить растение'}
        </button>
      </div>
    </form>
  );
};
