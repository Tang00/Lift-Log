"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function getItemTop(root: HTMLDivElement, item: HTMLDivElement) {
  const rootRect = root.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return itemRect.top - rootRect.top + root.scrollTop;
}

function isWindowScrollMode() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

function getPageTop(item: HTMLDivElement) {
  return item.getBoundingClientRect().top + window.scrollY;
}

export function useSegmentedScroll(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const trailingRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPaddingBottom, setScrollPaddingBottom] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
    setActiveIndex((current) => Math.min(current, Math.max(0, itemCount - 1)));
  }, [itemCount]);

  useEffect(() => {
    const root = containerRef.current;
    const lastItem = itemRefs.current[itemCount - 1] ?? null;
    const trailing = trailingRef.current;
    const useWindowScroll = isWindowScrollMode();

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

      const viewportHeight = useWindowScroll
        ? Math.round(window.visualViewport?.height ?? window.innerHeight)
        : nextRoot.clientHeight;
      const lastItemHeight = nextLastItem.offsetHeight;
      const trailingHeight = getOuterHeight(trailingRef.current);
      const nextPadding = Math.max(viewportHeight - lastItemHeight - trailingHeight, 0);

      setScrollPaddingBottom(Math.ceil(nextPadding));
    }

    updatePadding();

    const observer = new ResizeObserver(updatePadding);
    if (!useWindowScroll) {
      observer.observe(root);
    }
    observer.observe(lastItem);

    if (trailing) {
      observer.observe(trailing);
    }

    window.addEventListener("resize", updatePadding);
    window.visualViewport?.addEventListener("resize", updatePadding);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePadding);
      window.visualViewport?.removeEventListener("resize", updatePadding);
    };
  }, [itemCount]);

  useEffect(() => {
    const root = containerRef.current;
    const useWindowScroll = isWindowScrollMode();
    if (!root) {
      return;
    }

    let frameId = 0;

    function updateActiveFromScroll() {
      frameId = 0;
      const nextRoot = containerRef.current;

      if (!nextRoot) {
        return;
      }

      const rootScrollTop = useWindowScroll ? window.scrollY : nextRoot.scrollTop;
      const activationOffset = 12;
      let nextIndex = 0;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const itemTop = useWindowScroll ? getPageTop(item) : getItemTop(nextRoot, item);
        if (itemTop <= rootScrollTop + activationOffset) {
          nextIndex = index;
        }
      });

      setActiveIndex(nextIndex);
    }

    function handleScroll() {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveFromScroll);
    }

    updateActiveFromScroll();
    const scrollTarget = useWindowScroll ? window : root;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
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
    const useWindowScroll = isWindowScrollMode();
    const root = containerRef.current;
    const item = itemRefs.current[index];

    if (!root || !item) {
      return null;
    }

    return Math.max(useWindowScroll ? getPageTop(item) : getItemTop(root, item), 0);
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const useWindowScroll = isWindowScrollMode();
    const root = containerRef.current;
    const nextTop = getScrollTopForIndex(index);

    if (!root || nextTop == null) {
      return;
    }

    if (useWindowScroll) {
      window.scrollTo({
        top: nextTop,
        behavior,
      });
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
    scrollPaddingBottom,
    scrollToIndex,
    setItemRef,
    trailingRef,
  };
}
