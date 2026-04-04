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
            placeholder="Push Day"
          />
        </label>
        <label className={styles.field}>
          <span className="field-label">Summary</span>
          <input
            className="text-input"
            type="text"
            value={template.summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            placeholder="Chest, shoulders, triceps"
          />
        </label>
      </div>
    </div>
  );
}
