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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : isCancelled
                    ? 'bg-red-100 border-red-300 text-red-600'
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-primary-200' : ''}`}
              >
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1 text-center leading-tight ${
                  isCompleted ? 'text-primary-700 font-medium' : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 ${
                  idx < currentIdx && !isCancelled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
