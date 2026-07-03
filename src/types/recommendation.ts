export type ExperienceLevel = 'beginner' | 'some_experience' | 'advanced';

export type LightPreference = 'bright_indirect' | 'partial_shade' | 'shade' | 'unknown';

export type WateringPreference = 'often' | 'weekly' | 'rarely';

export type RecommendationPriority = 'easy_care' | 'decorative' | 'safe' | 'compact';

export type TemperaturePreference = 'high' | 'medium' | 'low';

export type PlantDifficulty = 'easy' | 'medium' | 'hard';

export type PlantSize = 'small' | 'medium' | 'large';

export type RecommendationTags = {
  difficulty: PlantDifficulty;
  size: PlantSize;
  decorativeLevel: 1 | 2 | 3;
  isPetFriendly: boolean;
  temperature: {
    preferred: TemperaturePreference;
    tolerated: TemperaturePreference[];
  };
};

export type RecommendationAnswers = {
  experience: ExperienceLevel;
  light: LightPreference;
  hasPetsOrKids: boolean;
  wateringPreference: WateringPreference;
  priority: RecommendationPriority;
  temperature: TemperaturePreference;
  considerOwnedPlants: boolean;
};

export type RecommendationStatus = 'excellent' | 'medium' | 'low';

export type RecommendationResult = {
  plantId: string;
  percent: number;
  score: number;
  maxScore: number;
  status: RecommendationStatus;
  positiveReasons: string[];
  negativeReasons: string[];
  isAlreadyOwned: boolean;
};
