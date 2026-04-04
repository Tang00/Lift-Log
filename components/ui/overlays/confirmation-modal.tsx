"use client";

import { DialogModal } from "@/components/ui/overlays/dialog-modal";

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
    <DialogModal
      actions={
        <>
        <button className="secondary-button modal-cancel-button" type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={
            confirmTone === "danger"
              ? "secondary-button danger-action-button"
              : "primary-button"
          }
          type="button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        </>
      }
      message={message}
      title={title}
      titleId={titleId}
    />
  );
}
