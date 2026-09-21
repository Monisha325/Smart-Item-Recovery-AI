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
    <div className="text-center px-4">
      {loading
        ? <div className="skeleton h-10 w-20 rounded-xl mx-auto mb-2" />
        : <p className="text-4xl font-extrabold text-white tabular-nums tracking-tight">{value?.toLocaleString() ?? '—'}</p>
      }
      <p className="text-sm text-white/70 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function ItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 rounded-full w-3/4" />
        <div className="skeleton h-3 rounded-full w-1/3" />
        <div className="skeleton h-3 rounded-full w-1/2" />
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
      <nav className="sticky top-0 z-30 h-16 glass flex items-center px-4 transition-all duration-300">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900 text-[17px] tracking-tight">CampusFind</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white text-gray-900 pt-16 pb-28 px-4 -mt-16">
        {/* Animated background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-blue-100 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[45%] rounded-full bg-indigo-100 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-3xl mx-auto text-center pt-28 relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-sm text-blue-700 mb-8 border border-blue-200 shadow-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            AI-powered matching — live
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Lost something<br className="hidden sm:block" /> on campus?<br />
            <span className="text-gradient">We'll find it.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
            AI-powered matching reunites students with their belongings — post once, recover fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/items/new', { state: { prefilledType: 'lost' } })}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-base flex items-center justify-center gap-2"
            >
              <span>😞</span> Report Lost Item
            </button>
            <button
              onClick={() => navigate('/items/new', { state: { prefilledType: 'found' } })}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 text-base flex items-center justify-center gap-2"
            >
              <span>🎉</span> Report Found Item
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="relative py-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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

      <div className="flex-1 bg-[#f8faff]">

      {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-20 relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
              <div key={step} className="glass-card rounded-3xl p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  {icon}
                </div>
                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-1 rounded-md">Step {step}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent lost items ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Recently lost</h2>
              <p className="text-sm text-gray-500 mt-1">Help someone find what they're missing</p>
            </div>
            <Link to="/items?type=lost" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              View all <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ItemSkeleton key={i} />)
              : recentItems.length === 0
              ? (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-sm">No items posted yet.</p>
                </div>
              )
              : recentItems.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))
            }
          </div>
        </section>

        {/* ── CTA footer ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gray-900 py-20 px-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/20 blur-[80px]"></div>
          <div className="max-w-xl mx-auto text-center text-white relative z-10">
            <h2 className="text-3xl font-extrabold mb-4">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">Join your campus community and help reunite people with their belongings.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Create free account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-100 bg-white py-6 px-4 text-center text-xs text-gray-400">
          © 2025 CampusFind · Smart Lost &amp; Found Platform
        </footer>
      </div>
    </div>
  );
}
