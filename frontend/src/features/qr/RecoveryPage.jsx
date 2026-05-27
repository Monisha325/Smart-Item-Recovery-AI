import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScanQR } from '../../hooks/useQR';
import { useAuthStore } from '../../store/authStore';
import { STATUS_CONFIG, CATEGORY_CONFIG } from '../../components/ItemCard';

const RECOVERED_STATUSES = new Set(['RETURNED', 'CLAIMED', 'ARCHIVED']);

function StatusMessage({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg || !RECOVERED_STATUSES.has(status)) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
      This item has already been recovered.
    </div>
  );
}

export default function RecoveryPage() {
  const { token }       = useParams();
  const navigate        = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const { data, isLoading, isError } = useScanQR(token);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid QR Code</h2>
          <p className="text-sm text-gray-500">
            This QR code is invalid or has been removed.
          </p>
          <Link
            to="/items"
            className="inline-block mt-5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Items
          </Link>
        </div>
      </div>
    );
  }

  const { item, owner, scannedCount } = data;
  const status   = STATUS_CONFIG[item.status]   ?? { label: item.status,   color: 'bg-gray-100 text-gray-600' };
  const catColor = CATEGORY_CONFIG[item.category] ?? 'bg-gray-50 text-gray-600';
  const alreadyRecovered = RECOVERED_STATUSES.has(item.status);

  const handleFoundCTA = () => {
    navigate('/items/new', { state: { prefilledType: 'found' } });
  };

  const handleClaimCTA = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/recover/${token}`);
    } else {
      navigate('/items/new', { state: { prefilledType: 'found' } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header banner */}
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 text-center shadow-sm">
          <p className="text-sm font-medium opacity-80 mb-0.5">This item belongs to</p>
          <p className="text-xl font-bold">{owner.name}</p>
          {owner.campusId && (
            <p className="text-sm opacity-80">{owner.campusId}</p>
          )}
        </div>

        {/* Item card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Image */}
          {item.image?.url ? (
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={item.image.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Badges + title */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {item.type}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catColor}`}>
                  {item.category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
              {item.color && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Color: <span className="font-medium text-gray-700">{item.color}</span>
                </p>
              )}
            </div>

            {/* Already recovered notice */}
            <StatusMessage status={item.status} />

            {/* Description */}
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>

            {/* Location */}
            {item.location?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location.name}
              </div>
            )}

            {/* Contact section */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Owner</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {owner.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                  {owner.campusId && (
                    <p className="text-xs text-gray-500">{owner.campusId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            {!alreadyRecovered && (
              <div className="border-t border-gray-100 pt-4">
                {item.type === 'lost' ? (
                  <button
                    onClick={handleFoundCTA}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
                  >
                    I found this item — Report it
                  </button>
                ) : (
                  <button
                    onClick={handleClaimCTA}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Claim this item
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Powered by{' '}
          <Link to="/" className="hover:underline">Smart Campus Lost &amp; Found</Link>
        </p>

      </div>
    </div>
  );
}
