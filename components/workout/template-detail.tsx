"use client";

import { useEffect, useMemo, useState } from "react";

import { useSegmentedScroll } from "@/hooks/use-segmented-scroll";
import { SegmentedScrollNav } from "@/components/ui/segmented-scroll-nav";
import styles from "@/components/workout/template-detail.module.css";
import cardStyles from "@/components/templates/template-card.module.css";
import { DeleteWorkoutModal } from "@/components/workout/delete-workout-modal";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { TemplateDetailDateModal } from "@/components/workout/template-detail-date-modal";
import type { WorkoutSession, WorkoutSetEntry } from "@/types/workout";

type TemplateDetailProps = {
  onAddExercise: () => void;
  onAddSet: (exerciseIndex: number) => void;
  onBack: () => void;
  onCompleteWorkout: () => void;
  onDeleteWorkout: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isEditingSavedSession: boolean;
  isReadOnly: boolean;
  isSavedSession: boolean;
  onRemoveExercise: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number) => void;
  onStartEditing: () => void;
  onUpdateCompletedAt: (value: string) => void;
  onUpdateExerciseName: (exerciseIndex: number, value: string) => void;
  onUpdateNote: (exerciseIndex: number, value: string) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSetEntry,
    value: string | boolean,
  ) => void;
  session: WorkoutSession;
};

function formatDateInputValue(value: string | null) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string | null) {
  return (value ? new Date(value) : new Date()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TemplateDetail({
  onAddExercise,
  onAddSet,
  onBack,
  onCompleteWorkout,
  onDeleteWorkout,
  onDirtyChange,
  isEditingSavedSession,
  isReadOnly,
  isSavedSession,
  onRemoveExercise,
  onRemoveSet,
  onStartEditing,
  onUpdateCompletedAt,
  onUpdateExerciseName,
  onUpdateNote,
  onUpdateSet,
  session,
}: TemplateDetailProps) {
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => formatDateInputValue(session.completedAt));
  const [visibleMonth, setVisibleMonth] = useState(() => draftDate.slice(0, 7));
  const totalSets = useMemo(
    () => session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
    [session.exercises],
  );

  const completedSets = useMemo(
    () =>
      session.exercises.reduce(
        (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
        0,
      ),
    [session.exercises],
  );

  useEffect(() => {
    const hasSessionContent =
      completedSets > 0 ||
      session.exercises.some((exercise) => exercise.note.trim() !== "");
    onDirtyChange?.(hasSessionContent);
  }, [completedSets, onDirtyChange, session.exercises]);

  const dateInputValue = formatDateInputValue(session.completedAt);
  const dateLabel = formatDateLabel(session.completedAt);
  const {
    activeIndex,
    containerRef,
    isScrollActive,
    scrollPaddingBottom,
    scrollToIndex,
    setItemRef,
    trailingRef,
  } = useSegmentedScroll(session.exercises.length);

  useEffect(() => {
    setDraftDate(dateInputValue);
    setVisibleMonth(dateInputValue.slice(0, 7));
  }, [dateInputValue]);

  return (
    <div className="stack">
      <div className={styles.header}>
        <button
          aria-label="Go back"
          className="back-arrow"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.title}>
          <h2>{session.title}</h2>
          <button
            className={`exercise-subtext ${styles.sessionDateButton}`}
            disabled={isReadOnly}
            type="button"
            onClick={() => setIsDateDialogOpen(true)}
          >
            {dateLabel}
          </button>
        </div>
        <div className={styles.headerActions}>
          {isSavedSession && !isEditingSavedSession ? (
            <button className={cardStyles.editButton} type="button" onClick={onStartEditing}>
              Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.scrollLayout}>
        <div
          className={styles.scrollArea}
          ref={containerRef}
          style={{ paddingBottom: `${scrollPaddingBottom}px` }}
        >
          <div className="exercise-list">
            {session.exercises.map((exercise, exerciseIndex) => (
              <div className={styles.scrollSnapItem} key={`${session.id}-${exercise.exerciseId}`} ref={setItemRef[exerciseIndex]}>
                <ExerciseCard
                  canRemoveExercise={session.exercises.length > 1}
                  exercise={exercise}
                  readOnly={isReadOnly}
                  onAddSet={() => onAddSet(exerciseIndex)}
                  onRemoveExercise={() => onRemoveExercise(exerciseIndex)}
                  onRemoveSet={() => onRemoveSet(exerciseIndex)}
                  onUpdateName={(value) => onUpdateExerciseName(exerciseIndex, value)}
                  onUpdateNote={(value) => onUpdateNote(exerciseIndex, value)}
                  onUpdateSet={(setIndex, field, value) =>
                    onUpdateSet(exerciseIndex, setIndex, field, value)
                  }
                />
              </div>
            ))}
          </div>
          {!isSavedSession || isEditingSavedSession ? (
            <div className={`${styles.actionStack} ${styles.scrollFooter}`} ref={trailingRef}>
              <button className="secondary-button" type="button" onClick={onAddExercise}>
                Add exercise
              </button>
              <button
                className="secondary-button danger-button"
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                {isSavedSession ? "Delete workout" : "Discard workout"}
              </button>
              <button
                className="primary-button"
                style={{ display: "block", width: "100%" }}
                type="button"
                onClick={onCompleteWorkout}
              >
                {isSavedSession ? "Save changes" : `Complete workout (${completedSets}/${totalSets})`}
              </button>
            </div>
          ) : null}
        </div>
        <SegmentedScrollNav
          activeIndex={activeIndex}
          count={session.exercises.length}
          isVisible={isScrollActive}
          labels={session.exercises.map((exercise) => exercise.name || "Exercise")}
          onSelect={scrollToIndex}
        />
      </div>

      {isDateDialogOpen ? (
        <TemplateDetailDateModal
          draftDate={draftDate}
          onClose={() => {
            setDraftDate(dateInputValue);
            setVisibleMonth(dateInputValue.slice(0, 7));
            setIsDateDialogOpen(false);
          }}
          onSelectDate={(value) => {
            setDraftDate(value);
            onUpdateCompletedAt(value);
            setIsDateDialogOpen(false);
          }}
          setVisibleMonth={setVisibleMonth}
          visibleMonth={visibleMonth}
        />
      ) : null}

      {isDeleteDialogOpen ? (
        <DeleteWorkoutModal
          isSavedSession={isSavedSession}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteDialogOpen(false);
            onDeleteWorkout();
          }}
        />
      ) : null}
    </div>
  );
}
