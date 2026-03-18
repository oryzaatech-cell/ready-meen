const variants = {
  primary:
    'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 hover:from-primary-700 hover:to-primary-600 active:from-primary-700 active:to-primary-700 focus-visible:ring-primary-500',
  secondary:
    'bg-white/80 text-surface-700 border border-surface-200/80 shadow-sm hover:bg-white hover:shadow-md active:bg-surface-50 focus-visible:ring-surface-400',
  danger:
    'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-200/30 hover:shadow-lg hover:shadow-red-200/40 hover:from-red-700 hover:to-red-600 focus-visible:ring-red-500',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100/80 active:bg-surface-200 focus-visible:ring-surface-400',
  'ghost-primary':
    'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
};

const sizes = {
  sm: 'px-3.5 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-[15px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[44px] select-none active:scale-[0.97]
        ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
