"use client";

import { useEffect, useRef, useState } from "react";

import { SegmentedScrollLabel } from "@/components/ui/navigation/segmented-scroll-label";
import styles from "@/components/ui/navigation/segmented-scroll-nav.module.css";

type SegmentedScrollNavProps = {
  activeIndex: number;
  count: number;
  labels?: string[];
  onSelect: (index: number) => void;
};

export function SegmentedScrollNav({
  activeIndex,
  count,
  labels,
  onSelect,
}: SegmentedScrollNavProps) {
  const hideTimeoutRef = useRef<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  function clearHideTimeout() {
    if (hideTimeoutRef.current == null) {
      return;
    }

    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  }

  function expandRail() {
    clearHideTimeout();
    setIsExpanded(true);
    hideTimeoutRef.current = window.setTimeout(() => {
      setIsExpanded(false);
      hideTimeoutRef.current = null;
    }, 1600);
  }

  useEffect(() => () => clearHideTimeout(), []);

  return (
    <nav
      aria-label="Exercise navigation"
      className={`${styles.rail} ${isExpanded ? styles.railActive : ""}`}
      onBlur={() => {
        clearHideTimeout();
        setIsExpanded(false);
      }}
      onPointerCancel={() => {
        clearHideTimeout();
        setIsExpanded(false);
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.segmentWrap} key={`${labels?.[index] ?? "exercise"}-${index}`}>
          <button
            aria-label={labels?.[index] ? `Go to ${labels[index]}` : `Go to exercise ${index + 1}`}
            aria-pressed={index === activeIndex}
            className={`${styles.segment} ${index === activeIndex ? styles.segmentActive : ""}`}
            type="button"
            onClick={() => {
              if (!isExpanded) {
                expandRail();
                return;
              }

              expandRail();
              onSelect(index);
            }}
          />
          {isExpanded && labels?.[index] ? (
            <SegmentedScrollLabel label={labels[index]} />
          ) : null}
        </div>
      ))}
    </nav>
  );
}
