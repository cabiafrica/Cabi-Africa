import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export interface ServiceCategoryConfig {
    category: string;
    displayName: string;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minimumFare: number;
    roundingStep: number;
    description?: string;
    isActive: boolean;
    colorCode: string;
    capacity: string;
    tag?: string;
    icon: string;
    bgImage: string;
    iconType: 'boda' | 'sedan' | 'suv' | 'van' | 'luxury';
}

const DATA_FILE = path.join(process.cwd(), 'src/data/service_categories.json');

const INITIAL_CATEGORIES: ServiceCategoryConfig[] = [
    {
        category: 'BODA',
        displayName: 'Cabi Boda',
        baseFare: 50.0,
        perKmRate: 25.0,
        perMinuteRate: 2.0,
        minimumFare: 50.0,
        roundingStep: 10,
        description: 'Two-wheel motorcycle deliveries & rapid urban traffic bypass.',
        isActive: true,
        colorCode: '#D97706', // Warm Terracotta Amber
        capacity: '1 Passenger',
        tag: 'FASTEST',
        icon: '🏍️',
        bgImage: '/images/vehicles/boda.png',
        iconType: 'boda',
    },
    {
        category: 'CABIGO',
        displayName: 'CabiGo (Standard)',
        baseFare: 120.0,
        perKmRate: 45.0,
        perMinuteRate: 4.0,
        minimumFare: 150.0,
        roundingStep: 25,
        description: 'Clean air-conditioned sedan for everyday urban transit.',
        isActive: true,
        colorCode: '#0D9488', // Petrol Teal / Sage
        capacity: '4 Passengers',
        tag: 'POPULAR',
        icon: '🚗',
        bgImage: '/images/vehicles/cabigo.png',
        iconType: 'sedan',
    },
    {
        category: 'EXECUTIVE',
        displayName: 'Executive Suite',
        baseFare: 250.0,
        perKmRate: 85.0,
        perMinuteRate: 8.0,
        minimumFare: 300.0,
        roundingStep: 50,
        description: 'Suited veteran captain with Mercedes E-Class / BMW executive sedan.',
        isActive: true,
        colorCode: '#D4AF37', // Presidential Champagne Gold
        capacity: '3 Passengers',
        tag: 'LUXURY',
        icon: '✨',
        bgImage: '/images/vehicles/executive.jpg',
        iconType: 'luxury',
    },
    {
        category: 'XL',
        displayName: 'Diplomatic XL',
        baseFare: 350.0,
        perKmRate: 110.0,
        perMinuteRate: 10.0,
        minimumFare: 450.0,
        roundingStep: 50,
        description: 'High capacity 6-7 seaters for executive delegations & airport luggage.',
        isActive: true,
        colorCode: '#2563EB', // Executive Steel Navy
        capacity: '6 Passengers',
        tag: 'DELEGATION',
        icon: '🚙',
        bgImage: '/images/vehicles/xl.png',
        iconType: 'suv',
    },
];

export function getStoredCategories(): ServiceCategoryConfig[] {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('Error reading stored categories:', e);
    }
    return INITIAL_CATEGORIES;
}

export function saveStoredCategories(categories: ServiceCategoryConfig[]) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(categories, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error saving stored categories:', e);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const activeOnly = req.query.activeOnly === 'true';
        const categories = getStoredCategories();
        if (activeOnly) {
            return res.status(200).json(categories.filter((c) => c.isActive));
        }
        return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
        // Admin creates a brand-new service category
        const newCat = req.body as Partial<ServiceCategoryConfig>;
        if (!newCat.category || !newCat.displayName) {
            return res.status(400).json({ message: 'Category key and display name are required' });
        }

        const current = getStoredCategories();
        const normalizedKey = newCat.category.trim().toUpperCase().replace(/\s+/g, '_');

        if (current.some((c) => c.category === normalizedKey)) {
            return res.status(409).json({ message: `Category '${normalizedKey}' already exists.` });
        }

        const categoryItem: ServiceCategoryConfig = {
            category: normalizedKey,
            displayName: newCat.displayName.trim(),
            baseFare: Number(newCat.baseFare) || 100,
            perKmRate: Number(newCat.perKmRate) || 40,
            perMinuteRate: Number(newCat.perMinuteRate) || 4,
            minimumFare: Number(newCat.minimumFare) || 150,
            roundingStep: Number(newCat.roundingStep) || 25,
            description: newCat.description || 'Admin created on-demand urban transport tier.',
            isActive: newCat.isActive !== false,
            colorCode: newCat.colorCode || '#0D9488',
            capacity: newCat.capacity || '4 Passengers',
            tag: newCat.tag || 'CUSTOM',
            icon: newCat.icon || '🚗',
            bgImage: newCat.bgImage || '/images/vehicles/cabigo.png',
            iconType: newCat.iconType || 'sedan',
        };

        current.push(categoryItem);
        saveStoredCategories(current);
        return res.status(201).json(categoryItem);
    }

    if (req.method === 'PUT') {
        // Admin updates categories in bulk or single category
        const body = req.body;
        if (Array.isArray(body)) {
            saveStoredCategories(body);
            return res.status(200).json(body);
        }

        const updateItem = body as ServiceCategoryConfig;
        if (!updateItem.category) {
            return res.status(400).json({ message: 'Category key is required' });
        }

        const current = getStoredCategories();
        const index = current.findIndex((c) => c.category === updateItem.category);
        if (index === -1) {
            return res.status(404).json({ message: `Category '${updateItem.category}' not found.` });
        }

        current[index] = { ...current[index], ...updateItem };
        saveStoredCategories(current);
        return res.status(200).json(current[index]);
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
