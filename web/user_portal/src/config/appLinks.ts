/**
 * Centralized Direct Download URLs for Cabi Africa Official Production Mobile Apps.
 * All links trigger direct binary downloads (.apk) to the user's device Downloads folder.
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
        appStore: '/downloads/Cabi-Go-Official.apk',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Go-Official.apk',
        iosWebApp: '/downloads/Cabi-Go-Official.apk',
    },
    driver: {
        name: 'CABI Drive (Driver App)',
        fileName: 'Cabi-Drive-Official.apk',
        version: 'v1.1.0 (Full Production)',
        packageId: 'africa.cabi.driver',
        apkDirect: '/downloads/Cabi-Drive-Official.apk',
        playStore: '/downloads/Cabi-Drive-Official.apk',
        appStore: '/downloads/Cabi-Drive-Official.apk',
        githubRelease:
            'https://github.com/ibnke/Cabi-Africa/releases/latest/download/Cabi-Drive-Official.apk',
        iosWebApp: '/downloads/Cabi-Drive-Official.apk',
    },
} as const;
