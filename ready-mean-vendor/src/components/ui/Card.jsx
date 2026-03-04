export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100/80 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
