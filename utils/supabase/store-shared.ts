"use client";

export function toText(value: number | null) {
  return value == null ? "" : String(value);
}

export function requireData<T>(value: T | null | undefined, message: string) {
  if (value == null) {
    throw new Error(message);
  }

  return value;
}

export type TemplateRow = {
  id: string;
  summary: string;
  title: string;
};

export type TemplateExerciseRow = {
  id: string;
  name: string;
  note: string;
  position: number;
  template_id: string;
};

export type TemplateSetRow = {
  max_reps: number | null;
  min_reps: number | null;
  position: number;
  template_exercise_id: string;
};

export type WorkoutSessionRow = {
  completed_at: string | null;
  id: string;
  template_id: string | null;
  title: string;
};

export type SessionExerciseRow = {
  id: string;
  name: string;
  position: number;
  session_id: string;
  session_note: string;
  template_exercise_id: string | null;
  template_note: string;
};

export type SessionSetRow = {
  completed: boolean;
  max_reps: number | null;
  min_reps: number | null;
  position: number;
  reps: number | null;
  session_exercise_id: string;
  weight: number | null;
};
