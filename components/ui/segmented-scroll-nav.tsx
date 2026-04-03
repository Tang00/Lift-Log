"use client";

import { useRef, useState } from "react";

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
  const railRef = useRef<HTMLElement | null>(null);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  function selectFromClientY(clientY: number) {
    const rail = railRef.current;

    if (!rail || count <= 0) {
      return;
    }

    const rect = rail.getBoundingClientRect();
    const relativeY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const nextIndex = Math.min(
      count - 1,
      Math.max(0, Math.floor((relativeY / Math.max(rect.height, 1)) * count)),
    );

    onSelect(nextIndex);
  }

  return (
    <nav
      aria-label="Exercise navigation"
      className={`${styles.rail} ${isVisible || isInteracting ? styles.railVisible : ""}`}
      ref={railRef}
      onBlur={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onPointerDown={(event) => {
        setIsInteracting(true);
        setActivePointerId(event.pointerId);
        railRef.current?.setPointerCapture(event.pointerId);
        selectFromClientY(event.clientY);
      }}
      onPointerMove={(event) => {
        if (activePointerId !== event.pointerId) {
          return;
        }

        selectFromClientY(event.clientY);
      }}
      onPointerUp={(event) => {
        if (activePointerId === event.pointerId) {
          railRef.current?.releasePointerCapture(event.pointerId);
          setActivePointerId(null);
        }
        setIsInteracting(false);
      }}
      onPointerCancel={(event) => {
        if (activePointerId === event.pointerId) {
          railRef.current?.releasePointerCapture(event.pointerId);
          setActivePointerId(null);
        }
        setIsInteracting(false);
      }}
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
