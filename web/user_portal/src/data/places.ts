export interface PlaceSuggestion {
    id: string;
    name: string;
    neighbourhood: string;
    label: string;
    lat: number;
    lng: number;
    aliases?: string[];
}

interface RawPlace {
    id: string;
    name: string;
    neighbourhood: string;
    lat: number;
    lng: number;
    aliases?: string[];
}

const RAW_PLACES: RawPlace[] = [
    { id: 'sarit-westlands', name: 'Sarit Centre', neighbourhood: 'Westlands', lat: -1.2611, lng: 36.8025, aliases: ['sarit', 'karuna', 'westgate'] },
    { id: 'westgate-westlands', name: 'Westgate Mall', neighbourhood: 'Westlands', lat: -1.2571, lng: 36.8032, aliases: ['mwanzi'] },
    { id: 'delta-westlands', name: 'Delta Corner', neighbourhood: 'Westlands', lat: -1.2647, lng: 36.8041, aliases: ['chiromo', 'gtc'] },
    { id: 'riverside-westlands', name: 'Riverside Drive', neighbourhood: 'Westlands', lat: -1.2698, lng: 36.7982, aliases: ['prime cart', 'chiromo'] },
    { id: 'yaya-kilimani', name: 'Yaya Centre', neighbourhood: 'Kilimani', lat: -1.2928, lng: 36.7879, aliases: ['argwings kodhek'] },
    { id: 'prestige-kilimani', name: 'Prestige Plaza', neighbourhood: 'Kilimani', lat: -1.2994, lng: 36.7872, aliases: ['ngong road'] },
    { id: 'adlife-kilimani', name: 'Adlife Plaza', neighbourhood: 'Kilimani', lat: -1.2906, lng: 36.7857, aliases: ['ring road kilimani'] },
    { id: 'hurlingham-kilimani', name: 'Hurlingham Shopping Centre', neighbourhood: 'Kilimani', lat: -1.2925, lng: 36.7975 },
    { id: 'lavington-mall', name: 'Lavington Mall', neighbourhood: 'Lavington', lat: -1.2797, lng: 36.7712, aliases: ['james gichuru'] },
    { id: 'valley-arcade', name: 'Valley Arcade', neighbourhood: 'Lavington', lat: -1.2896, lng: 36.7775, aliases: ['gitanga'] },
    { id: 'junction-ngong-rd', name: 'The Junction Mall', neighbourhood: 'Ngong Road', lat: -1.2989, lng: 36.7623, aliases: ['dagoretti corner'] },
    { id: 'kasuku-kileleshwa', name: 'Kasuku Centre', neighbourhood: 'Kileleshwa', lat: -1.2759, lng: 36.7872, aliases: ['migori road'] },
    { id: 'kenyatta-ave-cbd', name: 'Kenyatta Avenue', neighbourhood: 'Nairobi CBD', lat: -1.2841, lng: 36.8219, aliases: ['cbd', 'town', 'city centre'] },
    { id: 'kicc-cbd', name: 'KICC Convention Centre', neighbourhood: 'Nairobi CBD', lat: -1.2886, lng: 36.8231, aliases: ['city hall'] },
    { id: 'kencom-cbd', name: 'Kencom Bus Stage', neighbourhood: 'Nairobi CBD', lat: -1.2856, lng: 36.8246, aliases: ['archives', 'hilton', 'moi avenue'] },
    { id: 'upper-hill-med', name: 'Upper Hill Medical Centre', neighbourhood: 'Upper Hill', lat: -1.2996, lng: 36.8141, aliases: ['ralph bunche', 'hospital'] },
    { id: 'britam-upper-hill', name: 'Britam Tower', neighbourhood: 'Upper Hill', lat: -1.3008, lng: 36.8136, aliases: ['mara road'] },
    { id: 'knh-upper-hill', name: 'Kenyatta National Hospital', neighbourhood: 'Upper Hill', lat: -1.3013, lng: 36.8073, aliases: ['knh'] },
    { id: 'village-market-gigiri', name: 'Village Market', neighbourhood: 'Gigiri', lat: -1.2292, lng: 36.8045, aliases: ['limuru road'] },
    { id: 'un-complex-gigiri', name: 'UN Complex / UNEP', neighbourhood: 'Gigiri', lat: -1.2335, lng: 36.8169, aliases: ['united nations'] },
    { id: 'rosslyn-riviera', name: 'Rosslyn Riviera Mall', neighbourhood: 'Rosslyn', lat: -1.2194, lng: 36.7989 },
    { id: 'two-rivers-runda', name: 'Two Rivers Mall', neighbourhood: 'Runda', lat: -1.2108, lng: 36.7952, aliases: ['ruaka'] },
    { id: 'karen-hub', name: 'The Hub Karen', neighbourhood: 'Karen', lat: -1.3195, lng: 36.7037, aliases: ['dagoretti'] },
    { id: 'karen-waterfront', name: 'Waterfront Karen', neighbourhood: 'Karen', lat: -1.3266, lng: 36.7169, aliases: ['langata road'] },
    { id: 'galleria-karen', name: 'Galleria Shopping Mall', neighbourhood: 'Karen', lat: -1.3426, lng: 36.7647, aliases: ['bomas', 'langata'] },
    { id: 'jkia-embakasi', name: 'JKIA Terminal 1A', neighbourhood: 'Embakasi', lat: -1.3192, lng: 36.9275, aliases: ['airport', 'jomo kenyatta'] },
    { id: 'wilson-langata', name: 'Wilson Airport', neighbourhood: 'Langata', lat: -1.3217, lng: 36.8148, aliases: ['airport'] },
    { id: 'tmall-langata', name: 'T-Mall', neighbourhood: 'Langata', lat: -1.3156, lng: 36.8141, aliases: ['nyayo stadium'] },
    { id: 'nextgen-south-c', name: 'Nextgen Mall', neighbourhood: 'South C', lat: -1.3183, lng: 36.8371, aliases: ['mombasa road', 'bellevue'] },
    { id: 'capital-south-b', name: 'Capital Centre', neighbourhood: 'South B', lat: -1.3092, lng: 36.8351, aliases: ['mombasa road'] },
    { id: 'panari-mombasa-rd', name: 'Panari Sky Centre', neighbourhood: 'Mombasa Road', lat: -1.3279, lng: 36.8535 },
    { id: 'diamond-parklands', name: 'Diamond Plaza', neighbourhood: 'Parklands', lat: -1.2602, lng: 36.8199, aliases: ['highridge', 'aga khan'] },
    { id: 'garden-city-kasarani', name: 'Garden City Mall', neighbourhood: 'Kasarani', lat: -1.2323, lng: 36.8789, aliases: ['thika road'] },
    { id: 'trm-roysambu', name: 'Thika Road Mall (TRM)', neighbourhood: 'Roysambu', lat: -1.2196, lng: 36.8891, aliases: ['kasarani', 'thika road'] },
    { id: 'kilimani-state-house', name: 'State House Road', neighbourhood: 'Kilimani', lat: -1.2856, lng: 36.8058 },
];

export const CURATED_PLACES: PlaceSuggestion[] = RAW_PLACES.map((p) => ({
    ...p,
    label: `${p.name}, ${p.neighbourhood}`,
}));

export function formatPlaceWithNeighbourhood(name: string, neighbourhood?: string): string {
    const cleanName = name.trim().replace(/,+$/, '');
    const cleanHood = (neighbourhood || 'Nairobi').trim().replace(/,+$/, '');
    if (!cleanHood) return cleanName;
    if (cleanName.toLowerCase().endsWith(cleanHood.toLowerCase())) {
        return cleanName;
    }
    return `${cleanName}, ${cleanHood}`;
}

export function searchLocalPlaces(query: string, limit = 7): PlaceSuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) {
        return CURATED_PLACES.slice(0, limit);
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = CURATED_PLACES.map((place) => {
        const hayName = place.name.toLowerCase();
        const hayHood = place.neighbourhood.toLowerCase();
        const hayLabel = place.label.toLowerCase();
        const hayAliases = (place.aliases || []).join(' ').toLowerCase();
        const fullHay = `${hayLabel} ${hayAliases}`;

        const allMatch = tokens.every((t) => fullHay.includes(t));
        if (!allMatch) return { place, score: 0 };

        let score = 1;
        if (hayName.startsWith(q)) score += 10;
        else if (hayLabel.startsWith(q)) score += 8;
        else if (hayHood.startsWith(q)) score += 6;
        else if (hayName.includes(q)) score += 4;
        return { place, score };
    })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
        .slice(0, limit)
        .map((item) => item.place);

    return scored;
}

