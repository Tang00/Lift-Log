"use client";

import { CardActionButton } from "@/components/ui/actions/card-action-button";
import styles from "@/components/workout/detail/template-detail.module.css";

type TemplateDetailHeaderProps = {
  dateLabel: string;
  isReadOnly: boolean;
  isSavedSession: boolean;
  isEditingSavedSession: boolean;
  onBack: () => void;
  onOpenDate: () => void;
  onStartEditing: () => void;
  title: string;
};

export function TemplateDetailHeader({
  dateLabel,
  isEditingSavedSession,
  isReadOnly,
  isSavedSession,
  onBack,
  onOpenDate,
  onStartEditing,
  title,
}: TemplateDetailHeaderProps) {
  return (
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
        <h2>{title}</h2>
        <button
          className={`exercise-subtext ${styles.sessionDateButton}`}
          disabled={isReadOnly}
          type="button"
          onClick={onOpenDate}
        >
          {dateLabel}
        </button>
      </div>
      <div className={styles.headerActions}>
        {isSavedSession && !isEditingSavedSession ? (
          <CardActionButton onClick={onStartEditing}>Edit</CardActionButton>
        ) : null}
      </div>
    </div>
  );
}
