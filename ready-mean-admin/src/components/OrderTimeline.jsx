import { Check } from 'lucide-react';
import { TIMELINE_STEPS, STATUS_LABELS } from '../shared/constants';

export default function OrderTimeline({ currentStatus }) {
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="flex items-center w-full py-4">
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIdx && !isCancelled;
        const isCurrent = idx === currentIdx && !isCancelled;

        return (
          <div key={step} className="flex-1 flex items-center">
            <div className="flex flex-col items-center w-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : isCancelled
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight font-medium ${
                  isCompleted ? 'text-emerald-700' : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className="relative h-0.5 flex-1 mx-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 bg-emerald-600 rounded-full transition-all duration-500 ${
                    idx < currentIdx && !isCancelled ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
