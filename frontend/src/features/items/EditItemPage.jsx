import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useItem, useUpdateItem } from '../../hooks/useItems';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = ['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others'];

const schema = z.object({
  title:       z.string().min(3, 'At least 3 characters').max(100).trim(),
  description: z.string().min(10, 'At least 10 characters').max(1000).trim(),
  category:    z.enum(['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others']),
  color:       z.string().trim().optional(),
  locationName: z.string().min(2, 'At least 2 characters'),
});

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

export default function EditItemPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);

  const { data: item, isLoading } = useItem(id);
  const updateMutation = useUpdateItem();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!item) return;
    reset({
      title:        item.title,
      description:  item.description,
      category:     item.category,
      color:        item.color ?? '',
      locationName: item.location?.name ?? '',
    });
  }, [item, reset]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Item not found</h2>
          <Link to="/items/mine" className="text-blue-600 hover:underline text-sm">My items</Link>
        </div>
      </div>
    );
  }

  const isOwner = user && String(item.userId?._id) === String(user._id);
  if (!isOwner && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not authorized</h2>
          <Link to="/items" className="text-blue-600 hover:underline text-sm">Back to listings</Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const body = {
      title:       data.title,
      description: data.description,
      category:    data.category,
      ...(data.color && { color: data.color }),
      location: {
        name: data.locationName,
        lat:  item.location?.lat,
        lng:  item.location?.lng,
      },
    };
    updateMutation.mutate({ id, body }, {
      onSuccess: () => navigate(`/items/${id}`),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        <Link
          to={`/items/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to item
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Item Details</h2>

            <Field label="Title" error={errors.title?.message} required>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...register('title')}
              />
            </Field>

            <Field label="Description" error={errors.description?.message} required>
              <textarea
                rows={4}
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

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Location</h2>
            <Field label="Location name" error={errors.locationName?.message} required>
              <input
                type="text"
                placeholder="e.g. Library, Block A"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...register('locationName')}
              />
            </Field>
            <p className="mt-2 text-xs text-gray-400">To update the map pin, delete this item and create a new one.</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/items/${id}`}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </>
              ) : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
