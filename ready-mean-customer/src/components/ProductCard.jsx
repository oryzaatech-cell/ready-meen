import { Fish } from 'lucide-react';
import Card from './ui/Card';
import ImageZoom from './ui/ImageZoom';
import formatCurrency from '../shared/formatCurrency';

export default function ProductCard({ product, onClick }) {
  const soldOut = !product.stock_qty || product.stock_qty <= 0;

  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {product.image_url ? (
          <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Fish size={48} className="text-gray-300" />
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className={`font-semibold truncate ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.vendor?.name || product.category}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-lg font-bold ${soldOut ? 'text-gray-400' : 'text-primary-700'}`}>
            {formatCurrency(product.price)}
            <span className="text-xs text-gray-500 font-normal">/kg</span>
          </span>
          {soldOut ? (
            <span className="text-xs font-semibold text-red-500">Sold Out</span>
          ) : (
            <span className="text-xs text-gray-500">{product.stock_qty} kg</span>
          )}
        </div>
      </div>
    </Card>
  );
}
