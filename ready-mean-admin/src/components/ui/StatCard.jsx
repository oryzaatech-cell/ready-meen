const GRADIENTS = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  cyan: 'from-cyan-500 to-cyan-600',
  emerald: 'from-emerald-500 to-emerald-600',
  indigo: 'from-indigo-500 to-indigo-600',
};

export default function StatCard({ icon: Icon, label, value, gradient = 'blue', trend, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${GRADIENTS[gradient] || GRADIENTS.blue} p-4 text-white shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute bottom-0 right-0 -mb-6 -mr-6 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        {Icon && (
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Icon size={20} />
          </div>
        )}
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-0.5 text-sm text-white/80">{label}</div>
        {trend !== undefined && trend !== null && (
          <div className={`mt-1 text-xs font-medium ${trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs prev period
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 p-4 h-[120px]">
      <div className="h-10 w-10 rounded-lg bg-gray-300 mb-2" />
      <div className="h-6 w-20 rounded bg-gray-300 mb-1" />
      <div className="h-4 w-16 rounded bg-gray-300" />
    </div>
  );
}
