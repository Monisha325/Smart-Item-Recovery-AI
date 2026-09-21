import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../../hooks/useItems';
import { useDebounce } from '../../hooks/useDebounce';
import ItemCard from '../../components/ItemCard';
import { usePageTitle } from '../../hooks/usePageTitle';

const CATEGORIES = ['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others'];
const LIMIT = 12;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ItemsListPage() {
  usePageTitle('Browse Items');
  const [type, setType]         = useState('all');
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [items, setItems]       = useState([]);

  const debouncedSearch = useDebounce(search, 400);

  // Reset accumulation when filters change (not when page changes)
  const filterKey     = `${type}|${category}|${debouncedSearch}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (filterKey !== prevFilterKey.current) {
      prevFilterKey.current = filterKey;
      setPage(1);
      setItems([]);
    }
  }, [filterKey]);

  const filters = {
    ...(type !== 'all' && { type }),
    ...(category        && { category }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: LIMIT,
  };

  const { data, isLoading, isFetching } = useItems(filters);

  useEffect(() => {
    if (!data?.items) return;
    setItems(prev => page === 1 ? data.items : [...prev, ...data.items]);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasMore = data ? items.length < data.total : false;
  const showSkeleton = isLoading && page === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Type toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
              {['all', 'lost', 'found'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    type === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white text-gray-700 shrink-0"
            >
              <option value="">All categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search items…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Link
              to="/items/new"
              className="ml-auto shrink-0 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Report Item
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500 mb-4">Be the first to post!</p>
            <Link
              to="/items/new"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Report an item
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data?.total ?? items.length} item{data?.total !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => <ItemCard key={item._id} item={item} />)}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isFetching}
                  className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
