import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotificationsStore } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/formatTimeAgo';

const TYPE_ICONS = {
  MATCH_FOUND: (
    // magnifying glass
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ITEM_CLAIMED: (
    // check circle
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  QR_SCANNED: (
    // qr-code squares
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4H4v8h8V4zM20 4h-8v8h8V4zM12 12H4v8h8v-8zM20 16h-4v4h4v-4zM16 12h-4v4h4v-4z" />
    </svg>
  ),
  ADMIN_ACTION: (
    // shield
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const TYPE_COLORS = {
  MATCH_FOUND:  'bg-blue-100 text-blue-600',
  ITEM_CLAIMED: 'bg-green-100 text-green-600',
  QR_SCANNED:   'bg-purple-100 text-purple-600',
  ADMIN_ACTION: 'bg-orange-100 text-orange-600',
};

function NotificationItem({ notification, onClose }) {
  const navigate = useNavigate();
  const markRead = useNotificationsStore(s => s.markRead);

  const handleClick = () => {
    markRead(notification._id);
    if (notification.relatedItemId) {
      navigate(`/items/${notification.relatedItemId}`);
    }
    onClose();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/40' : ''
      }`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        TYPE_COLORS[notification.type] ?? 'bg-gray-100 text-gray-500'
      }`}>
        {TYPE_ICONS[notification.type] ?? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
      )}
    </button>
  );
}

export default function NotificationDropdown({ onClose }) {
  const notifications = useNotificationsStore(s => s.notifications);
  const unreadCount   = useNotificationsStore(s => s.unreadCount);
  const loading       = useNotificationsStore(s => s.loading);
  const markAllRead   = useNotificationsStore(s => s.markAllRead);
  const fetchNotifications = useNotificationsStore(s => s.fetchNotifications);

  // Load on open
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[380px] divide-y divide-gray-100">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n._id} notification={n} onClose={onClose} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2.5 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
