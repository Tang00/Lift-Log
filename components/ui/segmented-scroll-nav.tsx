"use client";

import { useState } from "react";

import styles from "@/components/ui/segmented-scroll-nav.module.css";

type SegmentedScrollNavProps = {
  activeIndex: number;
  count: number;
  isVisible?: boolean;
  labels?: string[];
  onSelect: (index: number) => void;
};

export function SegmentedScrollNav({
  activeIndex,
  count,
  isVisible = false,
  labels,
  onSelect,
}: SegmentedScrollNavProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <nav
      aria-label="Exercise navigation"
      className={`${styles.rail} ${isVisible || isInteracting ? styles.railVisible : ""}`}
      onBlur={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onPointerDown={() => setIsInteracting(true)}
      onPointerUp={() => setIsInteracting(false)}
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          aria-label={labels?.[index] ? `Go to ${labels[index]}` : `Go to exercise ${index + 1}`}
          aria-pressed={index === activeIndex}
          className={`${styles.segment} ${index === activeIndex ? styles.segmentActive : ""}`}
          key={`${labels?.[index] ?? "exercise"}-${index}`}
          title={labels?.[index] ?? `Exercise ${index + 1}`}
          type="button"
          onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}
