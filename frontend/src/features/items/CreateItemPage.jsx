import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x  from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow  from 'leaflet/dist/images/marker-shadow.png';
import { useLocation } from 'react-router-dom';
import { useCreateItem } from '../../hooks/useItems';
import { usePageTitle } from '../../hooks/usePageTitle';

// ── Leaflet icon fix for Vite ─────────────────────────────────────────────────
const leafletIcon = L.icon({
  iconUrl:       markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [17.385, 78.4867]; // Hyderabad, India
const CATEGORIES     = ['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others'];
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z.object({
  type:        z.enum(['lost', 'found']),
  title:       z.string().min(3, 'At least 3 characters').max(100).trim(),
  description: z.string().min(10, 'At least 10 characters').max(1000).trim(),
  category:    z.enum(['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others']),
  color:       z.string().trim().optional(),
  location:    z.object({
    name: z.string().min(2, 'At least 2 characters'),
    lat:  z.number(),
    lng:  z.number(),
  }),
});

// ── Map subcomponents ─────────────────────────────────────────────────────────
function MapClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateItemPage() {
  usePageTitle('Report an Item');
  const createItem    = useCreateItem();
  const routerLocation = useLocation();
  const prefilledType  = routerLocation.state?.prefilledType;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type:     prefilledType === 'found' ? 'found' : 'lost',
      location: { name: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] },
    },
  });

  const selectedType = watch('type');
  const lat          = watch('location.lat');
  const lng          = watch('location.lng');
  const markerPos    = lat && lng ? [lat, lng] : null;

  // ── Image state ───────────────────────────────────────────────────────────
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const urls = images.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [images]);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => ACCEPTED_TYPES.includes(f.type));
    setImages(prev => [...prev, ...valid].slice(0, 5));
  };

  const removeImage = (idx) =>
    setImages(prev => prev.filter((_, i) => i !== idx));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMapPick = (newLat, newLng) => {
    setValue('location.lat', newLat, { shouldValidate: true });
    setValue('location.lng', newLng, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const fd = new FormData();
    fd.append('type',        data.type);
    fd.append('title',       data.title);
    fd.append('description', data.description);
    fd.append('category',    data.category);
    if (data.color) fd.append('color', data.color);
    fd.append('location', JSON.stringify(data.location));
    images.forEach(img => fd.append('images', img));
    createItem.mutate(fd);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Item</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Type toggle ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Item type <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-3">
              {(['lost', 'found']).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`py-3 rounded-lg font-semibold text-sm border-2 transition-colors capitalize ${
                    selectedType === t
                      ? t === 'lost'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t === 'lost' ? '😞 Lost' : '🎉 Found'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Item details ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Item Details</h2>

            <Field label="Title" error={errors.title?.message} required>
              <input
                type="text"
                placeholder="e.g. Black AirPods Pro"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...register('title')}
              />
            </Field>

            <Field label="Description" error={errors.description?.message} required>
              <textarea
                rows={4}
                placeholder="Describe the item — brand, marks, where it was lost/found…"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...register('description')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" error={errors.category?.message} required>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  {...register('category')}
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Color" error={errors.color?.message}>
                <input
                  type="text"
                  placeholder="e.g. Black"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  {...register('color')}
                />
              </Field>
            </div>
          </div>

          {/* ── Location ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Location</h2>

            <Field label="Location name" error={errors.location?.name?.message} required>
              <input
                type="text"
                placeholder="e.g. Library, Block A"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...register('location.name')}
              />
            </Field>

            <p className="text-xs text-gray-500">Click the map to place a marker.</p>

            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 280 }}>
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onPick={handleMapPick} />
                {markerPos && (
                  <Marker
                    position={markerPos}
                    icon={leafletIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat: newLat, lng: newLng } = e.target.getLatLng();
                        handleMapPick(newLat, newLng);
                      },
                    }}
                  />
                )}
              </MapContainer>
            </div>

            {lat !== DEFAULT_CENTER[0] && (
              <p className="text-xs text-gray-500">
                Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
              </p>
            )}

            {/* Hidden inputs so RHF registers lat/lng */}
            <input type="hidden" {...register('location.lat', { valueAsNumber: true })} />
            <input type="hidden" {...register('location.lng', { valueAsNumber: true })} />
          </div>

          {/* ── Image upload ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Images</h2>
              <span className="text-xs text-gray-400">{images.length}/5</span>
            </div>

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              disabled={images.length >= 5}
              className={`w-full border-2 border-dashed rounded-lg py-8 flex flex-col items-center gap-2 transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : images.length >= 5
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }`}
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">
                {images.length >= 5 ? 'Maximum 5 images' : 'Click or drag images here'}
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 5 MB each</p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={url} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={createItem.isPending}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {createItem.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Posting…
              </>
            ) : 'Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
