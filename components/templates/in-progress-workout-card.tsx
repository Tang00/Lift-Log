"use client";

import styles from "@/components/templates/template-card.module.css";
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
    <button className={styles.card} type="button" onClick={onResumeWorkout}>
      <div className={styles.main}>
        <div className="exercise-name">{workout.title}</div>
        <div className="mini-pill">{workout.exercises.length} exercises</div>
      </div>
    </button>
  );
}
