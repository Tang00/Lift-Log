"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";
import {
  deleteCompletedWorkout,
  fetchCompletedWorkouts,
  fetchTemplates,
  saveCompletedWorkout,
  saveTemplate,
} from "@/utils/supabase/workout-store";
import { MAX_TEMPLATES } from "@/utils/workout/limits";
import { createTemplateFromSession, normalizeTemplate } from "@/utils/workout/session";

type UseWorkoutDataOptions = {
  onError: (message: string | null) => void;
  session: Session | null;
};

export function useWorkoutData({ onError, session }: UseWorkoutDataOptions) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const userId = session?.user.id ?? null;

  async function refreshData() {
    const [nextTemplates, nextWorkouts] = await Promise.all([
      fetchTemplates(),
      fetchCompletedWorkouts(),
    ]);

    setTemplates(nextTemplates);
    setWorkouts(nextWorkouts);

    return { templates: nextTemplates, workouts: nextWorkouts };
  }

  useEffect(() => {
    if (!userId) {
      setTemplates([]);
      setWorkouts([]);
      return;
    }

    let isMounted = true;
    setIsLoadingData(true);

    void Promise.all([fetchTemplates(), fetchCompletedWorkouts()])
      .then(([nextTemplates, nextWorkouts]) => {
        if (!isMounted) {
          return;
        }

        setTemplates(nextTemplates);
        setWorkouts(nextWorkouts);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        onError(error instanceof Error ? error.message : "Failed to load workout data.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onError, userId]);

  async function saveTemplateRecord(template: WorkoutTemplate) {
    if (!session?.user.id) {
      return false;
    }

    setIsSavingTemplate(true);
    try {
      const normalized = normalizeTemplate(template);
      const isNewTemplate = !templates.some((existingTemplate) => existingTemplate.id === normalized.id);

      if (isNewTemplate && templates.length >= MAX_TEMPLATES) {
        throw new Error(`You can only save up to ${MAX_TEMPLATES} templates.`);
      }

      await saveTemplate(session.user.id, normalized);
      const nextTemplates = await fetchTemplates();
      setTemplates(nextTemplates);
      return true;
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to save template.");
      return false;
    } finally {
      setIsSavingTemplate(false);
    }
  }

  async function deleteWorkoutRecord(sessionId: string) {
    setIsSavingWorkout(true);
    try {
      await deleteCompletedWorkout(sessionId);
      const nextWorkouts = await fetchCompletedWorkouts();
      setWorkouts(nextWorkouts);
      return true;
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete workout.");
      return false;
    } finally {
      setIsSavingWorkout(false);
    }
  }

  async function persistWorkoutRecord(
    workout: WorkoutSession,
    options?: { updateTemplate?: boolean; template?: WorkoutTemplate },
  ) {
    if (!session?.user.id) {
      return false;
    }

    setIsSavingWorkout(true);
    try {
      if (options?.updateTemplate && options.template) {
        await saveTemplate(
          session.user.id,
          createTemplateFromSession(workout, options.template),
        );
      }

      await saveCompletedWorkout(session.user.id, workout);
      await refreshData();
      return true;
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to save workout.");
      return false;
    } finally {
      setIsSavingWorkout(false);
    }
  }

  return {
    deleteWorkoutRecord,
    isLoadingData,
    isSavingTemplate,
    isSavingWorkout,
    persistWorkoutRecord,
    refreshData,
    saveTemplateRecord,
    templates,
    workouts,
  };
}
