"use client";

import styles from "@/components/workout/cards/workout-history-card.module.css";
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
    <button className={styles.item} type="button" onClick={onOpen}>
      <div className={styles.itemMain}>
        <div className="exercise-name">{workout.title}</div>
        <div className={styles.date}>{formatDate(workout.completedAt)}</div>
      </div>
    </button>
  );
}
