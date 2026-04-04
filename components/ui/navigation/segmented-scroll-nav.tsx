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
  const [isInteracting, setIsInteracting] = useState(false);
  const [labelIndex, setLabelIndex] = useState<number | null>(null);

  function clearHideTimeout() {
    if (hideTimeoutRef.current == null) {
      return;
    }

    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  }

  function pulseRail() {
    clearHideTimeout();
    setIsInteracting(true);
    hideTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
      hideTimeoutRef.current = null;
    }, 1600);
  }

  useEffect(() => () => clearHideTimeout(), []);

  return (
    <nav
      aria-label="Exercise navigation"
      className={`${styles.rail} ${isInteracting ? styles.railActive : ""}`}
      onBlur={() => {
        clearHideTimeout();
        setIsInteracting(false);
        setLabelIndex(null);
      }}
      onFocus={() => pulseRail()}
      onMouseEnter={() => pulseRail()}
      onMouseLeave={() => {
        clearHideTimeout();
        setIsInteracting(false);
        setLabelIndex(null);
      }}
      onPointerDown={() => {
        pulseRail();
      }}
      onPointerUp={() => {
        pulseRail();
      }}
      onPointerCancel={() => {
        clearHideTimeout();
        setIsInteracting(false);
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.segmentWrap} key={`${labels?.[index] ?? "exercise"}-${index}`}>
          <button
            aria-label={labels?.[index] ? `Go to ${labels[index]}` : `Go to exercise ${index + 1}`}
            aria-pressed={index === activeIndex}
            className={`${styles.segment} ${index === activeIndex ? styles.segmentActive : ""}`}
            type="button"
            onBlur={() => {
              setLabelIndex((current) => (current === index ? null : current));
            }}
            onClick={() => {
              pulseRail();
              setLabelIndex(index);
              onSelect(index);
            }}
            onFocus={() => {
              pulseRail();
              setLabelIndex(index);
            }}
            onMouseEnter={() => {
              pulseRail();
              setLabelIndex(index);
            }}
            onMouseLeave={() => {
              setLabelIndex((current) => (current === index ? null : current));
            }}
          />
          {labelIndex === index && labels?.[index] ? (
            <SegmentedScrollLabel label={labels[index]} />
          ) : null}
        </div>
      ))}
    </nav>
  );
}
