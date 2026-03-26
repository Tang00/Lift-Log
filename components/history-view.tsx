"use client";

import type { WorkoutSession } from "@/types/workout";

type HistoryViewProps = {
  onOpenWorkout: (session: WorkoutSession) => void;
  workouts: WorkoutSession[];
};

export function HistoryView({ onOpenWorkout, workouts }: HistoryViewProps) {
  function formatDate(date: string | null) {
    if (!date) {
      return "In progress";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="panel-header">
          <h3>History</h3>
        </div>
        <div className="history-list">
          {workouts.map((workout) => (
            <button
              className="history-item"
              key={workout.id}
              type="button"
              onClick={() => onOpenWorkout(workout)}
            >
                <div className="history-item-main">
                  <div className="exercise-name">{workout.title}</div>
                  <div className="history-date">{formatDate(workout.completedAt)}</div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
