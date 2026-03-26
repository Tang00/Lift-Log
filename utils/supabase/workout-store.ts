"use client";

import { supabase } from "@/utils/supabase/client";
import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";

type TemplateRow = {
  id: string;
  summary: string;
  title: string;
};

type TemplateExerciseRow = {
  id: string;
  name: string;
  note: string;
  position: number;
  template_id: string;
};

type TemplateSetRow = {
  max_reps: number | null;
  min_reps: number | null;
  position: number;
  template_exercise_id: string;
};

type WorkoutSessionRow = {
  completed_at: string | null;
  id: string;
  template_id: string | null;
  title: string;
};

type SessionExerciseRow = {
  id: string;
  name: string;
  position: number;
  session_id: string;
  session_note: string;
  template_exercise_id: string | null;
  template_note: string;
};

type SessionSetRow = {
  completed: boolean;
  max_reps: number | null;
  min_reps: number | null;
  position: number;
  reps: number | null;
  session_exercise_id: string;
  weight: number | null;
};

function toText(value: number | null) {
  return value == null ? "" : String(value);
}

function requireData<T>(value: T | null, message: string) {
  if (value == null) {
    throw new Error(message);
  }

  return value;
}

export async function fetchTemplates() {
  const { data: templates, error: templateError } = await supabase
    .from("workout_templates")
    .select("id,title,summary")
    .order("created_at", { ascending: true });

  if (templateError) {
    throw templateError;
  }

  const templateRows = (templates ?? []) as TemplateRow[];
  if (templateRows.length === 0) {
    return [] as WorkoutTemplate[];
  }

  const templateIds = templateRows.map((template) => template.id);

  const { data: exercises, error: exerciseError } = await supabase
    .from("template_exercises")
    .select("id,template_id,position,name,note")
    .in("template_id", templateIds)
    .order("position", { ascending: true });

  if (exerciseError) {
    throw exerciseError;
  }

  const exerciseRows = (exercises ?? []) as TemplateExerciseRow[];
  const exerciseIds = exerciseRows.map((exercise) => exercise.id);

  const { data: sets, error: setError } =
    exerciseIds.length > 0
      ? await supabase
          .from("template_sets")
          .select("template_exercise_id,position,min_reps,max_reps")
          .in("template_exercise_id", exerciseIds)
          .order("position", { ascending: true })
      : { data: [], error: null };

  if (setError) {
    throw setError;
  }

  const setRows = (sets ?? []) as TemplateSetRow[];

  return templateRows.map((template) => {
    const templateExercises = exerciseRows
      .filter((exercise) => exercise.template_id === template.id)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        note: exercise.note,
        expectedSets: setRows.filter(
          (set) => set.template_exercise_id === exercise.id,
        ).length,
        previousResults: [],
        repTargets: setRows
          .filter((set) => set.template_exercise_id === exercise.id)
          .map((set) => ({
            maxReps: toText(set.max_reps),
            minReps: toText(set.min_reps),
          })),
      }));

    return {
      id: template.id,
      summary: template.summary,
      title: template.title,
      exercises: templateExercises,
    };
  });
}

export async function saveTemplate(userId: string, template: WorkoutTemplate) {
  const templateId = template.id || crypto.randomUUID();

  const { error: templateError } = await supabase.from("workout_templates").upsert(
    {
      id: templateId,
      summary: template.summary,
      title: template.title,
      user_id: userId,
    },
    { onConflict: "id" },
  );

  if (templateError) {
    throw templateError;
  }

  const { error: deleteExercisesError } = await supabase
    .from("template_exercises")
    .delete()
    .eq("template_id", templateId);

  if (deleteExercisesError) {
    throw deleteExercisesError;
  }

  const exerciseRows = template.exercises.map((exercise, index) => ({
    id: exercise.id || crypto.randomUUID(),
    name: exercise.name,
    note: exercise.note,
    position: index,
    template_id: templateId,
  }));

  const { data: insertedExercises, error: insertExerciseError } = await supabase
    .from("template_exercises")
    .insert(exerciseRows)
    .select("id,position");

  if (insertExerciseError) {
    throw insertExerciseError;
  }

  const exerciseIdsByPosition = new Map(
    (insertedExercises ?? []).map((exercise) => [exercise.position, exercise.id]),
  );

  const setRows = template.exercises.flatMap((exercise, exerciseIndex) =>
    exercise.repTargets.map((target, setIndex) => ({
      max_reps: target.maxReps === "" ? null : Number(target.maxReps),
      min_reps: target.minReps === "" ? null : Number(target.minReps),
      position: setIndex,
      template_exercise_id: requireData(
        exerciseIdsByPosition.get(exerciseIndex),
        "Missing inserted template exercise id.",
      ),
    })),
  );

  if (setRows.length > 0) {
    const { error: insertSetError } = await supabase
      .from("template_sets")
      .insert(setRows);

    if (insertSetError) {
      throw insertSetError;
    }
  }
}

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
        exerciseId: exercise.template_exercise_id ?? exercise.id,
        name: exercise.name,
        note: exercise.session_note,
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
    template_exercise_id: exercise.exerciseId || null,
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
