import { Fish } from 'lucide-react';
import Card from './ui/Card';
import ImageZoom from './ui/ImageZoom';
import formatCurrency from '../shared/formatCurrency';

export default function ProductCard({ product, onClick }) {
  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {product.image_url ? (
          <ImageZoom src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Fish size={48} className="text-gray-300" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.vendor?.name || product.category}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-primary-700">
            {formatCurrency(product.price)}
            <span className="text-xs text-gray-500 font-normal">/kg</span>
          </span>
          <span className="text-xs text-gray-500">{product.stock_qty} kg in stock</span>
        </div>
      </div>
    </Card>
  );
}
