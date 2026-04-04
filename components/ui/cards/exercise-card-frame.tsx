"use client";

import type { ReactNode } from "react";

import styles from "@/components/ui/cards/exercise-card-frame.module.css";

type ExerciseCardFrameProps = {
  children: ReactNode;
  footer?: ReactNode;
  heading: ReactNode;
  headingCompact?: boolean;
  removeAction?: ReactNode;
};

function joinClassNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ExerciseCardFrame({
  children,
  footer,
  heading,
  headingCompact = false,
  removeAction,
}: ExerciseCardFrameProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={joinClassNames(styles.heading, headingCompact && styles.headingCompact)}>
          {heading}
        </div>
        {removeAction ? <div className={styles.removeAction}>{removeAction}</div> : null}
      </div>
      {children}
      {footer ? <div className={styles.footerControls}>{footer}</div> : null}
    </article>
  );
}
