"use client";

import type { ReactNode } from "react";

import { Modal } from "@/components/ui/overlays/modal";

type DialogModalProps = {
  actions?: ReactNode;
  message?: ReactNode;
  title: ReactNode;
  titleId: string;
};

export function DialogModal({
  actions,
  message,
  title,
  titleId,
}: DialogModalProps) {
  return (
    <Modal title={title} titleId={titleId}>
      {message ? <p className="modal-copy">{message}</p> : null}
      {actions ? <div className="modal-actions">{actions}</div> : null}
    </Modal>
  );
}
