import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export const STATUS_CONFIG = {
  LOST:            { label: 'Lost',            color: 'bg-red-100 text-red-600 ring-red-200' },
  FOUND:           { label: 'Found',           color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  POTENTIAL_MATCH: { label: 'Potential Match', color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  CLAIMED:         { label: 'Claimed',         color: 'bg-blue-100 text-blue-700 ring-blue-200' },
  RETURNED:        { label: 'Returned',        color: 'bg-purple-100 text-purple-700 ring-purple-200' },
  ARCHIVED:        { label: 'Archived',        color: 'bg-gray-100 text-gray-500 ring-gray-200' },
};

export const CATEGORY_CONFIG = {
  electronics: 'bg-indigo-50 text-indigo-700',
  clothing:    'bg-pink-50 text-pink-700',
  accessories: 'bg-amber-50 text-amber-700',
  documents:   'bg-cyan-50 text-cyan-700',
  bags:        'bg-emerald-50 text-emerald-700',
  others:      'bg-gray-50 text-gray-600',
};

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs mt-2 font-medium">No image</span>
    </div>
  );
}

export default function ItemCard({ item }) {
  const thumbnail = item.images?.[0]?.url;
  const status    = STATUS_CONFIG[item.status] ?? { label: item.status, color: 'bg-gray-100 text-gray-600 ring-gray-200' };

  return (
    <Link
      to={`/items/${item._id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {thumbnail
          ? <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
          : <ImagePlaceholder />}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${status.color} bg-white/90 backdrop-blur-sm`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors text-base leading-snug">
            {item.title}
          </h3>
        </div>

        <div className="mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_CONFIG[item.category] ?? 'bg-gray-50 text-gray-600'}`}>
            {item.category}
          </span>
        </div>

        <div className="space-y-1.5 text-sm text-gray-400">
          {item.location?.name && (
            <div className="flex items-center gap-1.5 truncate">
              <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{item.location.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-0.5 border-t border-gray-50">
            <span className="truncate text-xs text-gray-500 font-medium">{item.userId?.name ?? 'Unknown'}</span>
            <span className="shrink-0 ml-2 text-xs">{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

