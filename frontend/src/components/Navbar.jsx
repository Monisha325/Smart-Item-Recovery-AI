import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 group">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-blue-400/30 transition-all duration-300 group-hover:scale-105">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span className="font-display font-bold text-gray-900 text-[17px] tracking-tight leading-none">CampusFind</span>
    </Link>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-xs font-bold flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-60 glass-card rounded-2xl z-50 overflow-hidden">
          {/* Name + email */}
          <div className="px-4 py-3.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>

          {/* Links */}
          <div className="py-1.5">
            {[
              { to: '/items/mine', label: 'My Items' },
              { to: '/profile',   label: 'Profile' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 py-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({ open, onClose, isAuthenticated, user, onLogout }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white shadow-2xl h-full ml-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Logo />
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <MobileLink to="/items"       onClick={onClose}>Browse Items</MobileLink>
              {isAuthenticated && (
                <>
                  <MobileLink to="/items/mine" onClick={onClose}>My Items</MobileLink>
                  <MobileLink to="/matches"    onClick={onClose}>Matches</MobileLink>
                  <MobileLink to="/profile"    onClick={onClose}>Profile</MobileLink>
                </>
              )}
            </nav>

            {/* Auth footer */}
            <div className="px-4 py-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {user && (
                    <div className="text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="truncate">{user.email}</p>
                    </div>
                  )}
                  <button
                    onClick={() => { onClose(); onLogout(); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 text-center transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 text-center transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const navigate        = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user            = useAuthStore(s => s.user);
  const logout          = useAuthStore(s => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-30 h-16 glass border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center gap-4">
          {/* Logo */}
          <Logo />

          {/* Center nav — desktop only */}
          <div className="hidden md:flex items-center gap-1 mx-auto">
            <NavLink to="/items" end className={navLinkClass}>Items</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/items/mine" className={navLinkClass}>My Items</NavLink>
                <NavLink to="/matches" className={navLinkClass}>Matches</NavLink>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu user={user} onLogout={handleLogout} />
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all shadow-md hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}
