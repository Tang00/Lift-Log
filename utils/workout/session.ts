import type {
  TemplateExercise,
  WorkoutExerciseEntry,
  WorkoutSession,
  WorkoutSetEntry,
  WorkoutTemplate,
} from "@/types/workout";
import { MAX_EXERCISES, MAX_REPS, MAX_SETS, MAX_WEIGHT } from "@/utils/workout/limits";

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
        expectedSets: 1,
        repTargets: [{ minReps: "8", maxReps: "" }],
        previousResults: [],
      },
    ],
  };
}

export function normalizeTemplate(template: WorkoutTemplate): WorkoutTemplate {
  return {
    ...template,
    exercises: template.exercises.slice(0, MAX_EXERCISES).map((exercise) => {
      const expectedSets = Math.min(Math.max(1, exercise.expectedSets), MAX_SETS);
      const fallbackTarget =
        exercise.repTargets && exercise.repTargets.length > 0
          ? exercise.repTargets.slice(0, MAX_SETS)
          : Array.from({ length: expectedSets }, () => ({
              minReps: "",
              maxReps: "",
            }));

      const repTargets = Array.from(
        { length: expectedSets },
        (_, index) => {
          const target = fallbackTarget[index] ?? fallbackTarget[fallbackTarget.length - 1];
          return {
            minReps: target?.minReps ? String(Math.min(Number.parseInt(target.minReps, 10) || 0, MAX_REPS)) : "",
            maxReps: target?.maxReps ? String(Math.min(Number.parseInt(target.maxReps, 10) || 0, MAX_REPS)) : "",
          };
        },
      );

      return {
        ...exercise,
        id: exercise.id || crypto.randomUUID(),
        note: exercise.note ?? "",
        expectedSets,
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
        (item) => item.templateExerciseId === exercise.id,
      );

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        note: "",
        templateExerciseId: exercise.id,
        templateNote: exercise.note,
        previousResults: previousExercise?.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
        })),
        sets: Array.from({ length: exercise.expectedSets }, (_, index) => {
          const defaultWeight =
            previousExercise?.sets[index]?.weight?.trim() !== ""
              ? String(Math.min(Number.parseFloat(previousExercise?.sets[index]?.weight ?? "0") || 0, MAX_WEIGHT))
              : "0";
          const defaultReps =
            exercise.repTargets[index]?.minReps ||
            exercise.repTargets[index]?.maxReps ||
            "0";

          return {
            completed: false,
            defaultReps,
            defaultWeight,
            reps: "",
            repsTouched: false,
            weight: "",
            weightTouched: false,
            minReps: exercise.repTargets[index]?.minReps ?? "",
            maxReps: exercise.repTargets[index]?.maxReps ?? "",
          };
        }),
      };
    }),
  };
}

export function createWorkoutSetEntry(
  defaults?: Partial<Pick<WorkoutSetEntry, "defaultReps" | "defaultWeight" | "maxReps" | "minReps">>,
): WorkoutSetEntry {
  const defaultWeight = defaults?.defaultWeight ?? "0";
  const defaultReps =
    defaults?.defaultReps ?? defaults?.minReps ?? defaults?.maxReps ?? "0";

  return {
    completed: false,
    defaultReps,
    defaultWeight,
    maxReps: defaults?.maxReps ?? "",
    minReps: defaults?.minReps ?? "",
    reps: "",
    repsTouched: false,
    weight: "",
    weightTouched: false,
  };
}

export function createSessionExercise(name: string): WorkoutExerciseEntry {
  return {
    exerciseId: crypto.randomUUID(),
    name,
    note: "",
    templateExerciseId: null,
    templateNote: "",
    previousResults: [],
    sets: [createWorkoutSetEntry()],
  };
}

export function createSessionSetFromExercise(
  exercise: WorkoutExerciseEntry,
): WorkoutSetEntry {
  const lastSet = exercise.sets[exercise.sets.length - 1];

  return createWorkoutSetEntry({
    defaultReps:
      lastSet?.minReps || lastSet?.maxReps || lastSet?.defaultReps || "0",
    defaultWeight: String(Math.min(Number.parseFloat(lastSet?.defaultWeight ?? "0") || 0, MAX_WEIGHT)),
    maxReps: lastSet?.maxReps ?? "",
    minReps: lastSet?.minReps ?? "",
  });
}

export function sessionDiffersFromTemplate(
  session: WorkoutSession,
  template: WorkoutTemplate,
): boolean {
  const normalizedTemplate = normalizeTemplate(template);

  if (session.exercises.length !== normalizedTemplate.exercises.length) {
    return true;
  }

  return session.exercises.some((exercise, exerciseIndex) => {
    const templateExercise = normalizedTemplate.exercises[exerciseIndex];

    if (!templateExercise) {
      return true;
    }

    if (
      exercise.templateExerciseId !== templateExercise.id ||
      exercise.name !== templateExercise.name ||
      exercise.templateNote !== templateExercise.note ||
      exercise.sets.length !== templateExercise.repTargets.length
    ) {
      return true;
    }

    return exercise.sets.some((set, setIndex) => {
      const templateSet = templateExercise.repTargets[setIndex];
      return (
        !templateSet ||
        set.minReps !== templateSet.minReps ||
        set.maxReps !== templateSet.maxReps
      );
    });
  });
}

export function createTemplateFromSession(
  session: WorkoutSession,
  template: WorkoutTemplate,
): WorkoutTemplate {
  const normalizedTemplate = normalizeTemplate(template);
  const previousResultsById = new Map(
    normalizedTemplate.exercises.map((exercise) => [exercise.id, exercise.previousResults ?? []]),
  );

  return normalizeTemplate({
    ...normalizedTemplate,
    title: session.title,
    exercises: session.exercises.map((exercise): TemplateExercise => ({
      id: exercise.templateExerciseId ?? crypto.randomUUID(),
      name: exercise.name,
      note: exercise.templateNote,
      expectedSets: Math.min(Math.max(1, exercise.sets.length), MAX_SETS),
      previousResults:
        (exercise.templateExerciseId
          ? previousResultsById.get(exercise.templateExerciseId)
          : []) ?? [],
      repTargets: exercise.sets.slice(0, MAX_SETS).map((set) => ({
        maxReps: set.maxReps,
        minReps: set.minReps,
      })),
    })).slice(0, MAX_EXERCISES),
  });
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
