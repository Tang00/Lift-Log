"use client";

import { Modal } from "@/components/ui/modal";

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
    <Modal
      title={isSavedSession ? "Delete workout?" : "Discard workout?"}
      titleId="delete-workout-title"
    >
      <p className="modal-copy">
        {isSavedSession
          ? "This will remove the workout and its logged sets."
          : "This will remove the in-progress workout from the templates screen."}
      </p>
      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="secondary-button danger-button" type="button" onClick={onConfirm}>
          {isSavedSession ? "Delete" : "Discard"}
        </button>
      </div>
    </Modal>
  );
}
