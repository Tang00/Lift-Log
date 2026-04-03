"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: ReactNode;
  title?: ReactNode;
  titleId: string;
};

export function Modal({ children, title, titleId }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation">
      <div aria-labelledby={titleId} aria-modal="true" className="modal-card" role="dialog">
        {title ? (
          <div className="panel-header modal-header">
            <h3 id={titleId}>{title}</h3>
          </div>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
