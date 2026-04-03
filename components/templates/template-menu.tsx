"use client";

import { InProgressWorkoutCard } from "@/components/templates/in-progress-workout-card";
import { TemplateCard } from "@/components/templates/template-card";
import cardStyles from "@/components/templates/template-card.module.css";
import styles from "@/components/templates/template-menu.module.css";
import { Panel } from "@/components/ui/panel";
import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";
import { MAX_TEMPLATES } from "@/utils/workout/limits";

type TemplateMenuProps = {
  inProgressWorkout: WorkoutSession | null;
  onCreateBlankWorkout: () => void;
  onCreateTemplate: () => void;
  onEditTemplate: (template: WorkoutTemplate) => void;
  onResumeWorkout: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
};

export function TemplateMenu({
  inProgressWorkout,
  onCreateBlankWorkout,
  onCreateTemplate,
  onEditTemplate,
  onResumeWorkout,
  onSelectTemplate,
  templates,
}: TemplateMenuProps) {
  const hasReachedTemplateLimit = templates.length >= MAX_TEMPLATES;

  return (
    <div className={styles.root}>
      <div className={styles.stack}>
        <Panel title="Start a workout">
          <button className="primary-button" type="button" onClick={onCreateBlankWorkout}>
            Start blank workout
          </button>
        </Panel>

        {inProgressWorkout ? (
          <Panel title="In Progress">
            <InProgressWorkoutCard
              workout={inProgressWorkout}
              onResumeWorkout={onResumeWorkout}
            />
          </Panel>
        ) : null}

        <Panel
          actions={
            <button
              aria-label="Create template"
              className={cardStyles.iconButton}
              disabled={hasReachedTemplateLimit}
              type="button"
              onClick={onCreateTemplate}
            >
              +
            </button>
          }
          title="Templates"
        >
          {templates.length === 0 ? (
            <div className="empty-state">No templates yet.</div>
          ) : (
            <div className="template-list">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => onEditTemplate(template)}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
