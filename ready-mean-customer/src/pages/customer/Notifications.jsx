import { useEffect } from 'react';
import { Bell, ShoppingBag, Truck, XCircle, CheckCircle, Fish } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import PageLayout from '../../components/layout/PageLayout';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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
    case 'new_product':
      return { icon: Fish, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    default:
      return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
}

export default function Notifications() {
  const { notifications, unreadCount, markAllRead, refresh } = useNotifications();
  const navigate = useNavigate();
  usePullToRefresh(refresh);

  useEffect(() => {
    if (unreadCount > 0) markAllRead();
  }, [unreadCount, markAllRead]);

  const handleNotifClick = (notif) => {
    if (notif.order_id) {
      navigate(`/orders/${notif.order_id}`);
    } else if (notif.type === 'new_product') {
      navigate('/home');
    }
  };

  return (
    <PageLayout title="Notifications">
      <div className="max-w-lg mx-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const { icon: Icon, color, bg } = getNotifIcon(notif.type);
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-colors ${
                    !notif.is_read
                      ? 'bg-primary-50/30 border-primary-100/50'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-[13px] truncate ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                      </div>
                      <p className="text-[12px] text-gray-400 truncate mt-0.5">{notif.body}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
