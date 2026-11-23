export type SocialPlatformId =
    | 'x'
    | 'instagram'
    | 'facebook'
    | 'tiktok'
    | 'youtube'
    | 'whatsapp';

export interface SocialPlatformConfig {
    id: SocialPlatformId;
    name: string;
    href: string;
    handle: string;
    enabled: boolean;
    envKey: string;
}

const isEnabled = (envValue: string | undefined, fallback = true): boolean => {
    if (envValue === undefined) return fallback;
    return envValue.toLowerCase() !== 'false' && envValue !== '0';
};

/**
 * Centralized, environment-configurable social media channels for CABI Africa.
 * Configure any platform URL via NEXT_PUBLIC_SOCIAL_*_URL or disable via
 * NEXT_PUBLIC_SOCIAL_*_ENABLED=false in .env / deployment settings.
 */
export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
    {
        id: 'x',
        name: 'X (Twitter)',
        href: process.env.NEXT_PUBLIC_SOCIAL_X_URL || 'https://x.com/cabiafrica',
        handle: process.env.NEXT_PUBLIC_SOCIAL_X_HANDLE || '@cabiafrica',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_X_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_X_URL',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || 'https://instagram.com/cabiafrica',
        handle: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_HANDLE || '@cabiafrica',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || 'https://facebook.com/cabiafrica',
        handle: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_HANDLE || 'cabiafrica',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_FACEBOOK_URL',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL || 'https://tiktok.com/@cabiafrica',
        handle: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_HANDLE || '@cabiafrica',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_TIKTOK_URL',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL || 'https://youtube.com/@cabifastafrica',
        handle: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_HANDLE || '@cabifastafrica',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_YOUTUBE_URL',
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        href: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_URL || 'https://wa.me/254758777222',
        handle: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_HANDLE || '+254 758 777 222',
        enabled: isEnabled(process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_ENABLED, true),
        envKey: 'NEXT_PUBLIC_SOCIAL_WHATSAPP_URL',
    },
];

export const getEnabledSocialPlatforms = (): SocialPlatformConfig[] =>
    SOCIAL_PLATFORMS.filter((platform) => platform.enabled && Boolean(platform.href));

