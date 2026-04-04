"use client";

import type { ReactNode } from "react";

import styles from "@/components/ui/cards/row-card.module.css";

type RowCardProps = {
  action?: ReactNode;
  meta?: ReactNode;
  onSelect: () => void;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function RowCard({
  action,
  meta,
  onSelect,
  subtitle,
  title,
}: RowCardProps) {
  return (
    <div className={styles.card}>
      <button className={styles.main} type="button" onClick={onSelect}>
        <div className={styles.copy}>
          <div className={styles.title}>{title}</div>
          {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
        </div>
        {meta ? <div className={styles.meta}>{meta}</div> : null}
      </button>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
