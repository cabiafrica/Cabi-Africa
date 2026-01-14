import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';

const inter = Inter({ subsets: ['latin'] });

import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
