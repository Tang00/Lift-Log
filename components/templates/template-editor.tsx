"use client";

import { SegmentedScrollNav } from "@/components/ui/navigation/segmented-scroll-nav";
import { ActionGroup } from "@/components/ui/actions/action-group";
import { ScrollablePane } from "@/components/ui/navigation/scrollable-pane";
import { useSegmentedScroll } from "@/hooks/ui/use-segmented-scroll";
import { useTemplateEditorDraft } from "@/hooks/templates/use-template-editor-draft";
import { TemplateEditorBasics } from "@/components/templates/template-editor-basics";
import styles from "@/components/templates/template-editor.module.css";
import { TemplateEditorExerciseCard } from "@/components/templates/template-editor-exercise-card";
import { TemplateEditorHeader } from "@/components/templates/template-editor-header";
import type { WorkoutTemplate } from "@/types/workout";
import { MAX_EXERCISES, MAX_SETS } from "@/utils/workout/limits";

type TemplateEditorProps = {
  mode: "create" | "edit";
  onDirtyChange?: (isDirty: boolean) => void;
  onBack: () => void;
  onSave: (template: WorkoutTemplate) => void;
  template: WorkoutTemplate;
};

export function TemplateEditor({
  mode,
  onDirtyChange,
  onBack,
  onSave,
  template,
}: TemplateEditorProps) {
  const {
    addExercise,
    addSet,
    draft,
    heading,
    removeExercise,
    removeSet,
    setDraft,
    updateExercise,
    updateRepTarget,
  } = useTemplateEditorDraft({
    mode,
    onDirtyChange,
    template,
  });
  const {
    activeIndex,
    containerRef,
    isScrollActive,
    scrollPaddingBottom,
    scrubToIndex,
    scrollToIndex,
    setItemRef,
    trailingRef,
  } = useSegmentedScroll(draft.exercises.length);

  return (
    <div className={styles.root}>
      <TemplateEditorHeader heading={heading} onBack={onBack} />

      <ScrollablePane
        rail={
          <SegmentedScrollNav
            activeIndex={activeIndex}
            count={draft.exercises.length}
            isVisible={isScrollActive}
            labels={draft.exercises.map((exercise) => exercise.name || "Exercise")}
            onScrub={scrubToIndex}
            onSelect={scrollToIndex}
          />
        }
        scrollPaddingBottom={scrollPaddingBottom}
        scrollRef={containerRef}
      >
          <TemplateEditorBasics
            onSummaryChange={(value) =>
              setDraft((current) => ({ ...current, summary: value }))
            }
            onTitleChange={(value) =>
              setDraft((current) => ({ ...current, title: value }))
            }
            template={draft}
          />
          <div className="stack">
            {draft.exercises.map((exercise, index) => (
              <div className={styles.scrollSnapItem} key={exercise.id} ref={setItemRef[index]}>
                <TemplateEditorExerciseCard
                  canAddSet={exercise.repTargets.length < MAX_SETS}
                  exercise={exercise}
                  index={index}
                  onAddSet={() => addSet(exercise.id)}
                  onNameChange={(value) => updateExercise(exercise.id, "name", value)}
                  onNoteChange={(value) => updateExercise(exercise.id, "note", value)}
                  onRemove={() => removeExercise(exercise.id)}
                  onRemoveSet={(setIndex) => removeSet(exercise.id, setIndex)}
                  onRepTargetChange={(setIndex, field, value) =>
                    updateRepTarget(exercise.id, setIndex, field, value)
                  }
                />
              </div>
            ))}
          </div>
          <div className={styles.scrollFooter} ref={trailingRef}>
            <ActionGroup className={styles.editorActions}>
              <button
                className="secondary-button"
                disabled={draft.exercises.length >= MAX_EXERCISES}
                type="button"
                onClick={addExercise}
              >
                Add exercise
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={() => onSave(draft)}
              >
                Save template
              </button>
            </ActionGroup>
          </div>
      </ScrollablePane>

    </div>
  );
}
