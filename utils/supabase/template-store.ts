"use client";

import type { WorkoutTemplate } from "@/types/workout";
import { supabase } from "@/utils/supabase/client";
import {
  requireData,
  TemplateExerciseRow,
  TemplateRow,
  TemplateSetRow,
  toText,
} from "@/utils/supabase/store-shared";

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
