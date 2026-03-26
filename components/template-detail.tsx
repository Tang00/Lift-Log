"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { ExerciseCard } from "@/components/exercise-card";
import type { WorkoutSession, WorkoutSetEntry } from "@/types/workout";

type CalendarDay = {
  dateValue: string | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type TemplateDetailProps = {
  onBack: () => void;
  onCompleteWorkout: () => void;
  onDeleteWorkout: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isEditingSavedSession: boolean;
  isReadOnly: boolean;
  isSavedSession: boolean;
  onStartEditing: () => void;
  onUpdateCompletedAt: (value: string) => void;
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

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(value: string, direction: -1 | 1) {
  const [year, month] = value.split("-").map(Number);
  const nextDate = new Date(year, month - 1 + direction, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
}

function buildCalendarDays(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const leadingBlankDays = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const cells: CalendarDay[] = Array.from({ length: leadingBlankDays }, () => ({
    dateValue: null,
    dayNumber: null,
    isCurrentMonth: false,
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      dateValue: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      dateValue: null,
      dayNumber: null,
      isCurrentMonth: false,
    });
  }

  return cells;
}

export function TemplateDetail({
  onBack,
  onCompleteWorkout,
  onDeleteWorkout,
  onDirtyChange,
  isEditingSavedSession,
  isReadOnly,
  isSavedSession,
  onStartEditing,
  onUpdateCompletedAt,
  onUpdateNote,
  onUpdateSet,
  session,
}: TemplateDetailProps) {
  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const hasSessionContent =
      completedSets > 0 ||
      session.exercises.some((exercise) => exercise.note.trim() !== "");
    onDirtyChange?.(hasSessionContent);
  }, [completedSets, onDirtyChange, session.exercises]);

  const dateInputValue = formatDateInputValue(session.completedAt);
  const dateLabel = formatDateLabel(session.completedAt);

  useEffect(() => {
    setDraftDate(dateInputValue);
    setVisibleMonth(dateInputValue.slice(0, 7));
  }, [dateInputValue]);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <div className="stack">
      <div className="workout-screen-header">
        <button
          aria-label="Go back"
          className="back-arrow"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <div className="workout-screen-title">
          <h2>{session.title}</h2>
          <button
            className="exercise-subtext session-date-button"
            disabled={isReadOnly}
            type="button"
            onClick={() => setIsDateDialogOpen(true)}
          >
            {dateLabel}
          </button>
        </div>
        <div className="detail-header-actions">
          {isSavedSession && !isEditingSavedSession ? (
            <button className="template-edit-button" type="button" onClick={onStartEditing}>
              Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="exercise-list">
        {session.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            exercise={exercise}
            key={`${session.id}-${exercise.exerciseId}`}
            readOnly={isReadOnly}
            onUpdateNote={(value) => onUpdateNote(exerciseIndex, value)}
            onUpdateSet={(setIndex, field, value) =>
              onUpdateSet(exerciseIndex, setIndex, field, value)
            }
          />
        ))}
      </div>

      {!isSavedSession || isEditingSavedSession ? (
        <div className="detail-actions-stack" style={{ width: "100%" }}>
          <button
            className="secondary-button danger-button"
            style={{ display: "block", width: "100%" }}
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

      {isMounted && isDateDialogOpen
        ? createPortal(
            <div className="modal-backdrop" role="presentation">
              <div
                aria-labelledby="edit-date-title"
                aria-modal="true"
                className="modal-card"
                role="dialog"
              >
                <div className="panel-header modal-header">
                  <h3 id="edit-date-title">Edit date</h3>
                </div>
                <div className="month-calendar">
                  <div className="month-calendar-header">
                    <button
                      aria-label="Previous month"
                      className="calendar-arrow"
                      type="button"
                      onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
                    >
                      ←
                    </button>
                    <div className="month-calendar-title">{monthLabel(visibleMonth)}</div>
                    <button
                      aria-label="Next month"
                      className="calendar-arrow"
                      type="button"
                      onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
                    >
                      →
                    </button>
                  </div>

                  <div className="month-weekdays">
                    {WEEKDAY_LABELS.map((label, index) => (
                      <span className="month-weekday" key={`${label}-${index}`}>
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="month-grid" aria-label="Date picker">
                    {calendarDays.map((day, index) =>
                      day.isCurrentMonth ? (
                        <button
                          className={`month-day ${
                            day.dateValue === draftDate ? "month-day-selected" : ""
                          }`}
                          key={day.dateValue}
                          type="button"
                          onClick={() => {
                            if (!day.dateValue) {
                              return;
                            }

                            setDraftDate(day.dateValue);
                            onUpdateCompletedAt(day.dateValue);
                            setIsDateDialogOpen(false);
                          }}
                        >
                          <span>{day.dayNumber}</span>
                        </button>
                      ) : (
                        <div className="month-day month-day-empty" key={`empty-${index}`} />
                      ),
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setDraftDate(dateInputValue);
                      setVisibleMonth(dateInputValue.slice(0, 7));
                      setIsDateDialogOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {isMounted && isDeleteDialogOpen
        ? createPortal(
            <div className="modal-backdrop" role="presentation">
              <div
                aria-labelledby="delete-workout-title"
                aria-modal="true"
                className="modal-card"
                role="dialog"
              >
                <div className="panel-header modal-header">
                  <h3 id="delete-workout-title">
                    {isSavedSession ? "Delete workout?" : "Discard workout?"}
                  </h3>
                </div>
                <p className="modal-copy">
                  {isSavedSession
                    ? "This will remove the workout and its logged sets."
                    : "This will remove the in-progress workout from the templates screen."}
                </p>
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="secondary-button danger-button"
                    type="button"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      onDeleteWorkout();
                    }}
                  >
                    {isSavedSession ? "Delete" : "Discard"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
