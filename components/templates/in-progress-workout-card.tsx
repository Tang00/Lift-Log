"use client";

import { RowCard } from "@/components/ui/cards/row-card";
import type { WorkoutSession } from "@/types/workout";

type InProgressWorkoutCardProps = {
  workout: WorkoutSession;
  onResumeWorkout: () => void;
};

export function InProgressWorkoutCard({
  workout,
  onResumeWorkout,
}: InProgressWorkoutCardProps) {
  return (
    <RowCard
      meta={`${workout.exercises.length} exercises`}
      onSelect={onResumeWorkout}
      subtitle="Resume your in-progress workout"
      title={workout.title}
    />
  );
}
