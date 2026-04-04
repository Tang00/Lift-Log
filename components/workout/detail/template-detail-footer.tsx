"use client";

import { ActionGroup } from "@/components/ui/actions/action-group";
import { MAX_EXERCISES } from "@/utils/workout/limits";

type TemplateDetailFooterProps = {
  completedSets: number;
  exerciseCount: number;
  isSavedSession: boolean;
  onAddExercise: () => void;
  onDeleteWorkout: () => void;
  onSaveWorkout: () => void;
  totalSets: number;
};

export function TemplateDetailFooter({
  completedSets,
  exerciseCount,
  isSavedSession,
  onAddExercise,
  onDeleteWorkout,
  onSaveWorkout,
  totalSets,
}: TemplateDetailFooterProps) {
  return (
    <div className="stack">
      <ActionGroup>
        <button
          className="secondary-button"
          disabled={exerciseCount >= MAX_EXERCISES}
          type="button"
          onClick={onAddExercise}
        >
          Add another exercise
        </button>
      </ActionGroup>
      <div className="footer-action-divider" />
      <ActionGroup className="footer-primary-actions">
        <button
          className="secondary-button danger-button"
          type="button"
          onClick={onDeleteWorkout}
        >
          {isSavedSession ? "Delete workout" : "Discard draft"}
        </button>
        <button className="primary-button" type="button" onClick={onSaveWorkout}>
          {isSavedSession ? "Save workout" : `Finish workout (${completedSets}/${totalSets})`}
        </button>
      </ActionGroup>
    </div>
  );
}
