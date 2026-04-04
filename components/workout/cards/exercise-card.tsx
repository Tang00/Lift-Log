"use client";

import { useState } from "react";

import { CardActionButton } from "@/components/ui/actions/card-action-button";
import { ExerciseCardFrame } from "@/components/ui/cards/exercise-card-frame";
import { ConfirmationModal } from "@/components/ui/overlays/confirmation-modal";
import styles from "@/components/workout/cards/exercise-card.module.css";
import type { WorkoutExerciseEntry, WorkoutSetEntry } from "@/types/workout";
import { clampDecimalString, clampIntegerString, MAX_REPS, MAX_SETS, MAX_WEIGHT } from "@/utils/workout/limits";

type ExerciseCardProps = {
  exercise: WorkoutExerciseEntry;
  canRemoveExercise?: boolean;
  readOnly?: boolean;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onRemoveSet: () => void;
  onUpdateName: (value: string) => void;
  onUpdateNote: (value: string) => void;
  onUpdateSet: (
    setIndex: number,
    field: keyof WorkoutSetEntry,
    value: string | boolean,
  ) => void;
};

export function ExerciseCard({
  exercise,
  canRemoveExercise = true,
  readOnly = false,
  onAddSet,
  onRemoveExercise,
  onRemoveSet,
  onUpdateName,
  onUpdateNote,
  onUpdateSet,
}: ExerciseCardProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  function sanitizeNumericInput(value: string) {
    if (value === "") {
      return value;
    }

    if (/^\d*\.?\d*$/.test(value)) {
      return value;
    }

    return null;
  }

  function sanitizeIntegerInput(value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      return clampIntegerString(value, MAX_REPS);
    }

    return null;
  }

  function formatRepTarget(set: WorkoutSetEntry) {
    if (set.minReps && set.maxReps) {
      return `${set.minReps}-${set.maxReps}`;
    }

    return set.minReps || set.maxReps || "";
  }

  function clearDefaultValue(
    setIndex: number,
    field: "weight" | "reps",
    value: string,
    defaultValue: string,
    touched: boolean,
  ) {
    if (!touched && value === defaultValue) {
      onUpdateSet(setIndex, field, "");
    }
  }

  return (
    <>
      <ExerciseCardFrame
      footer={
        !readOnly ? (
          <>
            <CardActionButton
              disabled={exercise.sets.length >= MAX_SETS}
              onClick={onAddSet}
            >
              Add set
            </CardActionButton>
            <CardActionButton
              disabled={exercise.sets.length <= 1}
              tone="danger"
              onClick={onRemoveSet}
            >
              Remove set
            </CardActionButton>
          </>
        ) : undefined
      }
      heading={
        <>
          {readOnly ? (
            <h3>{exercise.name}</h3>
          ) : (
            <input
              aria-label="Exercise name"
              className={`text-input ${styles.nameInput}`}
              type="text"
              value={exercise.name}
              onChange={(event) => onUpdateName(event.target.value)}
              placeholder="Exercise name"
            />
          )}
          {exercise.templateNote ? (
            <div className="exercise-subtext">{exercise.templateNote}</div>
          ) : null}
          <textarea
            className={`text-input text-area-input ${styles.noteInput}`}
            disabled={readOnly}
            readOnly={readOnly}
            value={exercise.note}
            onChange={(event) => onUpdateNote(event.target.value)}
            placeholder="Notes"
            rows={2}
          />
        </>
      }
      headingCompact
      removeAction={
        !readOnly ? (
          <CardActionButton
            aria-label={`Remove ${exercise.name || "exercise"}`}
            disabled={!canRemoveExercise}
            square
            tone="danger"
            onClick={() => setIsRemoveDialogOpen(true)}
          >
            ×
          </CardActionButton>
        ) : undefined
      }
    >

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Set</span>
          <span>Previous</span>
          <span>Weight</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {exercise.sets.map((set, index) => (
          <div className={styles.row} key={`${exercise.exerciseId}-${index + 1}`}>
            <div className={`${styles.cell} ${styles.indexCell}`}>
              <div className={styles.index}>{index + 1}</div>
              <div className={styles.target}>{formatRepTarget(set)}</div>
            </div>

            {exercise.previousResults?.[index] ? (
              <div className={`${styles.cell} ${styles.previousSet}`}>
                {exercise.previousResults[index]?.weight} x{" "}
                {exercise.previousResults[index]?.reps}
              </div>
            ) : (
              <div className={`${styles.cell} ${styles.previousSet} ${styles.previousSetEmpty}`}>
                —
              </div>
            )}

            <input
              aria-label={`${exercise.name} set ${index + 1} weight`}
              className={`text-input ${styles.compactInput} ${styles.spreadsheetInput}`}
              disabled={readOnly}
              readOnly={readOnly}
              type="text"
              inputMode="decimal"
              value={set.weight}
              onChange={(event) => {
                const nextValue = sanitizeNumericInput(event.target.value);
                if (nextValue !== null) {
                  onUpdateSet(index, "weight", clampDecimalString(nextValue, MAX_WEIGHT));
                }
              }}
              onFocus={() =>
                clearDefaultValue(
                  index,
                  "weight",
                  set.weight,
                  set.defaultWeight,
                  set.weightTouched,
                )
              }
              placeholder={set.defaultWeight}
            />

            <input
              aria-label={`${exercise.name} set ${index + 1} reps`}
              className={`text-input ${styles.compactInput} ${styles.spreadsheetInput}`}
              disabled={readOnly}
              readOnly={readOnly}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={set.reps}
              onChange={(event) => {
                const nextValue = sanitizeIntegerInput(event.target.value);
                if (nextValue !== null) {
                  onUpdateSet(index, "reps", nextValue);
                }
              }}
              onFocus={() =>
                clearDefaultValue(
                  index,
                  "reps",
                  set.reps,
                  set.defaultReps,
                  set.repsTouched,
                )
              }
              placeholder={set.defaultReps}
            />

            <label className={styles.checkboxCell}>
              <input
                checked={set.completed}
                className={styles.checkboxInput}
                disabled={readOnly}
                type="checkbox"
                onChange={(event) =>
                  onUpdateSet(index, "completed", event.target.checked)
                }
              />
              <span aria-hidden="true" className={styles.checkboxBox} />
            </label>
          </div>
        ))}
      </div>
      </ExerciseCardFrame>
      {isRemoveDialogOpen ? (
        <ConfirmationModal
          cancelLabel="Keep exercise"
          confirmLabel="Remove exercise"
          confirmTone="danger"
          message={`This will remove ${exercise.name || "this exercise"} and its sets from the current session.`}
          onCancel={() => setIsRemoveDialogOpen(false)}
          onConfirm={() => {
            setIsRemoveDialogOpen(false);
            onRemoveExercise();
          }}
          title="Remove exercise?"
          titleId={`remove-exercise-${exercise.exerciseId}`}
        />
      ) : null}
    </>
  );
}
