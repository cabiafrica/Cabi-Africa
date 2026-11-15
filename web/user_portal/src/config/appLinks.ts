/**
 * Centralized Direct Download & iOS PWA URLs for Cabi Africa mobile apps.
 * Android links point directly to the official signed production APK hosted on cabi.africa.
 * iOS links launch the standalone-ready iOS Progressive Web Apps (Add to Home Screen).
 * Override any URL via NEXT_PUBLIC_* env vars.
 */
export const APP_LINKS = {
    passenger: {
        appStore:
            process.env.NEXT_PUBLIC_PASSENGER_APP_STORE_URL ||
            '/apps/passenger/index.html',
        playStore:
            process.env.NEXT_PUBLIC_PASSENGER_PLAY_STORE_URL ||
            '/downloads/Cabi-Go-Official.apk',
        apkDirect: '/downloads/Cabi-Go-Official.apk',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Go-Official.apk',
        iosWebApp: '/apps/passenger/index.html',
    },
    driver: {
        appStore:
            process.env.NEXT_PUBLIC_DRIVER_APP_STORE_URL ||
            '/apps/driver/index.html',
        playStore:
            process.env.NEXT_PUBLIC_DRIVER_PLAY_STORE_URL ||
            '/downloads/Cabi-Drive-Official.apk',
        apkDirect: '/downloads/Cabi-Drive-Official.apk',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Drive-Official.apk',
        iosWebApp: '/apps/driver/index.html',
    },
} as const;
