"use client";

import { useMemo, useState } from "react";

import calendarStyles from "@/components/ui/date/calendar.module.css";
import historyStyles from "@/components/workout/cards/workout-history-card.module.css";
import { Panel } from "@/components/ui/panel";
import type { WorkoutSession } from "@/types/workout";

type MonthCell = {
  count: number;
  dayNumber: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
  level: number;
  workout: WorkoutSession | null;
};

type AccountCalendarProps = {
  onOpenWorkout: (workout: WorkoutSession) => void;
  workouts: WorkoutSession[];
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

function buildMonthDays(month: Date, workouts: WorkoutSession[]) {
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

export function AccountCalendar({
  onOpenWorkout,
  workouts,
}: AccountCalendarProps) {
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
    <Panel actions={<div className={historyStyles.date}>{completedCount} workouts</div>} title="Workout Calendar">
      {workouts.length === 0 ? (
        <div className="empty-state">Complete a workout to start your calendar.</div>
      ) : (
        <div className={calendarStyles.calendar}>
          <div className={calendarStyles.header}>
            <button
              aria-label="Previous month"
              className={calendarStyles.calendarArrow}
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
            >
              ←
            </button>
            <div className={calendarStyles.title}>{monthLabel(visibleMonth)}</div>
            <button
              aria-label="Next month"
              className={calendarStyles.calendarArrow}
              disabled={isCurrentMonth}
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
            >
              →
            </button>
          </div>

          <div className={calendarStyles.monthWeekdays}>
            {WEEKDAY_LABELS.map((label, index) => (
              <span className={calendarStyles.monthWeekday} key={`${label}-${index}`}>
                {label}
              </span>
            ))}
          </div>

          <div className={calendarStyles.monthGrid} aria-label="Workout calendar">
            {monthDays.map((day) =>
              day.isCurrentMonth ? (
                <button
                  className={[
                    calendarStyles.monthDay,
                    day.level === 2 ? calendarStyles.monthLevel2 : "",
                    day.level === 3 ? calendarStyles.monthLevel3 : "",
                    day.level === 4 ? calendarStyles.monthLevel4 : "",
                    day.isToday ? calendarStyles.monthDayToday : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={!day.workout}
                  key={day.key}
                  title={`${day.key}: ${day.count} workout${day.count === 1 ? "" : "s"}`}
                  type="button"
                  onClick={() => {
                    if (day.workout) {
                      onOpenWorkout(day.workout);
                    }
                  }}
                >
                  <span>{day.dayNumber}</span>
                </button>
              ) : (
                <div className={`${calendarStyles.monthDay} ${calendarStyles.monthDayEmpty}`} key={day.key} />
              ),
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
