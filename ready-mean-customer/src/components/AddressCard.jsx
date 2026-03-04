import { MapPin, Pencil, Trash2, Phone, User, Building2 } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { formatAddressSummary } from '../shared/formatAddress';

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  selectable,
  selected,
  onSelect,
}) {
  const handleClick = () => {
    if (selectable && onSelect) onSelect(address);
  };

  return (
    <Card
      className={`p-3 ${selectable ? 'cursor-pointer' : ''} ${
        selected ? 'ring-2 ring-primary-500 border-primary-500' : ''
      }`}
      onClick={selectable ? handleClick : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {address.label && <Badge color="blue">{address.label}</Badge>}
            {selected && <Badge color="green">Selected</Badge>}
          </div>

          {/* Summary line */}
          <div className="flex items-start gap-1.5 text-sm">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="text-gray-700">{formatAddressSummary(address)}</span>
          </div>

          {/* Expanded details when selected */}
          {selected && (
            <div className="mt-2 ml-5 space-y-1 text-sm text-gray-600">
              {address.flat_number && (
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-gray-400" />
                  <span>Flat {address.flat_number}{address.floor ? `, Floor ${address.floor}` : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-gray-400" />
                <span>{address.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                <span>{address.phone}</span>
              </div>
            </div>
          )}

          {/* Always show phone in non-selectable mode (Profile view) */}
          {!selectable && (
            <div className="mt-1 ml-5 space-y-0.5 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-gray-400" />
                <span>{address.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                <span>{address.phone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit/Delete buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(address); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
