import type { RecommendationTags } from './recommendation';

export type LightType = 'bright_indirect' | 'partial_shade' | 'shade';

export type Plant = {
  id: string;
  image: string;
  name: string;
  shortDescription: string;
  description: string;
  watering: {
    intervalDays: number;
    text: string;
  };
  light: {
    type: LightType;
    text: string;
  };
  repotting: {
    intervalMonths: number;
    text: string;
  };
  toxicity: {
    isToxic: boolean;
    text: string;
  };
  features: string[];
  recommendationTags?: RecommendationTags;
};

export type UserPlantSource = 'catalog' | 'custom';

export type CustomPlantInfo = Omit<Plant, 'id' | 'image'> & {
  image?: string;
};

export type DisplayPlant = Plant | (CustomPlantInfo & { id: string; image?: string });

export type UserPlant = {
  id: string;
  source: UserPlantSource;
  plantId?: string;
  customPlant?: CustomPlantInfo;
  addedAt: string;
  notes: string;
  lastWateredAt: string;
  wateringIntervalDays: number;
  wateringReminderEnabled: boolean;
  wateringReminderTime?: string;
  lastRepottedAt: string;
  repottingIntervalMonths: number;
  repottingReminderEnabled: boolean;
  repottingReminderTime?: string;
};

export type CareTaskType = 'watering' | 'repotting';
export type CareTaskStatus = 'overdue' | 'today' | 'soon' | 'ok' | 'done';

export type CareTask = {
  id: string;
  userPlantId: string;
  plantId?: string;
  plantName: string;
  type: CareTaskType;
  dueDate: string;
  status: CareTaskStatus;
  title: string;
  description: string;
};
