"use client";

import styles from "@/components/templates/template-editor.module.css";
import cardStyles from "@/components/templates/template-card.module.css";
import type { TemplateExercise } from "@/types/workout";

type TemplateEditorExerciseCardProps = {
  exercise: TemplateExercise;
  index: number;
  onNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRemove: () => void;
  onRepTargetChange: (
    setIndex: number,
    field: "minReps" | "maxReps",
    value: string,
  ) => void;
  onRepTargetFocus: (
    setIndex: number,
    field: "minReps" | "maxReps",
    value: string,
  ) => void;
  onSetCountChange: (value: number) => void;
};

export function TemplateEditorExerciseCard({
  exercise,
  index,
  onNameChange,
  onNoteChange,
  onRemove,
  onRepTargetChange,
  onRepTargetFocus,
  onSetCountChange,
}: TemplateEditorExerciseCardProps) {
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

        <label className={styles.field}>
          <span className="field-label">Expected sets</span>
          <input
            className="text-input"
            min="1"
            type="number"
            value={exercise.expectedSets}
            onChange={(event) => onSetCountChange(Number(event.target.value || 1))}
          />
        </label>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <span className="field-label">Rep targets by set</span>
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
                    onChange={(event) =>
                      onRepTargetChange(setIndex, "minReps", event.target.value)
                    }
                    onFocus={() => onRepTargetFocus(setIndex, "minReps", target.minReps)}
                    placeholder="8"
                  />
                </label>
                <label className={styles.repTargetField}>
                  <span className={styles.repTargetCaption}>Max</span>
                  <input
                    className="text-input"
                    type="text"
                    value={target.maxReps}
                    onChange={(event) =>
                      onRepTargetChange(setIndex, "maxReps", event.target.value)
                    }
                    onFocus={() => onRepTargetFocus(setIndex, "maxReps", target.maxReps)}
                    placeholder=""
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
