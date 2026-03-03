import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { getDateRange } from '../../shared/dateUtils';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

export default function DateRangePicker({ value, onChange }) {
  const [activePreset, setActivePreset] = useState('30d');
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(value?.from || '');
  const [customTo, setCustomTo] = useState(value?.to || '');

  function handlePreset(key) {
    setActivePreset(key);
    if (key === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const range = getDateRange(key);
    if (range) onChange(range);
  }

  function handleCustomApply() {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={16} className="text-gray-400" />
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activePreset === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            onClick={handleCustomApply}
            className="px-3 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
