import type {
  WorkoutSession,
  WorkoutSetEntry,
  WorkoutTemplate,
} from "@/types/workout";

export function createEmptyTemplate(): WorkoutTemplate {
  return {
    id: crypto.randomUUID(),
    title: "",
    summary: "",
    exercises: [
      {
        id: crypto.randomUUID(),
        name: "",
        note: "",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
        ],
        previousResults: [],
      },
    ],
  };
}

export function normalizeTemplate(template: WorkoutTemplate): WorkoutTemplate {
  return {
    ...template,
    exercises: template.exercises.map((exercise) => {
      const fallbackTarget =
        exercise.repTargets && exercise.repTargets.length > 0
          ? exercise.repTargets
          : Array.from({ length: Math.max(1, exercise.expectedSets) }, () => ({
              minReps: "",
              maxReps: "",
            }));

      const repTargets = Array.from(
        { length: Math.max(1, exercise.expectedSets) },
        (_, index) => fallbackTarget[index] ?? fallbackTarget[fallbackTarget.length - 1],
      );

      return {
        ...exercise,
        id: exercise.id || crypto.randomUUID(),
        note: exercise.note ?? "",
        repTargets,
      };
    }),
  };
}

export function createSessionFromTemplate(
  template: WorkoutTemplate,
  completedWorkouts: WorkoutSession[],
): WorkoutSession {
  const normalizedTemplate = normalizeTemplate(template);
  const lastCompletedWorkout = completedWorkouts.find(
    (workout) => workout.templateId === normalizedTemplate.id,
  );

  return {
    id: crypto.randomUUID(),
    completedAt: null,
    templateId: normalizedTemplate.id,
    title: normalizedTemplate.title,
    exercises: normalizedTemplate.exercises.map((exercise) => {
      const previousExercise = lastCompletedWorkout?.exercises.find(
        (item) => item.exerciseId === exercise.id,
      );

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        note: "",
        templateNote: exercise.note,
        previousResults: previousExercise?.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
        })),
        sets: Array.from({ length: exercise.expectedSets }, (_, index) => {
          const defaultWeight =
            previousExercise?.sets[index]?.weight?.trim() !== ""
              ? previousExercise?.sets[index]?.weight ?? "0"
              : "0";
          const defaultReps =
            exercise.repTargets[index]?.minReps ||
            exercise.repTargets[index]?.maxReps ||
            "0";

          return {
            completed: false,
            defaultReps,
            defaultWeight,
            reps: defaultReps,
            repsTouched: false,
            weight: defaultWeight,
            weightTouched: false,
            minReps: exercise.repTargets[index]?.minReps ?? "",
            maxReps: exercise.repTargets[index]?.maxReps ?? "",
          };
        }),
      };
    }),
  };
}

export function updateSetWithDefaults(
  set: WorkoutSetEntry,
  field: keyof WorkoutSetEntry,
  value: string | boolean,
) {
  if (field === "weight" && typeof value === "string") {
    return {
      ...set,
      weight: value,
      weightTouched: true,
    };
  }

  if (field === "reps" && typeof value === "string") {
    return {
      ...set,
      reps: value,
      repsTouched: true,
    };
  }

  if (field === "completed" && typeof value === "boolean") {
    return {
      ...set,
      completed: value,
      weight:
        value && (set.weight.trim() === "" || !set.weightTouched)
          ? set.defaultWeight
          : set.weight,
      reps:
        value && (set.reps.trim() === "" || !set.repsTouched)
          ? set.defaultReps
          : set.reps,
    };
  }

  return {
    ...set,
    [field]: value,
  };
}
