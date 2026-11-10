/**
 * Centralized App Store & Google Play Store redirect URLs for Cabi Africa mobile apps.
 * Android package IDs match `mobile/passenger_app` (`africa.cabi.passenger`) and
 * `mobile/driver_app` (`africa.cabi.driver`). Override any URL via NEXT_PUBLIC_* env vars.
 */
export const APP_LINKS = {
    passenger: {
        appStore:
            process.env.NEXT_PUBLIC_PASSENGER_APP_STORE_URL ||
            'https://apps.apple.com/search?term=Cabi%20Africa',
        playStore:
            process.env.NEXT_PUBLIC_PASSENGER_PLAY_STORE_URL ||
            'https://play.google.com/store/apps/details?id=africa.cabi.passenger',
    },
    driver: {
        appStore:
            process.env.NEXT_PUBLIC_DRIVER_APP_STORE_URL ||
            'https://apps.apple.com/search?term=Cabi%20Driver%20Africa',
        playStore:
            process.env.NEXT_PUBLIC_DRIVER_PLAY_STORE_URL ||
            'https://play.google.com/store/apps/details?id=africa.cabi.driver',
    },
} as const;

