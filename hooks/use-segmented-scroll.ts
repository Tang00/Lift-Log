"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function getItemTop(root: HTMLDivElement, item: HTMLDivElement) {
  const rootRect = root.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return itemRect.top - rootRect.top + root.scrollTop;
}

export function useSegmentedScroll(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const trailingRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrollActive, setIsScrollActive] = useState(false);
  const [scrollPaddingBottom, setScrollPaddingBottom] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
    setActiveIndex((current) => Math.min(current, Math.max(0, itemCount - 1)));
  }, [itemCount]);

  useEffect(() => {
    const root = containerRef.current;
    const lastItem = itemRefs.current[itemCount - 1] ?? null;
    const trailing = trailingRef.current;

    if (!root || !lastItem) {
      setScrollPaddingBottom(0);
      return;
    }

    function getOuterHeight(node: HTMLElement | null) {
      if (!node) {
        return 0;
      }

      const styles = window.getComputedStyle(node);
      const marginTop = Number.parseFloat(styles.marginTop) || 0;
      const marginBottom = Number.parseFloat(styles.marginBottom) || 0;
      return node.offsetHeight + marginTop + marginBottom;
    }

    function updatePadding() {
      const nextRoot = containerRef.current;
      const nextLastItem = itemRefs.current[itemCount - 1] ?? null;

      if (!nextRoot || !nextLastItem) {
        setScrollPaddingBottom(0);
        return;
      }

      const viewportHeight = nextRoot.clientHeight;
      const lastItemHeight = nextLastItem.offsetHeight;
      const trailingHeight = getOuterHeight(trailingRef.current);
      const nextPadding = Math.max(viewportHeight - lastItemHeight - trailingHeight, 0);

      setScrollPaddingBottom(Math.ceil(nextPadding));
    }

    updatePadding();

    const observer = new ResizeObserver(updatePadding);
    observer.observe(root);
    observer.observe(lastItem);

    if (trailing) {
      observer.observe(trailing);
    }

    return () => {
      observer.disconnect();
    };
  }, [itemCount]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {
      return;
    }

    let frameId = 0;
    let scrollTimeoutId = 0;

    function updateActiveFromScroll() {
      frameId = 0;
      const nextRoot = containerRef.current;

      if (!nextRoot) {
        return;
      }

      const rootScrollTop = nextRoot.scrollTop;
      let nextIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const distance = Math.abs(getItemTop(nextRoot, item) - rootScrollTop);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextIndex = index;
        }
      });

      setActiveIndex(nextIndex);
    }

    function handleScroll() {
      setIsScrollActive(true);
      if (scrollTimeoutId !== 0) {
        window.clearTimeout(scrollTimeoutId);
      }
      scrollTimeoutId = window.setTimeout(() => {
        setIsScrollActive(false);
        scrollTimeoutId = 0;
      }, 700);

      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveFromScroll);
    }

    updateActiveFromScroll();
    root.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      root.removeEventListener("scroll", handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      if (scrollTimeoutId !== 0) {
        window.clearTimeout(scrollTimeoutId);
      }
    };
  }, [itemCount]);

  const setItemRef = useMemo(
    () =>
      Array.from({ length: itemCount }, (_, index) => (node: HTMLDivElement | null) => {
        itemRefs.current[index] = node;
      }),
    [itemCount],
  );

  function getScrollTopForIndex(index: number) {
    const root = containerRef.current;
    const item = itemRefs.current[index];

    if (!root || !item) {
      return null;
    }

    return Math.max(getItemTop(root, item), 0);
  }

  function scrubToIndex(index: number) {
    const root = containerRef.current;
    const nextTop = getScrollTopForIndex(index);

    if (!root || nextTop == null) {
      return;
    }

    root.scrollTop = nextTop;
    setActiveIndex(index);
    setIsScrollActive(true);
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const root = containerRef.current;
    const nextTop = getScrollTopForIndex(index);

    if (!root || nextTop == null) {
      return;
    }

    root.scrollTo({
      top: nextTop,
      behavior,
    });
  }

  return {
    activeIndex,
    containerRef,
    isScrollActive,
    scrollPaddingBottom,
    scrubToIndex,
    scrollToIndex,
    setItemRef,
    trailingRef,
  };
}
