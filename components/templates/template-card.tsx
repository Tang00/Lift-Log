"use client";

import { CardActionButton } from "@/components/ui/actions/card-action-button";
import { RowCard } from "@/components/ui/cards/row-card";
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
    <RowCard
      action={
        <CardActionButton square onClick={onEdit}>
          ✎
        </CardActionButton>
      }
      meta={`${template.exercises.length} exercises`}
      onSelect={onSelect}
      subtitle={template.summary || undefined}
      title={template.title}
    />
  );
}
