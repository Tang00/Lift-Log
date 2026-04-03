"use client";

import styles from "@/components/workout/exercise-card.module.css";
import type { WorkoutExerciseEntry, WorkoutSetEntry } from "@/types/workout";

type ExerciseCardProps = {
  exercise: WorkoutExerciseEntry;
  readOnly?: boolean;
  onUpdateNote: (value: string) => void;
  onUpdateSet: (
    setIndex: number,
    field: keyof WorkoutSetEntry,
    value: string | boolean,
  ) => void;
};

export function ExerciseCard({
  exercise,
  readOnly = false,
  onUpdateNote,
  onUpdateSet,
}: ExerciseCardProps) {
  function sanitizeNumericInput(value: string) {
    if (value === "") {
      return value;
    }

    if (/^\d*\.?\d*$/.test(value)) {
      return value;
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

  function restoreDefaultValue(
    setIndex: number,
    field: "weight" | "reps",
    value: string,
    defaultValue: string,
    completed: boolean,
  ) {
    if (!completed && value.trim() === "") {
      onUpdateSet(setIndex, field, defaultValue);
      onUpdateSet(
        setIndex,
        field === "weight" ? "weightTouched" : "repsTouched",
        false,
      );
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h3>{exercise.name}</h3>
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
        </div>
      </div>

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
                  onUpdateSet(index, "weight", nextValue);
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
              onBlur={() =>
                restoreDefaultValue(
                  index,
                  "weight",
                  set.weight,
                  set.defaultWeight,
                  set.completed,
                )
              }
              placeholder="0"
            />

            <input
              aria-label={`${exercise.name} set ${index + 1} reps`}
              className={`text-input ${styles.compactInput} ${styles.spreadsheetInput}`}
              disabled={readOnly}
              readOnly={readOnly}
              type="text"
              inputMode="decimal"
              value={set.reps}
              onChange={(event) => {
                const nextValue = sanitizeNumericInput(event.target.value);
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
              onBlur={() =>
                restoreDefaultValue(
                  index,
                  "reps",
                  set.reps,
                  set.defaultReps,
                  set.completed,
                )
              }
              placeholder="0"
            />

            <label className={styles.checkboxCell}>
              <input
                checked={set.completed}
                disabled={readOnly}
                type="checkbox"
                onChange={(event) =>
                  onUpdateSet(index, "completed", event.target.checked)
                }
              />
            </label>
          </div>
        ))}
      </div>
    </article>
  );
}
