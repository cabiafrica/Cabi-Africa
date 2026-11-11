import React from 'react';

type BrandLogoSize = 'header' | 'md' | 'footer' | 'lg';

interface BrandLogoProps {
    size?: BrandLogoSize;
    className?: string;
    alt?: string;
}

const SIZE_CLASSES: Record<BrandLogoSize, string> = {
    header: 'h-10 md:h-12 w-auto',
    md: 'h-12 sm:h-14 w-auto',
    footer: 'h-14 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
};

/**
 * Official CABI Africa brand logo that switches cleanly between
 * Light and Dark theme assets using CSS class polarity (zero hydration mismatch).
 */
export default function BrandLogo({
    size = 'header',
    className = '',
    alt = 'CABI Africa — Your Ride, Your Way',
}: BrandLogoProps) {
    const sizeClass = SIZE_CLASSES[size];

    return (
        <span className={`inline-flex items-center shrink-0 ${className}`}>
            <img
                src="/images/cabi-logo-light.png"
                alt={alt}
                width={890}
                height={387}
                className={`block dark:hidden object-contain select-none ${sizeClass}`}
            />
            <img
                src="/images/cabi-logo-dark.png"
                alt={alt}
                width={890}
                height={387}
                className={`hidden dark:block object-contain select-none ${sizeClass}`}
            />
        </span>
    );
}

