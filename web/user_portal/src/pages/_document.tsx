import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head>
                <link rel="icon" href="/favicon.ico" sizes="32x32" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#D4AF37" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="CABI Africa" />
                <meta name="mobile-web-app-capable" content="yes" />
            </Head>
            <body className="antialiased">
                {/*
                  * This inline script runs synchronously before any paint.
                  * It reads the saved theme from localStorage and applies the
                  * correct class to <html> immediately, preventing FOUC (Flash
                  * of Unstyled Content) when the user has a saved theme preference.
                  */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
                    }}
                />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
