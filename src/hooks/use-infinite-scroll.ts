import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from 'react';

interface UseInfiniteScrollProps {
  containerRef?: { readonly current: HTMLElement | null };
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  enabled?: boolean;
  threshold?: number;
  minDelayMs?: number;
  dependencies?: DependencyList;
  useWindow?: boolean;
  horizontal?: boolean;
}

export function useInfiniteScroll({
  containerRef,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  enabled = true,
  threshold = 200,
  minDelayMs = 500,
  dependencies = [],
  useWindow = false,
  horizontal = false,
}: UseInfiniteScrollProps) {
  const lastFetchTimeRef = useRef(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleScroll = useCallback(() => {
    const getScrollData = () => {
      if (useWindow) {
        const scrollPos = horizontal ? window.scrollX : window.scrollY;
        const scrollSize = horizontal
          ? document.documentElement.scrollWidth
          : document.documentElement.scrollHeight;
        const clientSize = horizontal ? window.innerWidth : window.innerHeight;
        return { scrollPos, scrollSize, clientSize };
      } else {
        const container = containerRef?.current;
        if (!container) return { scrollPos: 0, scrollSize: 0, clientSize: 0 };
        return horizontal
          ? {
              scrollPos: container.scrollLeft,
              scrollSize: container.scrollWidth,
              clientSize: container.clientWidth,
            }
          : {
              scrollPos: container.scrollTop,
              scrollSize: container.scrollHeight,
              clientSize: container.clientHeight,
            };
      }
    };

    const { scrollPos, scrollSize, clientSize } = getScrollData();
    const distanceFromEnd = scrollSize - scrollPos - clientSize;

    if (distanceFromEnd > threshold || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current > minDelayMs) {
      lastFetchTimeRef.current = now;
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    threshold,
    minDelayMs,
    useWindow,
    horizontal,
    containerRef,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const container = useWindow ? window : containerRef?.current;
    if (!container) return;

    const timer = setTimeout(() => {
      container.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleScroll, useWindow, containerRef]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      if (useWindow) {
        const hasScroll =
          document.documentElement.scrollHeight > window.innerHeight;
        setIsScrollable(hasScroll);
      } else {
        const container = containerRef?.current;
        if (container) {
          const hasScroll = container.scrollHeight > container.clientHeight;
          setIsScrollable(hasScroll);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, useWindow, containerRef, ...dependencies]);

  const showLoadMoreButton = hasNextPage && !isFetchingNextPage;

  return { isScrollable, showLoadMoreButton };
}
