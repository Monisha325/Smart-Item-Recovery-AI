import { create } from 'zustand';
import * as notificationsApi from '../services/notificationsApi';

// Module-level so the interval survives React re-renders
let _intervalId = null;

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  hasMore:       false,
  loading:       false,

  // Fetch page-1 notifications (replaces list). Used by dropdown + polling refresh.
  fetchNotifications: async (unreadOnly = false) => {
    set({ loading: true });
    try {
      const result = await notificationsApi.fetchNotifications({ unreadOnly, page: 1, limit: 20 });
      set({ notifications: result.notifications, hasMore: result.hasMore, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // Append next page — called by NotificationsPage for load-more.
  loadMore: async (unreadOnly = false, page) => {
    set({ loading: true });
    try {
      const result = await notificationsApi.fetchNotifications({ unreadOnly, page, limit: 20 });
      set(state => ({
        notifications: [...state.notifications, ...result.notifications],
        hasMore: result.hasMore,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const raw      = await notificationsApi.fetchUnreadCount();
      const newCount = typeof raw === 'number' ? raw : 0;
      const prev     = get().unreadCount;
      set({ unreadCount: newCount });
      // Refresh notification list when new ones arrive
      if (newCount > prev) {
        get().fetchNotifications();
      }
    } catch {}
  },

  markRead: async (id) => {
    const target = get().notifications.find(n => n._id === id);
    if (target && !target.isRead) {
      set(state => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount:   Math.max(0, state.unreadCount - 1),
      }));
    }
    try { await notificationsApi.markRead(id); } catch {}
  },

  markAllRead: async () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));
    try { await notificationsApi.markAllRead(); } catch {}
  },

  startPolling: () => {
    if (_intervalId) return () => {};
    // Immediate first fetch, then every 25 seconds
    get().fetchUnreadCount();
    _intervalId = setInterval(() => get().fetchUnreadCount(), 25_000);
    return () => get().stopPolling();
  },

  stopPolling: () => {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  },
}));
