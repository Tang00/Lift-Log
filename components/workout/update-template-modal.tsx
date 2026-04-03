"use client";

import { Modal } from "@/components/ui/modal";

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
    <Modal title="Update template too?" titleId="update-template-title">
      <p className="modal-copy">
        This session no longer matches its template. Do you want to update the
        template with the added or removed exercises and sets?
      </p>
      <div className="modal-actions">
        <button className="secondary-button modal-cancel-button" type="button" onClick={onClose}>
          Keep template
        </button>
        <button className="secondary-button" type="button" onClick={onKeepSessionOnly}>
          Save session only
        </button>
        <button className="primary-button" type="button" onClick={onUpdateTemplate}>
          Update template
        </button>
      </div>
    </Modal>
  );
}
