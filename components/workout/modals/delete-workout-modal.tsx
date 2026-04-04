"use client";

import { ConfirmationModal } from "@/components/ui/overlays/confirmation-modal";

type DeleteWorkoutModalProps = {
  isSavedSession: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteWorkoutModal({
  isSavedSession,
  onClose,
  onConfirm,
}: DeleteWorkoutModalProps) {
  return (
    <ConfirmationModal
      cancelLabel="Keep workout"
      confirmLabel={isSavedSession ? "Delete workout" : "Discard workout"}
      confirmTone="danger"
      message={
        isSavedSession
          ? "This will remove the workout and its logged sets."
          : "This will remove the in-progress workout from the templates screen."
      }
      onCancel={onClose}
      onConfirm={onConfirm}
      title={isSavedSession ? "Delete workout?" : "Discard workout?"}
      titleId="delete-workout-title"
    />
  );
}
