export type LightType = 'bright_indirect' | 'partial_shade' | 'shade';

export type Plant = {
  id: string;
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
};

export type UserPlant = {
  id: string;
  plantId: string;
  addedAt: string;
  notes: string;
  lastWateredAt: string;
  wateringIntervalDays: number;
  wateringReminderEnabled: boolean;
  lastRepottedAt: string;
  repottingIntervalMonths: number;
  repottingReminderEnabled: boolean;
};

export type CareTaskType = 'watering' | 'repotting';
export type CareTaskStatus = 'overdue' | 'today' | 'soon' | 'ok' | 'done';

export type CareTask = {
  id: string;
  userPlantId: string;
  plantId: string;
  plantName: string;
  type: CareTaskType;
  dueDate: string;
  status: CareTaskStatus;
  title: string;
  description: string;
};
