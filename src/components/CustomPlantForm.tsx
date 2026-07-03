import { useMemo, useState } from 'react';
import type { CustomPlantInfo, LightType, UserPlant } from '../types/plant';
import { todayIso } from '../utils/dates';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png'];

type CustomPlantFormProps = {
  existingPlant?: UserPlant;
  onSubmit: (plant: UserPlant) => void;
  onCancel: () => void;
};

type FormErrors = Partial<Record<
  | 'name'
  | 'shortDescription'
  | 'description'
  | 'wateringText'
  | 'wateringIntervalDays'
  | 'lightText'
  | 'repottingText'
  | 'repottingIntervalMonths'
  | 'toxicityText'
  | 'addedAt'
  | 'image',
  string
>>;

const getInitialCustomPlant = (existingPlant?: UserPlant): CustomPlantInfo => existingPlant?.customPlant ?? {
  name: '',
  shortDescription: '',
  description: '',
  image: '',
  watering: { intervalDays: 7, text: '' },
  light: { type: 'bright_indirect', text: '' },
  repotting: { intervalMonths: 12, text: '' },
  toxicity: { isToxic: false, text: '' },
  features: [],
};

export const CustomPlantForm = ({ existingPlant, onSubmit, onCancel }: CustomPlantFormProps) => {
  const initialPlant = useMemo(() => getInitialCustomPlant(existingPlant), [existingPlant]);
  const [name, setName] = useState(initialPlant.name);
  const [shortDescription, setShortDescription] = useState(initialPlant.shortDescription);
  const [description, setDescription] = useState(initialPlant.description);
  const [image, setImage] = useState(initialPlant.image ?? '');
  const [wateringText, setWateringText] = useState(initialPlant.watering.text);
  const [wateringIntervalDays, setWateringIntervalDays] = useState(String(existingPlant?.wateringIntervalDays ?? initialPlant.watering.intervalDays));
  const [lightText, setLightText] = useState(initialPlant.light.text);
  const [lightType, setLightType] = useState<LightType>(initialPlant.light.type);
  const [repottingText, setRepottingText] = useState(initialPlant.repotting.text);
  const [repottingIntervalMonths, setRepottingIntervalMonths] = useState(String(existingPlant?.repottingIntervalMonths ?? initialPlant.repotting.intervalMonths));
  const [isToxic, setToxic] = useState(initialPlant.toxicity.isToxic);
  const [toxicityText, setToxicityText] = useState(initialPlant.toxicity.text);
  const [featuresText, setFeaturesText] = useState(initialPlant.features.join('\n'));
  const [addedAt, setAddedAt] = useState(existingPlant?.addedAt ?? todayIso());
  const [notes, setNotes] = useState(existingPlant?.notes ?? '');
  const [lastWateredAt, setLastWateredAt] = useState(existingPlant?.lastWateredAt ?? todayIso());
  const [wateringReminderEnabled, setWateringReminderEnabled] = useState(existingPlant?.wateringReminderEnabled ?? true);
  const [lastRepottedAt, setLastRepottedAt] = useState(existingPlant?.lastRepottedAt ?? todayIso());
  const [repottingReminderEnabled, setRepottingReminderEnabled] = useState(existingPlant?.repottingReminderEnabled ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleImageChange = (file?: File) => {
    setErrors((current) => ({ ...current, image: undefined }));
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({ ...current, image: 'Файл изображения должен быть в формате WebP, JPG или PNG.' }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({ ...current, image: 'Изображение слишком большое. Выберите файл до 2 МБ.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const wateringDays = Number(wateringIntervalDays);
    const repottingMonths = Number(repottingIntervalMonths);

    if (!name.trim()) nextErrors.name = 'Название не может быть пустым.';
    if (!shortDescription.trim()) nextErrors.shortDescription = 'Краткое описание не может быть пустым.';
    if (!description.trim()) nextErrors.description = 'Полное описание не может быть пустым.';
    if (!wateringText.trim()) nextErrors.wateringText = 'Укажите рекомендации по поливу.';
    if (!Number.isFinite(wateringDays) || wateringDays <= 0) nextErrors.wateringIntervalDays = 'Интервал полива должен быть больше 0.';
    if (!lightText.trim()) nextErrors.lightText = 'Укажите рекомендации по освещению.';
    if (!repottingText.trim()) nextErrors.repottingText = 'Укажите информацию о пересадке.';
    if (!Number.isFinite(repottingMonths) || repottingMonths <= 0) nextErrors.repottingIntervalMonths = 'Интервал пересадки должен быть больше 0.';
    if (!toxicityText.trim()) nextErrors.toxicityText = 'Добавьте описание ядовитости.';
    if (!addedAt) nextErrors.addedAt = 'Дата добавления обязательна.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      id: existingPlant?.id ?? crypto.randomUUID(),
      source: 'custom',
      plantId: undefined,
      customPlant: {
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        image,
        watering: { intervalDays: wateringDays, text: wateringText.trim() },
        light: { type: lightType, text: lightText.trim() },
        repotting: { intervalMonths: repottingMonths, text: repottingText.trim() },
        toxicity: { isToxic, text: toxicityText.trim() },
        features: featuresText.split('\n').map((feature) => feature.trim()).filter(Boolean),
      },
      addedAt,
      notes,
      lastWateredAt: lastWateredAt || addedAt,
      wateringIntervalDays: wateringDays,
      wateringReminderEnabled,
      lastRepottedAt: lastRepottedAt || addedAt,
      repottingIntervalMonths: repottingMonths,
      repottingReminderEnabled,
    });
  };

  return (
    <form className="form custom-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <h3>Основная информация</h3>
        <div className="form-grid">
          <label>
            Название растения
            <input value={name} onChange={(event) => setName(event.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label>
            Краткое описание
            <input value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
            {errors.shortDescription && <span className="field-error">{errors.shortDescription}</span>}
          </label>
        </div>
        <label>
          Полное описание
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </label>
        <label>
          Изображение растения
          <input type="file" accept=".webp,.jpg,.jpeg,.png,image/webp,image/jpeg,image/png" onChange={(event) => handleImageChange(event.target.files?.[0])} />
          {errors.image && <span className="field-error">{errors.image}</span>}
        </label>
        {image ? <img className="image-preview" src={image} alt="Предпросмотр растения" /> : <div className="image-preview image-preview--placeholder">🌿</div>}
      </section>

      <section className="form-section">
        <h3>Уход</h3>
        <div className="form-grid">
          <label>
            Рекомендации по поливу
            <textarea value={wateringText} onChange={(event) => setWateringText(event.target.value)} />
            {errors.wateringText && <span className="field-error">{errors.wateringText}</span>}
          </label>
          <label>
            Интервал полива, дней
            <input min="1" type="number" value={wateringIntervalDays} onChange={(event) => setWateringIntervalDays(event.target.value)} />
            {errors.wateringIntervalDays && <span className="field-error">{errors.wateringIntervalDays}</span>}
          </label>
          <label>
            Рекомендации по освещению
            <textarea value={lightText} onChange={(event) => setLightText(event.target.value)} />
            {errors.lightText && <span className="field-error">{errors.lightText}</span>}
          </label>
          <label>
            Тип освещения
            <select value={lightType} onChange={(event) => setLightType(event.target.value as LightType)}>
              <option value="bright_indirect">Яркий рассеянный свет</option>
              <option value="partial_shade">Полутень</option>
              <option value="shade">Тень</option>
            </select>
          </label>
          <label>
            Информация о пересадке
            <textarea value={repottingText} onChange={(event) => setRepottingText(event.target.value)} />
            {errors.repottingText && <span className="field-error">{errors.repottingText}</span>}
          </label>
          <label>
            Интервал пересадки, месяцев
            <input min="1" type="number" value={repottingIntervalMonths} onChange={(event) => setRepottingIntervalMonths(event.target.value)} />
            {errors.repottingIntervalMonths && <span className="field-error">{errors.repottingIntervalMonths}</span>}
          </label>
          <label>
            Ядовитость
            <select value={isToxic ? 'toxic' : 'safe'} onChange={(event) => setToxic(event.target.value === 'toxic')}>
              <option value="safe">Безопасно</option>
              <option value="toxic">Ядовито</option>
            </select>
          </label>
          <label>
            Описание ядовитости
            <textarea value={toxicityText} onChange={(event) => setToxicityText(event.target.value)} />
            {errors.toxicityText && <span className="field-error">{errors.toxicityText}</span>}
          </label>
        </div>
        <label>
          Дополнительные особенности ухода
          <textarea value={featuresText} onChange={(event) => setFeaturesText(event.target.value)} placeholder="Каждую особенность вводите с новой строки" />
        </label>
      </section>

      <section className="form-section">
        <h3>Напоминания</h3>
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
            Дата последней пересадки
            <input type="date" value={lastRepottedAt} onInput={(event) => setLastRepottedAt(event.currentTarget.value)} onChange={(event) => setLastRepottedAt(event.target.value)} />
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={wateringReminderEnabled} onChange={(event) => setWateringReminderEnabled(event.target.checked)} />
            Включить напоминания о поливе
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={repottingReminderEnabled} onChange={(event) => setRepottingReminderEnabled(event.target.checked)} />
            Включить напоминания о пересадке
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Заметки</h3>
        <label>
          Заметки пользователя
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
      </section>

      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Отмена
        </button>
        <button className="button" type="submit">
          {existingPlant ? 'Сохранить собственное растение' : 'Добавить собственное растение'}
        </button>
      </div>
    </form>
  );
};
