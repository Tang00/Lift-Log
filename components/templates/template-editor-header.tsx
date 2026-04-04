"use client";

import styles from "@/components/templates/template-editor.module.css";

type TemplateEditorHeaderProps = {
  heading: string;
  onBack: () => void;
};

export function TemplateEditorHeader({
  heading,
  onBack,
}: TemplateEditorHeaderProps) {
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
        <h2>{heading}</h2>
      </div>
    </div>
  );
}
