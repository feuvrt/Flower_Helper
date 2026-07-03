import type { Plant, UserPlant } from '../types/plant';
import type { RecommendationAnswers, RecommendationResult, RecommendationStatus, RecommendationTags } from '../types/recommendation';

const MAX_SCORE = 115;

const defaultTags: RecommendationTags = {
  difficulty: 'medium',
  size: 'medium',
  decorativeLevel: 2,
  isPetFriendly: false,
  temperature: {
    preferred: 'medium',
    tolerated: ['medium'],
  },
};

const addReason = (reasons: string[], text: string) => {
  if (!reasons.includes(text)) reasons.push(text);
};

const getStatus = (percent: number): RecommendationStatus => {
  if (percent >= 75) return 'excellent';
  if (percent >= 50) return 'medium';
  return 'low';
};

const isOwned = (plant: Plant, userPlants: UserPlant[]) =>
  userPlants.some((userPlant) => userPlant.plantId === plant.id && (userPlant.source === 'catalog' || !userPlant.source));

const scoreLight = (plant: Plant, tags: RecommendationTags, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  if (answers.light === 'unknown') {
    if (tags.difficulty === 'easy') {
      addReason(positive, 'Подходит, даже если вы пока не уверены с освещением.');
      return 20;
    }

    if (plant.light.type === 'partial_shade') {
      addReason(positive, 'Подходит, даже если вы пока не уверены с освещением.');
      return 15;
    }

    addReason(positive, 'Растение есть в справочнике и может подойти при корректном уходе.');
    return 10;
  }

  if (plant.light.type === answers.light) {
    addReason(positive, 'Подходит под выбранное освещение.');
    return 25;
  }

  const closeLight =
    (answers.light === 'bright_indirect' && plant.light.type === 'partial_shade') ||
    (answers.light === 'partial_shade' && plant.light.type !== 'shade') ||
    (answers.light === 'shade' && plant.light.type === 'partial_shade');

  if (closeLight) {
    addReason(positive, 'Может адаптироваться к похожим условиям освещения.');
    return 15;
  }

  if (tags.difficulty === 'easy') {
    addReason(negative, 'Потребуется более подходящее место в квартире.');
    return 5;
  }

  addReason(negative, 'Может не подойти под выбранное освещение.');
  return 0;
};

const scoreSafety = (plant: Plant, tags: RecommendationTags, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  if (!answers.hasPetsOrKids) {
    addReason(positive, 'Ограничений по токсичности для вашего сценария нет.');
    return 25;
  }

  if (!plant.toxicity.isToxic && tags.isPetFriendly) {
    addReason(positive, 'Подходит для дома с детьми или животными.');
    return 25;
  }

  addReason(negative, 'Растение может быть токсично для детей или животных.');
  return 0;
};

const scoreExperience = (tags: RecommendationTags, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  if (answers.experience === 'beginner') {
    if (tags.difficulty === 'easy') {
      addReason(positive, 'Хороший вариант для новичка.');
      return 20;
    }
    if (tags.difficulty === 'medium') {
      addReason(positive, 'Подходит для вашего уровня опыта.');
      return 10;
    }
    addReason(negative, 'Может потребовать больше опыта и внимательности.');
    return 0;
  }

  if (answers.experience === 'some_experience') {
    if (tags.difficulty === 'easy') {
      addReason(positive, 'Подходит для вашего уровня опыта.');
      return 20;
    }
    if (tags.difficulty === 'medium') {
      addReason(positive, 'Подходит для вашего уровня опыта.');
      return 18;
    }
    addReason(negative, 'Может потребовать чуть больше внимания.');
    return 8;
  }

  addReason(positive, 'Подходит для вашего уровня опыта.');
  return 20;
};

const scoreWatering = (plant: Plant, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  const days = plant.watering.intervalDays;

  if (answers.wateringPreference === 'often') {
    if (days <= 5) {
      addReason(positive, 'Подходит под желаемую частоту полива.');
      return 20;
    }
    if (days <= 10) {
      addReason(positive, 'Подходит под желаемую частоту полива.');
      return 15;
    }
    addReason(positive, 'Не требует частого полива.');
    return 10;
  }

  if (answers.wateringPreference === 'weekly') {
    if (days >= 6 && days <= 10) {
      addReason(positive, 'Подходит под желаемую частоту полива.');
      return 20;
    }
    if (days > 10) {
      addReason(positive, 'Не требует частого полива.');
      return 12;
    }
    addReason(negative, 'Потребует полива чаще, чем вы указали.');
    return 8;
  }

  if (days > 10) {
    addReason(positive, 'Не требует частого полива.');
    return 20;
  }
  if (days >= 6 && days <= 10) {
    addReason(positive, 'Подходит под желаемую частоту полива.');
    return 10;
  }

  addReason(negative, 'Потребует полива чаще, чем вы указали.');
  return 0;
};

const scorePriority = (plant: Plant, tags: RecommendationTags, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  if (answers.priority === 'easy_care') {
    if (tags.difficulty === 'easy') {
      addReason(positive, 'Соответствует приоритету: неприхотливость.');
      return 10;
    }
    if (tags.difficulty === 'medium') {
      addReason(positive, 'Соответствует вашему главному приоритету.');
      return 5;
    }
    addReason(negative, 'Не самый простой вариант в уходе.');
    return 0;
  }

  if (answers.priority === 'decorative') {
    if (tags.decorativeLevel === 3) {
      addReason(positive, 'Высокая декоративность.');
      return 10;
    }
    if (tags.decorativeLevel === 2) {
      addReason(positive, 'Соответствует вашему главному приоритету.');
      return 6;
    }
    addReason(negative, 'Менее выразительное декоративное растение.');
    return 2;
  }

  if (answers.priority === 'safe') {
    if (!plant.toxicity.isToxic && tags.isPetFriendly) {
      addReason(positive, 'Соответствует приоритету: безопасность.');
      return 10;
    }
    addReason(negative, 'Не лучший выбор, если безопасность — главный приоритет.');
    return 0;
  }

  if (tags.size === 'small') {
    addReason(positive, 'Компактное растение.');
    return 10;
  }
  if (tags.size === 'medium') {
    addReason(positive, 'Соответствует вашему главному приоритету.');
    return 6;
  }

  addReason(negative, 'Может занять много места.');
  return 0;
};

const scoreTemperature = (tags: RecommendationTags, answers: RecommendationAnswers, positive: string[], negative: string[]) => {
  if (tags.temperature.preferred === answers.temperature) {
    addReason(positive, 'Температура в помещении подходит этому растению.');
    return 15;
  }

  if (tags.temperature.tolerated.includes(answers.temperature)) {
    addReason(positive, 'Растение может адаптироваться к такой температуре.');
    return 10;
  }

  if (answers.temperature === 'low') {
    addReason(negative, 'Растение может плохо переносить прохладное помещение.');
  } else {
    addReason(negative, 'Температура в помещении может быть неподходящей для этого растения.');
  }
  return 0;
};

export function getPlantRecommendations(
  plants: Plant[],
  userPlants: UserPlant[],
  answers: RecommendationAnswers,
): RecommendationResult[] {
  return plants
    .map((plant) => {
      const tags = plant.recommendationTags ?? defaultTags;
      const positiveReasons: string[] = [];
      const negativeReasons: string[] = [];

      const score =
        scoreLight(plant, tags, answers, positiveReasons, negativeReasons) +
        scoreSafety(plant, tags, answers, positiveReasons, negativeReasons) +
        scoreExperience(tags, answers, positiveReasons, negativeReasons) +
        scoreWatering(plant, answers, positiveReasons, negativeReasons) +
        scorePriority(plant, tags, answers, positiveReasons, negativeReasons) +
        scoreTemperature(tags, answers, positiveReasons, negativeReasons);

      const plantIsOwned = answers.considerOwnedPlants && isOwned(plant, userPlants);
      if (plantIsOwned) {
        addReason(negativeReasons, 'Это растение уже есть в вашей коллекции, поэтому новое растение может быть менее полезным для разнообразия.');
      }

      if (positiveReasons.length === 0) {
        positiveReasons.push('Растение есть в справочнике и может подойти при корректном уходе.');
      }

      const percent = Math.max(0, Math.min(100, Math.round((score / MAX_SCORE) * 100)));

      return {
        plantId: plant.id,
        percent,
        score,
        maxScore: MAX_SCORE,
        status: getStatus(percent),
        positiveReasons,
        negativeReasons,
        isAlreadyOwned: plantIsOwned,
      };
    })
    .sort((a, b) => b.percent - a.percent || b.score - a.score);
}
