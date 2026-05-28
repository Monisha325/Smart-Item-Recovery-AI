import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { usePageTitle } from '../../hooks/usePageTitle';

const ALLOWED_DOMAINS = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim())
  .filter(Boolean);

const domainCheck = (email) =>
  !ALLOWED_DOMAINS.length || ALLOWED_DOMAINS.some(d => email.toLowerCase().endsWith(`@${d}`));

const domainMsg = ALLOWED_DOMAINS.length
  ? `Email must end with: ${ALLOWED_DOMAINS.join(', ')}`
  : 'Invalid email';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number');

const schema = z
  .object({
    name:            z.string().min(2, 'At least 2 characters').max(100).trim(),
    email:           z.string().email('Invalid email').refine(domainCheck, domainMsg),
    campusId:        z.string().min(3, 'At least 3 characters').trim(),
    password:        passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint  && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  usePageTitle('Create account');
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirmPassword: _c, ...data }) => {
    try {
      const res = await api.post('/api/auth/register', data);
      if (res.data?.data?.devAutoVerified) {
        toast.success('Account created — log in now');
        navigate('/login');
        return;
      }
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err) {
      const status    = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const isNetwork = !err.response;

      console.error('[Register] failed:', { status, data: err.response?.data, code: err.code });

      // 502 = account was created but email send failed — show resend screen
      if (status === 502) {
        setSubmittedEmail(data.email);
        setEmailFailed(true);
        setSubmitted(true);
        return;
      }

      const msg = serverMsg
        || (isNetwork ? 'Cannot reach server — check your connection or try again' : 'Registration failed');
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/api/auth/resend-verification', { email: submittedEmail });
      toast.success('Verification email resent — check your inbox');
    } catch {
      toast.error('Could not resend — try again in a moment');
    } finally {
      setResending(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className={`w-16 h-16 ${emailFailed ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {emailFailed ? (
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {emailFailed ? 'Account created — email not sent' : 'Check your email'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {emailFailed
            ? 'Your account was created but the verification email could not be sent. Use the button below to resend it.'
            : 'We sent a verification link to your address. Click it to activate your account.'}
        </p>
        {emailFailed && (
          <p className="text-xs text-gray-400 mb-4">{submittedEmail}</p>
        )}

        <button
          onClick={handleResend}
          disabled={resending}
          className={`block w-full py-2.5 rounded-lg text-sm font-semibold mb-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            emailFailed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-blue-600 hover:underline'
          }`}
        >
          {resending ? 'Sending…' : emailFailed ? 'Send verification email' : "Didn't receive it? Resend email"}
        </button>

        <Link to="/login" className="text-blue-600 font-medium hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-0.5">Create account</h2>
      <p className="text-sm text-gray-500 mb-6">Join CampusFind</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <input
            type="text"
            autoComplete="name"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('name')}
          />
        </Field>

        <Field label="Campus email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            placeholder={ALLOWED_DOMAINS[0] ? `you@${ALLOWED_DOMAINS[0]}` : ''}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('email')}
          />
        </Field>

        <Field label="Campus ID" error={errors.campusId?.message}>
          <input
            type="text"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('campusId')}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          hint="Min 8 chars, one uppercase, one number"
        >
          <input
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            {...register('password')}
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
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
          className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mt-1"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
