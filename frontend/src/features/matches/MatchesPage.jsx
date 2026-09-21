import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyMatches, useAcceptMatch, useRejectMatch } from '../../hooks/useMatches';
import { useAuthStore } from '../../store/authStore';
import { STATUS_CONFIG } from '../../components/ItemCard';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const TABS = ['PENDING', 'ACCEPTED', 'REJECTED'];

function ConfidenceBadge({ score }) {
  const color = score >= 70 ? 'bg-green-100 text-green-700'
              : score >= 40 ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${color}`}>
      {score}
    </span>
  );
}

function ItemThumb({ item }) {
  const url = item?.images?.[0]?.url;
  return (
    <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 shrink-0">
      {url
        ? <img src={url} alt={item.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gray-200" />}
    </div>
  );
}

function MatchRow({ match, userId }) {
  const acceptMutation = useAcceptMatch();
  const rejectMutation = useRejectMatch();

  const uid        = String(userId ?? '');
  const lostOwner  = String(match.lostItemId?.userId  ?? '');
  const foundOwner = String(match.foundItemId?.userId ?? '');
  const isOwner    = uid && (uid === lostOwner || uid === foundOwner);

  const handleAccept = () => {
    if (!window.confirm('Are you sure? Both items will be marked as Claimed.')) return;
    acceptMutation.mutate({ matchId: match._id });
  };

  const handleReject = () => {
    rejectMutation.mutate({ matchId: match._id });
  };

  const statusCfg = STATUS_CONFIG[match.status] ?? { label: match.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      {/* Lost item */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ItemThumb item={match.lostItemId} />
        <Link
          to={`/items/${match.lostItemId?._id}`}
          className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate"
        >
          {match.lostItemId?.title ?? '—'}
        </Link>
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Found item */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ItemThumb item={match.foundItemId} />
        <Link
          to={`/items/${match.foundItemId?._id}`}
          className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate"
        >
          {match.foundItemId?.title ?? '—'}
        </Link>
      </div>

      {/* Score */}
      <ConfidenceBadge score={match.confidenceScore ?? 0} />

      {/* Date */}
      <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {formatTimeAgo(match.createdAt)}
      </span>

      {/* Status */}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusCfg.color}`}>
        {statusCfg.label}
      </span>

      {/* Actions */}
      {match.status === 'PENDING' && isOwner && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="px-2.5 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const { data: matches = [], isLoading } = useMyMatches();
  const user = useAuthStore(s => s.user);

  const filtered = matches.filter(m => m.status === activeTab);

  const tabCount = (status) => matches.filter(m => m.status === status).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-detected matches between lost and found items.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              {tabCount(tab) > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-4 h-4 bg-gray-100 rounded shrink-0" />
                <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-12 h-5 bg-gray-200 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No {activeTab.toLowerCase()} matches
            </h3>
            <p className="text-sm text-gray-400">
              {activeTab === 'PENDING'
                ? 'When the AI finds a potential match for your items, it will appear here.'
                : 'No matches have been ' + activeTab.toLowerCase() + ' yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {/* Header row */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span className="flex-1">Lost item</span>
              <span className="w-4" />
              <span className="flex-1">Found item</span>
              <span className="w-10">Score</span>
              <span className="w-16">Date</span>
              <span className="w-16">Status</span>
              {activeTab === 'PENDING' && <span className="w-28">Actions</span>}
            </div>
            {filtered.map(match => (
              <MatchRow key={match._id} match={match} userId={user?._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
