import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { getPlantRecommendations } from '../services/recommendationService';
import type { RecommendationAnswers, RecommendationResult } from '../types/recommendation';
import { getPlants } from '../utils/plants';

type RecommendationFormAnswers = {
  experience: RecommendationAnswers['experience'] | '';
  light: RecommendationAnswers['light'] | '';
  hasPetsOrKids: '' | 'yes' | 'no';
  wateringPreference: RecommendationAnswers['wateringPreference'] | '';
  priority: RecommendationAnswers['priority'] | '';
  temperature: RecommendationAnswers['temperature'] | '';
  considerOwnedPlants: boolean;
};

const defaultAnswers: RecommendationFormAnswers = {
  experience: '',
  light: '',
  hasPetsOrKids: '',
  wateringPreference: '',
  priority: '',
  temperature: '',
  considerOwnedPlants: true,
};

const statusLabels: Record<RecommendationResult['status'], string> = {
  excellent: 'Отлично подходит',
  medium: 'Подходит с оговорками',
  low: 'Скорее не подходит',
};

export const RecommendationsPage = () => {
  const [answers, setAnswers] = useState<RecommendationFormAnswers>(defaultAnswers);
  const [showResults, setShowResults] = useState(false);
  const [formError, setFormError] = useState('');
  const { collection, openCollectionForm } = useAppContext();
  const plants = getPlants();

  const recommendationAnswers = useMemo<RecommendationAnswers | null>(() => {
    if (
      !answers.experience ||
      !answers.light ||
      !answers.hasPetsOrKids ||
      !answers.wateringPreference ||
      !answers.priority ||
      !answers.temperature
    ) {
      return null;
    }

    return {
      experience: answers.experience,
      light: answers.light,
      hasPetsOrKids: answers.hasPetsOrKids === 'yes',
      wateringPreference: answers.wateringPreference,
      priority: answers.priority,
      temperature: answers.temperature,
      considerOwnedPlants: answers.considerOwnedPlants,
    };
  }, [answers]);

  const results = useMemo(() => {
    if (!showResults || !recommendationAnswers) return [];
    return getPlantRecommendations(plants, collection, recommendationAnswers);
  }, [collection, plants, recommendationAnswers, showResults]);

  const updateAnswer = <K extends keyof RecommendationFormAnswers>(key: K, value: RecommendationFormAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setShowResults(false);
    setFormError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!recommendationAnswers) {
      setFormError('Заполните все вопросы анкеты, чтобы получить подбор растений.');
      setShowResults(false);
      return;
    }

    setFormError('');
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers(defaultAnswers);
    setShowResults(false);
    setFormError('');
  };

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">📝 анкета </p>
        <h1>Подбор растения</h1>
        <p>Ответьте на несколько вопросов, чтобы мы рассчитали, что вам может подойти</p>
      </div>

      <form className="recommendation-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Анкета предпочтений</h2>
          <div className="form-grid">
            <label>
              Опыт ухода за растениями
              <select
                value={answers.experience}
                required
                onChange={(event) => updateAnswer('experience', event.target.value as RecommendationFormAnswers['experience'])}
              >
                <option value="" disabled>Выберите опыт</option>
                <option value="beginner">Новичок</option>
                <option value="some_experience">Есть небольшой опыт</option>
                <option value="advanced">Опытный цветовод</option>
              </select>
            </label>

            <label>
              Освещение дома
              <select
                value={answers.light}
                required
                onChange={(event) => updateAnswer('light', event.target.value as RecommendationFormAnswers['light'])}
              >
                <option value="" disabled>Выберите освещение</option>
                <option value="bright_indirect">Яркий рассеянный свет</option>
                <option value="partial_shade">Полутень</option>
                <option value="shade">Тень</option>
                <option value="unknown">Не знаю</option>
              </select>
            </label>

            <label>
              Есть ли дома животные или маленькие дети
              <select
                value={answers.hasPetsOrKids}
                required
                onChange={(event) => updateAnswer('hasPetsOrKids', event.target.value as RecommendationFormAnswers['hasPetsOrKids'])}
              >
                <option value="" disabled>Выберите ответ</option>
                <option value="yes">Да</option>
                <option value="no">Нет</option>
              </select>
            </label>

            <label>
              Как часто вы готовы поливать растения
              <select
                value={answers.wateringPreference}
                required
                onChange={(event) => updateAnswer('wateringPreference', event.target.value as RecommendationFormAnswers['wateringPreference'])}
              >
                <option value="" disabled>Выберите частоту</option>
                <option value="often">Часто</option>
                <option value="weekly">Примерно раз в неделю</option>
                <option value="rarely">Редко</option>
              </select>
            </label>

            <label>
              Главный приоритет
              <select
                value={answers.priority}
                required
                onChange={(event) => updateAnswer('priority', event.target.value as RecommendationFormAnswers['priority'])}
              >
                <option value="" disabled>Выберите приоритет</option>
                <option value="easy_care">Неприхотливость</option>
                <option value="decorative">Красивый внешний вид</option>
                <option value="safe">Безопасность</option>
                <option value="compact">Компактность</option>
              </select>
            </label>

            <label>
              Какая температура обычно в помещении?
              <select
                value={answers.temperature}
                required
                onChange={(event) => updateAnswer('temperature', event.target.value as RecommendationFormAnswers['temperature'])}
              >
                <option value="" disabled>Выберите температуру</option>
                <option value="high">Высокая - дома часто тепло или жарко</option>
                <option value="medium">Средняя - обычная комнатная температура</option>
                <option value="low">Низкая - дома прохладно</option>
              </select>
            </label>
          </div>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={answers.considerOwnedPlants}
              onChange={(event) => updateAnswer('considerOwnedPlants', event.target.checked)}
            />
            Учитывать мою текущую коллекцию
          </label>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button className="button button--primary" type="submit">Подобрать растения</button>
            <button className="button button--secondary" type="button" onClick={handleReset}>Сбросить подбор</button>
          </div>
        </section>
      </form>

      {!showResults && (
        <section className="soft-panel">
          <h2>Анкета ещё не заполнена</h2>
          <p>Выберите условия дома и предпочтения, затем нажмите "Подобрать растения"</p>
        </section>
      )}

      {showResults && plants.length === 0 && (
        <section className="soft-panel">
          <h2>Справочник пуст</h2>
          <p>Сейчас нет растений, по которым можно построить рекомендации.</p>
        </section>
      )}

      {showResults && results.length > 0 && (
        <section className="recommendations">
          <div className="soft-panel">
            <h2>Рейтинг растений</h2>
            <p>Мы сравнили ваши ответы со всеми растениями из справочника и отсортировали их по проценту совпадения.</p>
            <p>При подборе учитываются освещение, безопасность, опыт ухода, частота полива, главный приоритет, температура в помещении и ваша текущая коллекция.</p>
            <div className="legend">
              <span className="recommendation-status recommendation-status--excellent">75-100% - отлично подходит</span>
              <span className="recommendation-status recommendation-status--medium">50-74% - подходит с оговорками</span>
              <span className="recommendation-status recommendation-status--low">0-49% - скорее не подходит</span>
            </div>
          </div>

          <div className="recommendation-list">
            {results.map((result) => {
              const plant = plants.find((item) => item.id === result.plantId);
              if (!plant) return null;

              return (
                <article className={`recommendation-card recommendation-card--${result.status}`} key={result.plantId}>
                  <img className="recommendation-card__image" src={plant.image} alt={plant.name} />
                  <div className="recommendation-card__body">
                    <div className="recommendation-card__header">
                      <div>
                        <p className="eyebrow">место в рейтинге</p>
                        <h2>{plant.name}</h2>
                        <p>{plant.shortDescription}</p>
                      </div>
                      <div className="match-box">
                        <strong>{result.percent}%</strong>
                        <span>совпадение</span>
                      </div>
                    </div>

                    <div className="recommendation-card__badges">
                      <span className={`recommendation-status recommendation-status--${result.status}`}>
                        {statusLabels[result.status]}
                      </span>
                      {result.status === 'excellent' && <span className="badge">Лучшее совпадение</span>}
                      {result.isAlreadyOwned && <span className="badge">Уже есть в вашей коллекции</span>}
                    </div>

                    <div className="reason-grid">
                      <section>
                        <h3>Плюсы для вас</h3>
                        <ul>
                          {result.positiveReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <h3>Минусы для вас</h3>
                        {result.negativeReasons.length > 0 ? (
                          <ul>
                            {result.negativeReasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Явных минусов по вашим ответам не найдено.</p>
                        )}
                      </section>
                    </div>

                    <div className="card-actions">
                      <Link className="button button--secondary" to={`/plants/${plant.id}`}>Открыть карточку</Link>
                      <button className="button button--primary" type="button" onClick={() => openCollectionForm(plant.id)}>Добавить в коллекцию</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
