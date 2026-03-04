export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 p-4 h-[120px]">
      <div className="h-10 w-10 rounded-lg bg-gray-300 mb-2" />
      <div className="h-6 w-20 rounded bg-gray-300 mb-1" />
      <div className="h-4 w-16 rounded bg-gray-300" />
    </div>
  );
}

export function ChartSkeleton({ height = 250 }) {
  return (
    <div className="animate-pulse rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
      <div className="rounded-lg bg-gray-100" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-12 bg-gray-100 rounded" />
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton height={200} />
      </div>
      <TableSkeleton />
    </div>
  );
}
