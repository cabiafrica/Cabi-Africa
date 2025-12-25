import React from 'react';

interface DriverLayoutProps {
  children: React.ReactNode;
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <a href="/drivers" className="text-xl font-bold">Cabi Drivers</a>
          <div>
            <a href="/drivers/how-it-works" className="ml-4 hover:underline">How it Works</a>
            <a href="/drivers/faq" className="ml-4 hover:underline">FAQ</a>
            <a href="/drivers/register" className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100">Register</a>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>&copy; 2025 Cabi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DriverLayout;
