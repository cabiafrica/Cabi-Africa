import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';

const inter = Inter({ subsets: ['latin'] });

import { ThemeProvider } from '../context/ThemeContext';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
