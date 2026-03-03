import { useState, useRef } from 'react';

export default function ImageZoom({ src, alt, className = '' }) {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  if (!src) return null;

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMove}
      onTouchStart={() => setZoomed(true)}
      onTouchEnd={() => setZoomed(false)}
      onTouchMove={handleMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200"
        style={zoomed ? {
          transform: 'scale(2)',
          transformOrigin: `${position.x}% ${position.y}%`,
        } : undefined}
        draggable={false}
      />
    </div>
  );
}
