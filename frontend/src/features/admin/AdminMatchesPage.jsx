import { useState } from 'react';
import { useAdminMatches } from '../../hooks/useAdmin';
import { TableSkeleton, EmptyState, ErrorState, Pagination, StatusBadge } from '../../components/admin/AdminTable';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const LIMIT = 20;

const MATCH_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'];

function ScoreBadge({ score }) {
  const n = Number(score ?? 0);
  const color = n >= 70
    ? 'bg-green-100 text-green-700'
    : n >= 40
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${color}`}>
      {n.toFixed(1)}
    </span>
  );
}

function ItemCell({ item }) {
  if (!item) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      {item.images?.[0]?.url ? (
        <img
          src={item.images[0].url}
          alt=""
          className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-md bg-gray-100 shrink-0" />
      )}
      <span className="text-gray-800 text-sm font-medium truncate max-w-[140px]">
        {item.title}
      </span>
    </div>
  );
}

export default function AdminMatchesPage() {
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, isError, refetch } = useAdminMatches({
    page, limit: LIMIT, status,
  });

  const matches    = data?.matches ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Matches</h1>
        {data?.total != null && (
          <span className="text-sm text-gray-500">{data.total.toLocaleString()} total</span>
        )}
      </div>

      {/* Filter */}
      <div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All statuses</option>
          {MATCH_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Failed to load matches." onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="p-4">
            <TableSkeleton cols={5} rows={5} />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState message="No matches found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Lost Item', 'Found Item', 'Score', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {matches.map(match => (
                  <tr key={match._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <ItemCell item={match.lostItemId} />
                    </td>
                    <td className="px-4 py-3">
                      <ItemCell item={match.foundItemId} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={match.confidenceScore} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={match.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatTimeAgo(match.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && matches.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
