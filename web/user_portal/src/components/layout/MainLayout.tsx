import { Inter } from 'next/font/google';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
}

export default function MainLayout({
    children,
    title = 'CABI - Transforming Ride-Hailing',
    description = 'Join the Cabi team and start earning on your schedule or ride with comfort.',
    image = '/images/hero-fleet.jpg',
    imageAlt = 'CABI Africa multi-tier mobility fleet including electric Boda, CabiGo, Executive Sedan, and Diplomatic XL Van',
}: MainLayoutProps) {
    const fullImageUrl = image.startsWith('http') ? image : `https://cabi.africa${image}`;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* Favicons & Browser Address Bar Icon */}
                <link rel="icon" href="/favicon.ico" sizes="32x32" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#D4AF37" />

                {/* OpenGraph Image SEO */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={fullImageUrl} />
                <meta property="og:image:alt" content={imageAlt} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:type" content="website" />

                {/* Twitter Card Image SEO */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={fullImageUrl} />
                <meta name="twitter:image:alt" content={imageAlt} />
            </Head>
            <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300 ${inter.className}`}>
                <Header />
                <main className="flex-grow pt-16 md:pt-20">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
}
