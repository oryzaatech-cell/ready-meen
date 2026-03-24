import { useState } from 'react';
import { Fish } from 'lucide-react';
import formatCurrency from '../shared/formatCurrency';

export default function ProductCard({ product, onClick }) {
  const soldOut = !product.stock_qty || product.stock_qty <= 0;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary-900/8 hover:-translate-y-1 transition-all duration-300 active:scale-[0.97] group border border-gray-100/60 will-change-transform"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <Fish size={36} className="text-gray-200" />
        )}

        {/* Bottom gradient on hover */}
        {product.image_url && !soldOut && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-900 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}

        {!soldOut && product.stock_qty <= 5 && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Only {product.stock_qty}kg left
          </span>
        )}

        {/* Price floating badge */}
        {!soldOut && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-sm border border-white/50">
            <span className="text-[13px] font-bold text-primary-700">{formatCurrency(product.price)}</span>
            <span className="text-[8px] text-gray-400 ml-0.5">/kg</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 pb-3.5">
        <h3 className={`font-bold text-[13px] leading-snug truncate ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{product.vendor?.name || product.category}</p>
      </div>
    </div>
  );
}
