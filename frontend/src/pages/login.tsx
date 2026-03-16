import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      void router.replace('/create');
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth || !isFirebaseConfigured) {
      setError('Firebase Authentication is not configured.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await router.replace('/create');
    } catch (authError) {
      console.error('Login failed:', authError);
      setError('Login failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-primary dark:border-dark-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="card w-full p-8">
          <h1 className="mb-2 text-3xl font-black">Login</h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Sign in to create stories and access your history.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-light-primary dark:border-gray-800 dark:bg-dark-surface"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-light-primary dark:border-gray-800 dark:bg-dark-surface"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-light-primary dark:text-dark-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
