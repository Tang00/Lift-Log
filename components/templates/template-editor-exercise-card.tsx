"use client";

import styles from "@/components/templates/template-editor.module.css";
import cardStyles from "@/components/templates/template-card.module.css";
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
  function sanitizeIntegerInput(value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      return clampIntegerString(value, MAX_REPS);
    }

    return null;
  }

  return (
    <div className={`panel ${styles.panel}`}>
      <div className="panel-header">
        <h3>Exercise {index + 1}</h3>
        <button className={cardStyles.removeButton} type="button" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className="field-label">Exercise name</span>
          <input
            className="text-input"
            type="text"
            value={exercise.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Bench Press"
          />
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className="field-label">Template note</span>
          <textarea
            className="text-input text-area-input"
            value={exercise.note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Shown under the exercise name during the workout"
            rows={2}
          />
        </label>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <div className="panel-header">
            <span className="field-label">Rep targets by set</span>
          </div>
          <div className={styles.repTargetList}>
            {exercise.repTargets.map((target, setIndex) => (
              <div className={styles.repTargetRow} key={`${exercise.id}-${setIndex + 1}`}>
                <span className={styles.repTargetLabel}>Set {setIndex + 1}</span>
                <label className={styles.repTargetField}>
                  <span className={styles.repTargetCaption}>Min</span>
                  <input
                  className="text-input"
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
                </label>
                <label className={styles.repTargetField}>
                  <span className={styles.repTargetCaption}>Max</span>
                  <input
                  className="text-input"
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
                </label>
                <button
                  className={cardStyles.removeButton}
                  disabled={exercise.repTargets.length <= 1}
                  type="button"
                  onClick={() => onRemoveSet(setIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles.repTargetActions}>
            <button
              className={cardStyles.editButton}
              disabled={!canAddSet}
              type="button"
              onClick={onAddSet}
            >
              Add set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
