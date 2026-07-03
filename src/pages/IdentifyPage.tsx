import { useEffect, useRef, useState } from 'react';
import { PlantCard } from '../components/PlantCard';
import { useAppContext } from '../App';
import { identifyPlantByImage, type NormalizedIdentificationResult, type PlantNetIdentificationResponse } from '../services/plantNetApi';
import type { Plant } from '../types/plant';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

type MatchResult = {
  plant: Plant;
  sourceResult: NormalizedIdentificationResult;
};

const matchRules: Array<{ plantId: string; keywords: string[] }> = [
  { plantId: 'monstera', keywords: ['monstera', 'монстера'] },
  { plantId: 'sansevieria', keywords: ['sansevieria', 'dracaena trifasciata', 'snake plant', 'сансевиерия'] },
  { plantId: 'ficus-benjamina', keywords: ['ficus benjamina', 'weeping fig', 'фикус'] },
  { plantId: 'spathiphyllum', keywords: ['spathiphyllum', 'peace lily', 'спатифиллум'] },
  { plantId: 'zamioculcas', keywords: ['zamioculcas', 'zanzibar gem', 'zz plant', 'замиокулькас', 'замиокулкас'] },
  { plantId: 'chlorophytum', keywords: ['chlorophytum', 'spider plant', 'хлорофитум'] },
  { plantId: 'cactus', keywords: ['cactaceae', 'cactus', 'кактус'] },
  { plantId: 'phalaenopsis', keywords: ['phalaenopsis', 'moth orchid', 'orchid', 'орхидея'] },
  { plantId: 'peperomia', keywords: ['peperomia', 'пеперомия'] },
  { plantId: 'dracaena', keywords: ['dracaena', 'драцена'] },
  { plantId: 'aloe-vera', keywords: ['aloe vera', 'aloe', 'алоэ'] },
  { plantId: 'anthurium', keywords: ['anthurium', 'антуриум'] },
];

const getResultSearchText = (result: NormalizedIdentificationResult) =>
  [
    result.bestMatch,
    result.scientificName,
    result.genus,
    result.family,
    ...result.commonNames,
  ].join(' ').toLocaleLowerCase('ru-RU');

const findMatchForResult = (result: NormalizedIdentificationResult, plants: Plant[]) => {
  const searchText = getResultSearchText(result);
  const rule = matchRules.find((item) => item.keywords.some((keyword) => searchText.includes(keyword.toLocaleLowerCase('ru-RU'))));
  return rule ? plants.find((plant) => plant.id === rule.plantId) : undefined;
};

const findCatalogMatch = (response: PlantNetIdentificationResponse, plants: Plant[]): MatchResult | undefined => {
  for (const result of response.results.slice(0, 5)) {
    const plant = findMatchForResult(result, plants);
    if (plant) return { plant, sourceResult: result };
  }
  return undefined;
};

const formatFileSize = (size: number) => `${(size / 1024 / 1024).toFixed(2)} МБ`;

export const IdentifyPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identificationResult, setIdentificationResult] = useState<PlantNetIdentificationResponse | null>(null);
  const [matchedPlant, setMatchedPlant] = useState<MatchResult | null>(null);
  const { plants, favoritePlantIds, toggleFavorite, openCollectionForm, openCustomPlantForm } = useAppContext();
  const bestResult = matchedPlant?.sourceResult ?? identificationResult?.bestResult;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetResult = () => {
    setError('');
    setIdentificationResult(null);
    setMatchedPlant(null);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    resetResult();
    if (inputRef.current) inputRef.current.value = '';
  };

  const validateAndSetFile = (file?: File) => {
    if (!file) return;
    resetResult();

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Можно загрузить только изображение JPG или PNG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Файл слишком большой. Выберите изображение до 8 МБ.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleIdentify = async () => {
    if (!selectedFile) {
      setError('Сначала выберите фото растения.');
      return;
    }

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Можно загрузить только изображение JPG или PNG.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Файл слишком большой. Выберите изображение до 8 МБ.');
      return;
    }

    setLoading(true);
    resetResult();

    try {
      const response = await identifyPlantByImage(selectedFile);
      setIdentificationResult(response);
      setMatchedPlant(findCatalogMatch(response, plants) ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Не удалось распознать растение. Попробуйте другое фото.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="page-stack">
      <div className="page-title page-title--with-actions">
        <div>
          <p className="eyebrow">🔍 фото растения</p>
          <h1>Распознать растение</h1>
          <p></p>
        </div>
      </div>

      <section className="identify-layout">
        <div className="identify-panel">
          <div>
            <h2>Загрузите фото</h2>
            <p>Формат: JPG или PNG.</p>
          </div>

          <div
            className={`upload-zone ${previewUrl ? 'upload-zone--filled' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <img className="identify-preview" src={previewUrl} alt="Выбранное фото растения" />
            ) : (
              <div className="upload-placeholder">
                <span>🔍</span>
                <h3>Загрузите фото растения</h3>
                <p>Перетащите изображение сюда или выберите файл</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => validateAndSetFile(event.target.files?.[0])}
          />

          {selectedFile && (
            <div className="file-meta">
              <span>Файл</span>
              <strong>{selectedFile.name}</strong>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="card-actions">
            <button className="button button--secondary" type="button" onClick={() => inputRef.current?.click()}>
              {selectedFile ? 'Выбрать другое фото' : 'Выбрать фото'}
            </button>
            {selectedFile && (
              <button className="button button--primary" type="button" onClick={handleIdentify} disabled={isLoading}>
                {isLoading ? 'Распознаём...' : 'Распознать растение'}
              </button>
            )}
            {selectedFile && (
              <button className="button button--secondary" type="button" onClick={clearFile} disabled={isLoading}>
                Очистить
              </button>
            )}
          </div>

          <p className="hint-text">Распознавание работает через Pl@ntNet API.</p>
        </div>

        <div className="identify-panel identify-panel--result">
          <h2>Результат распознавания</h2>

          {!isLoading && !identificationResult && !error && (
            <div className="identify-empty">
              <span>❔</span>
              <p>Здесь будет результат распознавания растения</p>
            </div>
          )}

          {isLoading && (
            <div className="identify-empty">
              <span>⏳</span>
              <p>Распознаём растение...</p>
            </div>
          )}

          {identificationResult && bestResult && (
            <div className="identify-result">
              <div className="match-box">
                <strong>{bestResult.percent}%</strong>
                <span>уверенность</span>
              </div>

              {matchedPlant ? (
                <>
                  <h3>Вероятнее всего, это:</h3>
                  <PlantCard
                    plant={matchedPlant.plant}
                    isFavorite={favoritePlantIds.includes(matchedPlant.plant.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCollection={openCollectionForm}
                  />
                </>
              ) : (
                <div className="soft-panel identify-unmatched">
                  <h3>Растение распознано, но его пока нет в справочнике</h3>
                  <p>Pl@ntNet предполагает: <strong>{bestResult.bestMatch}</strong></p>
                  {bestResult.scientificName && <p>Научное название: <strong>{bestResult.scientificName}</strong></p>}
                  {bestResult.commonNames.length > 0 && <p>Другие названия: {bestResult.commonNames.join(', ')}</p>}
                  <p>Вы можете добавить это растение вручную в свою коллекцию.</p>
                  <button className="button button--primary" type="button" onClick={openCustomPlantForm}>
                    Добавить вручную
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
