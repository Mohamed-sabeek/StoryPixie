import React from 'react';
import Navbar from './Navbar';
import { ThemeProvider } from '../hooks/useTheme';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
