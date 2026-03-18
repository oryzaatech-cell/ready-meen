export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-semibold text-surface-600 mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-3 border rounded-xl text-base bg-white/60 backdrop-blur-sm transition-all duration-200
          placeholder:text-surface-300
          focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-400 focus:bg-white focus:shadow-sm focus:shadow-primary-500/5
          ${error ? 'border-red-300 focus:ring-red-500/15 focus:border-red-400' : 'border-surface-200/80 hover:border-surface-300'}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
