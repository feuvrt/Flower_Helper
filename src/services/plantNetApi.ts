export type NormalizedIdentificationResult = {
  bestMatch: string;
  score: number;
  percent: number;
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  raw: unknown;
};

export type PlantNetIdentificationResponse = {
  bestResult?: NormalizedIdentificationResult;
  results: NormalizedIdentificationResult[];
  raw: unknown;
};

type PlantNetApiResult = {
  score?: number;
  species?: {
    scientificName?: string;
    scientificNameWithoutAuthor?: string;
    commonNames?: string[];
    genus?: {
      scientificNameWithoutAuthor?: string;
      scientificName?: string;
    };
    family?: {
      scientificNameWithoutAuthor?: string;
      scientificName?: string;
    };
  };
};

type PlantNetApiResponse = {
  bestMatch?: string;
  results?: PlantNetApiResult[];
};

const getSpeciesName = (result: PlantNetApiResult) =>
  result.species?.scientificNameWithoutAuthor ||
  result.species?.scientificName ||
  '';

const normalizeResult = (result: PlantNetApiResult, bestMatch?: string): NormalizedIdentificationResult => {
  const score = result.score ?? 0;
  const scientificName = getSpeciesName(result);

  return {
    bestMatch: bestMatch || scientificName || result.species?.commonNames?.[0] || 'Неизвестное растение',
    score,
    percent: Math.max(0, Math.min(100, Math.round(score * 100))),
    scientificName,
    commonNames: result.species?.commonNames ?? [],
    genus: result.species?.genus?.scientificNameWithoutAuthor || result.species?.genus?.scientificName || '',
    family: result.species?.family?.scientificNameWithoutAuthor || result.species?.family?.scientificName || '',
    raw: result,
  };
};

export async function identifyPlantByImage(file: File): Promise<PlantNetIdentificationResponse> {
  const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;

  if (!apiKey) {
    throw new Error('API-ключ Pl@ntNet не найден. Проверьте файл .env.');
  }

  const formData = new FormData();
  formData.append('images', file);
  formData.append('organs', 'auto');

  const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=ru&nb-results=5`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Не удалось распознать растение. Попробуйте другое фото.');
  }

  const data = (await response.json()) as PlantNetApiResponse;
  const normalizedResults = (data.results ?? []).map((result, index) => normalizeResult(result, index === 0 ? data.bestMatch : undefined));

  if (normalizedResults.length === 0) {
    throw new Error('Pl@ntNet не смог уверенно распознать растение. Попробуйте фото листа или цветка крупным планом.');
  }

  return {
    bestResult: normalizedResults[0],
    results: normalizedResults,
    raw: data,
  };
}
