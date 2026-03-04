const colorMap = {
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  gray: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/60',
};

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  );
}
