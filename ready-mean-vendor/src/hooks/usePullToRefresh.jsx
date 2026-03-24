import { useState, useEffect, useRef, useCallback } from 'react';

export function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const triggered = useRef(false);
  const THRESHOLD = 60;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const onTouchStart = (e) => {
      if (mainEl.scrollTop <= 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
        triggered.current = false;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current || isRefreshing) return;
      const diff = Math.max(0, e.touches[0].clientY - startY.current);
      // Dampen the pull distance for a rubber-band feel
      const dampened = Math.min(diff * 0.5, 120);
      setPullDistance(dampened);

      if (dampened >= THRESHOLD && !triggered.current) {
        triggered.current = true;
        try { navigator.vibrate(10); } catch {}
      }
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (triggered.current) {
        setPullDistance(THRESHOLD); // snap to threshold while refreshing
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
  }, [handleRefresh, isRefreshing]);

  function PullIndicator() {
    if (pullDistance === 0 && !isRefreshing) return null;
    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const rotation = pullDistance * 3;

    return (
      <div
        className="pull-indicator-wrap"
        style={{
          height: pullDistance,
          transition: pulling.current ? 'none' : 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className={`pull-indicator ${isRefreshing ? 'pull-indicator-spinning' : ''}`}
          style={{
            opacity: isRefreshing ? 1 : progress,
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg) scale(${0.5 + progress * 0.5})`,
          }}
        />
      </div>
    );
  }

  // Keep backward compat: expose refreshing alias
  return { pullDistance, isRefreshing, refreshing: isRefreshing, PullIndicator };
}
