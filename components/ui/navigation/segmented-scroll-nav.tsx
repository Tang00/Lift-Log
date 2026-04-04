"use client";

import { useRef, useState } from "react";

import styles from "@/components/ui/navigation/segmented-scroll-nav.module.css";

type SegmentedScrollNavProps = {
  activeIndex: number;
  count: number;
  isVisible?: boolean;
  labels?: string[];
  onScrub: (index: number) => void;
  onSelect: (index: number) => void;
};

export function SegmentedScrollNav({
  activeIndex,
  count,
  isVisible = false,
  labels,
  onScrub,
  onSelect,
}: SegmentedScrollNavProps) {
  const railRef = useRef<HTMLElement | null>(null);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const lastScrubbedIndexRef = useRef<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  function releasePointer(pointerId: number) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    try {
      if (rail.hasPointerCapture(pointerId)) {
        rail.releasePointerCapture(pointerId);
      }
    } catch {
      // Mobile browsers can already drop capture before this handler runs.
    }
  }

  function getIndexFromClientY(clientY: number) {
    const rail = railRef.current;

    if (!rail || count <= 0) {
      return null;
    }

    const rect = rail.getBoundingClientRect();
    const relativeY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    return Math.min(
      count - 1,
      Math.max(0, Math.floor((relativeY / Math.max(rect.height, 1)) * count)),
    );
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
        event.preventDefault();
        setIsInteracting(true);
        setActivePointerId(event.pointerId);
        railRef.current?.setPointerCapture(event.pointerId);
        const nextIndex = getIndexFromClientY(event.clientY);
        if (nextIndex == null) {
          return;
        }
        lastScrubbedIndexRef.current = nextIndex;
        onScrub(nextIndex);
      }}
      onPointerMove={(event) => {
        if (activePointerId !== event.pointerId) {
          return;
        }

        const nextIndex = getIndexFromClientY(event.clientY);
        if (nextIndex == null || nextIndex === lastScrubbedIndexRef.current) {
          return;
        }

        lastScrubbedIndexRef.current = nextIndex;
        onScrub(nextIndex);
      }}
      onPointerUp={(event) => {
        if (activePointerId === event.pointerId) {
          releasePointer(event.pointerId);
          setActivePointerId(null);
        }
        lastScrubbedIndexRef.current = null;
        setIsInteracting(false);
      }}
      onPointerCancel={(event) => {
        if (activePointerId === event.pointerId) {
          releasePointer(event.pointerId);
          setActivePointerId(null);
        }
        lastScrubbedIndexRef.current = null;
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
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}
