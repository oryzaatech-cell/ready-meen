export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div className={`bg-surface-200/60 animate-pulse ${rounded} ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-4 shadow-sm">
      <div className="flex items-center gap-3.5">
        <Skeleton className="w-16 h-16 flex-shrink-0" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-3 w-8 ml-auto" />
        </div>
      </div>
      <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-surface-100/80">
        <Skeleton className="h-9 flex-1" rounded="rounded-xl" />
        <Skeleton className="h-9 flex-1" rounded="rounded-xl" />
        <Skeleton className="h-9 w-20" rounded="rounded-xl" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 flex-shrink-0" rounded="rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-surface-100/80">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11" rounded="rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" rounded="rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" rounded="rounded-2xl" />
        <Skeleton className="h-28" rounded="rounded-2xl" />
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}
