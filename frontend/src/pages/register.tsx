import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      void router.replace('/create');
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth || !db || !isFirebaseConfigured) {
      setError('Firebase Authentication is not configured.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          email: credential.user.email,
          created_at: serverTimestamp(),
        },
        { merge: true }
      );

      await router.replace('/create');
    } catch (authError) {
      console.error('Registration failed:', authError);
      setError('Registration failed. Please try a different email or stronger password.');
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
          <h1 className="mb-2 text-3xl font-black">Register</h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Create an account to save stories and access them later.
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
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-light-primary dark:border-gray-800 dark:bg-dark-surface"
                placeholder="Confirm your password"
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-light-primary dark:text-dark-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
