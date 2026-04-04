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
            className="text-input"
            type="text"
            value={template.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Workout template"
          />
        </label>
        <label className={styles.field}>
          <span className="field-label">Description</span>
          <input
            className="text-input"
            type="text"
            value={template.summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            placeholder="Workout description (optional)"
          />
        </label>
      </div>
    </div>
  );
}
