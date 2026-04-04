"use client";

import { RowCard } from "@/components/ui/cards/row-card";
import type { WorkoutSession } from "@/types/workout";

type WorkoutHistoryCardProps = {
  onOpen: () => void;
  workout: WorkoutSession;
};

function formatDate(date: string | null) {
  if (!date) {
    return "In progress";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function WorkoutHistoryCard({
  onOpen,
  workout,
}: WorkoutHistoryCardProps) {
  return (
    <RowCard
      meta={formatDate(workout.completedAt)}
      onSelect={onOpen}
      title={workout.title}
    />
  );
}
