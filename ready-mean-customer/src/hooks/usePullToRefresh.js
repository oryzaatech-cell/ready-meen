import { useState, useEffect, useRef, useCallback } from 'react';

export function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const onTouchStart = (e) => {
      if (mainEl.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchEnd = (e) => {
      if (!pulling.current) return;
      const diff = e.changedTouches[0].clientY - startY.current;
      pulling.current = false;
      if (diff > 80) {
        handleRefresh();
      }
    };

    mainEl.addEventListener('touchstart', onTouchStart, { passive: true });
    mainEl.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      mainEl.removeEventListener('touchstart', onTouchStart);
      mainEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleRefresh]);

  return { refreshing };
}
