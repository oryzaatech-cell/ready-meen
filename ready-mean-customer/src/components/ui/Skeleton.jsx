export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div className={`bg-gray-200/60 animate-pulse ${rounded} ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/60 overflow-hidden shadow-sm">
      <Skeleton className="aspect-[4/3] w-full" rounded="rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/60 p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16" rounded="rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="w-10 h-10" rounded="rounded-lg" />
        <Skeleton className="w-10 h-10" rounded="rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}
