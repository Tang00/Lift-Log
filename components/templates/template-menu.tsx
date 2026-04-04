"use client";

import { InProgressWorkoutCard } from "@/components/templates/in-progress-workout-card";
import { TemplateCard } from "@/components/templates/template-card";
import { CardActionButton } from "@/components/ui/actions/card-action-button";
import styles from "@/components/templates/template-menu.module.css";
import { Panel } from "@/components/ui/panel";
import { ScrollablePane } from "@/components/ui/navigation/scrollable-pane";
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
    <ScrollablePane>
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
            <CardActionButton
              aria-label="Create template"
              disabled={hasReachedTemplateLimit}
              square
              onClick={onCreateTemplate}
            >
              +
            </CardActionButton>
          }
          title="Templates"
        >
          {templates.length === 0 ? (
            <div className="empty-state">No templates yet.</div>
          ) : (
            <div className={styles.templateList}>
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
    </ScrollablePane>
  );
}
