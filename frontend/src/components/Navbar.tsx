import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import React from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    if (!auth) {
      return;
    }

    try {
      await signOut(auth);
      await router.replace('/login');
    } catch (logoutError) {
      console.error('Logout failed:', logoutError);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass bg-light-surface/80 dark:bg-dark-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-black tracking-tighter text-light-primary dark:text-dark-primary">
                StoryPixie
              </span>
            </Link>
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                Home
              </Link>
              {user && (
                <>
                  <Link href="/create" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                    Create Story
                  </Link>
                  <Link href="/history" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                    History
                  </Link>
                </>
              )}
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {!loading && !user && (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-xs px-4 py-2 md:text-sm md:px-6 md:py-3">
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-primary text-xs px-4 py-2 md:text-sm md:px-6 md:py-3"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
