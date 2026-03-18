const colorMap = {
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  gray: 'bg-surface-50 text-surface-600 ring-1 ring-surface-200/60',
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200/60',
};

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  );
}
