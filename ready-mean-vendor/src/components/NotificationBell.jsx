import { useState, useRef, useEffect } from 'react';
import { Bell, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      markAllRead();
    }
  };

  const handleNotifClick = (notif) => {
    setOpen(false);
    if (notif.order_id) {
      navigate(`/orders/${notif.order_id}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-surface-50 active:bg-surface-100 text-surface-400 hover:text-surface-600 transition-all"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-surface-100 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-100 rounded-lg">
              <X size={14} className="text-surface-400" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={24} className="text-surface-200 mx-auto mb-2" />
                <p className="text-xs text-surface-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-surface-50 last:border-0 hover:bg-surface-50 transition-colors ${
                    !notif.is_read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      !notif.is_read ? 'bg-primary-100' : 'bg-surface-100'
                    }`}>
                      <Package size={14} className={!notif.is_read ? 'text-primary-600' : 'text-surface-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{notif.body}</p>
                      <p className="text-[10px] text-surface-400 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
