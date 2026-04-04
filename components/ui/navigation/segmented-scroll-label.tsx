"use client";

import styles from "@/components/ui/navigation/segmented-scroll-nav.module.css";

type SegmentedScrollLabelProps = {
  label: string;
};

export function SegmentedScrollLabel({
  label,
}: SegmentedScrollLabelProps) {
  return <div className={styles.label}>{label}</div>;
}
