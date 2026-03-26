export type PreviousPerformance = {
  weight: string;
  reps: string;
};

export type TemplateExercise = {
  id: string;
  name: string;
  note: string;
  expectedSets: number;
  repTargets: Array<{
    maxReps: string;
    minReps: string;
  }>;
  previousResults?: PreviousPerformance[];
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  summary: string;
  exercises: TemplateExercise[];
};

export type WorkoutSetEntry = {
  completed: boolean;
  defaultReps: string;
  defaultWeight: string;
  maxReps: string;
  minReps: string;
  reps: string;
  repsTouched: boolean;
  weight: string;
  weightTouched: boolean;
};

export type WorkoutExerciseEntry = {
  exerciseId: string;
  name: string;
  note: string;
  templateNote: string;
  previousResults?: PreviousPerformance[];
  sets: WorkoutSetEntry[];
};

export type WorkoutSession = {
  id: string;
  completedAt: string | null;
  templateId: string;
  title: string;
  exercises: WorkoutExerciseEntry[];
};
