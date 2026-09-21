import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const TYPE_ICONS = {
  MATCH_FOUND: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ITEM_CLAIMED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  QR_SCANNED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4H4v8h8V4zM20 4h-8v8h8V4zM12 12H4v8h8v-8z" />
    </svg>
  ),
  ADMIN_ACTION: (
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

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'unread', label: 'Unread' },
];

function NotificationRow({ notification }) {
  const navigate   = useNavigate();
  const markRead   = useNotificationsStore(s => s.markRead);
  const unreadOnly = notification.isRead === false;

  const handleClick = () => {
    markRead(notification._id);
    if (notification.relatedItemId) {
      navigate(`/items/${notification.relatedItemId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/30' : ''
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        TYPE_COLORS[notification.type] ?? 'bg-gray-100 text-gray-500'
      }`}>
        {TYPE_ICONS[notification.type] ?? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
      )}
    </button>
  );
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page,   setPage]   = useState(1);

  const notifications   = useNotificationsStore(s => s.notifications);
  const hasMore         = useNotificationsStore(s => s.hasMore);
  const loading         = useNotificationsStore(s => s.loading);
  const unreadCount     = useNotificationsStore(s => s.unreadCount);
  const fetchNotifications = useNotificationsStore(s => s.fetchNotifications);
  const loadMore        = useNotificationsStore(s => s.loadMore);
  const markAllRead     = useNotificationsStore(s => s.markAllRead);

  const unreadOnly = filter === 'unread';

  // Reset and fetch when filter changes
  useEffect(() => {
    setPage(1);
    fetchNotifications(unreadOnly);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMore(unreadOnly, nextPage);
  };

  const showEmpty = !loading && notifications.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Mark all read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  filter === f.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : showEmpty ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔔</p>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}
              </h3>
              <p className="text-sm text-gray-400">
                {filter === 'unread'
                  ? 'All notifications have been read.'
                  : 'Notifications about matches and item updates will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(n => (
                <NotificationRow key={n._id} notification={n} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="border-t border-gray-100 p-4 text-center">
              <button
                onClick={handleLoadMore}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Load more
              </button>
            </div>
          )}
          {loading && notifications.length > 0 && (
            <div className="border-t border-gray-100 p-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
