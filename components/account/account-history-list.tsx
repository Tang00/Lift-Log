"use client";

import { WorkoutHistoryCard } from "@/components/workout/workout-history-card";
import historyStyles from "@/components/workout/workout-history-card.module.css";
import { Panel } from "@/components/ui/panel";
import type { WorkoutSession } from "@/types/workout";

type AccountHistoryListProps = {
  onOpenWorkout: (workout: WorkoutSession) => void;
  workouts: WorkoutSession[];
};

export function AccountHistoryList({
  onOpenWorkout,
  workouts,
}: AccountHistoryListProps) {
  return (
    <Panel title="History">
      {workouts.length === 0 ? (
        <div className="empty-state">No workouts yet.</div>
      ) : (
        <div className={historyStyles.list}>
          {workouts.map((workout) => (
            <WorkoutHistoryCard
              key={workout.id}
              workout={workout}
              onOpen={() => onOpenWorkout(workout)}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
