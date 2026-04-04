"use client";

import styles from "@/components/templates/template-card.module.css";
import { CardActionButton } from "@/components/ui/actions/card-action-button";
import type { WorkoutTemplate } from "@/types/workout";

type TemplateCardProps = {
  onEdit: () => void;
  onSelect: () => void;
  template: WorkoutTemplate;
};

export function TemplateCard({
  onEdit,
  onSelect,
  template,
}: TemplateCardProps) {
  return (
    <div className={styles.card}>
      <button className={styles.main} type="button" onClick={onSelect}>
        <div className={styles.copy}>
          <div className="exercise-name">{template.title}</div>
          {template.summary ? (
            <div className={styles.summary}>{template.summary}</div>
          ) : null}
        </div>
        <div className="mini-pill">{template.exercises.length} exercises</div>
      </button>
      <CardActionButton onClick={onEdit}>
        Edit
      </CardActionButton>
    </div>
  );
}
