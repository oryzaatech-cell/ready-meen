import { useState, useEffect, useRef, useCallback } from 'react';

const THRESHOLD = 60;
const MAX_PULL = 120;

export function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const onTouchStart = (e) => {
      if (mainEl.scrollTop <= 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current) return;
      const diff = Math.max(0, e.touches[0].clientY - startY.current);
      // Dampen the pull — diminishing returns past threshold
      const dampened = Math.min(MAX_PULL, diff * 0.5);
      setPullDistance(dampened);
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pullDistance >= THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(10);
        handleRefresh();
      } else {
        setPullDistance(0);
      }
    };

    mainEl.addEventListener('touchstart', onTouchStart, { passive: true });
    mainEl.addEventListener('touchmove', onTouchMove, { passive: true });
    mainEl.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      mainEl.removeEventListener('touchstart', onTouchStart);
      mainEl.removeEventListener('touchmove', onTouchMove);
      mainEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleRefresh, pullDistance, isRefreshing]);

  function PullIndicator() {
    const visible = pullDistance > 0 || isRefreshing;
    if (!visible) return null;

    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const spinning = isRefreshing;

    return (
      <div
        className="ptr-indicator"
        style={{
          height: isRefreshing ? 40 : pullDistance,
          transition: pulling.current ? 'none' : 'height 0.3s ease',
        }}
      >
        <div
          className={`ptr-spinner ${spinning ? 'ptr-spinning' : ''}`}
          style={{
            opacity: spinning ? 1 : progress,
            transform: `rotate(${spinning ? 0 : progress * 270}deg)`,
          }}
        />
      </div>
    );
  }

  // Keep backward compat — expose refreshing alias
  return { pullDistance, isRefreshing, refreshing: isRefreshing, PullIndicator };
}
