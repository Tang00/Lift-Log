"use client";

import { Modal } from "@/components/ui/modal";

type LoadingModalProps = {
  title: string;
};

export function LoadingModal({ title }: LoadingModalProps) {
  return (
    <Modal title={title} titleId="loading-modal-title">
      <p className="modal-copy">Please wait a moment.</p>
    </Modal>
  );
}
