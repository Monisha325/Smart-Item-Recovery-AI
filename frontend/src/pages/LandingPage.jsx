import { useNavigate, Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { usePublicStats } from '../hooks/useProfile';
import { usePageTitle } from '../hooks/usePageTitle';
import ItemCard from '../components/ItemCard';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post your item',
    desc:  'Report a lost or found item in under a minute. Add photos, location, and details.',
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'AI finds matches',
    desc:  'Our AI engine analyses text, images, and location to surface the most likely matches instantly.',
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Recover it',
    desc:  'Connect with the finder or owner, confirm the item, and close the loop.',
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function StatCard({ value, label, loading }) {
  return (
    <div className="text-center">
      {loading
        ? <div className="skeleton h-8 w-16 rounded-lg mx-auto mb-1" />
        : <p className="text-3xl font-bold text-white tabular-nums">{value?.toLocaleString() ?? '—'}</p>
      }
      <p className="text-sm text-blue-200">{label}</p>
    </div>
  );
}

function ItemSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="skeleton aspect-video" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/3" />
        <div className="skeleton h-3 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  usePageTitle('');
  const navigate = useNavigate();

  const { data: statsData, isLoading: statsLoading } = usePublicStats();
  const { data: recentData, isLoading: itemsLoading } = useItems({
    type: 'lost', limit: 6, page: 1,
  });

  const recentItems = recentData?.items ?? [];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar strip ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-sm border-b border-white/40 flex items-center px-4">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-white text-[15px]">CampusFind</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login"    className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="px-3.5 py-1.5 text-sm font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-4 pb-20 px-4 -mt-14">
        <div className="max-w-3xl mx-auto text-center pt-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-blue-100 mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-powered matching — live
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Lost something<br className="hidden sm:block" /> on campus?<br />
            <span className="text-blue-200">We'll find it.</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto">
            AI-powered matching reunites students with their belongings — post once, recover fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/items/new', { state: { prefilledType: 'lost' } })}
              className="px-7 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20 text-sm sm:text-base"
            >
              😞 Report Lost Item
            </button>
            <button
              onClick={() => navigate('/items/new', { state: { prefilledType: 'found' } })}
              className="px-7 py-3.5 bg-blue-500/40 text-white font-semibold rounded-xl hover:bg-blue-500/60 border border-white/20 transition-colors text-sm sm:text-base"
            >
              🎉 Report Found Item
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="bg-blue-800 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 divide-x divide-white/20">
          <StatCard
            value={statsData?.totalRecovered}
            label="Items recovered"
            loading={statsLoading}
          />
          <StatCard
            value={statsData?.totalUsers}
            label="Students registered"
            loading={statsLoading}
          />
          <StatCard
            value={statsData?.activeListings}
            label="Active listings"
            loading={statsLoading}
          />
        </div>
      </section>

      <div className="flex-1 bg-gray-50">

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  {icon}
                </div>
                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Step {step}</span>
                <h3 className="text-base font-semibold text-gray-900 mt-1.5 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent lost items ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recently lost</h2>
            <Link to="/items?type=lost" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ItemSkeleton key={i} />)
              : recentItems.length === 0
              ? (
                <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                  No items posted yet.
                </div>
              )
              : recentItems.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))
            }
          </div>
        </section>

        {/* ── CTA footer ────────────────────────────────────────────────── */}
        <section className="bg-blue-600 py-14 px-4">
          <div className="max-w-xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-blue-100 mb-7 text-sm">Join your campus community and help reunite people with their belongings.</p>
            <Link
              to="/register"
              className="inline-block px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
            >
              Create free account
            </Link>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 bg-white py-5 px-4 text-center text-xs text-gray-400">
          © 2025 CampusFind · Smart Lost &amp; Found Platform
        </footer>
      </div>
    </div>
  );
}
