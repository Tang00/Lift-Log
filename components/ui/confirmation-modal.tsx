"use client";

import { Modal } from "@/components/ui/modal";

type ConfirmationModalProps = {
  cancelLabel?: string;
  confirmLabel: string;
  confirmTone?: "default" | "danger";
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  titleId: string;
};

export function ConfirmationModal({
  cancelLabel = "Cancel",
  confirmLabel,
  confirmTone = "default",
  message,
  onCancel,
  onConfirm,
  title,
  titleId,
}: ConfirmationModalProps) {
  return (
    <Modal title={title} titleId={titleId}>
      <p className="modal-copy">{message}</p>
      <div className="modal-actions">
        <button className="secondary-button modal-cancel-button" type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={
            confirmTone === "danger"
              ? "secondary-button danger-button"
              : "primary-button"
          }
          type="button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
