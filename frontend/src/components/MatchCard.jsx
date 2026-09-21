import { useAuthStore } from '../store/authStore';
import { useAcceptMatch, useRejectMatch } from '../hooks/useMatches';
import { STATUS_CONFIG, CATEGORY_CONFIG } from './ItemCard';

const BREAKDOWN_DIMS = [
  { key: 'semantic',     label: 'Semantic',  weight: 50 },
  { key: 'category',     label: 'Category',  weight: 15 },
  { key: 'geo',          label: 'Geo',       weight: 15 },
  { key: 'color',        label: 'Color',     weight: 10 },
  { key: 'imageLabels',  label: 'Labels',    weight: 10 },
];

function ScoreBar({ label, weight, value }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-xs text-gray-500 shrink-0">{label} {weight}%</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs text-gray-400 shrink-0">{pct}%</span>
    </div>
  );
}

function Thumbnail({ item }) {
  const url = item?.images?.[0]?.url;
  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
      {url
        ? <img src={url} alt={item.title} className="w-full h-full object-cover" />
        : <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
      </div>
      <div className="space-y-2 pt-2 border-t border-gray-100">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-24 h-2.5 bg-gray-200 rounded" />
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchCard({ match, currentItemId }) {
  const user            = useAuthStore(s => s.user);
  const acceptMutation  = useAcceptMatch();
  const rejectMutation  = useRejectMatch();

  // Determine which side is "the other item" relative to the viewer's item
  const currentIsLost = String(match.lostItemId?._id) === String(currentItemId);
  const otherItem     = currentIsLost ? match.foundItemId : match.lostItemId;

  const score     = match.confidenceScore ?? 0;
  const scoreColor = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreBg    = score >= 70 ? 'bg-green-50'    : score >= 40 ? 'bg-amber-50'    : 'bg-red-50';

  const matchStatus = STATUS_CONFIG[match.status] ?? { label: match.status, color: 'bg-gray-100 text-gray-600' };
  const catColor    = CATEGORY_CONFIG[otherItem?.category] ?? 'bg-gray-50 text-gray-600';

  // Ownership — lostItemId.userId and foundItemId.userId are unpopulated ObjectId strings
  const uid          = String(user?._id ?? '');
  const lostOwner    = String(match.lostItemId?.userId  ?? '');
  const foundOwner   = String(match.foundItemId?.userId ?? '');
  const isOwner      = uid && (uid === lostOwner || uid === foundOwner);

  const handleAccept = () => {
    if (!window.confirm('Are you sure? Both items will be marked as Claimed.')) return;
    acceptMutation.mutate({ matchId: match._id, itemId: currentItemId });
  };

  const handleReject = () => {
    rejectMutation.mutate({ matchId: match._id, itemId: currentItemId });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">

      {/* Header row */}
      <div className="flex items-start gap-3">
        <Thumbnail item={otherItem} />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
            {otherItem?.title ?? '—'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {otherItem?.category && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${catColor}`}>
                {otherItem.category}
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${matchStatus.color}`}>
              {matchStatus.label}
            </span>
          </div>
          {otherItem?.location?.name && (
            <p className="text-xs text-gray-400 mt-1 truncate">{otherItem.location.name}</p>
          )}
        </div>

        {/* Confidence score */}
        <div className={`${scoreBg} rounded-lg px-3 py-2 text-center shrink-0`}>
          <p className={`text-2xl font-bold leading-none ${scoreColor}`}>{score}</p>
          <p className="text-xs text-gray-400 mt-0.5">/ 100</p>
        </div>
      </div>

      {/* Breakdown bars */}
      {match.breakdown && (
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          {BREAKDOWN_DIMS.map(({ key, label, weight }) => (
            <ScoreBar key={key} label={label} weight={weight} value={match.breakdown[key]} />
          ))}
        </div>
      )}

      {/* Action buttons */}
      {match.status === 'PENDING' && isOwner && (
        <div className="flex gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Accept Match
          </button>
          <button
            onClick={handleReject}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Reject Match
          </button>
        </div>
      )}
    </div>
  );
}
