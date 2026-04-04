"use client";

import { DialogModal } from "@/components/ui/overlays/dialog-modal";

type UpdateTemplateModalProps = {
  onClose: () => void;
  onKeepSessionOnly: () => void;
  onUpdateTemplate: () => void;
};

export function UpdateTemplateModal({
  onClose,
  onKeepSessionOnly,
  onUpdateTemplate,
}: UpdateTemplateModalProps) {
  return (
    <DialogModal
      actions={
        <>
        <button className="secondary-button modal-cancel-button" type="button" onClick={onClose}>
          Keep template
        </button>
        <button className="secondary-button" type="button" onClick={onKeepSessionOnly}>
          Save session only
        </button>
        <button className="primary-button" type="button" onClick={onUpdateTemplate}>
          Update template
        </button>
        </>
      }
      message="This session no longer matches its template. Do you want to update the template with the added or removed exercises and sets?"
      title="Update template too?"
      titleId="update-template-title"
    />
  );
}
