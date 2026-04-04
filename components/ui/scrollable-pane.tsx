"use client";

import type { ReactNode, Ref } from "react";

import styles from "@/components/ui/scrollable-pane.module.css";

type ScrollablePaneProps = {
  children: ReactNode;
  className?: string;
  rail?: ReactNode;
  scrollClassName?: string;
  scrollPaddingBottom?: number;
  scrollRef?: Ref<HTMLDivElement>;
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ScrollablePane({
  children,
  className,
  rail,
  scrollClassName,
  scrollPaddingBottom,
  scrollRef,
}: ScrollablePaneProps) {
  return (
    <div
      className={joinClassNames(
        styles.root,
        !rail && styles.singleColumn,
        className,
      )}
    >
      <div
        className={joinClassNames(styles.scrollArea, scrollClassName)}
        ref={scrollRef}
        style={
          scrollPaddingBottom != null
            ? { paddingBottom: `${scrollPaddingBottom}px` }
            : undefined
        }
      >
        {children}
      </div>
      {rail}
    </div>
  );
}
