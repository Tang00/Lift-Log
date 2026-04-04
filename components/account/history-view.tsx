"use client";

import { AccountCalendar } from "@/components/account/account-calendar";
import { AccountHistoryList } from "@/components/account/account-history-list";
import { ScrollablePane } from "@/components/ui/navigation/scrollable-pane";
import type { WorkoutSession } from "@/types/workout";

type HistoryViewProps = {
  onOpenWorkout: (workout: WorkoutSession) => void;
  workouts: WorkoutSession[];
};

export function HistoryView({
  onOpenWorkout,
  workouts,
}: HistoryViewProps) {
  return (
    <ScrollablePane>
      <div className="stack">
        <AccountCalendar onOpenWorkout={onOpenWorkout} workouts={workouts} />
        <AccountHistoryList onOpenWorkout={onOpenWorkout} workouts={workouts} />
      </div>
    </ScrollablePane>
  );
}
