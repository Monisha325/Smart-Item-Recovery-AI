import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { usePageTitle } from '../../hooks/usePageTitle';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number');

const schema = z
  .object({
    newPassword:     passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint  && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function ResetPasswordPage() {
  usePageTitle('Reset password');
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const token         = searchParams.get('token');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h2>
        <p className="text-sm text-gray-600 mb-6">This reset link is missing a token.</p>
        <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async ({ newPassword }) => {
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-0.5">Reset password</h2>
      <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          label="New password"
          error={errors.newPassword?.message}
          hint="Min 8 chars, one uppercase, one number"
        >
          <input
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('newPassword')}
          />
        </Field>

        <Field label="Confirm new password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('confirmPassword')}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
