"use client";

import { useMemo, useState } from "react";

import type { WorkoutSession } from "@/types/workout";

type AccountViewProps = {
  accountInitial: string;
  email: string;
  onOpenWorkout: (workout: WorkoutSession) => void;
  onSignOut: () => void;
  workouts: WorkoutSession[];
};

type MonthCell = {
  count: number;
  dayNumber: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
  level: number;
  workout: WorkoutSession | null;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildWorkoutMap(workouts: WorkoutSession[]) {
  const workoutCountByDay = new Map<string, number>();
  const latestWorkoutByDay = new Map<string, WorkoutSession>();

  for (const workout of workouts) {
    if (!workout.completedAt) {
      continue;
    }

    const key = formatKey(startOfDay(new Date(workout.completedAt)));
    workoutCountByDay.set(key, (workoutCountByDay.get(key) ?? 0) + 1);

    if (!latestWorkoutByDay.has(key)) {
      latestWorkoutByDay.set(key, workout);
    }
  }

  return {
    latestWorkoutByDay,
    workoutCountByDay,
  };
}

function buildMonthDays(
  month: Date,
  workouts: WorkoutSession[],
) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(month);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const leadingBlankDays = monthStart.getDay();
  const { latestWorkoutByDay, workoutCountByDay } = buildWorkoutMap(workouts);

  const cells: MonthCell[] = Array.from({ length: leadingBlankDays }, (_, index) => ({
    count: 0,
    dayNumber: null,
    isCurrentMonth: false,
    isToday: false,
    key: `blank-${index}`,
    level: 0,
    workout: null,
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const key = formatKey(date);
    const count = workoutCountByDay.get(key) ?? 0;

    cells.push({
      count,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: key === formatKey(today),
      key,
      level: count >= 3 ? 4 : count === 2 ? 3 : count === 1 ? 2 : 0,
      workout: latestWorkoutByDay.get(key) ?? null,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      count: 0,
      dayNumber: null,
      isCurrentMonth: false,
      isToday: false,
      key: `tail-${cells.length}`,
      level: 0,
      workout: null,
    });
  }

  return cells;
}

export function AccountView({
  accountInitial,
  email,
  onOpenWorkout,
  onSignOut,
  workouts,
}: AccountViewProps) {
  const currentMonth = useMemo(() => startOfMonth(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(currentMonth);
  const completedCount = workouts.length;

  const monthDays = useMemo(
    () => buildMonthDays(visibleMonth, workouts),
    [visibleMonth, workouts],
  );

  const isCurrentMonth =
    visibleMonth.getFullYear() === currentMonth.getFullYear() &&
    visibleMonth.getMonth() === currentMonth.getMonth();

  return (
    <div className="stack">
      <div className="panel">
        <div className="account-summary">
          <div className="account-summary-avatar">{accountInitial}</div>
          <div className="account-summary-copy">
            <h3>Account</h3>
            <div className="exercise-subtext">{email}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Workout Calendar</h3>
          <div className="history-date">{completedCount} workouts</div>
        </div>

        {workouts.length === 0 ? (
          <div className="empty-state">Complete a workout to start your calendar.</div>
        ) : (
          <div className="month-calendar">
            <div className="month-calendar-header">
              <button
                aria-label="Previous month"
                className="calendar-arrow"
                type="button"
                onClick={() =>
                  setVisibleMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
              >
                ←
              </button>
              <div className="month-calendar-title">{monthLabel(visibleMonth)}</div>
              <button
                aria-label="Next month"
                className="calendar-arrow"
                disabled={isCurrentMonth}
                type="button"
                onClick={() =>
                  setVisibleMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
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

            <div className="month-grid" aria-label="Workout calendar">
              {monthDays.map((day) =>
                day.isCurrentMonth ? (
                  <button
                    className={`month-day month-level-${day.level} ${
                      day.isToday ? "month-day-today" : ""
                    }`}
                    disabled={!day.workout}
                    key={day.key}
                    type="button"
                    title={`${day.key}: ${day.count} workout${day.count === 1 ? "" : "s"}`}
                    onClick={() => {
                      if (day.workout) {
                        onOpenWorkout(day.workout);
                      }
                    }}
                  >
                    <span>{day.dayNumber}</span>
                  </button>
                ) : (
                  <div className="month-day month-day-empty" key={day.key} />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>History</h3>
        </div>
        {workouts.length === 0 ? (
          <div className="empty-state">No workouts yet.</div>
        ) : (
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
                  <div className="history-date">
                    {workout.completedAt
                      ? new Date(workout.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "In progress"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="secondary-button" type="button" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}
