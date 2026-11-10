import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import Header, { GlobalHeaderContext } from '../components/layout/Header';
import FloatingTripWidget from '../components/ui/FloatingTripWidget';

// Routes that render without MainLayout and without built-in pt-16/pt-20 top offset
const STANDALONE_ROUTES_NEEDING_OFFSET = [
  '/login',
  '/register',
  '/reset-password',
  '/organizations/register',
  '/drivers/demand-analysis',
  '/drivers/dashboard',
  '/dashboard',
  '/tracking/[tripId]',
  '/verification-demo',
];

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const needsTopOffset = STANDALONE_ROUTES_NEEDING_OFFSET.includes(router.pathname);

  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalHeaderContext.Provider value={true}>
          <div className={inter.className}>
            <Header isGlobalRoot />
            <div className={needsTopOffset ? 'pt-16 md:pt-20' : ''}>
              <Component {...pageProps} />
            </div>
            <FloatingTripWidget />
          </div>
        </GlobalHeaderContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
