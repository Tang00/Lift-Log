"use client";

import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";

type TemplateMenuProps = {
  inProgressWorkout: WorkoutSession | null;
  onCreateTemplate: () => void;
  onEditTemplate: (template: WorkoutTemplate) => void;
  onResumeWorkout: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
};

export function TemplateMenu({
  inProgressWorkout,
  onCreateTemplate,
  onEditTemplate,
  onResumeWorkout,
  onSelectTemplate,
  templates,
}: TemplateMenuProps) {
  return (
    <div className="stack">
      {inProgressWorkout ? (
        <div className="panel">
          <div className="panel-header">
            <h3>In Progress</h3>
          </div>
          <button className="template-card" type="button" onClick={onResumeWorkout}>
            <div className="template-main">
              <div className="exercise-name">{inProgressWorkout.title}</div>
              <div className="mini-pill">{inProgressWorkout.exercises.length} exercises</div>
            </div>
          </button>
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-header">
          <h3>Templates</h3>
          <button
            aria-label="Create template"
            className="icon-button"
            type="button"
            onClick={onCreateTemplate}
          >
            +
          </button>
        </div>
        {templates.length === 0 ? (
          <div className="empty-state">No templates yet.</div>
        ) : (
          <div className="template-list">
            {templates.map((template) => (
              <div className="template-card" key={template.id}>
                <button
                  className="template-main"
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="exercise-name">{template.title}</div>
                  <div className="mini-pill">{template.exercises.length} exercises</div>
                </button>
                <button
                  className="template-edit-button"
                  type="button"
                  onClick={() => onEditTemplate(template)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
