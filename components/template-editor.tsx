"use client";

import { useEffect, useMemo, useState } from "react";

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
      <div className="workout-screen-header">
        <button
          aria-label="Go back"
          className="back-arrow"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <div className="workout-screen-title">
          <h2>{heading}</h2>
        </div>
      </div>

      <div className="panel editor-panel">
        <div className="editor-grid">
          <label className="editor-field">
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
          <label className="editor-field">
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
          <div className="panel editor-panel" key={exercise.id}>
            <div className="panel-header">
              <h3>Exercise {index + 1}</h3>
              <button
                className="template-remove-button"
                type="button"
                onClick={() => removeExercise(exercise.id)}
              >
                Remove
              </button>
            </div>

            <div className="editor-grid">
              <label className="editor-field">
                <span className="field-label">Exercise name</span>
                <input
                  className="text-input"
                  type="text"
                  value={exercise.name}
                  onChange={(event) =>
                    updateExercise(exercise.id, "name", event.target.value)
                  }
                  placeholder="Bench Press"
                />
              </label>

              <label className="editor-field editor-field-full">
                <span className="field-label">Template note</span>
                <textarea
                  className="text-input text-area-input"
                  value={exercise.note}
                  onChange={(event) =>
                    updateExercise(exercise.id, "note", event.target.value)
                  }
                  placeholder="Shown under the exercise name during the workout"
                  rows={2}
                />
              </label>

              <label className="editor-field">
                <span className="field-label">Expected sets</span>
                <input
                  className="text-input"
                  type="number"
                  min="1"
                  value={exercise.expectedSets}
                  onChange={(event) =>
                    updateSetCount(exercise.id, Number(event.target.value || 1))
                  }
                />
              </label>

              <div className="editor-field editor-field-full">
                <span className="field-label">Rep targets by set</span>
                <div className="rep-target-list">
                  {exercise.repTargets.map((target, setIndex) => (
                    <div className="rep-target-row" key={`${exercise.id}-${setIndex + 1}`}>
                      <span className="rep-target-label">Set {setIndex + 1}</span>
                      <label className="rep-target-field">
                        <span className="rep-target-caption">Min</span>
                        <input
                          className="text-input"
                          type="text"
                          value={target.minReps}
                          onChange={(event) =>
                            updateRepTarget(
                              exercise.id,
                              setIndex,
                              "minReps",
                              event.target.value,
                            )
                          }
                          onFocus={() =>
                            clearRepTargetDefault(
                              exercise.id,
                              setIndex,
                              "minReps",
                              target.minReps,
                            )
                          }
                          placeholder="8"
                        />
                      </label>
                      <label className="rep-target-field">
                        <span className="rep-target-caption">Max</span>
                        <input
                          className="text-input"
                          type="text"
                          value={target.maxReps}
                          onChange={(event) =>
                            updateRepTarget(
                              exercise.id,
                              setIndex,
                              "maxReps",
                              event.target.value,
                            )
                          }
                          onFocus={() =>
                            clearRepTargetDefault(
                              exercise.id,
                              setIndex,
                              "maxReps",
                              target.maxReps,
                            )
                          }
                          placeholder=""
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
