"use client";

import styles from "@/components/templates/template-editor.module.css";
import type { WorkoutTemplate } from "@/types/workout";

type TemplateEditorBasicsProps = {
  onSummaryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  template: WorkoutTemplate;
};

export function TemplateEditorBasics({
  onSummaryChange,
  onTitleChange,
  template,
}: TemplateEditorBasicsProps) {
  return (
    <div className={`panel ${styles.panel}`}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className="field-label">Template name</span>
          <input
            className={`text-input ${styles.exerciseNameInput}`}
            type="text"
            value={template.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Workout template"
          />
        </label>
        <label className={styles.field}>
          <span className="field-label">Description</span>
          <textarea
            className={`text-input text-area-input ${styles.exerciseNoteInput}`}
            value={template.summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            placeholder="Workout description (optional)"
            rows={2}
          />
        </label>
      </div>
    </div>
  );
}
