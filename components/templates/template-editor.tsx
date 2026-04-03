"use client";

import { useEffect, useMemo, useState } from "react";

import { SegmentedScrollNav } from "@/components/ui/segmented-scroll-nav";
import { useSegmentedScroll } from "@/hooks/use-segmented-scroll";
import styles from "@/components/templates/template-editor.module.css";
import { TemplateEditorExerciseCard } from "@/components/templates/template-editor-exercise-card";
import type { TemplateExercise, WorkoutTemplate } from "@/types/workout";
import { clampIntegerString, MAX_EXERCISES, MAX_REPS, MAX_SETS } from "@/utils/workout/limits";

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
  const {
    activeIndex,
    containerRef,
    isScrollActive,
    scrollPaddingBottom,
    scrubToIndex,
    scrollToIndex,
    setItemRef,
    trailingRef,
  } = useSegmentedScroll(draft.exercises.length);

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

  return (
    <div className={styles.root}>
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

      <div className={styles.scrollLayout}>
        <div
          className={styles.scrollArea}
          ref={containerRef}
          style={{ paddingBottom: `${scrollPaddingBottom}px` }}
        >
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
              <div className={styles.scrollSnapItem} key={exercise.id} ref={setItemRef[index]}>
                <TemplateEditorExerciseCard
                  canAddSet={exercise.repTargets.length < MAX_SETS}
                  exercise={exercise}
                  index={index}
                  onAddSet={() => addSet(exercise.id)}
                  onNameChange={(value) => updateExercise(exercise.id, "name", value)}
                  onNoteChange={(value) => updateExercise(exercise.id, "note", value)}
                  onRemove={() => removeExercise(exercise.id)}
                  onRemoveSet={(setIndex) => removeSet(exercise.id, setIndex)}
                  onRepTargetChange={(setIndex, field, value) =>
                    updateRepTarget(exercise.id, setIndex, field, value)
                  }
                />
              </div>
            ))}
          </div>
          <div className={`${styles.editorActions} ${styles.scrollFooter}`} ref={trailingRef}>
            <button
              className="secondary-button"
              disabled={draft.exercises.length >= MAX_EXERCISES}
              type="button"
              onClick={addExercise}
            >
              Add exercise
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={() => onSave(draft)}
            >
              Save template
            </button>
          </div>
        </div>
        <SegmentedScrollNav
          activeIndex={activeIndex}
          count={draft.exercises.length}
          isVisible={isScrollActive}
          labels={draft.exercises.map((exercise) => exercise.name || "Exercise")}
          onScrub={scrubToIndex}
          onSelect={scrollToIndex}
        />
      </div>

    </div>
  );
}
