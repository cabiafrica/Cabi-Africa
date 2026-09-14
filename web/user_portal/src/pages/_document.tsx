import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head />
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
