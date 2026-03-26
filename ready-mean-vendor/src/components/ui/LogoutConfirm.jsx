import { LogOut } from 'lucide-react';

export default function LogoutConfirm({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in">
      <div className="fixed inset-0 bg-surface-950/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[300px] p-6 flex flex-col items-center gap-4 animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <LogOut size={24} className="text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-surface-900">Sign Out?</p>
          <p className="text-sm text-surface-500 mt-1">Are you sure you want to sign out?</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-surface-100 text-surface-700 text-sm font-semibold active:bg-surface-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold active:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
