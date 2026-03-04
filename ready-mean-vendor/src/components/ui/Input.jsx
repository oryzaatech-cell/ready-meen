export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 border rounded-xl text-base bg-gray-50/50 transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
          ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
