import { Fish } from 'lucide-react';
import formatCurrency from '../shared/formatCurrency';

export default function ProductCard({ product, onClick }) {
  const soldOut = !product.stock_qty || product.stock_qty <= 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Fish size={40} className="text-gray-200" />
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        {!soldOut && product.stock_qty <= 5 && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock_qty}kg left
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className={`font-semibold text-sm truncate ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h3>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{product.vendor?.name || product.category}</p>
        <div className="flex items-end justify-between mt-2">
          <span className={`text-base font-bold ${soldOut ? 'text-gray-300' : 'text-primary-700'}`}>
            {formatCurrency(product.price)}
            <span className="text-[10px] text-gray-400 font-normal">/kg</span>
          </span>
          {soldOut ? (
            <span className="text-[10px] font-semibold text-red-400">Sold Out</span>
          ) : (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">{product.stock_qty} kg</span>
          )}
        </div>
      </div>
    </div>
  );
}
