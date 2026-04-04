"use client";

import { DialogModal } from "@/components/ui/overlays/dialog-modal";

type LoadingModalProps = {
  title: string;
};

export function LoadingModal({ title }: LoadingModalProps) {
  return (
    <DialogModal
      message="Please wait a moment."
      title={title}
      titleId="loading-modal-title"
    />
  );
}
