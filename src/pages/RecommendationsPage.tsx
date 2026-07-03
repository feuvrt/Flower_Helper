import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { getPlants } from '../utils/plants';
import { getPlantRecommendations } from '../services/recommendationService';
import type { RecommendationAnswers, RecommendationResult } from '../types/recommendation';

const STORAGE_KEY = 'plantCareRecommendationAnswers';

const defaultAnswers: RecommendationAnswers = {
  experience: 'beginner',
  light: 'unknown',
  hasPetsOrKids: true,
  wateringPreference: 'weekly',
  priority: 'easy_care',
  temperature: 'medium',
  considerOwnedPlants: true,
};

const readSavedAnswers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecommendationAnswers) : null;
  } catch {
    return null;
  }
};

const statusLabels: Record<RecommendationResult['status'], string> = {
  excellent: 'Отлично подходит',
  medium: 'Подходит с оговорками',
  low: 'Скорее не подходит',
};

export const RecommendationsPage = () => {
  const savedAnswers = useMemo(() => readSavedAnswers(), []);
  const [answers, setAnswers] = useState<RecommendationAnswers>(savedAnswers ?? defaultAnswers);
  const [showResults, setShowResults] = useState(Boolean(savedAnswers));
  const { collection, openCollectionForm } = useAppContext();
  const plants = getPlants();

  const results = useMemo(() => {
    if (!showResults) return [];
    return getPlantRecommendations(plants, collection, answers);
  }, [answers, collection, plants, showResults]);

  const updateAnswer = <K extends keyof RecommendationAnswers>(key: K, value: RecommendationAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    setShowResults(true);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers(defaultAnswers);
    setShowResults(false);
  };

  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">🌿 rule-based подбор</p>
        <h1>Подбор растения</h1>
        <p>Ответьте на несколько вопросов, а приложение рассчитает процент совпадения для каждого растения из справочника.</p>
      </div>

      <form className="recommendation-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Анкета предпочтений</h2>
          <div className="form-grid">
            <label>
              Опыт ухода за растениями
              <select value={answers.experience} onChange={(event) => updateAnswer('experience', event.target.value as RecommendationAnswers['experience'])}>
                <option value="beginner">Новичок</option>
                <option value="some_experience">Есть небольшой опыт</option>
                <option value="advanced">Опытный цветовод</option>
              </select>
            </label>

            <label>
              Освещение дома
              <select value={answers.light} onChange={(event) => updateAnswer('light', event.target.value as RecommendationAnswers['light'])}>
                <option value="bright_indirect">Яркий рассеянный свет</option>
                <option value="partial_shade">Полутень</option>
                <option value="shade">Тень</option>
                <option value="unknown">Не знаю</option>
              </select>
            </label>

            <label>
              Есть ли дома животные или маленькие дети
              <select value={answers.hasPetsOrKids ? 'yes' : 'no'} onChange={(event) => updateAnswer('hasPetsOrKids', event.target.value === 'yes')}>
                <option value="yes">Да</option>
                <option value="no">Нет</option>
              </select>
            </label>

            <label>
              Как часто вы готовы поливать растения
              <select value={answers.wateringPreference} onChange={(event) => updateAnswer('wateringPreference', event.target.value as RecommendationAnswers['wateringPreference'])}>
                <option value="often">Часто</option>
                <option value="weekly">Примерно раз в неделю</option>
                <option value="rarely">Редко</option>
              </select>
            </label>

            <label>
              Главный приоритет
              <select value={answers.priority} onChange={(event) => updateAnswer('priority', event.target.value as RecommendationAnswers['priority'])}>
                <option value="easy_care">Неприхотливость</option>
                <option value="decorative">Красивый внешний вид</option>
                <option value="safe">Безопасность</option>
                <option value="compact">Компактность</option>
              </select>
            </label>

            <label>
              Какая температура обычно в помещении?
              <select value={answers.temperature} onChange={(event) => updateAnswer('temperature', event.target.value as RecommendationAnswers['temperature'])}>
                <option value="high">Высокая — дома часто тепло или жарко</option>
                <option value="medium">Средняя — обычная комнатная температура</option>
                <option value="low">Низкая — дома прохладно</option>
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

          <div className="form-actions">
            <button className="button" type="submit">Подобрать растения</button>
            <button className="button button--ghost" type="button" onClick={handleReset}>Сбросить подбор</button>
          </div>
        </section>
      </form>

      {!showResults && (
        <section className="soft-panel">
          <h2>Анкета ещё не заполнена</h2>
          <p>Выберите условия дома и предпочтения, затем нажмите «Подобрать растения». Результаты будут рассчитаны без сервера и внешних API.</p>
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
              <span className="recommendation-status recommendation-status--excellent">75–100% — отлично подходит</span>
              <span className="recommendation-status recommendation-status--medium">50–74% — подходит с оговорками</span>
              <span className="recommendation-status recommendation-status--low">0–49% — скорее не подходит</span>
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
                      <Link className="button button--ghost" to={`/plants/${plant.id}`}>Открыть карточку</Link>
                      <button className="button" type="button" onClick={() => openCollectionForm(plant.id)}>Добавить в коллекцию</button>
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
