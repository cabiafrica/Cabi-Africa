import { Inter } from 'next/font/google';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function MainLayout({
    children,
    title = 'CABI - Transforming Ride-Hailing',
    description = 'Join the Cabi team and start earning on your schedule or ride with comfort.',
}: MainLayoutProps) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 ${inter.className}`}>
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
}
