import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdminStats } from '../../hooks/useAdmin';
import { StatusBadge, ErrorState } from '../../components/admin/AdminTable';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { usePageTitle } from '../../hooks/usePageTitle';

const STAT_CARDS = [
  { key: 'totalUsers',   label: 'Total Users',   icon: '👥' },
  { key: 'totalItems',   label: 'Total Items',   icon: '📦' },
  { key: 'totalLost',    label: 'Lost Items',    icon: '😞' },
  { key: 'totalFound',   label: 'Found Items',   icon: '🎉' },
  { key: 'totalMatches', label: 'Matches',       icon: '🔗' },
  { key: 'totalClaimed', label: 'Claimed',       icon: '✅' },
  { key: 'totalReturned',label: 'Returned',      icon: '🏠' },
];

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

export default function AdminDashboardPage() {
  usePageTitle('Admin — Dashboard');
  const { data, isLoading, isError, refetch } = useAdminStats();

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ErrorState message="Failed to load stats." onRetry={refetch} />
      </div>
    );
  }

  const chartData = (data?.itemsByCategory ?? []).map(row => ({
    category: row._id ?? 'unknown',
    count:    row.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* ── Stats grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? STAT_CARDS.map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS.map(card => (
              <div key={card.key} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <span>{card.icon}</span>
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data?.[card.key] ?? 0).toLocaleString()}
                </p>
              </div>
            ))}
      </div>

      {/* ── Items by Category chart ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Items by Category</h2>
        {isLoading ? (
          <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                width={90}
                tick={{ fontSize: 12 }}
                tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <Tooltip
                formatter={(v) => [v, 'Items']}
                labelFormatter={(l) => l.charAt(0).toUpperCase() + l.slice(1)}
              />
              <Bar dataKey="count" fill="#378ADD" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-3 py-2">
                <div className="h-3 bg-gray-200 rounded flex-1" />
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : !data?.recentActivity?.length ? (
          <p className="text-sm text-gray-400 text-center py-8">No items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Item</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Posted by</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentActivity.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-[160px] truncate">
                      {item.title}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 capitalize">{item.category}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{item.userId?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={item.status} /></td>
                    <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatTimeAgo(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
