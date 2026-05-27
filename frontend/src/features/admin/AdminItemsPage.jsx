import { useState } from 'react';
import { useAdminItems, useDeleteAdminItem } from '../../hooks/useAdmin';
import { TableSkeleton, EmptyState, ErrorState, Pagination, StatusBadge } from '../../components/admin/AdminTable';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const LIMIT = 20;

const TYPES      = ['lost', 'found'];
const STATUSES   = ['LOST', 'FOUND', 'POTENTIAL_MATCH', 'CLAIMED', 'RETURNED', 'ARCHIVED'];
const CATEGORIES = ['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others'];

function ImageThumb({ images }) {
  const url = images?.[0]?.url;
  if (!url) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="w-10 h-10 rounded-lg object-cover border border-gray-100"
    />
  );
}

export default function AdminItemsPage() {
  const [page,     setPage]     = useState(1);
  const [type,     setType]     = useState('');
  const [status,   setStatus]   = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading, isError, refetch } = useAdminItems({
    page, limit: LIMIT, type, status, category,
  });

  const deleteItem = useDeleteAdminItem();

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Permanently delete "${item.title}" and all its data?`)) return;
    deleteItem.mutate(item._id);
  };

  const items      = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const selectClass = 'text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Items</h1>
        {data?.total != null && (
          <span className="text-sm text-gray-500">{data.total.toLocaleString()} total</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={type} onChange={handleFilterChange(setType)} className={selectClass}>
          <option value="">All types</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select value={status} onChange={handleFilterChange(setStatus)} className={selectClass}>
          <option value="">All statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select value={category} onChange={handleFilterChange(setCategory)} className={selectClass}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Failed to load items." onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="p-4">
            <TableSkeleton cols={7} rows={5} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState message="No items match the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['', 'Title', 'Type', 'Category', 'Status', 'Owner', 'Date', 'Actions'].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.open(`/items/${item._id}`, '_blank')}
                  >
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <ImageThumb images={item.images} />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px] truncate">
                      {item.title}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 capitalize">{item.category}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-2.5 text-gray-600 max-w-[120px] truncate">
                      {item.userId?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatTimeAgo(item.createdAt)}
                    </td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deleteItem.isPending}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
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
