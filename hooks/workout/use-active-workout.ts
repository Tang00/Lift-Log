"use client";

import { useEffect, useMemo, useState } from "react";

import type { WorkoutSession, WorkoutSetEntry, WorkoutTemplate } from "@/types/workout";
import {
  addWorkoutExercise,
  addWorkoutSet,
  cloneSavedWorkout,
  removeWorkoutExercise,
  removeWorkoutSet,
  startBlankWorkout,
  startWorkoutFromTemplate,
  updateWorkoutCompletedAt,
  updateWorkoutExerciseName,
  updateWorkoutExerciseNote,
  updateWorkoutSet,
} from "@/utils/workout/active-workout";

type WorkoutSource = "menu" | "history" | null;

type UseActiveWorkoutOptions = {
  completedWorkouts: WorkoutSession[];
  source: WorkoutSource;
};

function updateForSource(
  source: WorkoutSource,
  setInProgressWorkout: React.Dispatch<React.SetStateAction<WorkoutSession | null>>,
  setSelectedHistoryWorkout: React.Dispatch<React.SetStateAction<WorkoutSession | null>>,
) {
  return source === "history" ? setSelectedHistoryWorkout : setInProgressWorkout;
}

export function useActiveWorkout({
  completedWorkouts,
  source,
}: UseActiveWorkoutOptions) {
  const [inProgressWorkout, setInProgressWorkout] = useState<WorkoutSession | null>(null);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] =
    useState<WorkoutSession | null>(null);
  const [isEditingSavedSession, setIsEditingSavedSession] = useState(false);

  const activeWorkout = useMemo(
    () => (source === "history" ? selectedHistoryWorkout : inProgressWorkout),
    [inProgressWorkout, selectedHistoryWorkout, source],
  );

  useEffect(() => {
    if (source !== "history") {
      setIsEditingSavedSession(false);
    }
  }, [source]);

  function clearAllWorkoutState() {
    setInProgressWorkout(null);
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
  }

  function openTemplate(template: WorkoutTemplate) {
    setInProgressWorkout(startWorkoutFromTemplate(template, completedWorkouts));
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
  }

  function openBlankWorkout() {
    setInProgressWorkout(startBlankWorkout());
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
  }

  function openWorkout(workout: WorkoutSession) {
    setSelectedHistoryWorkout(cloneSavedWorkout(workout));
    setIsEditingSavedSession(false);
  }

  function clearHistoryWorkout() {
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
  }

  function clearInProgressWorkout() {
    setInProgressWorkout(null);
    setIsEditingSavedSession(false);
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSetEntry,
    value: string | boolean,
  ) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) =>
      current ? updateWorkoutSet(current, exerciseIndex, setIndex, field, value) : current,
    );
  }

  function updateExerciseName(exerciseIndex: number, value: string) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) =>
      current ? updateWorkoutExerciseName(current, exerciseIndex, value) : current,
    );
  }

  function updateNote(exerciseIndex: number, value: string) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) =>
      current ? updateWorkoutExerciseNote(current, exerciseIndex, value) : current,
    );
  }

  function updateCompletedAt(value: string) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) => (current ? updateWorkoutCompletedAt(current, value) : current));
  }

  function addExercise() {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) => (current ? addWorkoutExercise(current) : current));
  }

  function removeExercise(exerciseIndex: number) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) => (current ? removeWorkoutExercise(current, exerciseIndex) : current));
  }

  function addSet(exerciseIndex: number) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) => (current ? addWorkoutSet(current, exerciseIndex) : current));
  }

  function removeSet(exerciseIndex: number) {
    const setter = updateForSource(source, setInProgressWorkout, setSelectedHistoryWorkout);

    setter((current) => (current ? removeWorkoutSet(current, exerciseIndex) : current));
  }

  return {
    activeWorkout,
    addExercise,
    addSet,
    clearAllWorkoutState,
    clearHistoryWorkout,
    clearInProgressWorkout,
    inProgressWorkout,
    isEditingSavedSession,
    openBlankWorkout,
    openTemplate,
    openWorkout,
    removeExercise,
    removeSet,
    selectedHistoryWorkout,
    setIsEditingSavedSession,
    updateCompletedAt,
    updateExerciseName,
    updateNote,
    updateSet,
  };
}
