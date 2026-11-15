/**
 * Centralized Direct Download & Install URLs for Cabi Africa Official Production Mobile Apps.
 * - Android: Direct .apk download to the device's Downloads folder.
 * - iOS (iPhone / iPad): Installable full-screen PWA via Safari "Add to Home Screen".
 * No third-party app store redirects or trial versions.
 */
export const APP_LINKS = {
    passenger: {
        name: 'CABI Go (Passenger App)',
        fileName: 'Cabi-Go-Official.apk',
        version: 'v1.1.0 (Full Production)',
        packageId: 'africa.cabi.passenger',
        apkDirect: '/downloads/Cabi-Go-Official.apk',
        playStore: '/downloads/Cabi-Go-Official.apk',
        appStore: '/apps/passenger/index.html',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Go-Official.apk',
        iosWebApp: '/apps/passenger/index.html',
    },
    driver: {
        name: 'CABI Drive (Driver App)',
        fileName: 'Cabi-Drive-Official.apk',
        version: 'v1.1.0 (Full Production)',
        packageId: 'africa.cabi.driver',
        apkDirect: '/downloads/Cabi-Drive-Official.apk',
        playStore: '/downloads/Cabi-Drive-Official.apk',
        appStore: '/apps/driver/index.html',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Drive-Official.apk',
        iosWebApp: '/apps/driver/index.html',
    },
} as const;
