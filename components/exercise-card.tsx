"use client";

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
    <article className="exercise-card">
      <div className="exercise-card-header">
        <div className="exercise-card-heading">
          <h3>{exercise.name}</h3>
          {exercise.templateNote ? (
            <div className="exercise-subtext">{exercise.templateNote}</div>
          ) : null}
          <textarea
            className="text-input text-area-input exercise-note-input"
            disabled={readOnly}
            readOnly={readOnly}
            value={exercise.note}
            onChange={(event) => onUpdateNote(event.target.value)}
            placeholder="Notes"
            rows={2}
          />
        </div>
      </div>

      <div className="set-table">
        <div className="set-table-header">
          <span>Set</span>
          <span>Previous</span>
          <span>Weight</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {exercise.sets.map((set, index) => (
          <div className="set-row" key={`${exercise.exerciseId}-${index + 1}`}>
            <div className="set-cell set-index-cell">
              <div className="set-index">{index + 1}</div>
              <div className="set-target">{formatRepTarget(set)}</div>
            </div>

            {exercise.previousResults?.[index] ? (
              <div className="set-cell previous-set">
                {exercise.previousResults[index]?.weight} x{" "}
                {exercise.previousResults[index]?.reps}
              </div>
            ) : (
              <div className="set-cell previous-set previous-set-empty">—</div>
            )}

            <input
              aria-label={`${exercise.name} set ${index + 1} weight`}
              className="text-input compact-input spreadsheet-input"
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
              className="text-input compact-input spreadsheet-input"
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

            <label className="checkbox-cell">
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
