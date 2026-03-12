import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import React from 'react';

const Navbar: React.FC = () => {
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
              <Link href="/create" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                Create Story
              </Link>
              <Link href="/history" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                History
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/create" className="btn-primary text-xs px-4 py-2 md:text-sm md:px-6 md:py-3">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
