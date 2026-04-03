"use client";

import { useMemo } from "react";

import calendarStyles from "@/components/ui/calendar.module.css";
import { Modal } from "@/components/ui/modal";

type CalendarDay = {
  dateValue: string | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

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

type TemplateDetailDateModalProps = {
  draftDate: string;
  onClose: () => void;
  onSelectDate: (value: string) => void;
  setVisibleMonth: (updater: (current: string) => string) => void;
  visibleMonth: string;
};

export function TemplateDetailDateModal({
  draftDate,
  onClose,
  onSelectDate,
  setVisibleMonth,
  visibleMonth,
}: TemplateDetailDateModalProps) {
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <Modal title="Edit date" titleId="edit-date-title">
      <div className={calendarStyles.calendar}>
        <div className={calendarStyles.header}>
          <button
            aria-label="Previous month"
            className={calendarStyles.calendarArrow}
            type="button"
            onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
          >
            ←
          </button>
          <div className={calendarStyles.title}>{monthLabel(visibleMonth)}</div>
          <button
            aria-label="Next month"
            className={calendarStyles.calendarArrow}
            type="button"
            onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
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

        <div className={calendarStyles.monthGrid} aria-label="Date picker">
          {calendarDays.map((day, index) =>
            day.isCurrentMonth ? (
              <button
                className={`${calendarStyles.monthDay} ${
                  day.dateValue === draftDate ? calendarStyles.monthDaySelected : ""
                }`}
                key={day.dateValue}
                type="button"
                onClick={() => {
                  if (!day.dateValue) {
                    return;
                  }

                  onSelectDate(day.dateValue);
                }}
              >
                <span>{day.dayNumber}</span>
              </button>
            ) : (
              <div
                className={`${calendarStyles.monthDay} ${calendarStyles.monthDayEmpty}`}
                key={`empty-${index}`}
              />
            ),
          )}
        </div>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
