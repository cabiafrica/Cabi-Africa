import React, { useState } from 'react';
import { FaYoutube, FaSpinner } from 'react-icons/fa';

interface VideoEmbedProps {
    videoId: string;
    title: string;
    autoplay?: boolean;
    className?: string;
    showChannelLink?: boolean;
    channelUrl?: string;
}

export default function VideoEmbed({
    videoId,
    title,
    autoplay = false,
    className = '',
    showChannelLink = false,
    channelUrl = 'https://youtube.com/@cabifastafrica',
}: VideoEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Use privacy-enhanced mode (youtube-nocookie.com) with muted autoplay for WCAG compliance
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${autoplay ? 1 : 0}&rel=0`;

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className={`bg-gray-900 rounded-2xl p-8 text-center ${className}`}>
                <div className="text-red-500 mb-4">
                    <FaYoutube className="text-6xl mx-auto" />
                </div>
                <p className="text-gray-400">Unable to load video. Please check your connection.</p>
                {showChannelLink && channelUrl && (
                    <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-brand-yellow hover:underline"
                    >
                        Visit our YouTube channel
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-black">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <FaSpinner className="text-4xl text-brand-yellow animate-spin" />
                    </div>
                )}
                <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={handleLoad}
                    onError={handleError}
                />
            </div>

            {showChannelLink && channelUrl && (
                <div className="flex items-center justify-center gap-2">
                    <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-transform hover:scale-105"
                    >
                        <FaYoutube className="text-xl" />
                        Visit Education Channel
                    </a>
                </div>
            )}
        </div>
    );
}
