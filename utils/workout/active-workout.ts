import type { WorkoutSession, WorkoutSetEntry } from "@/types/workout";
import {
  createSessionExercise,
  createSessionFromTemplate,
  createSessionSetFromExercise,
  updateSetWithDefaults,
} from "@/utils/workout/session";
import {
  clampDecimalString,
  clampIntegerString,
  MAX_EXERCISES,
  MAX_REPS,
  MAX_SETS,
  MAX_WEIGHT,
} from "@/utils/workout/limits";
import type { WorkoutTemplate } from "@/types/workout";

export function startWorkoutFromTemplate(
  template: WorkoutTemplate,
  completedWorkouts: WorkoutSession[],
) {
  return createSessionFromTemplate(template, completedWorkouts);
}

export function startBlankWorkout() {
  return {
    id: crypto.randomUUID(),
    completedAt: null,
    templateId: "",
    title: "Blank Workout",
    exercises: [createSessionExercise("Exercise 1")],
  } satisfies WorkoutSession;
}

export function cloneSavedWorkout(workout: WorkoutSession) {
  return structuredClone(workout);
}

export function updateWorkoutSet(
  workout: WorkoutSession,
  exerciseIndex: number,
  setIndex: number,
  field: keyof WorkoutSetEntry,
  value: string | boolean,
) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return exercise;
      }

      if ((field === "weight" || field === "reps") && typeof value === "string") {
        const boundedValue =
          field === "weight"
            ? clampDecimalString(value, MAX_WEIGHT)
            : clampIntegerString(value, MAX_REPS);
        const defaultField = field === "weight" ? "defaultWeight" : "defaultReps";
        const touchedField = field === "weight" ? "weightTouched" : "repsTouched";

        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) => {
            if (currentSetIndex === setIndex) {
              const nextSet = updateSetWithDefaults(set, field, boundedValue);
              return {
                ...nextSet,
                [defaultField]: boundedValue === "" ? nextSet[defaultField] : boundedValue,
              };
            }

            if (currentSetIndex < setIndex) {
              return set;
            }

            const currentValue = set[field];
            const currentDefault = set[defaultField];
            const isUntouchedDefault =
              !set[touchedField] &&
              (currentValue === "" || currentValue === currentDefault);

            if (!isUntouchedDefault) {
              return set;
            }

            return {
              ...set,
              [defaultField]: boundedValue === "" ? currentDefault : boundedValue,
              [field]: currentValue === "" ? "" : boundedValue,
              [touchedField]: false,
            };
          }),
        };
      }

      return {
        ...exercise,
        sets: exercise.sets.map((set, currentSetIndex) =>
          currentSetIndex === setIndex
            ? updateSetWithDefaults(set, field, value)
            : set,
        ),
      };
    }),
  };
}

export function updateWorkoutExerciseName(
  workout: WorkoutSession,
  exerciseIndex: number,
  value: string,
) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise, currentExerciseIndex) =>
      currentExerciseIndex === exerciseIndex ? { ...exercise, name: value } : exercise,
    ),
  };
}

export function updateWorkoutExerciseNote(
  workout: WorkoutSession,
  exerciseIndex: number,
  value: string,
) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise, currentExerciseIndex) =>
      currentExerciseIndex === exerciseIndex ? { ...exercise, note: value } : exercise,
    ),
  };
}

export function updateWorkoutCompletedAt(workout: WorkoutSession, value: string) {
  return {
    ...workout,
    completedAt: value === "" ? null : new Date(`${value}T12:00:00`).toISOString(),
  };
}

export function addWorkoutExercise(workout: WorkoutSession) {
  if (workout.exercises.length >= MAX_EXERCISES) {
    return workout;
  }

  return {
    ...workout,
    exercises: [
      ...workout.exercises,
      createSessionExercise(`Exercise ${workout.exercises.length + 1}`),
    ],
  };
}

export function removeWorkoutExercise(
  workout: WorkoutSession,
  exerciseIndex: number,
) {
  if (workout.exercises.length <= 1) {
    return workout;
  }

  return {
    ...workout,
    exercises: workout.exercises.filter(
      (_exercise, currentExerciseIndex) => currentExerciseIndex !== exerciseIndex,
    ),
  };
}

export function addWorkoutSet(workout: WorkoutSession, exerciseIndex: number) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise, currentExerciseIndex) =>
      currentExerciseIndex === exerciseIndex
        ? exercise.sets.length >= MAX_SETS
          ? exercise
          : { ...exercise, sets: [...exercise.sets, createSessionSetFromExercise(exercise)] }
        : exercise,
    ),
  };
}

export function removeWorkoutSet(workout: WorkoutSession, exerciseIndex: number) {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex || exercise.sets.length <= 1) {
        return exercise;
      }

      return {
        ...exercise,
        sets: exercise.sets.slice(0, -1),
      };
    }),
  };
}
