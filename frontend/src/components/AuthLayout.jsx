import { Link } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 mb-8">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900">CampusFind</span>
    </Link>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {children}
      </div>
      <p className="mt-6 text-xs text-gray-400">
        © 2025 CampusFind · Smart Lost &amp; Found Platform
      </p>
    </div>
  );
}
