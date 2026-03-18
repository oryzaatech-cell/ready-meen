export default function Card({ children, className = '', onClick, hover = false, glow = false }) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-white/80 transition-all duration-300 ${
        glow ? 'shadow-[0_2px_15px_rgba(6,198,178,0.08),0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-primary-100/50' : 'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.025)] ring-1 ring-surface-100/60'
      } ${
        onClick || hover ? 'cursor-pointer card-hover active:translate-y-0' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
