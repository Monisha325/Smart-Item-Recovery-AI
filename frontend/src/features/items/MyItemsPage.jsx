import { Link, useNavigate } from 'react-router-dom';
import { useMyItems, useDeleteItem } from '../../hooks/useItems';
import { STATUS_CONFIG } from '../../components/ItemCard';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const STATUS_ORDER = ['LOST', 'FOUND', 'POTENTIAL_MATCH', 'CLAIMED', 'RETURNED', 'ARCHIVED'];

function Thumbnail({ item }) {
  const url = item.images?.[0]?.url;
  return (
    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
      {url
        ? <img src={url} alt={item.title} className="w-full h-full object-cover" />
        : <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
    </div>
  );
}

export default function MyItemsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyItems();
  const deleteMutation      = useDeleteItem();

  const items = data?.items ?? [];

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    const list = items.filter(i => i.status === status);
    if (list.length) acc.push({ status, items: list });
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link
            to="/items/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Post new item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-5xl mb-3">📦</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No items yet</h3>
            <p className="text-gray-500 mb-4">Report a lost or found item to get started.</p>
            <Link to="/items/new" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Report an item
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ status, items: groupItems }) => {
              const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
              return (
                <section key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-sm text-gray-500">{groupItems.length}</span>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {groupItems.map(item => (
                      <div key={item._id} className="flex items-center gap-4 p-4">
                        <Thumbnail item={item} />

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/items/${item._id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                            {item.location?.name && <span className="truncate">{item.location.name}</span>}
                            <span className="shrink-0">{formatTimeAgo(item.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/items/${item._id}/edit`)}
                            className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item._id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
