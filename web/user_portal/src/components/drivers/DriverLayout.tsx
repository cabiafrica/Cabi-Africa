import React from 'react';

interface DriverLayoutProps {
  children: React.ReactNode;
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="bg-black border-b border-neutral-800 p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <a href="/drivers" className="text-xl font-black tracking-tight text-white">
            CABI <span className="text-amber-500">Drivers</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/why-drive" className="text-neutral-300 hover:text-amber-400 transition-colors">How it Works</a>
            <a href="/faq" className="text-neutral-300 hover:text-amber-400 transition-colors">FAQ</a>
            <a href="/register" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors">Register</a>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        {children}
      </main>
      <footer className="bg-black border-t border-neutral-900 text-neutral-400 p-6 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} CABI Africa. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DriverLayout;
