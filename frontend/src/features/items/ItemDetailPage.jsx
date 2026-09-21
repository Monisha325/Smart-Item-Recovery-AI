import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x  from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow  from 'leaflet/dist/images/marker-shadow.png';
import { useItem, useDeleteItem } from '../../hooks/useItems';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useMatchesForItem } from '../../hooks/useMatches';
import { useAuthStore } from '../../store/authStore';
import { STATUS_CONFIG, CATEGORY_CONFIG } from '../../components/ItemCard';
import MatchCard, { MatchCardSkeleton } from '../../components/MatchCard';
import QRTagSection from '../../components/QRTagSection';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const leafletIcon = L.icon({
  iconUrl:       markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

function ImagePlaceholderLarge() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100">
      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm mt-2">No image</span>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const { data: item, isLoading, isError } = useItem(id);
  const deleteMutation = useDeleteItem();
  const { data: matches = [], isLoading: matchesLoading } = useMatchesForItem(id);

  usePageTitle(item?.title ?? 'Item');
  const [activeIdx, setActiveIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Item not found</h2>
          <Link to="/items" className="text-blue-600 hover:underline text-sm">Back to listings</Link>
        </div>
      </div>
    );
  }

  const images   = item.images ?? [];
  const status   = STATUS_CONFIG[item.status]   ?? { label: item.status,   color: 'bg-gray-100 text-gray-600' };
  const catColor = CATEGORY_CONFIG[item.category] ?? 'bg-gray-50 text-gray-600';
  const isOwner  = user && String(item.userId?._id) === String(user._id);
  const mapPos   = item.location?.lat && item.location?.lng
    ? [item.location.lat, item.location.lng]
    : null;

  const handleDelete = () => {
    deleteMutation.mutate(item._id, {
      onSuccess: () => navigate('/items/mine'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Back */}
        <Link to="/items" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left column: gallery ─────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {images.length > 0
                ? <img
                    src={images[activeIdx]?.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                : <ImagePlaceholderLarge />}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeIdx ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right column: details ────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catColor}`}>
                  {item.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {item.type}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              {item.color && (
                <p className="text-sm text-gray-500 mt-1">Color: <span className="font-medium text-gray-700">{item.color}</span></p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Posted by */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Posted by</h2>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {item.userId?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.userId?.name ?? 'Unknown'}</p>
                  {item.userId?.campusId && (
                    <p className="text-xs text-gray-500">{item.userId.campusId}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400 shrink-0">{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>

            {/* AI detected tags */}
            {item.imageLabels?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">AI detected tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {item.imageLabels.map((label, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/items/${item._id}/edit`)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Location ──────────────────────────────────────────────────── */}
        {(item.location?.name || mapPos) && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Location</h2>
            {item.location?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location.name}
              </div>
            )}
            {mapPos && (
              <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 220 }}>
                <MapContainer
                  center={mapPos}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={mapPos} icon={leafletIcon} />
                </MapContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Potential Matches ──────────────────────────────────────────── */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Potential Matches</h2>
            {matches.length > 5 && (
              <Link to="/matches" className="text-sm text-blue-600 hover:underline">
                View all {matches.length} matches
              </Link>
            )}
          </div>

          {matchesLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : matches.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No potential matches yet. Our AI checks automatically when new items are posted.
            </p>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map(match => (
                <MatchCard key={match._id} match={match} currentItemId={id} />
              ))}
            </div>
          )}
        </div>

        {/* ── QR placeholder ─────────────────────────────────────────────── */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">QR Tag</h2>
          {isOwner
            ? <QRTagSection item={item} />
            : <p className="text-sm text-gray-400 text-center py-6">Only the item owner can manage its QR tag.</p>
          }
        </div>

      </div>
    </div>
  );
}
