import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

function CampusBuilding() {
  return (
    <svg viewBox="0 0 200 160" className="w-48 h-auto opacity-30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Main building */}
      <rect x="40" y="60" width="120" height="90" strokeWidth="3" />
      {/* Roof */}
      <polyline points="30,60 100,20 170,60" strokeWidth="3" />
      {/* Door */}
      <rect x="84" y="110" width="32" height="40" strokeWidth="2.5" />
      {/* Windows left */}
      <rect x="55"  y="75" width="22" height="18" strokeWidth="2" />
      <rect x="55"  y="100" width="22" height="18" strokeWidth="2" />
      {/* Windows right */}
      <rect x="123" y="75" width="22" height="18" strokeWidth="2" />
      <rect x="123" y="100" width="22" height="18" strokeWidth="2" />
      {/* Flag pole */}
      <line x1="100" y1="20" x2="100" y2="5" strokeWidth="2" />
      <polyline points="100,5 115,10 100,15" strokeWidth="2" />
      {/* Path */}
      <line x1="100" y1="150" x2="100" y2="160" strokeWidth="3" />
      <line x1="40"  y1="160" x2="160" y2="160" strokeWidth="3" />
    </svg>
  );
}

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <CampusBuilding />
      <h1 className="mt-6 text-5xl font-extrabold text-gray-200 tabular-nums">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-gray-800">Page not found</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-xs">
        Looks like this page went missing too. Let's get you back on campus.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back home
      </Link>
    </div>
  );
}
