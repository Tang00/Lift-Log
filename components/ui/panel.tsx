"use client";

import type { ReactNode } from "react";

type PanelProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Panel({ actions, children, className, title }: PanelProps) {
  return (
    <div className={joinClassNames("panel", className)}>
      {title || actions ? (
        <div className="panel-header">
          {title ? <h3>{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );
}
