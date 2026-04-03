"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/templates/template-editor.module.css";
import { TemplateEditorExerciseCard } from "@/components/templates/template-editor-exercise-card";
import type { TemplateExercise, WorkoutTemplate } from "@/types/workout";

type TemplateEditorProps = {
  mode: "create" | "edit";
  onDirtyChange?: (isDirty: boolean) => void;
  onBack: () => void;
  onSave: (template: WorkoutTemplate) => void;
  template: WorkoutTemplate;
};

export function TemplateEditor({
  mode,
  onDirtyChange,
  onBack,
  onSave,
  template,
}: TemplateEditorProps) {
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

  function clearRepTargetDefault(
    exerciseId: string,
    setIndex: number,
    field: "minReps" | "maxReps",
    value: string,
  ) {
    const defaultValue = field === "minReps" ? "8" : "";

    if (value === defaultValue) {
      updateRepTarget(exerciseId, setIndex, field, "");
    }
  }

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
    setDraft((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
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
    }));
  }

  function updateSetCount(exerciseId: string, nextCount: number) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const safeCount = Math.max(1, nextCount);
        const nextTargets =
          safeCount > exercise.repTargets.length
            ? [
                ...exercise.repTargets,
                ...Array.from(
                  { length: safeCount - exercise.repTargets.length },
                  () => ({
                    minReps: exercise.repTargets[exercise.repTargets.length - 1]?.minReps ?? "",
                    maxReps: exercise.repTargets[exercise.repTargets.length - 1]?.maxReps ?? "",
                  }),
                ),
              ]
            : exercise.repTargets.slice(0, safeCount);

        return {
          ...exercise,
          expectedSets: safeCount,
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
                currentIndex === setIndex ? { ...target, [field]: value } : target,
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

  return (
    <div className="stack">
      <div className={styles.header}>
        <button
          aria-label="Go back"
          className="back-arrow"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.title}>
          <h2>{heading}</h2>
        </div>
      </div>

      <div className={`panel ${styles.panel}`}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className="field-label">Template name</span>
            <input
              className="text-input"
              type="text"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Push Day"
            />
          </label>
          <label className={styles.field}>
            <span className="field-label">Summary</span>
            <input
              className="text-input"
              type="text"
              value={draft.summary}
              onChange={(event) =>
                setDraft((current) => ({ ...current, summary: event.target.value }))
              }
              placeholder="Chest, shoulders, triceps"
            />
          </label>
        </div>
      </div>

      <div className="stack">
        {draft.exercises.map((exercise, index) => (
          <TemplateEditorExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            onNameChange={(value) => updateExercise(exercise.id, "name", value)}
            onNoteChange={(value) => updateExercise(exercise.id, "note", value)}
            onRemove={() => removeExercise(exercise.id)}
            onRepTargetChange={(setIndex, field, value) =>
              updateRepTarget(exercise.id, setIndex, field, value)
            }
            onRepTargetFocus={(setIndex, field, value) =>
              clearRepTargetDefault(exercise.id, setIndex, field, value)
            }
            onSetCountChange={(value) => updateSetCount(exercise.id, value)}
          />
        ))}
      </div>

      <button className="secondary-button" type="button" onClick={addExercise}>
        Add exercise
      </button>

      <button className="primary-button" type="button" onClick={() => onSave(draft)}>
        Save template
      </button>
    </div>
  );
}
