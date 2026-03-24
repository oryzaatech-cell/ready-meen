import { useState, useRef, useEffect } from 'react';
import { Bell, ShoppingBag, Truck, XCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getNotifIcon(type) {
  switch (type) {
    case 'new_order':
    case 'order_placed':
      return { icon: ShoppingBag, color: 'text-primary-600', bg: 'bg-primary-50' };
    case 'order_update':
      return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'order_cancelled':
    case 'cancel_request':
    case 'cancel_rejected':
      return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
    case 'cancel_approved':
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    default:
      return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    if (!open && unreadCount > 0) markAllRead();
  };

  const handleNotifClick = (notif) => {
    setOpen(false);
    if (notif.order_id) navigate(`/orders/${notif.order_id}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-0.5 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-100/80 shadow-lg shadow-gray-200/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100/60">
            <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">Notifications</span>
            <button onClick={() => setOpen(false)} className="p-0.5 hover:bg-gray-100 rounded-md transition-colors">
              <X size={12} className="text-gray-400" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={20} className="text-gray-200 mx-auto mb-1.5" />
                <p className="text-[11px] text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const { icon: Icon, color, bg } = getNotifIcon(notif.type);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left px-3.5 py-2.5 border-b border-gray-50/80 last:border-0 hover:bg-gray-50/60 transition-colors ${
                      !notif.is_read ? 'bg-primary-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon size={13} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={`text-[12px] truncate ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-gray-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{notif.body}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
