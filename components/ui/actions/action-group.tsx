"use client";

import type { ReactNode } from "react";

import styles from "@/components/ui/actions/action-group.module.css";

type ActionGroupProps = {
  children: ReactNode;
  className?: string;
  direction?: "vertical" | "horizontal";
  fullWidth?: boolean;
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ActionGroup({
  children,
  className,
  direction = "vertical",
  fullWidth = true,
}: ActionGroupProps) {
  return (
    <div
      className={joinClassNames(
        styles.group,
        direction === "vertical" ? styles.vertical : styles.horizontal,
        fullWidth ? styles.fullWidth : undefined,
        className,
      )}
    >
      {children}
    </div>
  );
}
