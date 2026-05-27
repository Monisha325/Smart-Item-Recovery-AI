import { useEffect } from 'react';
import Navbar from './Navbar';
import { useAuthStore } from '../store/authStore';
import { useNotificationsStore } from '../hooks/useNotifications';

export default function Layout({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const startPolling    = useNotificationsStore(s => s.startPolling);
  const stopPolling     = useNotificationsStore(s => s.stopPolling);

  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = startPolling();
      return cleanup;
    } else {
      stopPolling();
    }
  }, [isAuthenticated, startPolling, stopPolling]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 px-4 text-center text-xs text-gray-400">
        © 2025 CampusFind · Smart Lost &amp; Found Platform
      </footer>
    </div>
  );
}
