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
    <ActionGroup>
      <button
        className="secondary-button"
        disabled={exerciseCount >= MAX_EXERCISES}
        type="button"
        onClick={onAddExercise}
      >
        Add exercise
      </button>
      <button
        className="secondary-button danger-button"
        type="button"
        onClick={onDeleteWorkout}
      >
        {isSavedSession ? "Delete workout" : "Discard workout"}
      </button>
      <button className="primary-button" type="button" onClick={onSaveWorkout}>
        {isSavedSession ? "Save changes" : `Complete workout (${completedSets}/${totalSets})`}
      </button>
    </ActionGroup>
  );
}
