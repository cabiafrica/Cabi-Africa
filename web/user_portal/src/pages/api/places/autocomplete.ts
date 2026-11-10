import type { NextApiRequest, NextApiResponse } from 'next';
import {
    formatPlaceWithNeighbourhood,
    PlaceSuggestion,
    searchLocalPlaces,
} from '@/data/places';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ suggestions: PlaceSuggestion[] }>
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ suggestions: [] });
    }

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const localHits = searchLocalPlaces(q, 7);

    if (q.length < 3) {
        return res.status(200).json({ suggestions: localHits });
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=ke&limit=5&q=${encodeURIComponent(q)}`;
        const upstream = await fetch(url, {
            headers: {
                'User-Agent': 'CabiAfricaPortal/1.0 (https://cabi.africa)',
                'Accept-Language': 'en',
            },
            signal: controller.signal,
        });
        clearTimeout(timer);

        if (!upstream.ok) {
            return res.status(200).json({ suggestions: localHits });
        }

        const data = await upstream.json();
        if (!Array.isArray(data)) {
            return res.status(200).json({ suggestions: localHits });
        }

        const seen = new Set(localHits.map((item) => item.label.toLowerCase()));
        const remoteHits: PlaceSuggestion[] = [];

        for (const item of data) {
            const addr = item.address || {};
            const primaryName =
                item.name ||
                addr.amenity ||
                addr.road ||
                (typeof item.display_name === 'string' ? item.display_name.split(',')[0].trim() : '');

            const neighbourhood =
                addr.neighbourhood ||
                addr.suburb ||
                addr.city_district ||
                addr.quarter ||
                addr.town ||
                addr.city ||
                addr.county ||
                'Nairobi';

            if (!primaryName) continue;
            const formatted = formatPlaceWithNeighbourhood(primaryName, neighbourhood);
            const key = formatted.toLowerCase();
            if (seen.has(key)) continue;

            const lat = Number(item.lat);
            const lng = Number(item.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

            seen.add(key);
            remoteHits.push({
                id: `osm-${item.place_id}`,
                name: primaryName,
                neighbourhood,
                label: formatted,
                lat,
                lng,
            });
        }

        return res.status(200).json({
            suggestions: [...localHits, ...remoteHits].slice(0, 8),
        });
    } catch {
        return res.status(200).json({ suggestions: localHits });
    }
}

