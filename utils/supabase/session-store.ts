"use client";

import type { WorkoutSession } from "@/types/workout";
import { supabase } from "@/utils/supabase/client";
import {
  requireData,
  SessionExerciseRow,
  SessionSetRow,
  toText,
  WorkoutSessionRow,
} from "@/utils/supabase/store-shared";

export async function fetchCompletedWorkouts() {
  const { data: sessions, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("id,template_id,title,completed_at")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (sessionError) {
    throw sessionError;
  }

  const sessionRows = (sessions ?? []) as WorkoutSessionRow[];
  if (sessionRows.length === 0) {
    return [] as WorkoutSession[];
  }

  const sessionIds = sessionRows.map((session) => session.id);

  const { data: exercises, error: exerciseError } = await supabase
    .from("session_exercises")
    .select(
      "id,session_id,template_exercise_id,position,name,template_note,session_note",
    )
    .in("session_id", sessionIds)
    .order("position", { ascending: true });

  if (exerciseError) {
    throw exerciseError;
  }

  const exerciseRows = (exercises ?? []) as SessionExerciseRow[];
  const sessionExerciseIds = exerciseRows.map((exercise) => exercise.id);

  const { data: sets, error: setError } =
    sessionExerciseIds.length > 0
      ? await supabase
          .from("session_sets")
          .select(
            "session_exercise_id,position,min_reps,max_reps,reps,weight,completed",
          )
          .in("session_exercise_id", sessionExerciseIds)
          .order("position", { ascending: true })
      : { data: [], error: null };

  if (setError) {
    throw setError;
  }

  const setRows = (sets ?? []) as SessionSetRow[];

  return sessionRows.map((session) => ({
    id: session.id,
    completedAt: session.completed_at,
    templateId: session.template_id ?? "",
    title: session.title,
    exercises: exerciseRows
      .filter((exercise) => exercise.session_id === session.id)
      .map((exercise) => ({
        exerciseId: exercise.id,
        name: exercise.name,
        note: exercise.session_note,
        templateExerciseId: exercise.template_exercise_id,
        templateNote: exercise.template_note,
        previousResults: [],
        sets: setRows
          .filter((set) => set.session_exercise_id === exercise.id)
          .map((set) => ({
            completed: set.completed,
            defaultReps:
              toText(set.reps) || toText(set.min_reps) || toText(set.max_reps) || "0",
            defaultWeight: toText(set.weight) || "0",
            maxReps: toText(set.max_reps),
            minReps: toText(set.min_reps),
            reps: toText(set.reps),
            repsTouched: true,
            weight: toText(set.weight),
            weightTouched: true,
          })),
      })),
  }));
}

export async function saveCompletedWorkout(
  userId: string,
  workout: WorkoutSession,
) {
  const sessionId = workout.id || crypto.randomUUID();
  const completedAt = workout.completedAt ?? new Date().toISOString();

  const { error: sessionError } = await supabase.from("workout_sessions").upsert(
    {
      id: sessionId,
      completed_at: completedAt,
      template_id: workout.templateId || null,
      title: workout.title,
      user_id: userId,
    },
    { onConflict: "id" },
  );

  if (sessionError) {
    throw sessionError;
  }

  const { error: deleteExercisesError } = await supabase
    .from("session_exercises")
    .delete()
    .eq("session_id", sessionId);

  if (deleteExercisesError) {
    throw deleteExercisesError;
  }

  const exerciseRows = workout.exercises.map((exercise, index) => ({
    id: crypto.randomUUID(),
    name: exercise.name,
    position: index,
    session_id: sessionId,
    session_note: exercise.note,
    template_exercise_id: exercise.templateExerciseId,
    template_note: exercise.templateNote,
  }));

  const { data: insertedExercises, error: insertExerciseError } = await supabase
    .from("session_exercises")
    .insert(exerciseRows)
    .select("id,position");

  if (insertExerciseError) {
    throw insertExerciseError;
  }

  const exerciseIdsByPosition = new Map(
    (insertedExercises ?? []).map((exercise) => [exercise.position, exercise.id]),
  );

  const setRows = workout.exercises.flatMap((exercise, exerciseIndex) =>
    exercise.sets
      .filter((set) => set.completed)
      .map((set, setIndex) => ({
        completed: true,
        max_reps: set.maxReps === "" ? null : Number(set.maxReps),
        min_reps: set.minReps === "" ? null : Number(set.minReps),
        position: setIndex,
        reps: set.reps === "" ? null : Number(set.reps),
        session_exercise_id: requireData(
          exerciseIdsByPosition.get(exerciseIndex),
          "Missing inserted session exercise id.",
        ),
        weight: set.weight === "" ? null : Number(set.weight),
      })),
  );

  if (setRows.length > 0) {
    const { error: insertSetError } = await supabase
      .from("session_sets")
      .insert(setRows);

    if (insertSetError) {
      throw insertSetError;
    }
  }
}

export async function deleteCompletedWorkout(sessionId: string) {
  const { error } = await supabase.from("workout_sessions").delete().eq("id", sessionId);

  if (error) {
    throw error;
  }
}
