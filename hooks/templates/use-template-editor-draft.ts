"use client";

import { useEffect, useMemo, useState } from "react";

import type { TemplateExercise, WorkoutTemplate } from "@/types/workout";
import { clampIntegerString, MAX_EXERCISES, MAX_REPS, MAX_SETS } from "@/utils/workout/limits";

type UseTemplateEditorDraftOptions = {
  mode: "create" | "edit";
  onDirtyChange?: (isDirty: boolean) => void;
  template: WorkoutTemplate;
};

export function useTemplateEditorDraft({
  mode,
  onDirtyChange,
  template,
}: UseTemplateEditorDraftOptions) {
  const [draft, setDraft] = useState<WorkoutTemplate>(template);

  const heading = useMemo(
    () => (mode === "create" ? "Create template" : "Edit template"),
    [mode],
  );

  const isDirty = JSON.stringify(draft) !== JSON.stringify(template);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    setDraft(template);
  }, [template]);

  function updateExercise(
    exerciseId: string,
    field: keyof TemplateExercise,
    value: string | number | boolean,
  ) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  }

  function addExercise() {
    if (draft.exercises.length >= MAX_EXERCISES) {
      return;
    }

    setDraft((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          id: crypto.randomUUID(),
          name: "",
          note: "",
          expectedSets: 1,
          repTargets: [{ minReps: "8", maxReps: "" }],
          previousResults: [],
        },
      ],
    }));
  }

  function addSet(exerciseId: string) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => {
        if (exercise.id !== exerciseId || exercise.repTargets.length >= MAX_SETS) {
          return exercise;
        }

        const lastTarget = exercise.repTargets[exercise.repTargets.length - 1];
        const nextTargets = [
          ...exercise.repTargets,
          {
            minReps: lastTarget?.minReps ?? "",
            maxReps: lastTarget?.maxReps ?? "",
          },
        ];

        return {
          ...exercise,
          expectedSets: nextTargets.length,
          repTargets: nextTargets,
        };
      }),
    }));
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => {
        if (exercise.id !== exerciseId || exercise.repTargets.length <= 1) {
          return exercise;
        }

        const nextTargets = exercise.repTargets.filter(
          (_target, currentIndex) => currentIndex !== setIndex,
        );

        return {
          ...exercise,
          expectedSets: nextTargets.length,
          repTargets: nextTargets,
        };
      }),
    }));
  }

  function updateRepTarget(
    exerciseId: string,
    setIndex: number,
    field: "minReps" | "maxReps",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              repTargets: exercise.repTargets.map((target, currentIndex) =>
                currentIndex === setIndex
                  ? { ...target, [field]: clampIntegerString(value, MAX_REPS) }
                  : target,
              ),
            }
          : exercise,
      ),
    }));
  }

  function removeExercise(exerciseId: string) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  }

  return {
    addExercise,
    addSet,
    draft,
    heading,
    removeExercise,
    removeSet,
    setDraft,
    updateExercise,
    updateRepTarget,
  };
}
