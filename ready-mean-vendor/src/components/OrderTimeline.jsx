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
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20'
                    : isCancelled
                    ? 'bg-red-50 border-red-300 text-red-400'
                    : 'bg-surface-50 border-surface-200 text-surface-400'
                } ${isCurrent ? 'ring-[3px] ring-primary-100 scale-110' : ''}`}
              >
                {isCompleted ? <Check size={15} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-2 text-center leading-tight font-semibold transition-colors duration-300 ${
                  isCompleted ? 'text-primary-700' : 'text-surface-400'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className="relative h-[3px] flex-1 mx-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                    idx < currentIdx && !isCancelled
                      ? 'w-full bg-gradient-to-r from-primary-500 to-primary-400'
                      : 'w-0'
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
