import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useMyStats, useUpdateProfile, useChangePassword } from '../../hooks/useProfile';
import { usePageTitle } from '../../hooks/usePageTitle';

const profileSchema = z.object({
  name:     z.string().min(2, 'At least 2 characters').max(100).trim(),
  campusId: z.string().min(3, 'At least 3 characters').trim(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'At least one uppercase letter')
      .regex(/[0-9]/, 'At least one number'),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint  && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function StatBox({ label, value, loading }) {
  return (
    <div className="text-center bg-white rounded-xl border border-gray-200 p-5">
      {loading
        ? <div className="skeleton h-7 w-10 rounded mx-auto mb-1" />
        : <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      }
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  usePageTitle('Profile');
  const { user, setAuth, token } = useAuthStore();
  const [editMode, setEditMode] = useState(false);

  const { data: stats, isLoading: statsLoading } = useMyStats();
  const updateProfile  = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', campusId: user?.campusId ?? '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const onProfileSubmit = async (data) => {
    try {
      const updated = await updateProfile.mutateAsync(data);
      // Keep auth store in sync
      setAuth(updated, token);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      passwordForm.reset();
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

        {/* ── Avatar + identity ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.isVerified !== false && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              {user?.campusId && (
                <p className="text-xs text-gray-400 mt-0.5">{user.campusId}</p>
              )}
            </div>
          </div>

          {/* Edit form */}
          {editMode ? (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <Field label="Full name" error={profileForm.formState.errors.name?.message}>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  {...profileForm.register('name')}
                />
              </Field>
              <Field label="Campus ID" error={profileForm.formState.errors.campusId?.message}>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  {...profileForm.register('campusId')}
                />
              </Field>
              <Field label="Email" error={null}>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className="block w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                />
              </Field>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updateProfile.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditMode(false); profileForm.reset(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit profile
            </button>
          )}
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Lost items posted"  value={stats?.lostCount}      loading={statsLoading} />
          <StatBox label="Found items posted" value={stats?.foundCount}     loading={statsLoading} />
          <StatBox label="Items recovered"    value={stats?.recoveredCount} loading={statsLoading} />
        </div>

        {/* ── Change password ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
              <input
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...passwordForm.register('currentPassword')}
              />
            </Field>
            <Field
              label="New password"
              error={passwordForm.formState.errors.newPassword?.message}
              hint="Min 8 chars, one uppercase letter, one number"
            >
              <input
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...passwordForm.register('newPassword')}
              />
            </Field>
            <Field label="Confirm new password" error={passwordForm.formState.errors.confirmPassword?.message}>
              <input
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                {...passwordForm.register('confirmPassword')}
              />
            </Field>
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {changePassword.isPending ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
