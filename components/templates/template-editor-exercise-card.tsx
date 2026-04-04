"use client";

import { useState } from "react";

import styles from "@/components/templates/template-editor.module.css";
import { CardActionButton } from "@/components/ui/actions/card-action-button";
import { ExerciseCardFrame } from "@/components/ui/cards/exercise-card-frame";
import { ConfirmationModal } from "@/components/ui/overlays/confirmation-modal";
import type { TemplateExercise } from "@/types/workout";
import { clampIntegerString, MAX_REPS } from "@/utils/workout/limits";

type TemplateEditorExerciseCardProps = {
  canAddSet: boolean;
  exercise: TemplateExercise;
  index: number;
  onAddSet: () => void;
  onNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRemove: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRepTargetChange: (
    setIndex: number,
    field: "minReps" | "maxReps",
    value: string,
  ) => void;
};

export function TemplateEditorExerciseCard({
  canAddSet,
  exercise,
  index,
  onAddSet,
  onNameChange,
  onNoteChange,
  onRemove,
  onRemoveSet,
  onRepTargetChange,
}: TemplateEditorExerciseCardProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  function sanitizeIntegerInput(value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      return clampIntegerString(value, MAX_REPS);
    }

    return null;
  }

  return (
    <>
    <ExerciseCardFrame
      footer={
        <>
          <CardActionButton disabled={!canAddSet} onClick={onAddSet}>
            Add set
          </CardActionButton>
          <CardActionButton
            disabled={exercise.repTargets.length <= 1}
            tone="danger"
            onClick={() => onRemoveSet(exercise.repTargets.length - 1)}
          >
            Remove set
          </CardActionButton>
        </>
      }
      heading={
        <>
          <div className={styles.exerciseIndex}>Exercise {index + 1}</div>
          <input
            className={`text-input ${styles.exerciseNameInput}`}
            type="text"
            value={exercise.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Exercise name"
          />
          <textarea
            className={`text-input text-area-input ${styles.exerciseNoteInput}`}
            value={exercise.note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Exercise details (optional)"
            rows={2}
          />
        </>
      }
      removeAction={
        <CardActionButton
          aria-label={`Remove ${exercise.name || "exercise"}`}
          square
          tone="danger"
          onClick={() => setIsRemoveDialogOpen(true)}
        >
          ×
        </CardActionButton>
      }
    >

      <div className={styles.repTable}>
        <div className={styles.repTableHeader}>
          <span>Set</span>
          <span>Min</span>
          <span>Max</span>
        </div>
        {exercise.repTargets.map((target, setIndex) => (
          <div className={styles.repTableRow} key={`${exercise.id}-${setIndex + 1}`}>
            <div className={styles.repSetIndex}>{setIndex + 1}</div>
            <input
              aria-label={`${exercise.name || "Exercise"} set ${setIndex + 1} minimum reps`}
              className={`text-input ${styles.repInput}`}
              type="text"
              value={target.minReps}
              inputMode="numeric"
              maxLength={2}
              onChange={(event) => {
                const nextValue = sanitizeIntegerInput(event.target.value);
                if (nextValue !== null) {
                  onRepTargetChange(setIndex, "minReps", nextValue);
                }
              }}
            />
            <input
              aria-label={`${exercise.name || "Exercise"} set ${setIndex + 1} maximum reps`}
              className={`text-input ${styles.repInput}`}
              type="text"
              value={target.maxReps}
              inputMode="numeric"
              maxLength={2}
              onChange={(event) => {
                const nextValue = sanitizeIntegerInput(event.target.value);
                if (nextValue !== null) {
                  onRepTargetChange(setIndex, "maxReps", nextValue);
                }
              }}
            />
          </div>
        ))}
      </div>
    </ExerciseCardFrame>
    {isRemoveDialogOpen ? (
      <ConfirmationModal
        cancelLabel="Keep exercise"
        confirmLabel="Remove exercise"
        confirmTone="danger"
        message={`This will remove ${exercise.name || "this exercise"} and its planned sets from the template.`}
        onCancel={() => setIsRemoveDialogOpen(false)}
        onConfirm={() => {
          setIsRemoveDialogOpen(false);
          onRemove();
        }}
        title="Remove exercise?"
        titleId={`remove-template-exercise-${exercise.id}`}
      />
    ) : null}
    </>
  );
}
